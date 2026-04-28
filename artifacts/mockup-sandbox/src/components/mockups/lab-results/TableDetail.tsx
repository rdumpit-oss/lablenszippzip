import React, { useState } from "react";
import "./_group.css";
import { SAMPLE_RESULTS, type LabResult, type GlossaryTerm } from "./data";

const c = {
  pageBg: "var(--lr-page-bg)",
  surface: "var(--lr-surface)",
  surfaceAlt: "var(--lr-surface-alt)",
  inputBg: "var(--lr-input-bg)",
  text: "var(--lr-text)",
  textSecondary: "var(--lr-text-secondary)",
  textMuted: "var(--lr-text-muted)",
  textFaint: "var(--lr-text-faint)",
  border: "var(--lr-border)",
  borderStrong: "var(--lr-border-strong)",
  borderFaint: "var(--lr-border-faint)",
  accent: "var(--lr-accent)",
  btnBg: "var(--lr-btn-bg)",
  btnText: "var(--lr-btn-text)",
  shadow: "var(--lr-shadow)",
  statusColors: {
    normal: { dot: "var(--lr-normal-dot)", text: "var(--lr-normal-text)", bg: "var(--lr-normal-bg)", border: "var(--lr-normal-border)" },
    low: { dot: "var(--lr-attn-dot)", text: "var(--lr-attn-text)", bg: "var(--lr-attn-bg)", border: "var(--lr-attn-border)" },
    high: { dot: "var(--lr-attn-dot)", text: "var(--lr-attn-text)", bg: "var(--lr-attn-bg)", border: "var(--lr-attn-border)" },
    critical: { dot: "var(--lr-crit-dot)", text: "var(--lr-crit-text)", bg: "var(--lr-crit-bg)", border: "var(--lr-crit-border)" },
  },
  overall: {
    normal: { bg: "var(--lr-overall-normal-bg)", border: "var(--lr-overall-normal-border)" },
    attention: { bg: "var(--lr-overall-attn-bg)", border: "var(--lr-overall-attn-border)" },
    concern: { bg: "var(--lr-overall-crit-bg)", border: "var(--lr-overall-crit-border)" },
  },
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

export function TableDetail() {
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

  const togglePill = (active: boolean): React.CSSProperties => ({
    background: active ? c.btnBg : "transparent",
    color: active ? c.btnText : c.textMuted,
    border: `1px solid ${active ? c.btnBg : c.borderStrong}`,
    fontSize: 11,
    fontWeight: 500,
    padding: "4px 8px",
    borderRadius: 6,
    cursor: "pointer",
    letterSpacing: "0.04em",
  });

  return (
    <div
      className="lab-results-root"
      style={{
        background: c.pageBg,
        color: c.text,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Georgia, serif",
      }}
    >
      <div style={{ flex: 1, padding: "0 24px 80px", maxWidth: 1280, margin: "0 auto", width: "100%" }}>
        {/* Header Strip */}
        <header
          style={{
            padding: "16px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${c.border}`,
            marginBottom: 24,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: c.btnBg,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1, color: c.text }}>
                  Lab<span style={{ fontStyle: "italic", fontWeight: 400, color: c.accent }}>Lens</span>
                </div>
                <div className="sans" style={{ fontSize: 10, color: c.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", marginTop: 2 }}>
                  Lab result explainer
                </div>
              </div>
            </div>
            <div style={{ width: 1, height: 24, background: c.borderStrong }}></div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: c.text }}>Results Analysis</div>
              <div className="sans" style={{ fontSize: 11, color: c.textMuted }}>Analyzed {data.analyzedDate}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="sans" style={{ fontSize: 11, color: c.textFaint, textAlign: "right", maxWidth: 150, lineHeight: 1.3 }}>
              Not a substitute for professional medical advice
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="sans" style={togglePill(true)}>EN</button>
              <button className="sans" style={togglePill(false)}>FIL</button>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="sans" style={togglePill(true)}>☀</button>
              <button className="sans" style={togglePill(false)}>☾</button>
            </div>
            <button className="sans" style={{ background: "transparent", border: `1px solid ${c.borderStrong}`, color: c.textMuted, fontSize: 11, padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 500 }}>
              Analyze another
            </button>
          </div>
        </header>

        {/* Summary Band */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "180px 1fr 220px",
            gap: 24,
            background: c.surface,
            border: `1px solid ${c.border}`,
            borderRadius: 8,
            padding: 20,
            marginBottom: 24,
            boxShadow: c.shadow,
            alignItems: "center",
          }}
        >
          <div style={{ paddingRight: 24, borderRight: `1px solid ${c.borderFaint}`, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div className="sans" style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, color: c.textMuted }}>
              Overall Verdict
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: ov.bg, border: `1px solid ${ov.border}`, padding: "6px 12px", borderRadius: 6, color: ov.border, fontWeight: 600, fontSize: 13, lineHeight: 1.2 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: ov.border }} />
              {data.overallLabel}
            </div>
          </div>
          <div className="sans" style={{ fontSize: 14, color: c.textSecondary, lineHeight: 1.5 }}>
            {G(data.summary)}
          </div>
          <div style={{ paddingLeft: 24, borderLeft: `1px solid ${c.borderFaint}`, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
            <div className="sans" style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: c.textMuted }}>
              {allResults.length} Total Results
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {counts.normal > 0 && <StatPill kind="normal" label={`${counts.normal} normal`} />}
              {counts.attention > 0 && <StatPill kind="high" label={`${counts.attention} needs attention`} />}
              {counts.critical > 0 && <StatPill kind="critical" label={`${counts.critical} concerning`} />}
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 24, boxShadow: c.shadow }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: c.surfaceAlt, borderBottom: `2px solid ${c.borderStrong}` }}>
                <th className="sans" style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: c.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", width: "35%" }}>Name</th>
                <th className="sans" style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: c.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", width: "20%" }}>Value</th>
                <th className="sans" style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: c.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", width: "20%" }}>Reference</th>
                <th className="sans" style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: c.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", width: "25%" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {allResults.map((r, i) => (
                <React.Fragment key={i}>
                  <TableRow r={r} G={G} />
                  {r.status !== "normal" && <TableDetailRow r={r} G={G} />}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Section */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 8, padding: "20px 24px", boxShadow: c.shadow }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: c.text, display: "flex", alignItems: "center", gap: 8 }}>
              <span>❓</span> Questions to ask your doctor
            </div>
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {data.questionsToAsk.map((q, i) => (
                <li key={i} className="sans" style={{ fontSize: 13, color: c.textSecondary, lineHeight: 1.4, paddingLeft: 4 }}>
                  {G(q)}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 8, padding: "20px 24px", boxShadow: c.shadow }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: c.text, display: "flex", alignItems: "center", gap: 8 }}>
              <span>🔍</span> Follow-up questions on abnormal results
            </div>
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {data.followUpQuestions.map((q, i) => (
                <li key={i} className="sans" style={{ fontSize: 13, color: c.textSecondary, lineHeight: 1.4, paddingLeft: 4 }}>
                  {G(q)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Chat Bar */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: c.surface,
          borderTop: `1px solid ${c.borderStrong}`,
          padding: "16px 24px",
          boxShadow: "0 -4px 12px rgba(26, 22, 18, 0.05)",
          display: "flex",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: 800, width: "100%", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 18 }}>💬</div>
          <input
            className="sans"
            placeholder="Ask LabLens a follow-up question about these results..."
            style={{
              flex: 1,
              background: c.inputBg,
              border: `1px solid ${c.borderStrong}`,
              borderRadius: 8,
              padding: "12px 16px",
              fontSize: 14,
              color: c.text,
              outline: "none",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)",
            }}
          />
          <button
            className="sans"
            style={{
              background: c.btnBg,
              color: c.btnText,
              border: "none",
              borderRadius: 8,
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function TableRow({ r, G }: { r: LabResult; G: (text: string) => JSX.Element }) {
  const sc = c.statusColors[r.status] || c.statusColors.normal;
  const isNormal = r.status === "normal";

  return (
    <tr style={{ borderBottom: `1px solid ${c.borderFaint}`, background: isNormal ? "transparent" : sc.bg }}>
      <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: 14, color: c.text }}>
        {G(r.name)}
      </td>
      <td style={{ padding: "12px 16px", fontSize: 15, fontWeight: 600, color: isNormal ? c.text : sc.text }}>
        {r.value}
      </td>
      <td className="sans" style={{ padding: "12px 16px", fontSize: 13, color: c.textSecondary }}>
        {r.referenceRange || "—"}
      </td>
      <td style={{ padding: "12px 16px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: isNormal ? c.surfaceAlt : c.pageBg, padding: "4px 8px", borderRadius: 4, border: `1px solid ${sc.border}` }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: sc.dot }} />
          <span className="sans" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: sc.text }}>
            {r.status}
          </span>
        </div>
      </td>
    </tr>
  );
}

function TableDetailRow({ r, G }: { r: LabResult; G: (text: string) => JSX.Element }) {
  const sc = c.statusColors[r.status] || c.statusColors.normal;

  return (
    <tr style={{ borderBottom: `2px solid ${c.borderStrong}` }}>
      <td colSpan={4} style={{ padding: 0 }}>
        <div style={{ padding: "16px 24px", background: c.pageBg, borderLeft: `4px solid ${sc.dot}` }}>
          <div style={{ marginBottom: 12 }}>
            <span className="sans" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: c.textMuted, marginRight: 8 }}>
              Explanation
            </span>
            <span className="sans" style={{ fontSize: 14, color: c.textSecondary, lineHeight: 1.5 }}>
              {G(r.explanation)}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 12 }}>
            {(r.possibleCauses?.length ?? 0) > 0 && (
              <div>
                <div className="sans" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: c.textMuted, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>⚠</span> Possible causes
                </div>
                <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                  {r.possibleCauses!.map((cause, j) => (
                    <li key={j} className="sans" style={{ fontSize: 13, color: c.textSecondary, lineHeight: 1.4, paddingLeft: 4 }}>
                      {G(cause)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(r.possibleRemedies?.length ?? 0) > 0 && (
              <div>
                <div className="sans" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: c.textMuted, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>♥</span> Possible remedies
                </div>
                <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                  {r.possibleRemedies!.map((remedy, j) => (
                    <li key={j} className="sans" style={{ fontSize: 13, color: c.textSecondary, lineHeight: 1.4, paddingLeft: 4 }}>
                      {G(remedy)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {(r.possibleRemedies?.length ?? 0) > 0 && (
            <div className="sans" style={{ fontSize: 11, color: c.textFaint, fontStyle: "italic", marginTop: 12 }}>
              Discuss these with your doctor before acting on them.
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function StatPill({ kind, label }: { kind: "normal" | "high" | "critical"; label: string }) {
  const sc = c.statusColors[kind];
  return (
    <div
      className="sans"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11,
        color: sc.text,
        background: sc.bg,
        padding: "3px 8px",
        borderRadius: 4,
        fontWeight: 600,
        border: `1px solid ${sc.border}`,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        width: "fit-content",
      }}
    >
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot }} />
      {label}
    </div>
  );
}
