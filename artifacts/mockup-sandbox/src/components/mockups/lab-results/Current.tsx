import "./_group.css";
import { SAMPLE_RESULTS, type LabResult, type GlossaryTerm } from "./data";

const c = {
  pageBg: "#f7f3ee",
  surface: "#faf8f5",
  surfaceAlt: "#efe9e0",
  inputBg: "#f7f3ee",
  text: "#1a1612",
  textSecondary: "#3d3630",
  textMuted: "#7a7068",
  textFaint: "#b0a89e",
  border: "rgba(26,22,18,0.1)",
  borderStrong: "rgba(26,22,18,0.15)",
  borderFaint: "rgba(26,22,18,0.06)",
  accent: "#2d6a4f",
  btnBg: "#1a1612",
  btnText: "#f7f3ee",
  iconStroke: "#7a7068",
  brandIconBg: "#1a1612",
  brandIconStroke: "white",
  shadow: "0 1px 3px rgba(26,22,18,0.08)",
  statusColors: {
    normal:   { dot: "#2d6a4f", text: "#2d6a4f", bg: "#e8f4ef", border: "#a8d5bb" },
    low:      { dot: "#c87941", text: "#c87941", bg: "#fdf0e6", border: "#f0c090" },
    high:     { dot: "#c87941", text: "#c87941", bg: "#fdf0e6", border: "#f0c090" },
    critical: { dot: "#c0392b", text: "#c0392b", bg: "#fdecea", border: "#f5a9a3" },
  } as const,
  overall: {
    normal:    { bg: "#e8f4ef", border: "#2d6a4f" },
    attention: { bg: "#fdf0e6", border: "#c87941" },
    concern:   { bg: "#fdecea", border: "#c0392b" },
  } as const,
};

function escapeRegex(s: string) {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

function GlossyText({ text, glossary }: { text: string; glossary: GlossaryTerm[] }) {
  if (!text || typeof text !== "string") return <>{text || null}</>;
  if (!glossary || glossary.length === 0) return <>{text}</>;
  const valid = glossary.filter((g) => g && typeof g.term === "string" && g.term.trim().length > 1);
  if (valid.length === 0) return <>{text}</>;
  const sorted = [...valid].sort((a, b) => b.term.length - a.term.length);
  const pattern = sorted.map((g) => escapeRegex(g.term)).join("|");
  const re = new RegExp(`(${pattern})`, "gi");
  const lookup = new Map(valid.map((g) => [g.term.toLowerCase(), g.definition || ""]));
  const segments: (string | JSX.Element)[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  re.lastIndex = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) segments.push(text.slice(last, m.index));
    const matched = m[0];
    const def = lookup.get(matched.toLowerCase());
    if (def) {
      segments.push(
        <span
          key={`${m.index}-${matched}`}
          style={{
            borderBottom: `1px dotted ${c.textMuted}`,
            cursor: "help",
          }}
          title={def}
        >
          {matched}
        </span>
      );
    } else {
      segments.push(matched);
    }
    last = m.index + matched.length;
    if (m.index === re.lastIndex) re.lastIndex++;
  }
  if (last < text.length) segments.push(text.slice(last));
  return <>{segments}</>;
}

