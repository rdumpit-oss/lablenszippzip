import { useEffect, useMemo, useRef, useState } from "react";
import "./_group.css";
import { SAMPLE_RESULTS, type LabResult, type GlossaryTerm, type LabResultsData } from "./data";

type Tab = "results" | "ask" | "chat";
type ChatMsg = { role: "user" | "assistant"; content: string; pending?: boolean; error?: boolean };
type Theme = "light" | "dark";
type Lang = "en" | "fil";

const STATUS = {
  normal:   { dot: "var(--lr-normal-dot)",  text: "var(--lr-normal-text)",  bg: "var(--lr-normal-bg)",  border: "var(--lr-normal-border)"  },
  low:      { dot: "var(--lr-attn-dot)",    text: "var(--lr-attn-text)",    bg: "var(--lr-attn-bg)",    border: "var(--lr-attn-border)"    },
  high:     { dot: "var(--lr-attn-dot)",    text: "var(--lr-attn-text)",    bg: "var(--lr-attn-bg)",    border: "var(--lr-attn-border)"    },
  critical: { dot: "var(--lr-crit-dot)",    text: "var(--lr-crit-text)",    bg: "var(--lr-crit-bg)",    border: "var(--lr-crit-border)"    },
} as const;

const OVERALL = {
  normal:    { bg: "var(--lr-overall-normal-bg)", border: "var(--lr-overall-normal-border)" },
  attention: { bg: "var(--lr-overall-attn-bg)",   border: "var(--lr-overall-attn-border)"   },
  concern:   { bg: "var(--lr-overall-crit-bg)",   border: "var(--lr-overall-crit-border)"   },
} as const;

const STRINGS = {
  en: {
    appTagline: "Lab result explainer",
    tabResults: "Results", tabAsk: "Ask", tabChat: "Chat",
    statNormal: "normal", statAttention: "attention", statCritical: "concerning",
    sectionAttention: "Needs attention",
    sectionNormal: "Normal results",
    statusNormal: "Normal", statusLow: "Low", statusHigh: "High", statusCritical: "Critical",
    refRangePrefix: "Ref:", refMissing: "No reference range",
    detailWhatItMeans: "What it means",
    detailCauses: "Possible causes",
    detailRemedies: "Possible remedies",
    detailRemediesNote: "Discuss these with your doctor before acting on them.",
    askLabLensAboutThis: "Ask LabLens about this result",
    askIntro: "Tap any question to drop it into chat with LabLens, or jot it down to ask your doctor.",
    askForDoctor: "Questions for your doctor",
    askFollowUps: "Follow-ups on abnormal results",
    chatGreeting: "I read your urinalysis. Several markers point to a possible UTI — ask me anything about the results.",
    chatPlaceholder: "Ask about your results…",
    chatDisclaimer: "LabLens uses AI. Always discuss decisions with your doctor.",
    askAboutTemplate: (name: string, value: string) => `What does my ${name} value of ${value} mean for me?`,
    sheetAnalyzeOther: "Analyze another lab result",
    sheetLanguage: "Switch language",
    sheetTheme: "Light / Dark theme",
    sheetAbout: "About LabLens",
    analyzeTitle: "Analyze another",
    analyzeBody: "Pick a fresh lab result image to analyze. Your current results will be replaced with the new analysis.",
    analyzeChoose: "Choose a lab result",
    analyzeFormats: "JPG · PNG · WEBP · HEIC",
    analyzeChooseBtn: "Choose photo",
    analyzing: "Analyzing your lab result…",
    analyzingHint: "This usually takes 5–15 seconds.",
    analyzeError: "Couldn't analyze that image",
    tryAgain: "Try again",
    cancel: "Cancel",
    languageTitle: "Language",
    themeTitle: "Theme",
    themeLight: "Light", themeDark: "Dark",
    aboutTitle: "About LabLens",
    aboutBody: "LabLens uses AI to translate medical jargon into plain language. It does not diagnose, treat, or replace a licensed medical professional. Always discuss your results with your doctor.",
    gotIt: "Got it",
    notSubstitute: "Not a substitute for professional medical advice. Always discuss results with your doctor.",
    backTitleResultPrefix: "",
  },
  fil: {
    appTagline: "Tagapagpaliwanag ng lab result",
    tabResults: "Resulta", tabAsk: "Tanong", tabChat: "Usapan",
    statNormal: "normal", statAttention: "kailangan ng atensyon", statCritical: "nakakaalala",
    sectionAttention: "Kailangang bantayan",
    sectionNormal: "Mga normal na resulta",
    statusNormal: "Normal", statusLow: "Mababa", statusHigh: "Mataas", statusCritical: "Kritikal",
    refRangePrefix: "Ref:", refMissing: "Walang reference range",
    detailWhatItMeans: "Ano ang ibig sabihin nito",
    detailCauses: "Mga posibleng dahilan",
    detailRemedies: "Mga posibleng lunas",
    detailRemediesNote: "Pag-usapan muna ito sa iyong doktor bago gawin.",
    askLabLensAboutThis: "Tanungin ang LabLens tungkol dito",
    askIntro: "I-tap ang anumang tanong para ilagay sa chat sa LabLens, o isulat ito para itanong sa iyong doktor.",
    askForDoctor: "Mga tanong sa iyong doktor",
    askFollowUps: "Mga follow-up sa abnormal na resulta",
    chatGreeting: "Nabasa ko na ang iyong urinalysis. May ilang markers na nagpapahiwatig ng posibleng UTI — magtanong ka lang.",
    chatPlaceholder: "Magtanong tungkol sa resulta…",
    chatDisclaimer: "Gumagamit ng AI ang LabLens. Palaging kumonsulta sa iyong doktor bago magdesisyon.",
    askAboutTemplate: (name: string, value: string) => `Ano ang ibig sabihin ng aking ${name} na ${value} para sa akin?`,
    sheetAnalyzeOther: "Mag-analyze ng panibagong lab result",
    sheetLanguage: "Palitan ang wika",
    sheetTheme: "Light / Dark theme",
    sheetAbout: "Tungkol sa LabLens",
    analyzeTitle: "Mag-analyze ng panibago",
    analyzeBody: "Pumili ng panibagong larawan ng lab result. Papalitan ang kasalukuyang resulta sa bagong analysis.",
    analyzeChoose: "Pumili ng lab result",
    analyzeFormats: "JPG · PNG · WEBP · HEIC",
    analyzeChooseBtn: "Pumili ng larawan",
    analyzing: "Sinusuri ang iyong lab result…",
    analyzingHint: "Karaniwang tumatagal ito ng 5–15 segundo.",
    analyzeError: "Hindi ma-analyze ang larawan",
    tryAgain: "Subukan ulit",
    cancel: "Kanselahin",
    languageTitle: "Wika",
    themeTitle: "Tema",
    themeLight: "Light", themeDark: "Dark",
    aboutTitle: "Tungkol sa LabLens",
    aboutBody: "Ginagamit ng LabLens ang AI para isalin ang medikal na jargon sa simpleng wika. Hindi ito gumagawa ng diagnosis, lunas, o kapalit ng lisensyadong doktor. Palaging pag-usapan ang resulta sa iyong doktor.",
    gotIt: "Sige",
    notSubstitute: "Hindi kapalit ng propesyonal na medikal na payo. Palaging pag-usapan ang resulta sa iyong doktor.",
    backTitleResultPrefix: "",
  },
} as const;

