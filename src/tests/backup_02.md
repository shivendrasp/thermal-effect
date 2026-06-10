import { useEffect, useRef } from "react";

const STOPS = 60;
const FADE_DURATION = 1000;
const ANIMATION_DURATION = 4500;
const COLORS = [
  "#ffffff",
  "#FFD478",
  "#E4FF8D",
  "#FFFFFF",
  "#ffffff",
];
const SWEEP_BLUR = 0;
const SWEEP_SPEED = 0.6;
const BAND_FREQUENCY = 1;

function buildThermalTable(colors: string[], phase: number, frequency: number) {
  const n = colors.length;
  const stops: [number, number, number][] = [];
  for (let i = 0; i < n; ++i) {
    const hex = colors[i].replace("#", "");
    stops.push([
      parseInt(hex.slice(0, 2), 16) / 255,
      parseInt(hex.slice(2, 4), 16) / 255,
      parseInt(hex.slice(4, 6), 16) / 255,
    ]);
  }
  const tableR: number[] = [];
  const tableG: number[] = [];
  const tableB: number[] = [];
  for (let i = 0; i <= STOPS; ++i) {
    const t = i / STOPS;
    const mapped = ((t * frequency + phase) % 1.0 + 1.0) % 1.0;
    const idx = mapped * (n - 1);
    const i0 = Math.floor(idx);
    const i1 = Math.min(i0 + 1, n - 1);
    const lerp = idx - i0;
    tableR.push(+(stops[i0][0] * (1 - lerp) + stops[i1][0] * lerp).toFixed(4));
    tableG.push(+(stops[i0][1] * (1 - lerp) + stops[i1][1] * lerp).toFixed(4));
    tableB.push(+(stops[i0][2] * (1 - lerp) + stops[i1][2] * lerp).toFixed(4));
  }
  return { r: tableR.join(" "), g: tableG.join(" "), b: tableB.join(" ") };
}

const ThermalLoad = () => {
  const ref = useRef<SVGFilterElement | null>(null);

  useEffect(() => {
    let frameId: number;
    const animStart = performance.now();
    const totalDuration = ANIMATION_DURATION + FADE_DURATION;

    const identityArr = Array(STOPS + 1)
      .fill(0)
      .map((_, i) => +(i / STOPS).toFixed(4));
    const identityTable = identityArr.join(" ");

    function tick(now: number) {
      const elapsed = now - animStart;
      const filter = ref.current;
      if (!filter) { frameId = requestAnimationFrame(tick); return; }

      const feFuncR = filter.querySelector("feFuncR");
      const feFuncG = filter.querySelector("feFuncG");
      const feFuncB = filter.querySelector("feFuncB");
      const feBlur = filter.querySelector("feGaussianBlur");
      if (
        !(feFuncR instanceof SVGFEFuncRElement) ||
        !(feFuncG instanceof SVGFEFuncGElement) ||
        !(feFuncB instanceof SVGFEFuncBElement)
      ) {
        frameId = requestAnimationFrame(tick);
        return;
      }

      if (elapsed < totalDuration) {
        // Bands keep moving throughout — including during the reveal
        const phase = (elapsed * SWEEP_SPEED / 1000) % 1.0;
        const animated = buildThermalTable(COLORS, phase, BAND_FREQUENCY);
        const animR = animated.r.split(" ").map(Number);
        const animG = animated.g.split(" ").map(Number);
        const animB = animated.b.split(" ").map(Number);

        if (feBlur) feBlur.setAttribute("stdDeviation", String(SWEEP_BLUR));

        if (elapsed < ANIMATION_DURATION) {
          feFuncR.setAttribute("tableValues", animated.r);
          feFuncG.setAttribute("tableValues", animated.g);
          feFuncB.setAttribute("tableValues", animated.b);
        } else {
          const fadeProgress = (elapsed - ANIMATION_DURATION) / FADE_DURATION;
          const BLEND_WINDOW = 0.25;
          const blend = (animArr: number[]) =>
            animArr.map((v, i) => {
              const revealAt = (1 - BLEND_WINDOW) * (1 - i / STOPS);
              const t = Math.max(0, Math.min(1, (fadeProgress - revealAt) / BLEND_WINDOW));
              const smooth = t * t * t * (t * (t * 6 - 15) + 10); // smootherstep
              return +(v + (identityArr[i] - v) * smooth).toFixed(4);
            }).join(" ");

          feFuncR.setAttribute("tableValues", blend(animR));
          feFuncG.setAttribute("tableValues", blend(animG));
          feFuncB.setAttribute("tableValues", blend(animB));
        }

        frameId = requestAnimationFrame(tick);
      } else {
        feFuncR.setAttribute("tableValues", identityTable);
        feFuncG.setAttribute("tableValues", identityTable);
        feFuncB.setAttribute("tableValues", identityTable);
        if (feBlur) feBlur.setAttribute("stdDeviation", "0");
      }
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="w-full h-screen flex justify-center items-center bg-[#dfdfdf]">
      <svg
        viewBox="0 0 100 100"
        className="bg-none rounded-3xl w-[500px] h-[500px]"
      >
        <defs>
          <filter
            id="thermal-map"
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
            filterUnits="objectBoundingBox"
            primitiveUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
            ref={ref}
          >
            <feColorMatrix
              type="luminanceToAlpha"
              in="SourceGraphic"
              result="luma"
            />
            <feComponentTransfer in="SourceGraphic" result="colorized">
              <feFuncR type="table" tableValues="0 0 0 1" />
              <feFuncG type="table" tableValues="0 0 0 1" />
              <feFuncB type="table" tableValues="0 0 0 1" />
              <feFuncA type="table" tableValues="0 1" />
            </feComponentTransfer>
            <feGaussianBlur in="colorized" stdDeviation="0" result="blurred" />
            <feBlend
              mode="normal"
              in="blurred"
              in2="SourceGraphic"
              result="blend"
            />
          </filter>
        </defs>
        <image
          href="./1.jpeg"
          x="0"
          y="0"
          width="100"
          height="100"
          preserveAspectRatio="xMidYMid meet"
          filter="url(#thermal-map)"
        />
      </svg>
    </div>
  );
};

export default ThermalLoad;