export function Current() {
  const data = SAMPLE_RESULTS;
  const ov = c.overall[data.overallStatus] || c.overall.normal;
  const allResults = data.results;
  const counts = allResults.reduce(
    (acc, r) => {
      if (r.status === "normal") acc.normal++;
      else if (r.status === "critical") acc.critical++;
      else acc.attention++;
      return acc;
    },
    { normal: 0, attention: 0, critical: 0 }
  );
  const G = (text: string) => <GlossyText text={text} glossary={data.glossary} />;

  return (
    <div
      className="lab-results-root"
      style={{
        background: c.pageBg,
        color: c.text,
        minHeight: "100vh",
        padding: "0 20px 60px",
        maxWidth: 1040,
        margin: "0 auto",
        fontFamily: "Georgia, serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "24px 0 18px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          borderBottom: `1px solid ${c.border}`,
          marginBottom: 28,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              background: c.brandIconBg,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c.brandIconStroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1, color: c.text }}>
              Lab<span style={{ fontStyle: "italic", fontWeight: 400, color: c.accent }}>Lens</span>
            </div>
            <div className="sans" style={{ fontSize: 11, color: c.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", marginTop: 3 }}>
              Lab result explainer
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="sans" style={togglePill(true)}>EN</button>
            <button className="sans" style={togglePill(false)}>FIL</button>
            <span style={{ width: 8 }} />
            <button className="sans" style={togglePill(true)}>☀</button>
            <button className="sans" style={togglePill(false)}>☾</button>
          </div>
          <div className="sans" style={{ fontSize: 11, color: c.textFaint, textAlign: "right", maxWidth: 180, lineHeight: 1.5 }}>
            Not a substitute for professional medical advice
          </div>
        </div>
      </header>

      {/* Title row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: c.text }}>Your results, explained</div>
          <div className="sans" style={{ fontSize: 11.5, color: c.textMuted, marginTop: 2 }}>
            Analyzed {data.analyzedDate}
          </div>
        </div>
        <button className="sans" style={{ background: "transparent", border: `1px solid ${c.borderStrong}`, color: c.textMuted, fontSize: 12, padding: "6px 13px", borderRadius: 8, cursor: "pointer" }}>
          ↩ Analyze another
        </button>
      </div>

      {/* Overall summary */}
      <div
        style={{
          background: ov.bg,
          border: `1px solid ${c.border}`,
          borderLeftWidth: 4,
          borderLeftColor: ov.border,
          borderRadius: 12,
          padding: "14px 18px",
          marginBottom: 14,
          boxShadow: c.shadow,
        }}
      >
        <div className="sans" style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, color: ov.border }}>
          {data.overallLabel}
        </div>
        <div className="sans" style={{ fontSize: 14, color: c.textSecondary, lineHeight: 1.55 }}>
          {G(data.summary)}
        </div>
      </div>

      {/* Stat bar */}
      <div className="sans" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11.5, color: c.textMuted, fontWeight: 500, padding: "4px 10px", background: c.surface, border: `1px solid ${c.border}`, borderRadius: 14 }}>
          {allResults.length} results
        </span>
        {counts.normal > 0 && <StatPill kind="normal" label={`${counts.normal} normal`} />}
        {counts.attention > 0 && <StatPill kind="high" label={`${counts.attention} needs attention`} />}
        {counts.critical > 0 && <StatPill kind="critical" label={`${counts.critical} concerning`} />}
        <span style={{ fontSize: 11, color: c.textMuted, fontStyle: "italic", marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5 }}>
          ⓘ Hover the underlined words for a plain-language definition.
        </span>
      </div>

      {/* Result cards grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
          gap: 10,
          marginBottom: 14,
        }}
      >
        {allResults.map((r, i) => (
          <ResultCard key={i} r={r} G={G} />
        ))}
      </div>

      {/* Question sections */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 12 }}>
        <QuestionsCard title="Questions to ask your doctor" items={data.questionsToAsk} G={G} />
        <QuestionsCard title="Follow-up questions on abnormal results" items={data.followUpQuestions} G={G} />
      </div>

      {/* Chat */}
      <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 12, boxShadow: c.shadow }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: c.text, display: "flex", alignItems: "center", gap: 6 }}>
          💬 Ask LabLens a follow-up
        </div>
        <div className="sans" style={{ fontSize: 11.5, color: c.textMuted, marginBottom: 10, lineHeight: 1.45 }}>
          Ask anything about your results — what a value means, what to do next, how to prepare to talk to your doctor.
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="sans"
            placeholder="Type your question…"
            style={{ flex: 1, background: c.inputBg, border: `1px solid ${c.borderStrong}`, borderRadius: 9, padding: "10px 13px", fontSize: 13, color: c.text, outline: "none" }}
          />
          <button className="sans" style={{ background: c.btnBg, color: c.btnText, border: "none", borderRadius: 9, padding: "0 18px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            ✈ Send
          </button>
        </div>
      </div>

      <div className="sans" style={{ fontSize: 11, color: c.textFaint, textAlign: "center", lineHeight: 1.55, paddingTop: 12, marginTop: 6, borderTop: `1px solid ${c.borderFaint}` }}>
        LabLens uses AI to translate medical jargon into plain language. It does not diagnose, treat, or replace a licensed medical professional.
        <br />
        Always discuss your results with your doctor before making any health decisions.
      </div>
    </div>
  );

  function togglePill(active: boolean): React.CSSProperties {
    return {
      background: active ? c.btnBg : "transparent",
      color: active ? c.btnText : c.textMuted,
      border: `1px solid ${active ? c.btnBg : c.borderStrong}`,
      fontSize: 11,
      fontWeight: 500,
      padding: "5px 10px",
      borderRadius: 7,
      cursor: "pointer",
      letterSpacing: "0.04em",
    };
  }
}