function escapeRegex(s: string) {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

function GlossyText({
  text,
  glossary,
  onTap,
}: {
  text: string;
  glossary: GlossaryTerm[];
  onTap: (term: string, def: string) => void;
}) {
  if (!text) return null;
  const valid = glossary.filter((g) => g && typeof g.term === "string" && g.term.trim().length > 1);
  if (valid.length === 0) return <>{text}</>;
  const sorted = [...valid].sort((a, b) => b.term.length - a.term.length);
  const pattern = sorted.map((g) => escapeRegex(g.term)).join("|");
  const re = new RegExp(`(${pattern})`, "gi");
  const lookup = new Map(valid.map((g) => [g.term.toLowerCase(), g.definition || ""]));
  const segments: (string | JSX.Element)[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) segments.push(text.slice(last, m.index));
    const matched = m[0];
    const def = lookup.get(matched.toLowerCase());
    if (def) {
      segments.push(
        <span
          key={`${m.index}-${matched}`}
          onClick={(e) => { e.stopPropagation(); onTap(matched, def); }}
          style={{
            borderBottom: "1px dotted var(--lr-text-muted)",
            cursor: "pointer",
            color: "var(--lr-text-secondary)",
          }}
        >
          {matched}
        </span>,
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

function fmtDate(lang: Lang) {
  const d = new Date();
  return d.toLocaleDateString(lang === "fil" ? "fil-PH" : "en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export function SplitRail() {
  const [data, setData] = useState<LabResultsData>(SAMPLE_RESULTS);
  const [theme, setTheme] = useState<Theme>("light");
  const [lang, setLang] = useState<Lang>("en");
  const t = STRINGS[lang];

  const [tab, setTab] = useState<Tab>("results");
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [glossPopup, setGlossPopup] = useState<{ term: string; def: string } | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: STRINGS.en.chatGreeting },
  ]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sheet, setSheet] = useState<"none" | "menu" | "analyze" | "language" | "theme" | "about">("none");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeErr, setAnalyzeErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const counts = useMemo(() => {
    const c = { normal: 0, attention: 0, critical: 0 };
    for (const r of data.results) {
      if (r.status === "normal") c.normal++;
      else if (r.status === "critical") c.critical++;
      else c.attention++;
    }
    return c;
  }, [data.results]);

  const selected = useMemo(
    () => (selectedName ? data.results.find((r) => r.name === selectedName) || null : null),
    [selectedName, data.results],
  );

  useEffect(() => {
    if (tab === "chat") {
      requestAnimationFrame(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      });
    }
  }, [tab, messages]);

  // Reset greeting when language changes (only if greeting is still default)
  useEffect(() => {
    setMessages((cur) => {
      if (cur.length === 1 && cur[0].role === "assistant" && (cur[0].content === STRINGS.en.chatGreeting || cur[0].content === STRINGS.fil.chatGreeting)) {
        return [{ role: "assistant", content: STRINGS[lang].chatGreeting }];
      }
      return cur;
    });
  }, [lang]);

  function openGlossary(term: string, def: string) { setGlossPopup({ term, def }); }
  const G = (text: string) => <GlossyText text={text} glossary={data.glossary} onTap={openGlossary} />;

  async function sendMessage(textOverride?: string) {
    const text = (textOverride ?? draft).trim();
    if (!text || sending) return;
    const next: ChatMsg[] = [
      ...messages,
      { role: "user", content: text },
      { role: "assistant", content: "", pending: true },
    ];
    setMessages(next);
    setDraft("");
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: lang,
          labContext: {
            overallStatus: data.overallStatus,
            overallLabel: data.overallLabel,
            summary: data.summary,
            results: data.results,
          },
          messages: next.filter((m) => !m.pending).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error?.message || `Request failed (${res.status})`);
      const reply = body?.reply || "";
      setMessages((cur) => {
        const copy = [...cur];
        const idx = copy.findIndex((m) => m.pending);
        if (idx >= 0) copy[idx] = { role: "assistant", content: reply };
        return copy;
      });
    } catch (err: any) {
      setMessages((cur) => {
        const copy = [...cur];
        const idx = copy.findIndex((m) => m.pending);
        if (idx >= 0) copy[idx] = { role: "assistant", content: err?.message || "Something went wrong.", error: true };
        return copy;
      });
    } finally {
      setSending(false);
    }
  }

  function jumpToChatWith(question: string) {
    setTab("chat");
    setDraft(question);
    setSelectedName(null);
  }

  function pickFile() {
    setAnalyzeErr(null);
    fileRef.current?.click();
  }

  async function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      setAnalyzeErr("Please choose an image file (JPG, PNG, WEBP, HEIC).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setAnalyzeErr("Image is too large. Please choose one under 8 MB.");
      return;
    }
    setAnalyzing(true);
    setAnalyzeErr(null);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: base64, mediaType: file.type, language: lang }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error?.message || `Request failed (${res.status})`);
      const c = body?.content;
      if (!c || !Array.isArray(c.results)) throw new Error("Unexpected response from analysis.");
      const newData: LabResultsData = {
        overallStatus: c.overallStatus || "attention",
        overallLabel: c.overallLabel || "",
        summary: c.summary || "",
        results: c.results,
        questionsToAsk: c.questionsToAsk || [],
        followUpQuestions: c.followUpQuestions || [],
        glossary: c.glossary || [],
        analyzedDate: fmtDate(lang),
      };
      setData(newData);
      setMessages([{ role: "assistant", content: STRINGS[lang].chatGreeting }]);
      setSelectedName(null);
      setTab("results");
      setSheet("none");
    } catch (err: any) {
      setAnalyzeErr(err?.message || "Couldn't analyze that image.");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div
      className="lab-results-root"
      data-theme={theme}
      style={{
        width: 390,
        height: 844,
        margin: "0 auto",
        background: "var(--lr-page-bg)",
        color: "var(--lr-text)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 8px 30px rgba(26,22,18,0.08)",
      }}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*"
        onChange={onFilePicked}
        style={{ display: "none" }}
      />

      {/* iOS status bar */}
      <div
        className="sans"
        style={{
          height: 44,
          flexShrink: 0,
          padding: "0 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 14,
          fontWeight: 600,
          color: "var(--lr-text)",
        }}
      >
        <span>9:41</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <SignalIcon /><WifiIcon /><BatteryIcon />
        </span>
      </div>

      <TopBar
        title={selected ? selected.name.replace(/EPITHELIAL CELLS – /, "Epithelial · ") : "LabLens"}
        showBack={!!selected}
        onBack={() => setSelectedName(null)}
        onMenu={() => setSheet("menu")}
      />

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch" }}>
        {tab === "results" && !selected && <ResultsList data={data} counts={counts} G={G} t={t} onSelect={(n) => setSelectedName(n)} />}
        {tab === "results" && selected && <ResultDetail r={selected} G={G} t={t} onAsk={(q) => jumpToChatWith(q)} />}
        {tab === "ask" && <AskTab data={data} G={G} t={t} onAsk={(q) => jumpToChatWith(q)} />}
        {tab === "chat" && <ChatThread messages={messages} chatEndRef={chatEndRef} sending={sending} t={t} G={G} />}
      </div>

      {tab === "chat" && (
        <ChatComposer placeholder={t.chatPlaceholder} draft={draft} setDraft={setDraft} onSend={() => sendMessage()} disabled={sending} />
      )}

      <TabBar
        active={tab}
        labels={{ results: t.tabResults, ask: t.tabAsk, chat: t.tabChat }}
        onChange={(newTab) => {
          setTab(newTab);
          if (newTab !== "results") setSelectedName(null);
        }}
      />

      {/* Glossary modal */}
      {glossPopup && (
        <Modal onClose={() => setGlossPopup(null)} title={glossPopup.term} confirmLabel={t.gotIt}>
          <div className="sans" style={{ fontSize: 14, lineHeight: 1.55, color: "var(--lr-text-secondary)" }}>
            {glossPopup.def}
          </div>
        </Modal>
      )}

      {/* MENU */}
      {sheet === "menu" && (
        <Sheet onClose={() => setSheet("none")}>
          <SheetItem label={t.sheetAnalyzeOther} onClick={() => setSheet("analyze")} icon={<UploadIcon />} />
          <SheetItem
            label={`${t.sheetLanguage} · ${lang === "en" ? "English" : "Filipino"}`}
            onClick={() => setSheet("language")}
            icon={<GlobeIcon />}
          />
          <SheetItem
            label={`${t.sheetTheme} · ${theme === "light" ? t.themeLight : t.themeDark}`}
            onClick={() => setSheet("theme")}
            icon={theme === "light" ? <SunIcon /> : <MoonIcon />}
          />
          <SheetItem label={t.sheetAbout} onClick={() => setSheet("about")} icon={<InfoIcon />} last />
        </Sheet>
      )}

      {/* ANALYZE */}
      {sheet === "analyze" && (
        <Sheet onClose={() => analyzing ? null : setSheet("none")} title={t.analyzeTitle}>
          {!analyzing && !analyzeErr && (
            <>
              <div className="sans" style={{ fontSize: 13.5, color: "var(--lr-text-secondary)", lineHeight: 1.55, padding: "4px 4px 16px" }}>
                {t.analyzeBody}
              </div>
              <button
                onClick={pickFile}
                style={{
                  display: "block",
                  width: "100%",
                  border: "2px dashed var(--lr-border-strong)",
                  borderRadius: 14,
                  padding: "26px 20px",
                  textAlign: "center",
                  background: "var(--lr-input-bg)",
                  marginBottom: 14,
                  cursor: "pointer",
                  color: "inherit",
                  font: "inherit",
                }}
              >
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                  <div style={{ width: 44, height: 44, background: "var(--lr-surface-alt)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <UploadIcon />
                  </div>
                </div>
                <div style={{ fontWeight: 600, fontSize: 15, color: "var(--lr-text)", marginBottom: 4 }}>
                  {t.analyzeChoose}
                </div>
                <div className="sans" style={{ fontSize: 12, color: "var(--lr-text-muted)" }}>
                  {t.analyzeFormats}
                </div>
              </button>
              <button
                className="sans"
                onClick={pickFile}
                style={{
                  width: "100%",
                  background: "var(--lr-btn-bg)",
                  color: "var(--lr-btn-text)",
                  border: "none",
                  borderRadius: 12,
                  padding: "14px",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {t.analyzeChooseBtn}
              </button>
            </>
          )}

          {analyzing && (
            <div style={{ padding: "30px 8px", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <Spinner />
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "var(--lr-text)", marginBottom: 6 }}>
                {t.analyzing}
              </div>
              <div className="sans" style={{ fontSize: 12.5, color: "var(--lr-text-muted)" }}>
                {t.analyzingHint}
              </div>
            </div>
          )}

          {!analyzing && analyzeErr && (
            <>
              <div
                style={{
                  background: "var(--lr-crit-bg)",
                  border: "1px solid var(--lr-crit-border)",
                  borderRadius: 12,
                  padding: "13px 14px",
                  marginBottom: 14,
                }}
              >
                <div className="sans" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--lr-crit-text)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 }}>
                  {t.analyzeError}
                </div>
                <div className="sans" style={{ fontSize: 13, color: "var(--lr-text-secondary)", lineHeight: 1.5 }}>
                  {analyzeErr}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="sans"
                  onClick={() => { setAnalyzeErr(null); }}
                  style={{
                    flex: 1,
                    background: "transparent",
                    color: "var(--lr-text)",
                    border: "1px solid var(--lr-border-strong)",
                    borderRadius: 12,
                    padding: "12px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {t.cancel}
                </button>
                <button
                  className="sans"
                  onClick={pickFile}
                  style={{
                    flex: 1,
                    background: "var(--lr-btn-bg)",
                    color: "var(--lr-btn-text)",
                    border: "none",
                    borderRadius: 12,
                    padding: "12px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {t.tryAgain}
                </button>
              </div>
            </>
          )}
        </Sheet>
      )}

      {/* LANGUAGE */}
      {sheet === "language" && (
        <Sheet onClose={() => setSheet("none")} title={t.languageTitle}>
          <SegmentedChoice
            options={[
              { id: "en",  label: "English" },
              { id: "fil", label: "Filipino (Tagalog)" },
            ]}
            value={lang}
            onChange={(v) => { setLang(v as Lang); setSheet("none"); }}
          />
        </Sheet>
      )}

      {/* THEME */}
      {sheet === "theme" && (
        <Sheet onClose={() => setSheet("none")} title={t.themeTitle}>
          <SegmentedChoice
            options={[
              { id: "light", label: t.themeLight, icon: <SunIcon /> },
              { id: "dark",  label: t.themeDark,  icon: <MoonIcon /> },
            ]}
            value={theme}
            onChange={(v) => { setTheme(v as Theme); setSheet("none"); }}
          />
        </Sheet>
      )}

      {/* ABOUT */}
      {sheet === "about" && (
        <Sheet onClose={() => setSheet("none")} title={t.aboutTitle}>
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

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/* ---------- Top bar ---------- */
function TopBar({ title, showBack, onBack, onMenu }: { title: string; showBack: boolean; onBack: () => void; onMenu: () => void }) {
  return (
    <div
      style={{
        height: 50,
        flexShrink: 0,
        background: "var(--lr-page-bg)",
        borderBottom: "1px solid var(--lr-border-faint)",
        padding: "0 8px",
        display: "grid",
        gridTemplateColumns: "44px 1fr 44px",
        alignItems: "center",
      }}
    >
      <button
        aria-label={showBack ? "Back" : "Menu"}
        onClick={showBack ? onBack : onMenu}
        style={{
          background: "transparent",
          border: "none",
          width: 44,
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--lr-text)",
          cursor: "pointer",
          padding: 0,
        }}
      >
        {showBack ? <ChevronLeft /> : <MenuIcon />}
      </button>
      <div style={{ textAlign: "center", overflow: "hidden" }}>
        {showBack ? (
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--lr-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {title}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, background: "var(--lr-btn-bg)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--lr-btn-text)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
              </svg>
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--lr-text)", letterSpacing: "-0.01em" }}>
              Lab<span style={{ fontStyle: "italic", fontWeight: 400, color: "var(--lr-accent)" }}>Lens</span>
            </div>
          </div>
        )}
      </div>
      <div />
    </div>
  );
}

/* ---------- Results list ---------- */
function ResultsList({
  data,
  counts,
  G,
  t,
  onSelect,
}: {
  data: LabResultsData;
  counts: { normal: number; attention: number; critical: number };
  G: (text: string) => JSX.Element | null;
  t: (typeof STRINGS)["en"];
  onSelect: (name: string) => void;
}) {
  const ov = OVERALL[data.overallStatus] || OVERALL.normal;
  const abnormal = data.results.filter((r) => r.status !== "normal");
  const normal = data.results.filter((r) => r.status === "normal");

  return (
    <div style={{ padding: "14px 16px 100px" }}>
      <div
        style={{
          background: ov.bg,
          border: "1px solid var(--lr-border)",
          borderLeft: `4px solid ${ov.border}`,
          borderRadius: 14,
          padding: "14px 14px 12px",
          marginBottom: 12,
          boxShadow: "var(--lr-shadow)",
        }}
      >
        <div className="sans" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ov.border, marginBottom: 6 }}>
          {data.overallLabel}
        </div>
        <div className="sans" style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--lr-text-secondary)" }}>
          {G(data.summary)}
        </div>
      </div>

      <div className="sans" style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        <StatPill kind="normal"   value={counts.normal}    label={t.statNormal} />
        <StatPill kind="high"     value={counts.attention} label={t.statAttention} />
        {counts.critical > 0 && <StatPill kind="critical" value={counts.critical} label={t.statCritical} />}
      </div>

      {abnormal.length > 0 && (
        <>
          <SectionLabel>{t.sectionAttention}</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
            {abnormal.map((r) => (
              <ResultRow key={r.name} r={r} t={t} onClick={() => onSelect(r.name)} G={G} />
            ))}
          </div>
        </>
      )}

      {normal.length > 0 && (
        <>
          <SectionLabel>{t.sectionNormal}</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {normal.map((r) => (
              <ResultRow key={r.name} r={r} t={t} compact onClick={() => onSelect(r.name)} G={G} />
            ))}
          </div>
        </>
      )}

      <div className="sans" style={{ fontSize: 11, color: "var(--lr-text-faint)", textAlign: "center", marginTop: 22, lineHeight: 1.55, padding: "0 12px" }}>
        {t.notSubstitute}
      </div>
    </div>
  );
}

function StatPill({ kind, value, label }: { kind: "normal" | "high" | "critical"; value: number; label: string }) {
  const sc = STATUS[kind];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        color: sc.text,
        background: sc.bg,
        padding: "5px 11px",
        borderRadius: 14,
        fontWeight: 600,
        border: `1px solid ${sc.border}`,
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: sc.dot }} />
      {value} {label}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="sans"
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--lr-text-muted)",
        marginBottom: 8,
        paddingLeft: 2,
      }}
    >
      {children}
    </div>
  );
}

