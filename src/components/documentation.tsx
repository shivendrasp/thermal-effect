import { useEffect, useState } from "react";
import { Check, Copy, Astroid } from "lucide-react";
import XIcon from "../../icons/x";
import ThermalEffect from "./thermal-effect";

const FONT = "'Inter Tight', sans-serif";
const TEXT = "#767676";
const t = { fontFamily: FONT, color: TEXT };

// ─── Slides ───────────────────────────────────────────────────────────────────

const SLIDES = [
  {
    src: "./images/1.jpeg",
    colors: ["#D9D9D9", "#FFAAED", "#D9D9D9"],
    sweepSpeed: 0.4,
    bandFrequency: 2,
    sweepBlur: 0.4,
    animationDuration: 3500,
    fadeDuration: 1400,
  },
  {
    src: "./images/2.jpg",
    colors: ["#95A5FF", "#D8D8D8", "#FF4444", "#ADE6FF", "#95A5FF"],
    sweepSpeed: 0.2,
    bandFrequency: 0.4,
    sweepBlur: 0.2,
    animationDuration: 1500,
    fadeDuration: 2500,
  },
  {
    src: "./images/3.jpg",
    colors: ["#7B98FF", "#FFDEDE", "#BDC7FF", "#FFFFFF", "#7B98FF"],
    sweepSpeed: 0.8,
    bandFrequency: 1,
    sweepBlur: 0.1,
    animationDuration: 1000,
    fadeDuration: 1500,
  },
  {
    src: "./images/4.jpg",
    colors: ["#C6CEFF", "#FF7676", "#C6CEFF"],
    sweepSpeed: 1,
    bandFrequency: 1,
    sweepBlur: 0.1,
    animationDuration: 1000,
    fadeDuration: 1400,
  },
  {
    src: "./images/6.png",
    colors: ["#FFFFFF", "#91FFCF", "#91FFCF", "#DAD9FF", "#DAD9FF", "#FFFFFF"],
    sweepSpeed: 0.8,
    bandFrequency: 2,
    sweepBlur: 0,
    animationDuration: 2500,
    fadeDuration: 2500,
  },
  {
    src: "./images/8.jpg",
    colors: ["#D2D2D2", "#2A2A2A", "#FF9393", "#D2D2D2", "#D2D2D2", "#D2D2D2"],
    sweepSpeed: 0.8,
    bandFrequency: 1,
    sweepBlur: 0.5,
    animationDuration: 1500,
    fadeDuration: 1200,
  },
  {
    src: "./images/7.jpg",
    colors: ["#BDBBFF", "#BDBBFF", "#6AFFFD", "#BDBBFF", "#BDBBFF"],
    sweepSpeed: 0.6,
    bandFrequency: 0.4,
    sweepBlur: 0.2,
    animationDuration: 1200,
    fadeDuration: 1300,
  },
];

// ─── Code block ───────────────────────────────────────────────────────────────

