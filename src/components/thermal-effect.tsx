import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties } from "react";

export interface ThermalEffectProps {
  src: string;
  stops?: number;
  fadeDuration?: number;
  animationDuration?: number;
  colors?: string[];
  sweepBlur?: number;
  sweepSpeed?: number;
  bandFrequency?: number;
  fit?: "cover" | "contain";
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_COLORS = ["#ffffff", "#FFD478", "#E4FF8D", "#FFFFFF", "#ffffff"];

function buildThermalTable(
  colors: string[],
  phase: number,
  frequency: number,
  stops: number
): { r: string; g: string; b: string } {
  const n = colors.length;
  const parsed: [number, number, number][] = colors.map((hex) => {
    const h = hex.replace("#", "");
    return [
      parseInt(h.slice(0, 2), 16) / 255,
      parseInt(h.slice(2, 4), 16) / 255,
      parseInt(h.slice(4, 6), 16) / 255,
    ];
  });

  const tableR: number[] = [];
  const tableG: number[] = [];
  const tableB: number[] = [];

  for (let i = 0; i <= stops; ++i) {
    const t = i / stops;
    const mapped = ((t * frequency + phase) % 1.0 + 1.0) % 1.0;
    const idx = mapped * (n - 1);
    const i0 = Math.floor(idx);
    const i1 = Math.min(i0 + 1, n - 1);
    const frac = idx - i0;
    tableR.push(+(parsed[i0][0] * (1 - frac) + parsed[i1][0] * frac).toFixed(4));
    tableG.push(+(parsed[i0][1] * (1 - frac) + parsed[i1][1] * frac).toFixed(4));
    tableB.push(+(parsed[i0][2] * (1 - frac) + parsed[i1][2] * frac).toFixed(4));
  }

  return { r: tableR.join(" "), g: tableG.join(" "), b: tableB.join(" ") };
}

export const ThermalEffect = ({
  src,
  stops = 60,
  fadeDuration = 1200,
  animationDuration = 3500,
  colors = DEFAULT_COLORS,
  sweepBlur = 0,
  sweepSpeed = 0.6,
  bandFrequency = 1,
  fit = "cover",
  className,
  style,
}: ThermalEffectProps) => {
  const filterRef = useRef<SVGFilterElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const frameIdRef = useRef<number>(0);
  const rawId = useId();
  const filterId = `thermal-${rawId.replace(/:/g, "")}`;

  // The image's natural dimensions drive the SVG viewBox — no letterboxing
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  // Becomes true the first time the container enters the viewport
  const [inView, setInView] = useState(false);

  // Effect 1: resolve image dimensions via onload (handles cached images too)
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = src;
    // For already-cached images onload won't fire; use queueMicrotask to stay
    // out of the synchronous effect body so React doesn't warn about cascading renders
    if (img.complete && img.naturalWidth) {
      queueMicrotask(() => setImgSize({ w: img.naturalWidth, h: img.naturalHeight }));
    }
    return () => { img.onload = null; };
  }, [src]);

  // Effect 2: watch viewport intersection once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Effect 3: run animation once both the image is sized and the element is in view
  useEffect(() => {
    if (!imgSize || !inView) return;

    const totalDuration = animationDuration + fadeDuration;
    const identityArr = Array(stops + 1)
      .fill(0)
      .map((_, i) => +(i / stops).toFixed(4));
    const identityTable = identityArr.join(" ");
    const animStart = performance.now();

    const tick = (now: number) => {
      const elapsed = now - animStart;
      const filter = filterRef.current;
      if (!filter) { frameIdRef.current = requestAnimationFrame(tick); return; }

      const feFuncR = filter.querySelector("feFuncR");
      const feFuncG = filter.querySelector("feFuncG");
      const feFuncB = filter.querySelector("feFuncB");
      const feBlur = filter.querySelector("feGaussianBlur");

      if (
        !(feFuncR instanceof SVGFEFuncRElement) ||
        !(feFuncG instanceof SVGFEFuncGElement) ||
        !(feFuncB instanceof SVGFEFuncBElement)
      ) {
        frameIdRef.current = requestAnimationFrame(tick);
        return;
      }

      if (elapsed < totalDuration) {
        const phase = ((elapsed * sweepSpeed) / 1000) % 1.0;
        const animated = buildThermalTable(colors, phase, bandFrequency, stops);
        const animR = animated.r.split(" ").map(Number);
        const animG = animated.g.split(" ").map(Number);
        const animB = animated.b.split(" ").map(Number);

        if (feBlur) feBlur.setAttribute("stdDeviation", String(sweepBlur));

        if (elapsed < animationDuration) {
          feFuncR.setAttribute("tableValues", animated.r);
          feFuncG.setAttribute("tableValues", animated.g);
          feFuncB.setAttribute("tableValues", animated.b);
        } else {
          const fadeProgress = (elapsed - animationDuration) / fadeDuration;
          const BLEND_WINDOW = 0.25;
          const blend = (animArr: number[]) =>
            animArr.map((v, i) => {
              const revealAt = (1 - BLEND_WINDOW) * (1 - i / stops);
              const t = Math.max(0, Math.min(1, (fadeProgress - revealAt) / BLEND_WINDOW));
              const smooth = t * t * t * (t * (t * 6 - 15) + 10); // smootherstep
              return +(v + (identityArr[i] - v) * smooth).toFixed(4);
            }).join(" ");

          feFuncR.setAttribute("tableValues", blend(animR));
          feFuncG.setAttribute("tableValues", blend(animG));
          feFuncB.setAttribute("tableValues", blend(animB));
        }

        frameIdRef.current = requestAnimationFrame(tick);
      } else {
        feFuncR.setAttribute("tableValues", identityTable);
        feFuncG.setAttribute("tableValues", identityTable);
        feFuncB.setAttribute("tableValues", identityTable);
        if (feBlur) feBlur.setAttribute("stdDeviation", "0");
      }
    };

    frameIdRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameIdRef.current);
  }, [imgSize, inView, stops, fadeDuration, animationDuration, colors, sweepBlur, sweepSpeed, bandFrequency]);

  return (
    // Size is fully controlled by className/style on the outer div.
    // The SVG fills the div; preserveAspectRatio on the SVG handles cover vs contain.
    // Add overflow-hidden to className when using fit="cover" to clip the excess.
    <div ref={containerRef} className={className} style={style}>
      {imgSize && (
        <svg
          viewBox={`0 0 ${imgSize.w} ${imgSize.h}`}
          preserveAspectRatio={fit === "cover" ? "xMidYMid slice" : "xMidYMid meet"}
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <defs>
            <filter
              id={filterId}
              x="-10%"
              y="-10%"
              width="120%"
              height="120%"
              filterUnits="objectBoundingBox"
              primitiveUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
              ref={filterRef}
            >
              {/* <feColorMatrix type="luminanceToAlpha" in="SourceGraphic" result="luma" /> */}
              <feComponentTransfer in="SourceGraphic" result="colorized">
                <feFuncR type="table" tableValues="0 0 0 1" />
                <feFuncG type="table" tableValues="0 0 0 1" />
                <feFuncB type="table" tableValues="0 0 0 1" />
                <feFuncA type="table" tableValues="0 1" />
              </feComponentTransfer>
              <feGaussianBlur in="colorized" stdDeviation="0" />
            </filter>
          </defs>
          <image
            href={src}
            x="0"
            y="0"
            width={imgSize.w}
            height={imgSize.h}
            filter={`url(#${filterId})`}
          />
        </svg>
      )}
    </div>
  );
};

export default ThermalEffect;