function ResultRow({
  r,
  onClick,
  compact,
  G,
  t,
}: {
  r: LabResult;
  onClick: () => void;
  compact?: boolean;
  G: (text: string) => JSX.Element | null;
  t: (typeof STRINGS)["en"];
}) {
  const sc = STATUS[r.status] || STATUS.normal;
  const statusLabelMap = { normal: t.statusNormal, low: t.statusLow, high: t.statusHigh, critical: t.statusCritical } as const;
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        background: "var(--lr-surface)",
        border: "1px solid var(--lr-border)",
        borderLeft: `3px solid ${sc.border}`,
        borderRadius: 12,
        padding: compact ? "9px 12px" : "11px 13px",
        cursor: "pointer",
        boxShadow: "var(--lr-shadow)",
        display: "flex",
        alignItems: compact ? "center" : "flex-start",
        justifyContent: "space-between",
        gap: 10,
        width: "100%",
        font: "inherit",
        color: "inherit",
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: compact ? 13 : 13.5, color: "var(--lr-text)", lineHeight: 1.3 }}>
          {G(r.name)}
        </div>
        {!compact && (
          <div className="sans" style={{ fontSize: 11.5, color: "var(--lr-text-muted)", marginTop: 3, lineHeight: 1.4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {r.referenceRange ? `${t.refRangePrefix} ${r.referenceRange}` : t.refMissing}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: compact ? 13.5 : 15, fontWeight: 600, color: sc.text, whiteSpace: "nowrap" }}>
            {r.value}
          </div>
          {!compact && (
            <div className="sans" style={{ fontSize: 10.5, color: sc.text, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 1 }}>
              {statusLabelMap[r.status]}
            </div>
          )}
        </div>
        <ChevronRight />
      </div>
    </button>
  );
}

