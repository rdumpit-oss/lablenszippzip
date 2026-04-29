import { useEffect, useRef, useState } from "react";
import "./_group.css";
import {
  AnalyzeSheetContent,
  BrandMark, BrandWordmark,
  ChatBubbleIcon, ChatComposer, ChatThread,
  GlobeIcon, HelpIcon, InfoIcon, ListIcon,
  MenuIcon, Modal, MoonIcon,
  OVERALL,
  QuestionRow, ResultDetailContent, ResultRow, SectionLabel, SegmentedChoice,
  Sheet, SheetItem, StatPill, SunIcon, UploadIcon,
  useLabApp,
  type Lang, type Tab, type Theme,
} from "./_shared";

export function SplitRailTablet({
  width = 820,
  height = 1180,
  chrome = true,
}: { width?: number | string; height?: number | string; chrome?: boolean } = {}) {
  const app = useLabApp();
  const [rightTab, setRightTab] = useState<Tab>("results");
  const [sheet, setSheet] = useState<"none" | "menu" | "analyze" | "language" | "theme" | "about">("none");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rightTab === "chat") {
      requestAnimationFrame(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }));
    }
  }, [rightTab, app.messages]);

  function jumpToChatWith(question: string) {
    setRightTab("chat");
    app.setDraft(question);
  }

  function selectResult(name: string) {
    app.setSelectedName(name);
    setRightTab("results");
  }

  const ov = OVERALL[app.data.overallStatus] || OVERALL.normal;
  const t = app.t;

  return (
    <div
      className="lab-results-root"
      data-theme={app.theme}
      style={{
        width,
        height,
        margin: chrome ? "0 auto" : 0,
        background: "var(--lr-page-bg)",
        color: "var(--lr-text)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: chrome ? "0 8px 30px rgba(26,22,18,0.08)" : "none",
      }}
    >
      <input
        ref={app.fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*"
        onChange={async (e) => { const ok = await app.onFilePicked(e); if (ok) setSheet("none"); }}
        style={{ display: "none" }}
      />

      {chrome && (
        <div
          className="sans"
          style={{
            height: 28,
            flexShrink: 0,
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--lr-text)",
          }}
        >
          <span>9:41 AM · Mon Apr 28</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span>Wi-Fi</span>
            <span style={{ width: 22, height: 10, border: "1px solid currentColor", borderRadius: 2, padding: 1, display: "inline-flex" }}>
              <span style={{ background: "currentColor", flex: 1, borderRadius: 1 }} />
            </span>
            <span>87%</span>
          </span>
        </div>
      )}

      {/* Top bar */}
      <div
        style={{
          height: 60,
          flexShrink: 0,
          background: "var(--lr-page-bg)",
          borderBottom: "1px solid var(--lr-border)",
          padding: "0 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setSheet("menu")}
            aria-label="Menu"
            style={{
              width: 38, height: 38, background: "transparent", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--lr-text)", cursor: "pointer", borderRadius: 8,
            }}
          >
            <MenuIcon />
          </button>
          <BrandMark size={32} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <BrandWordmark size={20} />
            <div className="sans" style={{ fontSize: 11, color: "var(--lr-text-muted)", marginTop: -2 }}>
              {t.appTagline}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <IconButton onClick={() => setSheet("theme")} title={t.themeTitle}>
            {app.theme === "light" ? <SunIcon /> : <MoonIcon />}
          </IconButton>
          <IconButton onClick={() => setSheet("language")} title={t.languageTitle}>
            <GlobeIcon />
          </IconButton>
          <button
            onClick={() => setSheet("analyze")}
            className="sans"
            style={{
              background: "var(--lr-btn-bg)",
              color: "var(--lr-btn-text)",
              border: "none",
              borderRadius: 10,
              padding: "9px 14px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <UploadIcon /> {t.sheetAnalyzeOther}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "360px 1fr", overflow: "hidden", minHeight: 0 }}>
        {/* Left rail: list */}
        <div
          style={{
            borderRight: "1px solid var(--lr-border)",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            background: "var(--lr-page-bg)",
          }}
        >
          {/* Summary mini card */}
          <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--lr-border-faint)" }}>
            <div
              style={{
                background: ov.bg,
                border: "1px solid var(--lr-border)",
                borderLeft: `4px solid ${ov.border}`,
                borderRadius: 12,
                padding: "11px 13px",
                marginBottom: 10,
              }}
            >
              <div className="sans" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ov.border, marginBottom: 4 }}>
                {app.data.overallLabel}
              </div>
              <div className="sans" style={{ fontSize: 12, lineHeight: 1.5, color: "var(--lr-text-secondary)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {app.G(app.data.summary)}
              </div>
            </div>
            <div className="sans" style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              <StatPill kind="normal"   value={app.counts.normal}    label={t.statNormal} />
              <StatPill kind="high"     value={app.counts.attention} label={t.statAttention} />
              {app.counts.critical > 0 && <StatPill kind="critical" value={app.counts.critical} label={t.statCritical} />}
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 24px" }}>
            <SectionLabel>{t.sectionAttention}</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 18 }}>
              {app.data.results
                .filter((r) => r.status !== "normal")
                .map((r) => (
                  <ResultRow key={r.name} r={r} t={t} G={app.G} isActive={app.selectedName === r.name && rightTab === "results"} onClick={() => selectResult(r.name)} />
                ))}
            </div>
            <SectionLabel>{t.sectionNormal}</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {app.data.results
                .filter((r) => r.status === "normal")
                .map((r) => (
                  <ResultRow key={r.name} r={r} t={t} G={app.G} compact isActive={app.selectedName === r.name && rightTab === "results"} onClick={() => selectResult(r.name)} />
                ))}
            </div>
          </div>
        </div>

        {/* Right pane */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
          {/* Tab strip */}
          <div
            style={{
              flexShrink: 0,
              borderBottom: "1px solid var(--lr-border)",
              padding: "0 18px",
              display: "flex",
              gap: 4,
              alignItems: "stretch",
            }}
          >
            {[
              { id: "results" as Tab, label: app.selected ? app.selected.name.replace(/EPITHELIAL CELLS – /, "Epithelial · ") : t.tabResults, icon: <ListIcon /> },
              { id: "ask" as Tab,     label: t.tabAsk,                                                                                          icon: <HelpIcon /> },
              { id: "chat" as Tab,    label: t.tabChat,                                                                                         icon: <ChatBubbleIcon /> },
            ].map((tab) => {
              const active = rightTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setRightTab(tab.id);
                    if (tab.id !== "results") app.setSelectedName(null);
                  }}
                  className="sans"
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: "16px 14px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 13.5,
                    fontWeight: active ? 600 : 500,
                    color: active ? "var(--lr-text)" : "var(--lr-text-muted)",
                    cursor: "pointer",
                    borderBottom: `2px solid ${active ? "var(--lr-text)" : "transparent"}`,
                    marginBottom: -1,
                    maxWidth: tab.id === "results" ? 280 : "none",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {tab.icon}
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            {rightTab === "results" && (
              <div style={{ padding: "20px 22px 32px" }}>
                {app.selected ? (
                  <ResultDetailContent r={app.selected} G={app.G} t={t} onAsk={(q) => jumpToChatWith(q)} />
                ) : (
                  <EmptyDetail t={t} G={app.G} data={app.data} />
                )}
              </div>
            )}
            {rightTab === "ask" && (
              <div style={{ padding: "20px 22px 32px" }}>
                <div className="sans" style={{ fontSize: 13, color: "var(--lr-text-muted)", lineHeight: 1.55, marginBottom: 14 }}>
                  {t.askIntro}
                </div>
                {app.data.questionsToAsk.length > 0 && (
                  <>
                    <SectionLabel>{t.askForDoctor}</SectionLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
                      {app.data.questionsToAsk.map((q, i) => (
                        <QuestionRow key={`a${i}`} text={q} G={app.G} onAsk={() => jumpToChatWith(q)} />
                      ))}
                    </div>
                  </>
                )}
                {app.data.followUpQuestions.length > 0 && (
                  <>
                    <SectionLabel>{t.askFollowUps}</SectionLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {app.data.followUpQuestions.map((q, i) => (
                        <QuestionRow key={`f${i}`} text={q} G={app.G} onAsk={() => jumpToChatWith(q)} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            {rightTab === "chat" && (
              <ChatThread
                messages={app.messages}
                chatEndRef={chatEndRef}
                sending={app.sending}
                t={t}
                G={app.G}
                padding="20px 22px 24px"
              />
            )}
          </div>

          {rightTab === "chat" && (
            <ChatComposer
              draft={app.draft}
              setDraft={app.setDraft}
              onSend={() => app.sendMessage()}
              disabled={app.sending}
              placeholder={t.chatPlaceholder}
            />
          )}
        </div>
      </div>

      {/* Glossary popup */}
      {app.glossPopup && (
        <Modal onClose={app.closeGlossary} title={app.glossPopup.term} confirmLabel={t.gotIt}>
          <div className="sans" style={{ fontSize: 14, lineHeight: 1.55, color: "var(--lr-text-secondary)" }}>
            {app.glossPopup.def}
          </div>
        </Modal>
      )}

      {/* Sheets */}
      {sheet === "menu" && (
        <Sheet onClose={() => setSheet("none")}>
          <SheetItem label={t.sheetAnalyzeOther} onClick={() => setSheet("analyze")} icon={<UploadIcon />} />
          <SheetItem label={t.sheetLanguage} value={app.lang === "en" ? "English" : "Filipino"} onClick={() => setSheet("language")} icon={<GlobeIcon />} />
          <SheetItem label={t.sheetTheme} value={app.theme === "light" ? t.themeLight : t.themeDark} onClick={() => setSheet("theme")} icon={app.theme === "light" ? <SunIcon /> : <MoonIcon />} />
          <SheetItem label={t.sheetAbout} onClick={() => setSheet("about")} icon={<InfoIcon />} last />
        </Sheet>
      )}

      {sheet === "analyze" && (
        <Sheet onClose={() => app.analyzing ? null : setSheet("none")} title={t.analyzeTitle} maxWidth={520}>
          <AnalyzeSheetContent
            t={t}
            analyzing={app.analyzing}
            analyzeErr={app.analyzeErr}
            onPick={app.pickFile}
            onCancel={() => setSheet("none")}
            onClearError={() => app.setAnalyzeErr(null)}
          />
        </Sheet>
      )}

      {sheet === "language" && (
        <Sheet onClose={() => setSheet("none")} title={t.languageTitle} maxWidth={420}>
          <SegmentedChoice
            options={[
              { id: "en",  label: "English" },
              { id: "fil", label: "Filipino (Tagalog)" },
            ]}
            value={app.lang}
            onChange={(v) => { app.setLang(v as Lang); setSheet("none"); }}
          />
        </Sheet>
      )}

      {sheet === "theme" && (
        <Sheet onClose={() => setSheet("none")} title={t.themeTitle} maxWidth={420}>
          <SegmentedChoice
            options={[
              { id: "light", label: t.themeLight, icon: <SunIcon /> },
              { id: "dark",  label: t.themeDark,  icon: <MoonIcon /> },
            ]}
            value={app.theme}
            onChange={(v) => { app.setTheme(v as Theme); setSheet("none"); }}
          />
        </Sheet>
      )}

      {sheet === "about" && (
        <Sheet onClose={() => setSheet("none")} title={t.aboutTitle} maxWidth={460}>
          <div className="sans" style={{ fontSize: 13.5, color: "var(--lr-text-secondary)", lineHeight: 1.6, padding: "4px 2px 14px" }}>
            {t.aboutBody}
          </div>
          <button
            className="sans"
            onClick={() => setSheet("none")}
            style={{
              width: "100%",
              background: "var(--lr-btn-bg)",
              color: "var(--lr-btn-text)",
              border: "none",
              borderRadius: 12,
              padding: "13px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t.gotIt}
          </button>
        </Sheet>
      )}
    </div>
  );
}

function IconButton({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 38, height: 38,
        background: "transparent",
        border: "1px solid var(--lr-border)",
        borderRadius: 10,
        color: "var(--lr-text)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
}

function EmptyDetail({
  t, G, data,
}: {
  t: ReturnType<typeof useLabApp>["t"];
  G: (text: string) => JSX.Element | null;
  data: ReturnType<typeof useLabApp>["data"];
}) {
  const ov = OVERALL[data.overallStatus] || OVERALL.normal;
  return (
    <div>
      <div
        style={{
          background: ov.bg,
          border: "1px solid var(--lr-border)",
          borderLeft: `4px solid ${ov.border}`,
          borderRadius: 14,
          padding: "20px 22px",
          marginBottom: 18,
        }}
      >
        <div className="sans" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ov.border, marginBottom: 8 }}>
          {data.overallLabel}
        </div>
        <div className="sans" style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--lr-text-secondary)" }}>
          {G(data.summary)}
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          padding: "32px 24px",
          border: "1px dashed var(--lr-border-strong)",
          borderRadius: 14,
          background: "var(--lr-input-bg)",
        }}
      >
        <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 600, color: "var(--lr-text)", marginBottom: 6 }}>
          {t.pickAResult}
        </div>
        <div className="sans" style={{ fontSize: 13.5, color: "var(--lr-text-muted)", lineHeight: 1.55 }}>
          {t.pickAResultBody}
        </div>
      </div>

      <div className="sans" style={{ fontSize: 11, color: "var(--lr-text-faint)", textAlign: "center", marginTop: 22, lineHeight: 1.55 }}>
        {t.notSubstitute}
      </div>
    </div>
  );
}
