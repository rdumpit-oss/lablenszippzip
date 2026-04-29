import { useEffect, useRef, useState } from "react";
import "./_group.css";
import {
  AnalyzeSheetContent,
  BrandMark, BrandWordmark,
  ChatBubbleIcon, ChatComposer, ChatThread,
  ChevronLeft,
  GlobeIcon, HelpIcon, InfoIcon, ListIcon,
  Modal, MoonIcon,
  OVERALL,
  QuestionRow, ResultDetailContent, ResultRow, SectionLabel, SegmentedChoice,
  Sheet, StatPill, SunIcon, UploadIcon,
  useLabApp,
  type Lang, type Theme,
} from "./_shared";

type DesktopView = "overview" | "ask";

export function SplitRailDesktop({
  width = 1280,
  height = 860,
  chrome = true,
}: { width?: number | string; height?: number | string; chrome?: boolean } = {}) {
  const app = useLabApp();
  const [view, setView] = useState<DesktopView>("overview");
  const [sheet, setSheet] = useState<"none" | "analyze" | "language" | "theme" | "about">("none");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }));
  }, [app.messages]);

  function selectResult(name: string) {
    app.setSelectedName(name);
    setView("overview");
  }

  function jumpToChatWith(question: string) {
    app.setDraft(question);
  }

  const t = app.t;
  const ov = OVERALL[app.data.overallStatus] || OVERALL.normal;
  const abnormal = app.data.results.filter((r) => r.status !== "normal");
  const normal = app.data.results.filter((r) => r.status === "normal");

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

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "260px 1fr 460px", overflow: "hidden", minHeight: 0 }}>
        {/* LEFT RAIL */}
        <aside
          style={{
            background: "var(--lr-surface)",
            borderRight: "1px solid var(--lr-border)",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          {/* Brand */}
          <div style={{ padding: "20px 18px 18px", borderBottom: "1px solid var(--lr-border-faint)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <BrandMark size={32} />
              <BrandWordmark size={20} />
            </div>
            <div className="sans" style={{ fontSize: 12, color: "var(--lr-text-muted)", marginLeft: 42, marginTop: -2 }}>
              {t.appTagline}
            </div>
          </div>

          {/* Nav */}
          <div style={{ padding: "14px 12px", display: "flex", flexDirection: "column", gap: 3 }}>
            <NavItem
              label={t.overview}
              icon={<ListIcon />}
              active={view === "overview" && !app.selectedName}
              onClick={() => { setView("overview"); app.setSelectedName(null); }}
            />
            <NavItem
              label={t.askLabLens}
              icon={<HelpIcon />}
              active={view === "ask"}
              onClick={() => { setView("ask"); app.setSelectedName(null); }}
            />
          </div>

          {/* Results sub-nav */}
          <div style={{ padding: "8px 12px", flex: 1, overflowY: "auto", minHeight: 0 }}>
            <SectionLabel style={{ marginTop: 8, paddingLeft: 10 }}>{t.yourResults}</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {app.data.results.map((r) => (
                <SidebarResultLink
                  key={r.name}
                  name={r.name}
                  status={r.status}
                  active={app.selectedName === r.name}
                  onClick={() => selectResult(r.name)}
                  t={t}
                />
              ))}
            </div>
          </div>

          {/* Footer settings */}
          <div
            style={{
              padding: "10px 12px 16px",
              borderTop: "1px solid var(--lr-border-faint)",
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <NavItem
              label={t.sheetAnalyzeOther}
              icon={<UploadIcon />}
              onClick={() => setSheet("analyze")}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 4 }}>
              <SmallButton onClick={() => setSheet("theme")} icon={app.theme === "light" ? <SunIcon /> : <MoonIcon />} label={app.theme === "light" ? t.themeLight : t.themeDark} />
              <SmallButton onClick={() => setSheet("language")} icon={<GlobeIcon />} label={app.lang === "en" ? "English" : "Filipino"} />
            </div>
            <button
              onClick={() => setSheet("about")}
              className="sans"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--lr-text-muted)",
                fontSize: 11.5,
                padding: "8px 4px 0",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                textAlign: "left",
              }}
            >
              <InfoIcon /> {t.sheetAbout}
            </button>
          </div>
        </aside>

        {/* MIDDLE: main content */}
        <main style={{ display: "flex", flexDirection: "column", minHeight: 0, minWidth: 0 }}>
          <div
            style={{
              padding: "16px 28px",
              borderBottom: "1px solid var(--lr-border-faint)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
              background: "var(--lr-page-bg)",
              minHeight: 56,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              {app.selectedName && (
                <button
                  onClick={() => app.setSelectedName(null)}
                  aria-label="Back"
                  style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: "transparent", border: "1px solid var(--lr-border)",
                    color: "var(--lr-text)", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <ChevronLeft />
                </button>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 600, color: "var(--lr-text)", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {app.selected ? app.selected.name : view === "ask" ? t.askLabLens : t.overview}
                </div>
                <div className="sans" style={{ fontSize: 12, color: "var(--lr-text-muted)", marginTop: 2 }}>
                  {t.sampleType} · {t.analyzedOn} {app.data.analyzedDate}
                </div>
              </div>
            </div>
            <div className="sans" style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <StatPill kind="normal"   value={app.counts.normal}    label={t.statNormal} />
              <StatPill kind="high"     value={app.counts.attention} label={t.statAttention} />
              {app.counts.critical > 0 && <StatPill kind="critical" value={app.counts.critical} label={t.statCritical} />}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            {view === "overview" && app.selected && (
              <div style={{ padding: "26px 36px 40px", maxWidth: 720, margin: "0 auto" }}>
                <ResultDetailContent r={app.selected} G={app.G} t={t} onAsk={(q) => jumpToChatWith(q)} />
              </div>
            )}

            {view === "overview" && !app.selected && (
              <div style={{ padding: "26px 36px 40px", maxWidth: 760, margin: "0 auto" }}>
                <div
                  style={{
                    background: ov.bg,
                    border: "1px solid var(--lr-border)",
                    borderLeft: `4px solid ${ov.border}`,
                    borderRadius: 14,
                    padding: "20px 22px",
                    marginBottom: 24,
                  }}
                >
                  <div className="sans" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ov.border, marginBottom: 8 }}>
                    {app.data.overallLabel}
                  </div>
                  <div className="sans" style={{ fontSize: 14.5, lineHeight: 1.65, color: "var(--lr-text-secondary)" }}>
                    {app.G(app.data.summary)}
                  </div>
                </div>

                {abnormal.length > 0 && (
                  <>
                    <SectionLabel>{t.sectionAttention}</SectionLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
                      {abnormal.map((r) => (
                        <ResultRow key={r.name} r={r} t={t} G={app.G} onClick={() => selectResult(r.name)} />
                      ))}
                    </div>
                  </>
                )}

                {normal.length > 0 && (
                  <>
                    <SectionLabel>{t.sectionNormal}</SectionLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {normal.map((r) => (
                        <ResultRow key={r.name} r={r} t={t} G={app.G} compact onClick={() => selectResult(r.name)} />
                      ))}
                    </div>
                  </>
                )}

                <div className="sans" style={{ fontSize: 11.5, color: "var(--lr-text-faint)", textAlign: "center", marginTop: 28, lineHeight: 1.55 }}>
                  {t.notSubstitute}
                </div>
              </div>
            )}

            {view === "ask" && (
              <div style={{ padding: "26px 36px 40px", maxWidth: 760, margin: "0 auto" }}>
                <div className="sans" style={{ fontSize: 13.5, color: "var(--lr-text-muted)", lineHeight: 1.55, marginBottom: 18 }}>
                  {t.askIntro}
                </div>
                {app.data.questionsToAsk.length > 0 && (
                  <>
                    <SectionLabel>{t.askForDoctor}</SectionLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 26 }}>
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
          </div>
        </main>

        {/* RIGHT: chat */}
        <aside
          style={{
            background: "var(--lr-surface)",
            borderLeft: "1px solid var(--lr-border)",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            minWidth: 0,
          }}
        >
          <div
            style={{
              padding: "14px 18px",
              borderBottom: "1px solid var(--lr-border-faint)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
              minHeight: 56,
            }}
          >
            <div
              style={{
                width: 32, height: 32, borderRadius: 9,
                background: "var(--lr-btn-bg)",
                color: "var(--lr-btn-text)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <ChatBubbleIcon />
            </div>
            <div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 600, color: "var(--lr-text)", lineHeight: 1.2 }}>
                {t.askLabLens}
              </div>
              <div className="sans" style={{ fontSize: 12, color: "var(--lr-text-muted)", marginTop: 1 }}>
                {t.chatHint}
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", minHeight: 0, background: "var(--lr-page-bg)" }}>
            <ChatThread
              messages={app.messages}
              chatEndRef={chatEndRef}
              sending={app.sending}
              t={t}
              G={app.G}
              padding="18px 18px 24px"
            />
          </div>

          <ChatComposer
            draft={app.draft}
            setDraft={app.setDraft}
            onSend={() => app.sendMessage()}
            disabled={app.sending}
            placeholder={t.chatPlaceholder}
          />
        </aside>
      </div>

      {/* Glossary modal */}
      {app.glossPopup && (
        <Modal onClose={app.closeGlossary} title={app.glossPopup.term} confirmLabel={t.gotIt}>
          <div className="sans" style={{ fontSize: 14, lineHeight: 1.55, color: "var(--lr-text-secondary)" }}>
            {app.glossPopup.def}
          </div>
        </Modal>
      )}

      {/* Sheets — center-anchored on desktop */}
      {sheet === "analyze" && (
        <Sheet onClose={() => app.analyzing ? null : setSheet("none")} title={t.analyzeTitle} anchor="center" maxWidth={520}>
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
        <Sheet onClose={() => setSheet("none")} title={t.languageTitle} anchor="center" maxWidth={420}>
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
        <Sheet onClose={() => setSheet("none")} title={t.themeTitle} anchor="center" maxWidth={420}>
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
        <Sheet onClose={() => setSheet("none")} title={t.aboutTitle} anchor="center" maxWidth={460}>
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

function NavItem({
  label, icon, active, onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="sans"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 12px",
        borderRadius: 10,
        background: active ? "var(--lr-surface-alt)" : "transparent",
        color: "var(--lr-text)",
        border: "none",
        fontSize: 13.5,
        fontWeight: active ? 600 : 500,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span style={{ color: active ? "var(--lr-text)" : "var(--lr-text-muted)", display: "inline-flex" }}>{icon}</span>
      {label}
    </button>
  );
}

function SidebarResultLink({
  name, status, active, onClick, t,
}: {
  name: string;
  status: "normal" | "low" | "high" | "critical";
  active: boolean;
  onClick: () => void;
  t: ReturnType<typeof useLabApp>["t"];
}) {
  const dot = status === "normal" ? "var(--lr-normal-dot)" : status === "critical" ? "var(--lr-crit-dot)" : "var(--lr-attn-dot)";
  return (
    <button
      onClick={onClick}
      className="sans"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "7px 10px",
        borderRadius: 8,
        background: active ? "var(--lr-surface-alt)" : "transparent",
        color: "var(--lr-text)",
        border: "none",
        fontSize: 12.5,
        fontWeight: active ? 600 : 500,
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, flexShrink: 0 }} />
      <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
    </button>
  );
}

function SmallButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="sans"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 10px",
        borderRadius: 8,
        background: "transparent",
        color: "var(--lr-text)",
        border: "1px solid var(--lr-border)",
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      <span style={{ color: "var(--lr-text-muted)", display: "inline-flex", flexShrink: 0 }}>{icon}</span>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
    </button>
  );
}