/* ---------- Result detail ---------- */
function ResultDetail({
  r,
  G,
  t,
  onAsk,
}: {
  r: LabResult;
  G: (text: string) => JSX.Element | null;
  t: (typeof STRINGS)["en"];
  onAsk: (q: string) => void;
}) {
  const sc = STATUS[r.status] || STATUS.normal;
  const statusLabelMap = { normal: t.statusNormal, low: t.statusLow, high: t.statusHigh, critical: t.statusCritical } as const;
  return (
    <div style={{ padding: "16px 16px 100px" }}>
      <div
        style={{
          background: sc.bg,
          border: "1px solid var(--lr-border)",
          borderRadius: 14,
          padding: "16px",
          marginBottom: 14,
        }}
      >
        <div className="sans" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: sc.text, marginBottom: 8 }}>
          <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: sc.dot, marginRight: 6, verticalAlign: "middle" }} />
          {statusLabelMap[r.status]}
        </div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 600, lineHeight: 1.1, color: "var(--lr-text)", marginBottom: 6 }}>
          {r.value}
        </div>
        {r.referenceRange && (
          <div className="sans" style={{ fontSize: 12, color: "var(--lr-text-muted)" }}>
            {t.refRangePrefix} {r.referenceRange}
          </div>
        )}
      </div>

      <SectionLabel>{t.detailWhatItMeans}</SectionLabel>
      <div className="sans" style={{ fontSize: 14, lineHeight: 1.6, color: "var(--lr-text-secondary)", marginBottom: 18 }}>
        {G(r.explanation)}
      </div>

      {(r.possibleCauses?.length ?? 0) > 0 && (
        <>
          <SectionLabel>{t.detailCauses}</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
            {r.possibleCauses!.map((c, i) => (
              <BulletItem key={i}>{G(c)}</BulletItem>
            ))}
          </div>
        </>
      )}

      {(r.possibleRemedies?.length ?? 0) > 0 && (
        <>
          <SectionLabel>{t.detailRemedies}</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            {r.possibleRemedies!.map((c, i) => (
              <BulletItem key={i}>{G(c)}</BulletItem>
            ))}
          </div>
          <div className="sans" style={{ fontSize: 11.5, color: "var(--lr-text-faint)", fontStyle: "italic", marginBottom: 18 }}>
            {t.detailRemediesNote}
          </div>
        </>
      )}

      <button
        onClick={() => onAsk(t.askAboutTemplate(r.name, r.value))}
        className="sans"
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <ChatBubbleIcon /> {t.askLabLensAboutThis}
      </button>
    </div>
  );
}

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="sans"
      style={{
        fontSize: 13.5,
        color: "var(--lr-text-secondary)",
        lineHeight: 1.5,
        background: "var(--lr-surface)",
        border: "1px solid var(--lr-border-faint)",
        borderRadius: 10,
        padding: "9px 12px 9px 28px",
        position: "relative",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 12,
          top: 12,
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--lr-text-muted)",
        }}
      />
      {children}
    </div>
  );
}

