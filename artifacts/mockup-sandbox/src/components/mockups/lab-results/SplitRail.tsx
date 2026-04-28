import React, { useState } from "react";
import { SAMPLE_RESULTS, type LabResult, type GlossaryTerm } from "./data";
import "./_group.css";

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
          className="border-b border-dotted border-[var(--lr-text-muted)] cursor-help"
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

export function SplitRail() {
  const data = SAMPLE_RESULTS;
  const [selectedResultName, setSelectedResultName] = useState("Leukocytes");

  const selectedResult = data.results.find((r) => r.name === selectedResultName) || data.results[0];

  const counts = data.results.reduce(
    (acc, r) => {
      if (r.status === "normal") acc.normal++;
      else if (r.status === "critical") acc.critical++;
      else acc.attention++;
      return acc;
    },
    { normal: 0, attention: 0, critical: 0 }
  );

  const getStatusColor = (status: LabResult["status"]) => {
    switch (status) {
      case "normal":
        return "var(--lr-normal-dot)";
      case "low":
      case "high":
        return "var(--lr-attn-dot)";
      case "critical":
        return "var(--lr-crit-dot)";
      default:
        return "var(--lr-normal-dot)";
    }
  };

  const getStatusClass = (status: LabResult["status"]) => {
    switch (status) {
      case "normal":
        return "bg-[var(--lr-normal-bg)] text-[var(--lr-normal-text)] border-[var(--lr-normal-border)]";
      case "low":
      case "high":
        return "bg-[var(--lr-attn-bg)] text-[var(--lr-attn-text)] border-[var(--lr-attn-border)]";
      case "critical":
        return "bg-[var(--lr-crit-bg)] text-[var(--lr-crit-text)] border-[var(--lr-crit-border)]";
      default:
        return "bg-[var(--lr-normal-bg)] text-[var(--lr-normal-text)] border-[var(--lr-normal-border)]";
    }
  };

  const getOverallClass = (status: typeof data.overallStatus) => {
    switch (status) {
      case "normal":
        return "bg-[var(--lr-overall-normal-bg)] border-[var(--lr-overall-normal-border)] text-[var(--lr-overall-normal-border)]";
      case "attention":
        return "bg-[var(--lr-overall-attn-bg)] border-[var(--lr-overall-attn-border)] text-[var(--lr-overall-attn-border)]";
      case "concern":
        return "bg-[var(--lr-overall-crit-bg)] border-[var(--lr-overall-crit-border)] text-[var(--lr-overall-crit-border)]";
      default:
        return "bg-[var(--lr-overall-normal-bg)] border-[var(--lr-overall-normal-border)] text-[var(--lr-overall-normal-border)]";
    }
  };

  const G = (text: string) => <GlossyText text={text} glossary={data.glossary} />;

  return (
    <div className="lab-results-root flex h-screen overflow-hidden">
      {/* Left Rail */}
      <aside className="w-[360px] flex-shrink-0 flex flex-col border-r border-[var(--lr-border)] bg-[var(--lr-surface)] h-full">
        {/* Header */}
        <div className="p-6 border-b border-[var(--lr-border)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[var(--lr-btn-bg)] rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
              </svg>
            </div>
            <div>
              <div className="text-[22px] font-semibold tracking-tight leading-none text-[var(--lr-text)]">
                Lab<span className="italic font-normal text-[var(--lr-accent)]">Lens</span>
              </div>
              <div className="sans text-[11px] text-[var(--lr-text-muted)] tracking-wider uppercase mt-1">
                Lab result explainer
              </div>
            </div>
          </div>

          {/* Overall Badge */}
          <div className={`p-4 rounded-xl border-l-4 ${getOverallClass(data.overallStatus).split(' ')[0]} ${getOverallClass(data.overallStatus).split(' ')[1]} shadow-sm mb-4`}>
            <div className={`sans text-[10px] font-bold tracking-wider uppercase mb-1.5 ${getOverallClass(data.overallStatus).split(' ')[2]}`}>
              {data.overallLabel}
            </div>
            <div className="sans text-sm text-[var(--lr-text-secondary)] leading-relaxed line-clamp-3">
              {G(data.summary)}
            </div>
          </div>

          {/* Stat Counts */}
          <div className="sans flex flex-wrap gap-2">
            <span className="text-[11px] font-medium text-[var(--lr-text-muted)] bg-[var(--lr-page-bg)] border border-[var(--lr-border)] px-2.5 py-1 rounded-full">
              {data.results.length} total
            </span>
            {counts.attention > 0 && (
              <span className="text-[11px] font-medium text-[var(--lr-attn-text)] bg-[var(--lr-attn-bg)] border border-[var(--lr-attn-border)] px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--lr-attn-dot)]"></span>
                {counts.attention} attention
              </span>
            )}
            {counts.critical > 0 && (
              <span className="text-[11px] font-medium text-[var(--lr-crit-text)] bg-[var(--lr-crit-bg)] border border-[var(--lr-crit-border)] px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--lr-crit-dot)]"></span>
                {counts.critical} critical
              </span>
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="sans text-xs font-semibold text-[var(--lr-text-muted)] tracking-wider uppercase mb-3 px-2">
            All Results
          </div>
          {data.results.map((r) => (
            <button
              key={r.name}
              onClick={() => setSelectedResultName(r.name)}
              className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                selectedResultName === r.name
                  ? "bg-[var(--lr-page-bg)] border border-[var(--lr-border-strong)] shadow-sm"
                  : "hover:bg-[var(--lr-page-bg)] border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getStatusColor(r.status) }}
                />
                <span className={`truncate text-[13px] ${selectedResultName === r.name ? "font-semibold text-[var(--lr-text)]" : "text-[var(--lr-text-secondary)]"}`}>
                  {r.name}
                </span>
              </div>
              <span className={`font-serif text-[13px] whitespace-nowrap pl-3 ${
                r.status !== "normal" ? "font-semibold" : ""
              }`} style={{ color: getStatusColor(r.status) }}>
                {r.value}
              </span>
            </button>
          ))}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-[var(--lr-border)] bg-[var(--lr-surface)]">
          <div className="sans text-[10px] text-[var(--lr-text-faint)] leading-snug">
            Not a substitute for professional medical advice. Always discuss with your doctor.
          </div>
        </div>
      </aside>

      {/* Right Pane */}
      <main className="flex-1 flex flex-col h-full bg-[var(--lr-page-bg)] relative overflow-hidden">
        {/* Right Header */}
        <header className="h-[88px] flex items-center justify-between px-10 border-b border-[var(--lr-border)] flex-shrink-0">
          <div className="sans text-[12px] text-[var(--lr-text-muted)]">
            Analyzed {data.analyzedDate}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <button className="sans px-2.5 py-1 text-[11px] font-medium rounded-md bg-[var(--lr-btn-bg)] text-[var(--lr-btn-text)]">EN</button>
              <button className="sans px-2.5 py-1 text-[11px] font-medium rounded-md border border-[var(--lr-border-strong)] text-[var(--lr-text-muted)]">FIL</button>
            </div>
            <div className="flex gap-1.5 border-l border-[var(--lr-border-strong)] pl-4">
              <button className="sans px-2.5 py-1 text-[11px] font-medium rounded-md bg-[var(--lr-btn-bg)] text-[var(--lr-btn-text)]">☀</button>
              <button className="sans px-2.5 py-1 text-[11px] font-medium rounded-md border border-[var(--lr-border-strong)] text-[var(--lr-text-muted)]">☾</button>
            </div>
            <button className="sans ml-4 px-4 py-1.5 text-[12px] font-medium rounded-lg border border-[var(--lr-border-strong)] text-[var(--lr-text-secondary)] hover:bg-[var(--lr-surface)] transition-colors">
              ↩ Analyze another
            </button>
          </div>
        </header>

        {/* Scrollable Detail Area */}
        <div className="flex-1 overflow-y-auto px-10 py-12">
          <div className="max-w-3xl mx-auto pb-24">
            {/* Detail Hero */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <span className={`sans text-[12px] font-bold tracking-wider uppercase px-3 py-1 rounded-full border ${getStatusClass(selectedResult.status)}`}>
                  {selectedResult.status}
                </span>
                <span className="sans text-[13px] text-[var(--lr-text-muted)]">
                  {selectedResult.referenceRange ? `Reference: ${selectedResult.referenceRange}` : "No reference range"}
                </span>
              </div>
              <h1 className="text-5xl font-semibold text-[var(--lr-text)] mb-4 tracking-tight">
                {G(selectedResult.name)}
              </h1>
              <div className="flex items-baseline gap-4 mb-8 pb-8 border-b border-[var(--lr-border)]">
                <span className="text-4xl font-semibold" style={{ color: getStatusColor(selectedResult.status) }}>
                  {selectedResult.value}
                </span>
              </div>
              <div className="text-xl text-[var(--lr-text-secondary)] leading-relaxed max-w-2xl">
                {G(selectedResult.explanation)}
              </div>
            </div>

            {/* Causes / Remedies */}
            {(selectedResult.possibleCauses?.length || selectedResult.possibleRemedies?.length) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                {selectedResult.possibleCauses && selectedResult.possibleCauses.length > 0 && (
                  <div className="bg-[var(--lr-surface)] rounded-2xl p-6 border border-[var(--lr-border)] shadow-sm">
                    <h3 className="sans text-[11px] font-bold tracking-wider uppercase text-[var(--lr-text-muted)] mb-4 flex items-center gap-2">
                      <span>⚠</span> Possible Causes
                    </h3>
                    <ul className="space-y-3">
                      {selectedResult.possibleCauses.map((cause, i) => (
                        <li key={i} className="sans text-[14px] text-[var(--lr-text-secondary)] leading-relaxed pl-4 relative">
                          <span className="absolute left-0 top-1 text-[var(--lr-text-muted)]">•</span>
                          {G(cause)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedResult.possibleRemedies && selectedResult.possibleRemedies.length > 0 && (
                  <div className="bg-[var(--lr-surface)] rounded-2xl p-6 border border-[var(--lr-border)] shadow-sm">
                    <h3 className="sans text-[11px] font-bold tracking-wider uppercase text-[var(--lr-text-muted)] mb-4 flex items-center gap-2">
                      <span>♥</span> Possible Remedies
                    </h3>
                    <ul className="space-y-3">
                      {selectedResult.possibleRemedies.map((remedy, i) => (
                        <li key={i} className="sans text-[14px] text-[var(--lr-text-secondary)] leading-relaxed pl-4 relative">
                          <span className="absolute left-0 top-1 text-[var(--lr-text-muted)]">•</span>
                          {G(remedy)}
                        </li>
                      ))}
                    </ul>
                    <div className="sans text-[11px] italic text-[var(--lr-text-faint)] mt-4">
                      Discuss these with your doctor before acting on them.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Questions Section */}
            <div className="space-y-8 mb-12">
              <div className="border-t border-[var(--lr-border)] pt-8">
                <h3 className="text-xl font-semibold text-[var(--lr-text)] mb-6 flex items-center gap-2">
                  ❓ Questions to ask your doctor
                </h3>
                <div className="space-y-3">
                  {data.questionsToAsk.map((q, i) => (
                    <div key={i} className="sans text-[15px] text-[var(--lr-text-secondary)] bg-[var(--lr-surface)] p-4 rounded-xl border border-[var(--lr-border-faint)]">
                      {G(q)}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-[var(--lr-text)] mb-6 flex items-center gap-2">
                  ❓ Follow-up questions on abnormal results
                </h3>
                <div className="space-y-3">
                  {data.followUpQuestions.map((q, i) => (
                    <div key={i} className="sans text-[15px] text-[var(--lr-text-secondary)] bg-[var(--lr-surface)] p-4 rounded-xl border border-[var(--lr-border-faint)]">
                      {G(q)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Bottom spacer for chat */}
            <div className="h-16"></div>
          </div>
        </div>

        {/* Chat Docked at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[var(--lr-page-bg)] via-[var(--lr-page-bg)] to-transparent pt-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-[var(--lr-surface)] rounded-2xl border border-[var(--lr-border-strong)] p-4 shadow-lg flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[14px] text-[var(--lr-text)] flex items-center gap-2">
                  💬 Ask LabLens a follow-up
                </span>
                <span className="sans text-[11px] text-[var(--lr-text-muted)]">
                  Ask what a value means, what to do next...
                </span>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type your question..."
                  className="sans flex-1 bg-[var(--lr-input-bg)] border border-[var(--lr-border)] rounded-xl px-4 py-2.5 text-[14px] text-[var(--lr-text)] outline-none focus:border-[var(--lr-border-strong)]"
                />
                <button className="sans bg-[var(--lr-btn-bg)] text-[var(--lr-btn-text)] px-6 py-2.5 rounded-xl font-medium text-[14px] hover:opacity-90 transition-opacity">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
