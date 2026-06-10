import { useEffect, useRef } from "react";

const STOPS = 60;
const FADE_DURATION = 1500;
const ANIMATION_DURATION = 4500;
const COLORS = ["#ffffff", "#FFFFFF", "#C8DAFF", "#FFFFFF"];
const SWEEP_BLUR = 0;

function buildThermalTable(colors: string[], phase: number) {
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
    const mapped = (t + phase) % 1.0;
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

    let fadeStartR: number[] | null = null;
    let fadeStartG: number[] | null = null;
    let fadeStartB: number[] | null = null;

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

      if (elapsed < ANIMATION_DURATION) {
        const t = (elapsed / ANIMATION_DURATION) * (ANIMATION_DURATION * 60 / 1000);
        const phase = (0.25 + t * 0.015 * 0.22 + t * 0.0013) % 1.0;
        const tables = buildThermalTable(COLORS, phase);
        feFuncR.setAttribute("tableValues", tables.r);
        feFuncG.setAttribute("tableValues", tables.g);
        feFuncB.setAttribute("tableValues", tables.b);
        if (feBlur) feBlur.setAttribute("stdDeviation", String(SWEEP_BLUR));
        frameId = requestAnimationFrame(tick);
      } else if (elapsed < totalDuration) {
        if (!fadeStartR) {
          fadeStartR = feFuncR.getAttribute("tableValues")!.split(" ").map(Number);
          fadeStartG = feFuncG.getAttribute("tableValues")!.split(" ").map(Number);
          fadeStartB = feFuncB.getAttribute("tableValues")!.split(" ").map(Number);
        }

        const fadeProgress = (elapsed - ANIMATION_DURATION) / FADE_DURATION;
        const BLEND_WINDOW = 0.35;
        const restore = (arr: number[]) =>
          arr.map((v, i) => {
            // Scale revealAt so the last stop's window ends at exactly fadeProgress=1.0
            const revealAt = (1 - BLEND_WINDOW) * (1 - i / STOPS);
            const t = Math.max(0, Math.min(1, (fadeProgress - revealAt) / BLEND_WINDOW));
            const smooth = t * t * t * (t * (t * 6 - 15) + 10); // smootherstep
            return +(v + (identityArr[i] - v) * smooth).toFixed(4);
          }).join(" ");

        feFuncR.setAttribute("tableValues", restore(fadeStartR!));
        feFuncG.setAttribute("tableValues", restore(fadeStartG!));
        feFuncB.setAttribute("tableValues", restore(fadeStartB!));
        if (feBlur) {
          const blurEased = SWEEP_BLUR * (1 - fadeProgress) * (1 - fadeProgress);
          feBlur.setAttribute("stdDeviation", blurEased.toFixed(3));
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
    <div className="w-full h-screen flex justify-center items-center">
      <svg
        viewBox="0 0 100 100"
        className="bg-[#f3f3f3] rounded-3xl w-[500px] h-[500px]"
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
