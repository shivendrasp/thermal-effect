import { useEffect, useRef } from "react";

const STOPS = 24;

// Helper to generate stepped table values for feFunc values
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
    let mapped = t + phase;
    mapped = mapped % 1.0;
    const idx = mapped * (n - 1);
    const i0 = Math.floor(idx);
    const i1 = Math.min(i0 + 1, n - 1);
    const lerp = idx - i0;
    tableR.push(
      +(stops[i0][0] * (1 - lerp) + stops[i1][0] * lerp).toFixed(4)
    );
    tableG.push(
      +(stops[i0][1] * (1 - lerp) + stops[i1][1] * lerp).toFixed(4)
    );
    tableB.push(
      +(stops[i0][2] * (1 - lerp) + stops[i1][2] * lerp).toFixed(4)
    );
  }
  return {
    r: tableR.join(" "),
    g: tableG.join(" "),
    b: tableB.join(" "),
  };
}

const ColorMapping = () => {
  const colors = [
    "#F9C0FF",
    "#D6D6D6",
    "#ffffff",
    "#FFE38D",
    "#F9C0FF",
  ];
  const ref = useRef<SVGFilterElement | null>(null);

  useEffect(() => {    
    let frameId: number;
    let t = 0;

    function animate() {
      t = t + 1;
      const phase = (0.25 + (t * 0.015) * 0.22 + t * 0.0013) % 1.0;
      const tables = buildThermalTable(colors, phase);

      const filter = ref.current;
      if (filter) {
        // Use correct SVG type casting for feFuncR/G/B (SVGFEFuncRElement etc)
        const feFuncR = filter.querySelector("feFuncR");
        const feFuncG = filter.querySelector("feFuncG");
        const feFuncB = filter.querySelector("feFuncB");
        // SVGFEFuncRElement/ SVGFEFuncGElement/ SVGFEFuncBElement are correct in TypeScript
        if (feFuncR instanceof SVGFEFuncRElement) feFuncR.setAttribute("tableValues", tables.r);
        if (feFuncG instanceof SVGFEFuncGElement) feFuncG.setAttribute("tableValues", tables.g);
        if (feFuncB instanceof SVGFEFuncBElement) feFuncB.setAttribute("tableValues", tables.b);
      }

      frameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
    // colors is a constant array, so it's OK to not include as a dependency to avoid animation reset
    // eslint-disable-next-line
  }, []);

  return (
    <div className="w-full h-screen flex justify-center items-center bg-[#ececec]">
      <svg width={500} height={500} className="bg-[#19191a]">
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
            <feComponentTransfer
              in="SourceGraphic"
              result="colorized"
            >
              <feFuncR type="table" tableValues="0 0 0 1" />
              <feFuncG type="table" tableValues="0 0 0 1" />
              <feFuncB type="table" tableValues="0 0 0 1" />
              <feFuncA type="table" tableValues="0 1" />
            </feComponentTransfer>
            <feBlend
              mode="normal"
              in="colorized"
              in2="SourceGraphic"
              result="blend"
            />
          </filter>
        </defs>
        <image
          href="./1.jpeg"
          x="0"
          y="0"
          width={500}
          height={500}
          filter="url(#thermal-map)"
          style={{ imageRendering: "pixelated" }}
        />
      </svg>
    </div>
  );
};

export default ColorMapping;