function StatPill({ kind, label }: { kind: "normal" | "high" | "critical"; label: string }) {
  const sc = c.statusColors[kind];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11.5,
        color: sc.text,
        background: sc.bg,
        padding: "4px 10px",
        borderRadius: 14,
        fontWeight: 500,
        border: `1px solid ${sc.border}`,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot }} />
      {label}
    </span>
  );
}

function ResultCard({ r, G }: { r: LabResult; G: (text: string) => JSX.Element }) {
  const sc = c.statusColors[r.status] || c.statusColors.normal;
  const showDetails = r.status !== "normal" && ((r.possibleCauses?.length ?? 0) > 0 || (r.possibleRemedies?.length ?? 0) > 0);
  const bothColumns = (r.possibleCauses?.length ?? 0) > 0 && (r.possibleRemedies?.length ?? 0) > 0;
  return (
    <div
      style={{
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderLeftWidth: 3,
        borderLeftColor: sc.border,
        borderRadius: 11,
        padding: "12px 14px",
        boxShadow: c.shadow,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 5 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5, color: c.text, lineHeight: 1.3 }}>{G(r.name)}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot }} />
          <div style={{ fontFamily: "Georgia,serif", fontSize: 15, fontWeight: 600, color: sc.text }}>{r.value}</div>
        </div>
      </div>
      {r.referenceRange && (
        <div className="sans" style={{ fontSize: 11, color: c.textFaint, marginBottom: 6 }}>
          Reference range: {r.referenceRange}
        </div>
      )}
      <div className="sans" style={{ fontSize: 12.5, color: c.textSecondary, lineHeight: 1.5 }}>
        {G(r.explanation)}
      </div>

      {showDetails && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: bothColumns ? "1fr 1fr" : "1fr",
            gap: 10,
            marginTop: 9,
            paddingTop: 9,
            borderTop: `1px solid ${c.borderFaint}`,
          }}
        >
          {(r.possibleCauses?.length ?? 0) > 0 && (
            <div>
              <div className="sans" style={detailLabelStyle()}>⚠ Possible causes</div>
              {r.possibleCauses!.map((cause, j) => (
                <div key={j} className="sans" style={detailItemStyle()}>
                  <span style={{ position: "absolute", left: 0, top: 2, color: c.textMuted, fontSize: 11 }}>•</span>
                  {G(cause)}
                </div>
              ))}
            </div>
          )}
          {(r.possibleRemedies?.length ?? 0) > 0 && (
            <div>
              <div className="sans" style={detailLabelStyle()}>♥ Possible remedies</div>
              {r.possibleRemedies!.map((remedy, j) => (
                <div key={j} className="sans" style={detailItemStyle()}>
                  <span style={{ position: "absolute", left: 0, top: 2, color: c.textMuted, fontSize: 11 }}>•</span>
                  {G(remedy)}
                </div>
              ))}
            </div>
          )}
          {(r.possibleRemedies?.length ?? 0) > 0 && (
            <div className="sans" style={{ fontSize: 10.5, color: c.textFaint, fontStyle: "italic", marginTop: 5, gridColumn: "1 / -1" }}>
              Discuss these with your doctor before acting on them.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuestionsCard({ title, items, G }: { title: string; items: string[]; G: (text: string) => JSX.Element }) {
  return (
    <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: "14px 16px", boxShadow: c.shadow }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: c.text, display: "flex", alignItems: "center", gap: 6 }}>
        ❓ {title}
      </div>
      {items.map((q, i) => (
        <div key={i} className="sans" style={{ fontSize: 12.5, color: c.textSecondary, padding: "7px 11px", background: c.inputBg, borderRadius: 8, lineHeight: 1.45, marginBottom: 5, border: `1px solid ${c.borderFaint}` }}>
          → {G(q)}
        </div>
      ))}
    </div>
  );
}

function detailLabelStyle(): React.CSSProperties {
  return {
    fontSize: 9.5,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: c.textMuted,
    marginBottom: 5,
    display: "flex",
    alignItems: "center",
    gap: 5,
  };
}

function detailItemStyle(): React.CSSProperties {
  return {
    fontSize: 12,
    color: c.textSecondary,
    lineHeight: 1.45,
    padding: "2px 0 2px 11px",
    position: "relative",
  };
}