function CodeBlock({ code, lang = "tsx" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = code;
      ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* fallback */
      }
      document.body.removeChild(ta);
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(fallback);
    } else {
      fallback();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        background: "#111111",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 18px",
          borderBottom: "1px solid #1C1C1C",
        }}
      >
        <span
          style={{
            ...t,
            fontSize: 11,
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
            color: "#888888",
          }}
        >
          {lang}
        </span>
        <button
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy code"}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative" as const,
            width: 22,
            height: 22,
          }}
        >
          <span
            style={{
              position: "absolute" as const,
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "opacity 0.2s ease, transform 0.2s ease",
              opacity: copied ? 0 : 0.4,
              transform: copied
                ? "scale(0.6) rotate(-10deg)"
                : "scale(1) rotate(0deg)",
            }}
          >
            <Copy size={14} color={TEXT} />
          </span>
          <span
            style={{
              position: "absolute" as const,
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "opacity 0.2s ease, transform 0.2s ease",
              opacity: copied ? 1 : 0,
              transform: copied
                ? "scale(1) rotate(0deg)"
                : "scale(0.6) rotate(10deg)",
            }}
          >
            <Check size={14} color="#4ade80" />
          </span>
        </button>
      </div>
      <pre style={{ margin: 0, padding: "20px 18px", overflowX: "auto" }}>
        <code
          style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 12.5,
            lineHeight: 1.75,
            color: "#d4d4d4",
            whiteSpace: "pre",
          }}
        >
          {code}
        </code>
      </pre>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ paddingTop: 64 }}>
      <h2
        style={{
          ...t,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase" as const,
          marginBottom: 20,
          color: "#767676",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

// ─── Props table ──────────────────────────────────────────────────────────────

const PROPS = [
  {
    name: "src",
    type: "string",
    required: true,
    default: "—",
    description: "Image URL or local path",
  },
  {
    name: "colors",
    type: "string[]",
    required: false,
    default: "['#fff', ...]",
    description: "Hex color stops for the sweep gradient",
  },
  {
    name: "animationDuration",
    type: "number",
    required: false,
    default: "3500",
    description: "Duration of the color-sweep phase in ms",
  },
  {
    name: "fadeDuration",
    type: "number",
    required: false,
    default: "1200",
    description: "Duration of the image-reveal fade in ms",
  },
  {
    name: "sweepSpeed",
    type: "number",
    required: false,
    default: "0.6",
    description: "Phase units per second — higher = faster bands",
  },
  {
    name: "bandFrequency",
    type: "number",
    required: false,
    default: "1",
    description: "Color cycles visible at once — higher = more bands",
  },
  {
    name: "sweepBlur",
    type: "number",
    required: false,
    default: "0",
    description: "Gaussian blur during the sweep phase",
  },
  {
    name: "stops",
    type: "number",
    required: false,
    default: "60",
    description: "Color table resolution — higher = smoother gradients",
  },
  {
    name: "fit",
    type: '"cover" | "contain"',
    required: false,
    default: '"cover"',
    description: "How the image fills its container",
  },
  {
    name: "className",
    type: "string",
    required: false,
    default: "—",
    description: "Classes on the wrapper — controls size, radius, etc.",
  },
  {
    name: "style",
    type: "CSSProperties",
    required: false,
    default: "—",
    description: "Inline styles on the wrapper div",
  },
];

function PropsTable() {
  return (
    <div
      style={{
        border: "1px solid #e8e8e8",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            ...t,
            fontSize: 13,
          }}
        >
          <thead>
            <tr
              style={{
                background: "#f9f9f9",
                borderBottom: "1px solid #e8e8e8",
              }}
            >
              {["Prop", "Type", "Default", "Description"].map((h) => (
                <th
                  key={h}
                  style={{
                    ...t,
                    padding: "11px 18px",
                    textAlign: "left" as const,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase" as const,
                    color: "#767676",
                    whiteSpace: "nowrap" as const,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PROPS.map((p, i) => (
              <tr
                key={p.name}
                style={{
                  borderBottom:
                    i < PROPS.length - 1 ? "1px solid #f0f0f0" : "none",
                  background: "#fff",
                }}
              >
                <td
                  style={{
                    padding: "13px 18px",
                    whiteSpace: "nowrap" as const,
                  }}
                >
                  <code
                    style={{
                      fontFamily: "'Roboto Mono', monospace",
                      fontSize: 12,
                      color: "#3a3a3a",
                      background: "#f3f3f3",
                      border: "1px solid #eaeaea",
                      borderRadius: 6,
                      padding: "2px 8px",
                    }}
                  >
                    {p.name}
                  </code>
                  {p.required && (
                    <span
                      style={{
                        marginLeft: 7,
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#B83224",
                        letterSpacing: "0.04em",
                      }}
                    >
                      req
                    </span>
                  )}
                </td>
                <td
                  style={{
                    padding: "13px 18px",
                    whiteSpace: "nowrap" as const,
                  }}
                >
                  <code
                    style={{
                      fontFamily: "'Roboto Mono', monospace",
                      fontSize: 12,
                      color: "#888",
                    }}
                  >
                    {p.type}
                  </code>
                </td>
                <td
                  style={{
                    padding: "13px 18px",
                    whiteSpace: "nowrap" as const,
                  }}
                >
                  <code
                    style={{
                      fontFamily: "'Roboto Mono', monospace",
                      fontSize: 12,
                      color: "#888",
                    }}
                  >
                    {p.default}
                  </code>
                </td>
                <td style={{ padding: "13px 18px", ...t, lineHeight: 1.65 }}>
                  {p.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Code strings ─────────────────────────────────────────────────────────────

const INSTALL_CODE = `npx shadcn@latest add shivendrasp/thermal-effect/thermal-effect`;

const USAGE_CODE = `import ThermalEffect from "@/components/thermal-effect"

<ThermalEffect
src="./images/flower.png"
animationDuration={1500}
fadeDuration={2000}
sweepSpeed={0.8}
bandFrequency={1}
sweepBlur={0.2}
stops={30}
colors={["#ECECEC", "#FFBBFA", "#FF7B47", "#FFD3D3", "#ECECEC"]}
className="w-200 h-120 rounded-2xl overflow-hidden"
/>`;

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Documentation() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [mountKey, setMountKey] = useState(0);

  useEffect(() => {
    SLIDES.forEach((s) => {
      const img = new window.Image();
      img.src = s.src;
    });
  }, []);

  const goTo = (idx: number) => {
    if (idx === activeIdx) return;
    setActiveIdx(idx);
    setMountKey((k) => k + 1);
  };

  const slide = SLIDES[activeIdx];

  return (
    <div
      style={{
        fontFamily: FONT,
        color: TEXT,
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 32px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Hero ── */}
      <section
        className="hero-section"
        style={{
          display: "flex",
          flexDirection: "column",
          paddingTop: 32,
          paddingBottom: 36,
        }}
      >
        <div
          key={mountKey}
          role="button"
          tabIndex={0}
          aria-label={`Slide ${activeIdx + 1} of ${SLIDES.length}. Click to advance.`}
          onClick={() => goTo((activeIdx + 1) % SLIDES.length)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              goTo((activeIdx + 1) % SLIDES.length);
            }
          }}
          style={{
            flex: 1,
            minHeight: 0,
            borderRadius: 24,
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          <ThermalEffect
            key={mountKey}
            {...slide}
            stops={60}
            className="w-full h-full"
          />
        </div>

        {/* Dots */}
        <nav
          aria-label="Slide navigation"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 7,
            padding: "20px 0",
          }}
        >
          {SLIDES.map((_, i) => (
            <div
              key={i}
              role="button"
              tabIndex={0}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === activeIdx ? "true" : undefined}
              onClick={() => goTo(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  goTo(i);
                }
              }}
              style={{
                width: i === activeIdx ? 20 : 7,
                height: 7,
                borderRadius: 99,
                background: i === activeIdx ? "#767676" : "#d9d9d9",
                transition: "width 0.3s ease, background 0.3s ease",
                cursor: "pointer",
              }}
            />
          ))}
        </nav>

        {/* Paragraph */}
        <p style={{ ...t, fontSize: 16, lineHeight: 1.4, textAlign: "center" }}>
          The thermal effect draws from infrared imaging — a visual language
          where heat, not light, determines color. In thermal cameras, cool
          surfaces read as deep blues and purples while warm surfaces bloom into
          yellows, oranges, and whites. Borrowed as a design motif, this
          remapping of luminance to temperature-coded color transforms an
          ordinary photograph into something that feels alive and charged.
          Bright pixels glow hot, shadows run cold, and midtones pulse through
          the full spectrum in between. As a loading technique it earns its keep
          twice over: it masks the wait behind something genuinely worth
          watching, and it gives the arriving image a sense of weight — as if it
          is cooling down from something raw into the photograph you finally
          see.
        </p>
      </section>

      {/* Divider */}
      <div style={{ height: 1, background: "#DCDCDC" }} />

      {/* ── Docs ── */}
      <div
        style={{
          padding: "0 0 42px",
          background: "transparent",
          alignSelf: "center",
          maxWidth: "800px",
        }}
      >
        <Section title="Installation">
          <CodeBlock code={INSTALL_CODE} lang="bash" />
        </Section>

        <Section title="Usage">
          <CodeBlock code={USAGE_CODE} lang="tsx" />
        </Section>

        <div style={{ height: 1, background: "#DCDCDC", marginTop: 64 }} />

        <Section title="Props">
          <PropsTable />
        </Section>

        <div style={{ height: 1, background: "#DCDCDC", marginTop: 64 }} />

        <Section title="Notes">
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {[
              "Animation starts only once the image has loaded and the element enters the viewport (IntersectionObserver, 10% threshold).",
              "Multiple instances on the same page are safe — each generates a unique SVG filter ID via useId().",
              'Set only width via className and height follows the image\'s natural aspect ratio. Set both for a fixed box — fit="cover" by default.',
              "colors should start and end near white (#FFFFFF) for a natural reveal back to the real image.",
              "Increase stops for smoother gradients at the cost of slightly more DOM attribute churn per frame.",
            ].map((note, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  gap: 14,
                  fontSize: 14,
                  ...t,
                  lineHeight: 1.7,
                }}
              >
                <span style={{ opacity: 0.3, flexShrink: 0, marginTop: 4 }}>
                  <Astroid size={16} />
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </Section>

        <div style={{ height: 1, background: "#DCDCDC", marginTop: 64 }} />

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: 36,
            paddingBottom: 8,
          }}
        >
          <a
            href="https://x.com/shiv_visual"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              color: TEXT,
              transition: "color 0.2s ease",
              fontSize: 13,
              fontFamily: FONT,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#333333")}
            onMouseLeave={(e) => (e.currentTarget.style.color = TEXT)}
          >
            <XIcon width={13} height={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
