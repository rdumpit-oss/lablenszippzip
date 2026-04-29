import { useEffect, useMemo, useRef, useState } from "react";
import { SAMPLE_RESULTS, type LabResult, type GlossaryTerm, type LabResultsData } from "./data";

export type Tab = "results" | "ask" | "chat";
export type ChatMsg = { role: "user" | "assistant"; content: string; pending?: boolean; error?: boolean };
export type Theme = "light" | "dark";
export type Lang = "en" | "fil";

export const STATUS = {
  normal:   { dot: "var(--lr-normal-dot)", text: "var(--lr-normal-text)", bg: "var(--lr-normal-bg)", border: "var(--lr-normal-border)" },
  low:      { dot: "var(--lr-attn-dot)",   text: "var(--lr-attn-text)",   bg: "var(--lr-attn-bg)",   border: "var(--lr-attn-border)"   },
  high:     { dot: "var(--lr-attn-dot)",   text: "var(--lr-attn-text)",   bg: "var(--lr-attn-bg)",   border: "var(--lr-attn-border)"   },
  critical: { dot: "var(--lr-crit-dot)",   text: "var(--lr-crit-text)",   bg: "var(--lr-crit-bg)",   border: "var(--lr-crit-border)"   },
} as const;

export const OVERALL = {
  normal:    { bg: "var(--lr-overall-normal-bg)", border: "var(--lr-overall-normal-border)" },
  attention: { bg: "var(--lr-overall-attn-bg)",   border: "var(--lr-overall-attn-border)"   },
  concern:   { bg: "var(--lr-overall-crit-bg)",   border: "var(--lr-overall-crit-border)"   },
} as const;

export const STRINGS = {
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
    sheetTheme: "Theme",
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
    pickAResult: "Pick a result",
    pickAResultBody: "Select any result from the list to see its full explanation here.",
    overview: "Overview",
    yourResults: "Your results",
    askLabLens: "Ask LabLens",
    settings: "Settings",
    analyzedOn: "Analyzed",
    sampleType: "Urinalysis",
    chatHint: "Chat about your results",
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
    sheetTheme: "Tema",
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
    pickAResult: "Pumili ng resulta",
    pickAResultBody: "Pumili ng kahit anong resulta sa listahan para makita ang buong paliwanag dito.",
    overview: "Pangkalahatan",
    yourResults: "Iyong mga resulta",
    askLabLens: "Tanungin ang LabLens",
    settings: "Mga setting",
    analyzedOn: "Sinuri noong",
    sampleType: "Urinalysis",
    chatHint: "Mag-chat tungkol sa resulta",
  },
} as const;

export type StringsT = typeof STRINGS["en"];

