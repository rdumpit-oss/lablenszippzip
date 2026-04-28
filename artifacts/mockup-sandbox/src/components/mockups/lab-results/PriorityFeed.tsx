import React from "react";
import "./_group.css";
import { SAMPLE_RESULTS, type LabResult, type GlossaryTerm } from "./data";
import { Info, AlertCircle, CheckCircle2, ChevronRight, Send, ArrowLeft, Lightbulb } from "lucide-react";

// Helper for regex escaping
function escapeRegex(s: string) {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

// Inline glossy text for tooltips
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
            borderBottom: "1px dotted var(--lr-text-muted)",
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

export function PriorityFeed() {
  const data = SAMPLE_RESULTS;
  const G = (text: string) => <GlossyText text={text} glossary={data.glossary} />;
  
  const allResults = data.results;
  const normalResults = allResults.filter(r => r.status === "normal");
  const abnormalResults = allResults.filter(r => r.status !== "normal");
  
  return (
    <div className="lab-results-root" style={{
      fontFamily: "Georgia, serif",
      backgroundColor: "var(--lr-page-bg)",
      color: "var(--lr-text)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      
      {/* App Bar */}
      <div style={{
        width: "100%",
        borderBottom: "1px solid var(--lr-border)",
        backgroundColor: "var(--lr-page-bg)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36,
              background: "var(--lr-btn-bg)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white"
            }}>
              <Lightbulb size={20} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1 }}>
                Lab<span style={{ fontStyle: "italic", fontWeight: 400, color: "var(--lr-accent)" }}>Lens</span>
              </div>
              <div className="sans" style={{ fontSize: 10, color: "var(--lr-text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: 4 }}>
                Lab result explainer
              </div>
            </div>
          </div>
          
          <button className="sans" style={{
            background: "transparent",
            border: "1px solid var(--lr-border-strong)",
            color: "var(--lr-text-muted)",
            fontSize: 12,
            padding: "6px 12px",
            borderRadius: 6,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}>
            <ArrowLeft size={14} /> Analyze another
          </button>
        </div>
      </div>

      <div style={{
        maxWidth: 800,
        width: "100%",
        padding: "32px 20px 80px",
        display: "flex",
        flexDirection: "column",
        gap: 32
      }}>

        {/* Hero Summary Band */}
        <section>
          <div className="sans" style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--lr-overall-attn-border)",
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 6
          }}>
            <AlertCircle size={16} /> Analysis Complete
          </div>
          <h1 style={{
            fontSize: 36,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: 16,
            color: "var(--lr-text)"
          }}>
            {data.overallLabel}
          </h1>
          
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }} className="sans">
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "var(--lr-attn-bg)", color: "var(--lr-attn-text)",
              border: "1px solid var(--lr-attn-border)",
              padding: "4px 10px", borderRadius: 16, fontSize: 12, fontWeight: 500
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
              {abnormalResults.length} needs attention
            </span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "var(--lr-normal-bg)", color: "var(--lr-normal-text)",
              border: "1px solid var(--lr-normal-border)",
              padding: "4px 10px", borderRadius: 16, fontSize: 12, fontWeight: 500
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
              {normalResults.length} normal
            </span>
            <span style={{
              fontSize: 12, color: "var(--lr-text-muted)", marginLeft: "auto", display: "flex", alignItems: "center", fontStyle: "italic"
            }}>
              Analyzed {data.analyzedDate}
            </span>
          </div>

          <div className="sans" style={{
            fontSize: 16,
            lineHeight: 1.6,
            color: "var(--lr-text-secondary)",
            background: "var(--lr-surface)",
            padding: 24,
            borderRadius: 12,
            border: "1px solid var(--lr-border)",
            boxShadow: "var(--lr-shadow)"
          }}>
            {G(data.summary)}
          </div>
        </section>


        {/* Actions UP: Questions for doctor */}
        <section style={{
          background: "var(--lr-btn-bg)",
          color: "var(--lr-btn-text)",
          borderRadius: 12,
          padding: 24,
          boxShadow: "var(--lr-shadow)"
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            Questions to ask your doctor
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.questionsToAsk.map((q, i) => (
              <div key={i} className="sans" style={{
                fontSize: 14,
                background: "rgba(255,255,255,0.1)",
                padding: "12px 16px",
                borderRadius: 8,
                display: "flex",
                alignItems: "flex-start",
                gap: 12
              }}>
                <ChevronRight size={16} style={{ marginTop: 2, flexShrink: 0, opacity: 0.6 }} />
                <span>{G(q)}</span>
              </div>
            ))}
          </div>
        </section>


        {/* Needs Attention */}
        <section>
          <div style={{
            display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20,
            borderBottom: "2px solid var(--lr-attn-border)", paddingBottom: 12
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0, color: "var(--lr-attn-text)" }}>Needs Attention</h2>
            <span className="sans" style={{ fontSize: 14, color: "var(--lr-text-muted)", fontWeight: 500 }}>{abnormalResults.length} items</span>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {abnormalResults.map((r, i) => (
              <div key={i} style={{
                background: "var(--lr-surface)",
                border: "1px solid var(--lr-border)",
                borderLeft: "4px solid var(--lr-attn-border)",
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "var(--lr-shadow)"
              }}>
                <div style={{ padding: "20px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 20 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 4px 0", color: "var(--lr-text)" }}>
                        {G(r.name)}
                      </h3>
                      <div className="sans" style={{ fontSize: 13, color: "var(--lr-text-muted)" }}>
                        Reference: {r.referenceRange || "N/A"}
                      </div>
                    </div>
                    <div style={{
                      fontFamily: "Georgia, serif",
                      fontSize: 24,
                      fontWeight: 700,
                      color: "var(--lr-attn-text)",
                      textAlign: "right",
                      whiteSpace: "nowrap"
                    }}>
                      {r.value}
                    </div>
                  </div>
                  
                  <p className="sans" style={{ fontSize: 15, lineHeight: 1.5, color: "var(--lr-text-secondary)", margin: "12px 0 0 0" }}>
                    {G(r.explanation)}
                  </p>
                </div>
                
                {((r.possibleCauses && r.possibleCauses.length > 0) || (r.possibleRemedies && r.possibleRemedies.length > 0)) && (
                  <div style={{
                    background: "var(--lr-surface-alt)",
                    padding: "16px 24px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 20,
                    borderTop: "1px solid var(--lr-border)"
                  }}>
                    {r.possibleCauses && r.possibleCauses.length > 0 && (
                      <div>
                        <div className="sans" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--lr-text-muted)", marginBottom: 8 }}>
                          Possible Causes
                        </div>
                        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                          {r.possibleCauses.map((c, idx) => (
                            <li key={idx} className="sans" style={{ fontSize: 13, color: "var(--lr-text-secondary)", display: "flex", alignItems: "flex-start", gap: 8 }}>
                              <span style={{ color: "var(--lr-text-faint)", marginTop: 2 }}>•</span> {G(c)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {r.possibleRemedies && r.possibleRemedies.length > 0 && (
                      <div>
                        <div className="sans" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--lr-text-muted)", marginBottom: 8 }}>
                          Possible Remedies
                        </div>
                        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                          {r.possibleRemedies.map((c, idx) => (
                            <li key={idx} className="sans" style={{ fontSize: 13, color: "var(--lr-text-secondary)", display: "flex", alignItems: "flex-start", gap: 8 }}>
                              <span style={{ color: "var(--lr-text-faint)", marginTop: 2 }}>•</span> {G(c)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>


        {/* Normal Results (Compact) */}
        <section>
          <div style={{
            display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16,
            borderBottom: "2px solid var(--lr-normal-border)", paddingBottom: 12
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: "var(--lr-normal-text)" }}>Normal Results</h2>
            <span className="sans" style={{ fontSize: 14, color: "var(--lr-text-muted)", fontWeight: 500 }}>{normalResults.length} items</span>
          </div>
          
          <div style={{
            background: "var(--lr-surface)",
            border: "1px solid var(--lr-border)",
            borderRadius: 12,
            boxShadow: "var(--lr-shadow)",
            overflow: "hidden"
          }}>
            {normalResults.map((r, i) => (
              <div key={i} style={{
                padding: "12px 16px",
                borderBottom: i < normalResults.length - 1 ? "1px solid var(--lr-border-faint)" : "none",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 12
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, width: "220px", flexShrink: 0 }}>
                  <CheckCircle2 size={16} color="var(--lr-normal-dot)" />
                  <span style={{ fontWeight: 600, fontSize: 14, color: "var(--lr-text)" }}>{G(r.name)}</span>
                </div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 600, color: "var(--lr-text-secondary)", width: "100px", flexShrink: 0 }}>
                  {r.value}
                </div>
                <div className="sans" style={{ fontSize: 13, color: "var(--lr-text-muted)", flex: 1, minWidth: "200px" }}>
                  {G(r.explanation)}
                </div>
              </div>
            ))}
          </div>
        </section>

        
        {/* Chat / Follow up */}
        <section style={{
          background: "var(--lr-surface)",
          border: "1px solid var(--lr-border)",
          borderRadius: 12,
          padding: 24,
          boxShadow: "var(--lr-shadow)",
          marginTop: 16
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            Still confused? Ask LabLens
          </h2>
          <p className="sans" style={{ fontSize: 14, color: "var(--lr-text-muted)", marginBottom: 20, lineHeight: 1.5 }}>
            Ask anything about your results — what a value means, what to do next, how to prepare to talk to your doctor.
          </p>
          
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <input 
              type="text" 
              placeholder="Type your question here..." 
              className="sans"
              style={{
                flex: 1,
                background: "var(--lr-input-bg)",
                border: "1px solid var(--lr-border-strong)",
                borderRadius: 8,
                padding: "12px 16px",
                fontSize: 14,
                color: "var(--lr-text)",
                outline: "none"
              }}
            />
            <button className="sans" style={{
              background: "var(--lr-btn-bg)",
              color: "var(--lr-btn-text)",
              border: "none",
              borderRadius: 8,
              padding: "0 20px",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              Send <Send size={16} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="sans" style={{ fontSize: 12, fontWeight: 600, color: "var(--lr-text-muted)", textTransform: "uppercase", marginBottom: 4 }}>
              Suggested follow-ups
            </div>
            {data.followUpQuestions.map((q, i) => (
              <button key={i} className="sans" style={{
                background: "transparent",
                border: "1px solid var(--lr-border)",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 13,
                color: "var(--lr-text-secondary)",
                textAlign: "left",
                cursor: "pointer",
                transition: "background 0.2s"
              }}>
                {G(q)}
              </button>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <div className="sans" style={{
          textAlign: "center",
          fontSize: 12,
          color: "var(--lr-text-faint)",
          lineHeight: 1.5,
          marginTop: 20
        }}>
          LabLens uses AI to translate medical jargon into plain language. It does not diagnose, treat, or replace a licensed medical professional.<br/>
          Always discuss your results with your doctor before making any health decisions.
        </div>

      </div>
    </div>
  );
}