/* ---------- Ask tab ---------- */
function AskTab({
  data,
  G,
  t,
  onAsk,
}: {
  data: LabResultsData;
  G: (text: string) => JSX.Element | null;
  t: (typeof STRINGS)["en"];
  onAsk: (q: string) => void;
}) {
  return (
    <div style={{ padding: "16px 16px 100px" }}>
      <div className="sans" style={{ fontSize: 13, color: "var(--lr-text-muted)", lineHeight: 1.55, marginBottom: 14 }}>
        {t.askIntro}
      </div>

      {data.questionsToAsk.length > 0 && (
        <>
          <SectionLabel>{t.askForDoctor}</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
            {data.questionsToAsk.map((q, i) => (
              <QuestionRow key={`a${i}`} text={q} G={G} onAsk={() => onAsk(q)} />
            ))}
          </div>
        </>
      )}

      {data.followUpQuestions.length > 0 && (
        <>
          <SectionLabel>{t.askFollowUps}</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.followUpQuestions.map((q, i) => (
              <QuestionRow key={`f${i}`} text={q} G={G} onAsk={() => onAsk(q)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function QuestionRow({ text, G, onAsk }: { text: string; G: (text: string) => JSX.Element | null; onAsk: () => void }) {
  return (
    <div
      style={{
        background: "var(--lr-surface)",
        border: "1px solid var(--lr-border)",
        borderRadius: 12,
        padding: "11px 13px",
        boxShadow: "var(--lr-shadow)",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      <div className="sans" style={{ fontSize: 13.5, color: "var(--lr-text-secondary)", lineHeight: 1.5, flex: 1 }}>
        {G(text)}
      </div>
      <button
        onClick={onAsk}
        aria-label="Ask LabLens"
        style={{
          flexShrink: 0,
          width: 34,
          height: 34,
          borderRadius: 10,
          background: "var(--lr-surface-alt)",
          border: "1px solid var(--lr-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "var(--lr-text)",
        }}
      >
        <ChatBubbleIcon />
      </button>
    </div>
  );
}

/* ---------- Chat ---------- */
function ChatThread({
  messages,
  chatEndRef,
  sending,
  t,
  G,
}: {
  messages: ChatMsg[];
  chatEndRef: React.RefObject<HTMLDivElement>;
  sending: boolean;
  t: (typeof STRINGS)["en"];
  G: (text: string) => JSX.Element | null;
}) {
  return (
    <div style={{ padding: "16px 16px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
      {messages.map((m, i) => {
        const isUser = m.role === "user";
        return (
          <div key={i} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
            <div
              className="sans"
              style={{
                maxWidth: "82%",
                padding: "10px 13px",
                borderRadius: 16,
                fontSize: 13.5,
                lineHeight: 1.5,
                background: isUser ? "var(--lr-btn-bg)" : "var(--lr-surface)",
                color: isUser ? "var(--lr-btn-text)" : (m.error ? "var(--lr-crit-text)" : "var(--lr-text-secondary)"),
                border: isUser ? "none" : `1px solid ${m.error ? "var(--lr-crit-border)" : "var(--lr-border)"}`,
                borderBottomRightRadius: isUser ? 4 : 16,
                borderBottomLeftRadius: isUser ? 16 : 4,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {m.pending ? <TypingDots /> : (isUser ? m.content : G(m.content))}
            </div>
          </div>
        );
      })}
      <div ref={chatEndRef} style={{ height: 1 }} />
      {!sending && messages.length <= 2 && (
        <div className="sans" style={{ fontSize: 11, color: "var(--lr-text-faint)", textAlign: "center", marginTop: 8, lineHeight: 1.5 }}>
          {t.chatDisclaimer}
        </div>
      )}
    </div>
  );
}

function TypingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center", padding: "2px 0" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--lr-text-muted)",
            animation: `lrBounce 1.2s ${i * 0.15}s infinite ease-in-out`,
            display: "inline-block",
            opacity: 0.5,
          }}
        />
      ))}
      <style>
        {`@keyframes lrBounce { 0%,80%,100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-3px); opacity: 1; } }`}
      </style>
    </span>
  );
}

function Spinner() {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        border: "3px solid var(--lr-border-strong)",
        borderTopColor: "var(--lr-text)",
        borderRadius: "50%",
        animation: "lrSpin 0.9s linear infinite",
      }}
    >
      <style>{`@keyframes lrSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ChatComposer({
  draft,
  setDraft,
  onSend,
  disabled,
  placeholder,
}: {
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
  placeholder: string;
}) {
  return (
    <div
      style={{
        flexShrink: 0,
        background: "var(--lr-page-bg)",
        borderTop: "1px solid var(--lr-border-faint)",
        padding: "10px 12px",
        display: "flex",
        gap: 8,
        alignItems: "flex-end",
      }}
    >
      <textarea
        className="sans"
        placeholder={placeholder}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        rows={1}
        style={{
          flex: 1,
          background: "var(--lr-input-bg)",
          border: "1px solid var(--lr-border-strong)",
          borderRadius: 18,
          padding: "10px 14px",
          fontSize: 14,
          color: "var(--lr-text)",
          outline: "none",
          resize: "none",
          maxHeight: 100,
          fontFamily: "inherit",
          lineHeight: 1.4,
        }}
      />
      <button
        onClick={onSend}
        disabled={disabled || !draft.trim()}
        aria-label="Send"
        style={{
          flexShrink: 0,
          width: 40,
          height: 40,
          background: disabled || !draft.trim() ? "var(--lr-text-faint)" : "var(--lr-btn-bg)",
          color: "var(--lr-btn-text)",
          border: "none",
          borderRadius: "50%",
          cursor: disabled || !draft.trim() ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.15s",
        }}
      >
        <SendIcon />
      </button>
    </div>
  );
}

/* ---------- Tab bar ---------- */
function TabBar({
  active,
  labels,
  onChange,
}: {
  active: Tab;
  labels: { results: string; ask: string; chat: string };
  onChange: (t: Tab) => void;
}) {
  const items: { id: Tab; label: string; icon: JSX.Element }[] = [
    { id: "results", label: labels.results, icon: <ListIcon /> },
    { id: "ask",     label: labels.ask,     icon: <HelpIcon /> },
    { id: "chat",    label: labels.chat,    icon: <ChatBubbleIcon /> },
  ];
  return (
    <div
      style={{
        flexShrink: 0,
        background: "var(--lr-surface)",
        borderTop: "1px solid var(--lr-border)",
        padding: "6px 4px 22px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
      }}
    >
      {items.map((it) => {
        const isActive = active === it.id;
        return (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            style={{
              background: "transparent",
              border: "none",
              padding: "6px 4px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              color: isActive ? "var(--lr-text)" : "var(--lr-text-muted)",
              cursor: "pointer",
            }}
          >
            <span style={{ opacity: isActive ? 1 : 0.7 }}>{it.icon}</span>
            <span className="sans" style={{ fontSize: 10.5, fontWeight: isActive ? 600 : 500, letterSpacing: "0.02em" }}>
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Modal & Sheet ---------- */
function Modal({ children, onClose, title, confirmLabel }: { children: React.ReactNode; onClose: () => void; title?: string; confirmLabel?: string }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--lr-surface)",
          borderRadius: 16,
          padding: "18px 18px 16px",
          width: "100%",
          maxWidth: 320,
          boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        }}
      >
        {title && (
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--lr-text)", marginBottom: 10 }}>
            {title}
          </div>
        )}
        {children}
        <button
          onClick={onClose}
          className="sans"
          style={{
            marginTop: 16,
            width: "100%",
            background: "var(--lr-btn-bg)",
            color: "var(--lr-btn-text)",
            border: "none",
            borderRadius: 10,
            padding: "10px",
            fontSize: 13.5,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {confirmLabel || "Got it"}
        </button>
      </div>
    </div>
  );
}

function Sheet({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title?: string }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 60,
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--lr-surface)",
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          padding: "10px 16px 22px",
          width: "100%",
          boxShadow: "0 -8px 30px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <div style={{ width: 38, height: 4, background: "var(--lr-border-strong)", borderRadius: 2 }} />
        </div>
        {title && (
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--lr-text)", marginBottom: 12, textAlign: "center" }}>
            {title}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function SheetItem({ label, onClick, icon, last }: { label: string; onClick: () => void; icon: React.ReactNode; last?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="sans"
      style={{
        width: "100%",
        background: "transparent",
        border: "none",
        borderBottom: last ? "none" : "1px solid var(--lr-border-faint)",
        padding: "13px 4px",
        textAlign: "left",
        fontSize: 14,
        color: "var(--lr-text)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span style={{ width: 24, color: "var(--lr-text-muted)", display: "flex", justifyContent: "center" }}>
        {icon}
      </span>
      {label}
      <span style={{ marginLeft: "auto", color: "var(--lr-text-faint)" }}>
        <ChevronRight />
      </span>
    </button>
  );
}

function SegmentedChoice({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string; icon?: React.ReactNode }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className="sans"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "13px 14px",
              borderRadius: 12,
              border: `1px solid ${active ? "var(--lr-text)" : "var(--lr-border)"}`,
              background: active ? "var(--lr-surface-alt)" : "transparent",
              color: "var(--lr-text)",
              fontSize: 14.5,
              fontWeight: active ? 600 : 500,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            {opt.icon && <span style={{ color: "var(--lr-text-muted)", display: "inline-flex" }}>{opt.icon}</span>}
            <span style={{ flex: 1 }}>{opt.label}</span>
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: `1.5px solid ${active ? "var(--lr-text)" : "var(--lr-border-strong)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {active && (
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--lr-text)" }} />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Icons ---------- */
function ChevronLeft() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>; }
function ChevronRight() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--lr-text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>; }
function MenuIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>; }
function ListIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>; }
function HelpIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function ChatBubbleIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }
function SendIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>; }
function UploadIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>; }
function GlobeIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>; }
function SunIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>; }
function MoonIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>; }
function InfoIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>; }
function SignalIcon() { return <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4" y="5" width="3" height="6" rx="0.5"/><rect x="8" y="2" width="3" height="9" rx="0.5"/><rect x="12" y="0" width="3" height="11" rx="0.5"/></svg>; }
function WifiIcon() { return <svg width="14" height="11" viewBox="0 0 14 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M1 3.5a9 9 0 0 1 12 0"/><path d="M3.2 5.7a6 6 0 0 1 7.6 0"/><path d="M5.4 7.9a3 3 0 0 1 3.2 0"/><circle cx="7" cy="9.6" r="0.7" fill="currentColor"/></svg>; }
function BatteryIcon() { return <svg width="24" height="11" viewBox="0 0 24 11" fill="none" stroke="currentColor" strokeWidth="1"><rect x="0.5" y="0.5" width="20" height="10" rx="2.5"/><rect x="2" y="2" width="16" height="7" rx="1" fill="currentColor"/><rect x="21" y="3.5" width="1.5" height="4" rx="0.5" fill="currentColor"/></svg>; }