export function escapeRegex(s: string) {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

export function fileToBase64(file: File): Promise<string> {
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

export function fmtDate(lang: Lang) {
  const d = new Date();
  return d.toLocaleDateString(lang === "fil" ? "fil-PH" : "en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export function statusLabel(s: LabResult["status"], t: StringsT) {
  return s === "normal" ? t.statusNormal : s === "low" ? t.statusLow : s === "high" ? t.statusHigh : t.statusCritical;
}

/* ---------- Glossary text ---------- */
export function GlossyText({
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

/* ---------- useLabApp hook ---------- */
export type UseLabAppOptions = {
  initialData?: LabResultsData;
  initialTheme?: Theme;
  initialLang?: Lang;
  onThemeChange?: (theme: Theme) => void;
  onLangChange?: (lang: Lang) => void;
};

export function useLabApp(opts: UseLabAppOptions = {}) {
  const [data, setData] = useState<LabResultsData>(opts.initialData || SAMPLE_RESULTS);
  const [theme, setThemeState] = useState<Theme>(opts.initialTheme || "light");
  const [lang, setLangState] = useState<Lang>(opts.initialLang || "en");
  const t = STRINGS[lang];

  const setTheme = (next: Theme) => { setThemeState(next); opts.onThemeChange?.(next); };
  const setLang  = (next: Lang)  => { setLangState(next);  opts.onLangChange?.(next);  };

  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [glossPopup, setGlossPopup] = useState<{ term: string; def: string } | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: STRINGS.en.chatGreeting },
  ]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeErr, setAnalyzeErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

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

  // Switch chat greeting if we're still on the default
  useEffect(() => {
    setMessages((cur) => {
      if (
        cur.length === 1 &&
        cur[0].role === "assistant" &&
        (cur[0].content === STRINGS.en.chatGreeting || cur[0].content === STRINGS.fil.chatGreeting)
      ) {
        return [{ role: "assistant", content: STRINGS[lang].chatGreeting }];
      }
      return cur;
    });
  }, [lang]);

  function openGlossary(term: string, def: string) { setGlossPopup({ term, def }); }
  function closeGlossary() { setGlossPopup(null); }

  function G(text: string) {
    return <GlossyText text={text} glossary={data.glossary} onTap={openGlossary} />;
  }

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

  function pickFile() {
    setAnalyzeErr(null);
    fileRef.current?.click();
  }

  async function onFilePicked(e: React.ChangeEvent<HTMLInputElement>): Promise<boolean> {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return false;
    if (!/^image\//.test(file.type)) {
      setAnalyzeErr("Please choose an image file (JPG, PNG, WEBP, HEIC).");
      return false;
    }
    if (file.size > 8 * 1024 * 1024) {
      setAnalyzeErr("Image is too large. Please choose one under 8 MB.");
      return false;
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
      return true;
    } catch (err: any) {
      setAnalyzeErr(err?.message || "Couldn't analyze that image.");
      return false;
    } finally {
      setAnalyzing(false);
    }
  }

  return {
    data, setData,
    theme, setTheme,
    lang, setLang, t,
    selectedName, setSelectedName, selected,
    counts,
    glossPopup, openGlossary, closeGlossary, G,
    messages, setMessages,
    draft, setDraft, sending, sendMessage,
    fileRef, pickFile, onFilePicked,
    analyzing, analyzeErr, setAnalyzeErr,
  };
}

/* ---------- Visual primitives ---------- */
export function StatPill({ kind, value, label }: { kind: "normal" | "high" | "critical"; value: number; label: string }) {
  const sc = STATUS[kind];
  return (
    <span
      className="sans"
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

export function SectionLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
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
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function BulletItem({ children }: { children: React.ReactNode }) {
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
      <span style={{ position: "absolute", left: 12, top: 12, width: 6, height: 6, borderRadius: "50%", background: "var(--lr-text-muted)" }} />
      {children}
    </div>
  );
}

export function Spinner({ size = 36 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `3px solid var(--lr-border-strong)`,
        borderTopColor: "var(--lr-text)",
        borderRadius: "50%",
        animation: "lrSpin 0.9s linear infinite",
      }}
    >
      <style>{`@keyframes lrSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function TypingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center", padding: "2px 0" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--lr-text-muted)",
            animation: `lrBounce 1.2s ${i * 0.15}s infinite ease-in-out`,
            display: "inline-block", opacity: 0.5,
          }}
        />
      ))}
      <style>{`@keyframes lrBounce { 0%,80%,100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-3px); opacity: 1; } }`}</style>
    </span>
  );
}

/* ---------- Detail content (reusable detail panel) ---------- */
export function ResultDetailContent({
  r,
  G,
  t,
  onAsk,
}: {
  r: LabResult;
  G: (text: string) => JSX.Element | null;
  t: StringsT;
  onAsk: (q: string) => void;
}) {
  const sc = STATUS[r.status] || STATUS.normal;
  return (
    <div>
      <div
        style={{
          background: sc.bg,
          border: "1px solid var(--lr-border)",
          borderRadius: 14,
          padding: "16px 18px",
          marginBottom: 14,
        }}
      >
        <div className="sans" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: sc.text, marginBottom: 8 }}>
          <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: sc.dot, marginRight: 6, verticalAlign: "middle" }} />
          {statusLabel(r.status, t)}
        </div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 600, lineHeight: 1.15, color: "var(--lr-text)", marginBottom: 8 }}>
          {r.name}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 36, fontWeight: 600, color: sc.text, lineHeight: 1 }}>
            {r.value}
          </div>
          {r.referenceRange && (
            <div className="sans" style={{ fontSize: 12.5, color: "var(--lr-text-muted)" }}>
              {t.refRangePrefix} {r.referenceRange}
            </div>
          )}
        </div>
      </div>

      <SectionLabel>{t.detailWhatItMeans}</SectionLabel>
      <div className="sans" style={{ fontSize: 14, lineHeight: 1.6, color: "var(--lr-text-secondary)", marginBottom: 18 }}>
        {G(r.explanation)}
      </div>

      {(r.possibleCauses?.length ?? 0) > 0 && (
        <>
          <SectionLabel>{t.detailCauses}</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
            {r.possibleCauses!.map((c, i) => <BulletItem key={i}>{G(c)}</BulletItem>)}
          </div>
        </>
      )}

      {(r.possibleRemedies?.length ?? 0) > 0 && (
        <>
          <SectionLabel>{t.detailRemedies}</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            {r.possibleRemedies!.map((c, i) => <BulletItem key={i}>{G(c)}</BulletItem>)}
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

/* ---------- Result row ---------- */
export function ResultRow({
  r, onClick, compact, isActive, G, t,
}: {
  r: LabResult;
  onClick: () => void;
  compact?: boolean;
  isActive?: boolean;
  G: (text: string) => JSX.Element | null;
  t: StringsT;
}) {
  const sc = STATUS[r.status] || STATUS.normal;
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        background: isActive ? "var(--lr-surface-alt)" : "var(--lr-surface)",
        border: "1px solid var(--lr-border)",
        borderLeft: `3px solid ${sc.border}`,
        borderRadius: 12,
        padding: compact ? "9px 12px" : "11px 13px",
        cursor: "pointer",
        boxShadow: isActive ? "none" : "var(--lr-shadow)",
        outline: isActive ? "1.5px solid var(--lr-text)" : "none",
        outlineOffset: -1,
        display: "flex",
        alignItems: compact ? "center" : "flex-start",
        justifyContent: "space-between",
        gap: 10,
        width: "100%",
        font: "inherit",
        color: "inherit",
        transition: "background 0.12s",
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
              {statusLabel(r.status, t)}
            </div>
          )}
        </div>
        <ChevronRight />
      </div>
    </button>
  );
}

/* ---------- Question row ---------- */
export function QuestionRow({ text, G, onAsk }: { text: string; G: (text: string) => JSX.Element | null; onAsk: () => void }) {
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
          width: 34, height: 34, borderRadius: 10,
          background: "var(--lr-surface-alt)",
          border: "1px solid var(--lr-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "var(--lr-text)",
        }}
      >
        <ChatBubbleIcon />
      </button>
    </div>
  );
}

/* ---------- Chat thread + composer ---------- */
export function ChatThread({
  messages, chatEndRef, sending, t, G, padding,
}: {
  messages: ChatMsg[];
  chatEndRef: React.RefObject<HTMLDivElement>;
  sending: boolean;
  t: StringsT;
  G: (text: string) => JSX.Element | null;
  padding?: string;
}) {
  return (
    <div style={{ padding: padding || "16px 16px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
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

export function ChatComposer({
  draft, setDraft, onSend, disabled, placeholder,
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
          width: 40, height: 40,
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

/* ---------- Modal & Sheet ---------- */
export function Modal({
  children, onClose, title, confirmLabel,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
  confirmLabel?: string;
}) {
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
          maxWidth: 420,
          boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        }}
      >
        {title && (
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--lr-text)", marginBottom: 10 }}>{title}</div>
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

export function Sheet({
  children, onClose, title, anchor = "bottom", maxWidth,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
  anchor?: "bottom" | "center";
  maxWidth?: number;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 60,
        display: "flex",
        alignItems: anchor === "center" ? "center" : "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--lr-surface)",
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          borderBottomLeftRadius: anchor === "center" ? 18 : 0,
          borderBottomRightRadius: anchor === "center" ? 18 : 0,
          padding: "10px 18px 22px",
          width: "100%",
          maxWidth: maxWidth || (anchor === "center" ? 480 : "none"),
          boxShadow: "0 -8px 30px rgba(0,0,0,0.35)",
        }}
      >
        {anchor === "bottom" && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
            <div style={{ width: 38, height: 4, background: "var(--lr-border-strong)", borderRadius: 2 }} />
          </div>
        )}
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

export function SheetItem({
  label, onClick, icon, last, value,
}: {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
  last?: boolean;
  value?: string;
}) {
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
      <span style={{ flex: 1 }}>{label}</span>
      {value && (
        <span className="sans" style={{ fontSize: 12.5, color: "var(--lr-text-muted)" }}>{value}</span>
      )}
      <span style={{ color: "var(--lr-text-faint)" }}>
        <ChevronRight />
      </span>
    </button>
  );
}

export function SegmentedChoice({
  options, value, onChange,
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
                width: 20, height: 20, borderRadius: "50%",
                border: `1.5px solid ${active ? "var(--lr-text)" : "var(--lr-border-strong)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {active && <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--lr-text)" }} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Analyze sheet body (reusable) ---------- */
export function AnalyzeSheetContent({
  t, analyzing, analyzeErr, onPick, onCancel, onClearError,
}: {
  t: StringsT;
  analyzing: boolean;
  analyzeErr: string | null;
  onPick: () => void;
  onCancel: () => void;
  onClearError: () => void;
}) {
  if (analyzing) {
    return (
      <div style={{ padding: "30px 8px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><Spinner /></div>
        <div style={{ fontWeight: 600, fontSize: 15, color: "var(--lr-text)", marginBottom: 6 }}>{t.analyzing}</div>
        <div className="sans" style={{ fontSize: 12.5, color: "var(--lr-text-muted)" }}>{t.analyzingHint}</div>
      </div>
    );
  }
  if (analyzeErr) {
    return (
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
          <div className="sans" style={{ fontSize: 13, color: "var(--lr-text-secondary)", lineHeight: 1.5 }}>{analyzeErr}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="sans"
            onClick={onClearError}
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
            onClick={onPick}
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
    );
  }
  return (
    <>
      <div className="sans" style={{ fontSize: 13.5, color: "var(--lr-text-secondary)", lineHeight: 1.55, padding: "4px 4px 16px" }}>
        {t.analyzeBody}
      </div>
      <button
        onClick={onPick}
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
        <div style={{ fontWeight: 600, fontSize: 15, color: "var(--lr-text)", marginBottom: 4 }}>{t.analyzeChoose}</div>
        <div className="sans" style={{ fontSize: 12, color: "var(--lr-text-muted)" }}>{t.analyzeFormats}</div>
      </button>
      <button
        className="sans"
        onClick={onPick}
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
  );
}

/* ---------- Brand mark ---------- */
export function BrandMark({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        width: size, height: size,
        background: "var(--lr-btn-bg)",
        borderRadius: Math.round(size * 0.27),
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width={Math.round(size * 0.55)} height={Math.round(size * 0.55)} viewBox="0 0 24 24" fill="none" stroke="var(--lr-btn-text)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
      </svg>
    </div>
  );
}

export function BrandWordmark({ size = 18 }: { size?: number }) {
  return (
    <div style={{ fontSize: size, fontWeight: 600, color: "var(--lr-text)", letterSpacing: "-0.01em" }}>
      Lab<span style={{ fontStyle: "italic", fontWeight: 400, color: "var(--lr-accent)" }}>Lens</span>
    </div>
  );
}

/* ---------- Icons ---------- */
export function ChevronLeft() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>; }
export function ChevronRight() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--lr-text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>; }
export function MenuIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>; }
export function ListIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>; }
export function HelpIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
export function ChatBubbleIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }
export function SendIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>; }
export function UploadIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>; }
export function GlobeIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>; }
export function SunIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>; }
export function MoonIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>; }
export function InfoIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>; }
export function MoreIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>; }
