import { useState, useRef, useCallback, useEffect, useMemo } from "react";

// ─── i18n ──────────────────────────────────────────────────────────────────
const STRINGS = {
  en: {
    brandSub: "Lab result explainer",
    notAdvice: "Not a substitute for professional medical advice",
    uploadTitle: "Upload your lab results",
    uploadSub: "Photo a printout, screenshot a portal, or snap a picture",
    chooseFile: "Choose file",
    formats: "JPG · PNG · WEBP · HEIC",
    readyToAnalyze: "Ready to analyze",
    optionalContext: "Optional context",
    contextPlaceholder: "e.g. 34F, routine checkup, on metformin...",
    explainBtn: "Explain my results",
    chooseDifferent: "↩ Choose a different file",
    reading: "Reading your lab results…",
    readingSub: "Analyzing each value and what it means for you",
    analysisFailed: "Analysis failed",
    tryAgain: "↩ Try again",
    uploadDifferent: "Upload a different file",
    yourResults: "Your results, explained",
    analyzed: "Analyzed",
    analyzeAnother: "↩ Analyze another",
    overallAssessment: "Overall Assessment",
    referenceRange: "Reference range",
    questionsTitle: "Questions to ask your doctor",
    followUpTitle: "Follow-up questions on abnormal results",
    statResults: (n) => `${n} result${n === 1 ? "" : "s"}`,
    statNormal: "normal",
    statAttention: "needs attention",
    statConcern: "concerning",
    causesLabel: "Possible causes",
    remediesLabel: "Possible remedies",
    remediesNote: "Discuss these with your doctor before acting on them.",
    chatTitle: "Ask LabLens a follow-up",
    chatHint: "Ask anything about your results — what a value means, what to do next, how to prepare to talk to your doctor.",
    chatPlaceholder: "Type your question…",
    chatSend: "Send",
    chatThinking: "Thinking…",
    chatYou: "You",
    chatBot: "LabLens",
    chatErrorPrefix: "Couldn't send: ",
    glossaryHint: "Hover the underlined words for a plain-language definition.",
    disclaimerL1: "LabLens uses AI to translate medical jargon into plain language. It does not diagnose, treat, or replace a licensed medical professional.",
    disclaimerL2: "Always discuss your results with your doctor before making any health decisions.",
    statusLabels: { normal: "Within range", low: "Below range", high: "Above range", critical: "Needs attention" },
    langLabel: "EN",
    themeLight: "Light",
    themeDark: "Dark",
  },
  fil: {
    brandSub: "Tagapagpaliwanag ng resulta ng lab",
    notAdvice: "Hindi kapalit ng propesyonal na payo medikal",
    uploadTitle: "I-upload ang iyong resulta ng lab",
    uploadSub: "Kuhanan ng litrato ang printout, i-screenshot ang portal, o mag-snap",
    chooseFile: "Pumili ng file",
    formats: "JPG · PNG · WEBP · HEIC",
    readyToAnalyze: "Handa nang suriin",
    optionalContext: "Karagdagang impormasyon (opsyonal)",
    contextPlaceholder: "hal. 34F, regular na checkup, umiinom ng metformin...",
    explainBtn: "Ipaliwanag ang resulta ko",
    chooseDifferent: "↩ Pumili ng ibang file",
    reading: "Binabasa ang iyong resulta…",
    readingSub: "Sinusuri ang bawat halaga at ano ang ibig sabihin nito sa iyo",
    analysisFailed: "Hindi nasuri",
    tryAgain: "↩ Subukan muli",
    uploadDifferent: "Mag-upload ng ibang file",
    yourResults: "Ang iyong resulta, ipinaliwanag",
    analyzed: "Sinuri noong",
    analyzeAnother: "↩ Sumuri ng iba",
    overallAssessment: "Pangkalahatang Pagtatasa",
    referenceRange: "Karaniwang saklaw",
    questionsTitle: "Mga itatanong sa doktor mo",
    followUpTitle: "Mga follow-up na tanong sa abnormal na resulta",
    statResults: (n) => `${n} resulta`,
    statNormal: "normal",
    statAttention: "abnormal",
    statConcern: "kritikal",
    causesLabel: "Mga posibleng dahilan",
    remediesLabel: "Mga posibleng lunas",
    remediesNote: "Talakayin muna ito sa iyong doktor bago gawin.",
    chatTitle: "Magtanong sa LabLens",
    chatHint: "Magtanong tungkol sa iyong resulta — kung ano ang ibig sabihin ng halaga, ano ang susunod na gagawin, o paano ihanda ang sarili para sa doktor.",
    chatPlaceholder: "I-type ang iyong tanong…",
    chatSend: "Ipadala",
    chatThinking: "Iniisip…",
    chatYou: "Ikaw",
    chatBot: "LabLens",
    chatErrorPrefix: "Hindi naipadala: ",
    glossaryHint: "I-hover ang mga may guhit na salita para sa simpleng paliwanag.",
    disclaimerL1: "Gumagamit ang LabLens ng AI upang isalin ang medikal na jargon sa simpleng wika. Hindi ito nagdi-diagnose, gumagamot, o kapalit ng lisensyadong propesyonal sa medisina.",
    disclaimerL2: "Palaging talakayin ang iyong resulta sa doktor bago gumawa ng anumang desisyon pangkalusugan.",
    statusLabels: { normal: "Nasa saklaw", low: "Mababa", high: "Mataas", critical: "Kailangan ng pansin" },
    langLabel: "FIL",
    themeLight: "Liwanag",
    themeDark: "Dilim",
  },
};

// ─── Theme palettes ────────────────────────────────────────────────────────
const PALETTES = {
  light: {
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
    dragBg: "#e8f4ef",
    dragBorder: "#2d6a4f",
    spinnerBg: "#efe9e0",
    statusColors: {
      normal:   { dot: "#2d6a4f", text: "#2d6a4f", bg: "#e8f4ef", border: "#a8d5bb" },
      low:      { dot: "#c87941", text: "#c87941", bg: "#fdf0e6", border: "#f0c090" },
      high:     { dot: "#c87941", text: "#c87941", bg: "#fdf0e6", border: "#f0c090" },
      critical: { dot: "#c0392b", text: "#c0392b", bg: "#fdecea", border: "#f5a9a3" },
    },
    overall: {
      normal:    { bg: "#e8f4ef", border: "#2d6a4f" },
      attention: { bg: "#fdf0e6", border: "#c87941" },
      concern:   { bg: "#fdecea", border: "#c0392b" },
    },
    errBox: { bg: "#fdecea", border: "#f5a9a3", title: "#c0392b", text: "#7a3028" },
  },
  dark: {
    pageBg: "#14110e",
    surface: "#1f1c18",
    surfaceAlt: "#2a2620",
    inputBg: "#14110e",
    text: "#f5efe6",
    textSecondary: "#d6cfc4",
    textMuted: "#9a9088",
    textFaint: "#6f655c",
    border: "rgba(245,239,230,0.1)",
    borderStrong: "rgba(245,239,230,0.2)",
    borderFaint: "rgba(245,239,230,0.05)",
    accent: "#7fb68f",
    btnBg: "#f5efe6",
    btnText: "#14110e",
    iconStroke: "#9a9088",
    brandIconBg: "#f5efe6",
    brandIconStroke: "#14110e",
    shadow: "0 1px 3px rgba(0,0,0,0.5)",
    dragBg: "#1d2a23",
    dragBorder: "#7fb68f",
    spinnerBg: "#2a2620",
    statusColors: {
      normal:   { dot: "#7fb68f", text: "#a8d5bb", bg: "#1d2a23", border: "#3a5a47" },
      low:      { dot: "#e0a070", text: "#f0c090", bg: "#2d2218", border: "#5a4028" },
      high:     { dot: "#e0a070", text: "#f0c090", bg: "#2d2218", border: "#5a4028" },
      critical: { dot: "#e07060", text: "#f5a9a3", bg: "#2d1d1a", border: "#5a3028" },
    },
    overall: {
      normal:    { bg: "#1d2a23", border: "#7fb68f" },
      attention: { bg: "#2d2218", border: "#e0a070" },
      concern:   { bg: "#2d1d1a", border: "#e07060" },
    },
    errBox: { bg: "#2d1d1a", border: "#5a3028", title: "#f5a9a3", text: "#e8b8b0" },
  },
};

// ─── Glossary tooltip rendering ────────────────────────────────────────────
function escapeRegex(s) {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

function GlossyText({ text, glossary }) {
  if (!text || typeof text !== "string") return text || null;
  if (!glossary || glossary.length === 0) return text;

  const valid = glossary.filter((g) => g && typeof g.term === "string" && g.term.trim().length > 1);
  if (valid.length === 0) return text;

  const sorted = [...valid].sort((a, b) => b.term.length - a.term.length);
  const pattern = sorted.map((g) => escapeRegex(g.term)).join("|");
  const re = new RegExp(`(${pattern})`, "gi");

  const lookup = new Map(valid.map((g) => [g.term.toLowerCase(), g.definition || ""]));
  const segments = [];
  let last = 0;
  let m;
  re.lastIndex = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) segments.push(text.slice(last, m.index));
    const matched = m[0];
    const def = lookup.get(matched.toLowerCase());
    if (def) {
      segments.push(
        <span className="gloss" key={`${m.index}-${matched}`} tabIndex={0}>
          {matched}
          <span className="gloss-pop">{def}</span>
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

export default function LabLens() {
  const [screen, setScreen]       = useState("upload");
  const [imageData, setImageData] = useState(null);
  const [mediaType, setMediaType] = useState("image/jpeg");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileName, setFileName]   = useState("");
  const [fileSize, setFileSize]   = useState("");
  const [context, setContext]     = useState("");
  const [results, setResults]     = useState(null);
  const [errorMsg, setErrorMsg]   = useState("");
  const [dragging, setDragging]   = useState(false);
  const [lang, setLang]           = useState(() => localStorage.getItem("lablens.lang") || "en");
  const [theme, setTheme]         = useState(() => localStorage.getItem("lablens.theme") || "light");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState("");
  const chatScrollRef = useRef(null);
  const fileRef = useRef();

  const t = STRINGS[lang];
  const c = PALETTES[theme];

  useEffect(() => {
    localStorage.setItem("lablens.lang", lang);
  }, [lang]);
  useEffect(() => {
    localStorage.setItem("lablens.theme", theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const processFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const base64  = dataUrl.split(",")[1];
      let mt = file.type || "image/jpeg";
      if (!["image/jpeg","image/png","image/gif","image/webp"].includes(mt)) mt = "image/jpeg";
      setImageData(base64);
      setMediaType(mt);
      setPreviewUrl(dataUrl);
      setFileName(file.name);
      setFileSize((file.size / 1024).toFixed(1) + " KB");
      setScreen("preview");
    };
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const analyze = async () => {
    if (!imageData) return;
    setScreen("loading");
    setErrorMsg("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData, mediaType, context, language: lang }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error?.message || `API error ${response.status}`);
      }

      setResults(data.content);
      setChatMessages([]);
      setChatError("");
      setScreen("results");
    } catch (err) {
      setErrorMsg(err.message || "Unknown error");
      setScreen("error");
    }
  };

  const reset = () => {
    setScreen("upload");
    setImageData(null);
    setPreviewUrl(null);
    setFileName("");
    setContext("");
    setResults(null);
    setErrorMsg("");
    setChatMessages([]);
    setChatInput("");
    setChatError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || chatSending) return;
    const newHistory = [...chatMessages, { role: "user", content: text }];
    setChatMessages(newHistory);
    setChatInput("");
    setChatError("");
    setChatSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang, labContext: results, messages: newHistory }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error?.message || `Error ${res.status}`);
      setChatMessages([...newHistory, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setChatError(err.message || "Unknown error");
    } finally {
      setChatSending(false);
    }
  };

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, chatSending]);

  const dateLocale = lang === "fil" ? "fil-PH" : "en-US";

  // ─── Styles ──────────────────────────────────────────────────────────────
  const s = useMemo(() => ({
    app:         { fontFamily:"Georgia,serif", background:c.pageBg, color:c.text, minHeight:"100vh", padding:"0 20px 60px", maxWidth: screen === "results" ? 1040 : 820, margin:"0 auto", transition:"background 0.25s ease, color 0.25s ease, max-width 0.25s ease" },
    header:      { padding:"24px 0 18px", display:"flex", alignItems:"flex-end", justifyContent:"space-between", borderBottom:`1px solid ${c.border}`, marginBottom:28, gap:16, flexWrap:"wrap" },
    brandRow:    { display:"flex", alignItems:"center", gap:12 },
    brandIcon:   { width:40, height:40, background:c.brandIconBg, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" },
    brandName:   { fontSize:22, fontWeight:600, letterSpacing:"-0.02em", lineHeight:1, color:c.text },
    brandItalic: { fontStyle:"italic", fontWeight:400, color:c.accent },
    brandSub:    { fontSize:11, color:c.textMuted, letterSpacing:"0.05em", textTransform:"uppercase", marginTop:3, fontFamily:"sans-serif" },
    headerRight: { display:"flex", flexDirection:"column", alignItems:"flex-end", gap:10 },
    toggleRow:   { display:"flex", gap:6 },
    toggleBtn:   (active) => ({
      background: active ? c.btnBg : "transparent",
      color: active ? c.btnText : c.textMuted,
      border: `1px solid ${active ? c.btnBg : c.borderStrong}`,
      fontSize: 11,
      fontWeight: 500,
      padding: "5px 10px",
      borderRadius: 7,
      cursor: "pointer",
      fontFamily: "sans-serif",
      letterSpacing: "0.04em",
      transition: "all 0.15s ease",
    }),
    notAdvice:   { fontSize:11, color:c.textFaint, textAlign:"right", maxWidth:180, lineHeight:1.5, fontFamily:"sans-serif" },

    uploadZone:  { background: dragging ? c.dragBg : c.surface, border:`2px dashed ${dragging ? c.dragBorder : c.border}`, borderRadius:18, padding:"52px 32px", textAlign:"center", cursor:"pointer", transition:"all 0.2s" },
    uploadIcon:  { width:52, height:52, background:c.surfaceAlt, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", border:`1px solid ${c.border}` },
    uploadTitle: { fontSize:19, fontWeight:600, marginBottom:6, color:c.text },
    uploadSub:   { fontSize:13, color:c.textMuted, marginBottom:20, fontFamily:"sans-serif" },
    uploadBtn:   { display:"inline-flex", alignItems:"center", gap:7, background:c.btnBg, color:c.btnText, fontSize:13, fontWeight:500, padding:"9px 20px", borderRadius:9, border:"none", fontFamily:"sans-serif" },
    uploadFmts:  { marginTop:12, fontSize:11, color:c.textFaint, letterSpacing:"0.04em", fontFamily:"sans-serif" },

    previewWrap: { display:"flex", gap:20, flexWrap:"wrap", marginBottom:28 },
    previewCard: { flex:"0 0 220px", background:c.surface, border:`1px solid ${c.border}`, borderRadius:14, overflow:"hidden", boxShadow:c.shadow },
    previewImg:  { width:"100%", height:150, objectFit:"cover", display:"block", borderBottom:`1px solid ${c.borderFaint}` },
    previewMeta: { padding:"10px 12px" },
    previewName: { fontSize:12, fontWeight:500, color:c.textSecondary, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontFamily:"sans-serif" },
    previewSz:   { fontSize:11, color:c.textFaint, fontFamily:"sans-serif" },

    analyzePanel: { flex:1, minWidth:240, background:c.surface, border:`1px solid ${c.border}`, borderRadius:14, padding:22, display:"flex", flexDirection:"column", gap:12, boxShadow:c.shadow },
    analyzeTitle: { fontSize:17, fontWeight:600, color:c.text },
    ctxLabel:     { fontSize:11, fontWeight:500, color:c.textMuted, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:5, fontFamily:"sans-serif", display:"block" },
    ctxInput:     { width:"100%", background:c.inputBg, border:`1px solid ${c.borderStrong}`, borderRadius:9, padding:"9px 13px", fontFamily:"sans-serif", fontSize:13, color:c.text, resize:"none", outline:"none", lineHeight:1.5 },
    analyzeBtn:   { width:"100%", background:c.btnBg, color:c.btnText, fontSize:13.5, fontWeight:500, padding:11, borderRadius:9, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, fontFamily:"sans-serif" },
    changeBtn:    { background:"transparent", border:`1px solid ${c.borderStrong}`, color:c.textMuted, fontSize:12, padding:"7px 13px", borderRadius:8, cursor:"pointer", fontFamily:"sans-serif", textAlign:"center" },

    loadWrap:  { textAlign:"center", padding:"56px 0" },
    spinner:   { width:36, height:36, border:`2px solid ${c.spinnerBg}`, borderTopColor:c.accent, borderRadius:"50%", margin:"0 auto 16px", animation:"spin 0.9s linear infinite" },
    loadTitle: { fontSize:17, fontStyle:"italic", color:c.textSecondary, marginBottom:5 },
    loadSub:   { fontSize:13, color:c.textMuted, fontFamily:"sans-serif" },

    errWrap:  { textAlign:"center", padding:"48px 0" },
    errBox:   { background:c.errBox.bg, border:`1px solid ${c.errBox.border}`, borderRadius:14, padding:"20px 24px", display:"inline-block", maxWidth:480, marginBottom:20 },
    errTitle: { fontSize:15, fontWeight:600, color:c.errBox.title, marginBottom:6 },
    errMsg:   { fontSize:13, color:c.errBox.text, fontFamily:"sans-serif", lineHeight:1.5 },

    resultsHeader: { display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14, gap:12, flexWrap:"wrap" },
    resultsTitle:  { fontSize:20, fontWeight:600, color:c.text },
    resultsSub:    { fontSize:11.5, color:c.textMuted, marginTop:2, fontFamily:"sans-serif" },
    newBtn:        { background:"transparent", border:`1px solid ${c.borderStrong}`, color:c.textMuted, fontSize:12, padding:"6px 13px", borderRadius:8, cursor:"pointer", fontFamily:"sans-serif", whiteSpace:"nowrap" },

    statBar:       { display:"flex", alignItems:"center", gap:8, marginBottom:18, flexWrap:"wrap", fontFamily:"sans-serif" },
    statTotal:     { fontSize:11.5, color:c.textMuted, fontWeight:500, padding:"4px 10px", background:c.surface, border:`1px solid ${c.border}`, borderRadius:14 },
    statPill:      (sc) => ({ display:"inline-flex", alignItems:"center", gap:6, fontSize:11.5, color:sc.text, background:sc.bg, padding:"4px 10px", borderRadius:14, fontWeight:500, border:`1px solid ${sc.border}` }),
    statDot:       (color) => ({ width:6, height:6, borderRadius:"50%", background:color }),
    statGlossHint: { fontSize:11, color:c.textMuted, fontStyle:"italic", marginLeft:"auto", display:"inline-flex", alignItems:"center", gap:5 },

    overallCard:   { background:c.surface, border:`1px solid ${c.border}`, borderLeftWidth:4, borderRadius:12, padding:"14px 18px", marginBottom:14, boxShadow:c.shadow },
    overallLabel:  { fontSize:10.5, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:4, fontFamily:"sans-serif" },
    overallText:   { fontSize:14, color:c.textSecondary, lineHeight:1.55, fontFamily:"sans-serif" },

    resultsGrid:{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(310px, 1fr))", gap:10, marginBottom:14 },
    resultItem: { background:c.surface, border:`1px solid ${c.border}`, borderLeftWidth:3, borderRadius:11, padding:"12px 14px", boxShadow:c.shadow },
    riHeader:   { display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:10, marginBottom:5 },
    riName:     { fontWeight:600, fontSize:13.5, color:c.text, lineHeight:1.3 },
    riValWrap:  { display:"flex", alignItems:"center", gap:6, flexShrink:0 },
    riRange:    { fontSize:11, color:c.textFaint, marginBottom:6, fontFamily:"sans-serif" },
    riExp:      { fontSize:12.5, color:c.textSecondary, lineHeight:1.5, fontFamily:"sans-serif" },

    qSection: { background:c.surface, border:`1px solid ${c.border}`, borderRadius:12, padding:"14px 16px", marginBottom:12, boxShadow:c.shadow },
    qTitle:   { fontSize:13, fontWeight:600, marginBottom:8, display:"flex", alignItems:"center", gap:6, color:c.text, letterSpacing:"-0.01em" },
    qItem:    { fontSize:12.5, color:c.textSecondary, padding:"7px 11px", background:c.inputBg, borderRadius:8, lineHeight:1.45, marginBottom:5, border:`1px solid ${c.borderFaint}`, fontFamily:"sans-serif" },

    questionsGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:12, marginBottom:12 },

    detailGrid:     { display:"grid", gridTemplateColumns:"1fr", gap:10, marginTop:9, paddingTop:9, borderTop:`1px solid ${c.borderFaint}` },
    detailGrid2:    { display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:9, paddingTop:9, borderTop:`1px solid ${c.borderFaint}` },
    detailBlock:    {},
    detailLabel:    { fontSize:9.5, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:c.textMuted, marginBottom:5, fontFamily:"sans-serif", display:"flex", alignItems:"center", gap:5 },
    detailItem:     { fontSize:12, color:c.textSecondary, lineHeight:1.45, padding:"2px 0 2px 11px", position:"relative", fontFamily:"sans-serif" },
    detailBullet:   { position:"absolute", left:0, top:2, color:c.textMuted, fontSize:11 },
    remedyNote:     { fontSize:10.5, color:c.textFaint, fontStyle:"italic", marginTop:5, fontFamily:"sans-serif", gridColumn:"1 / -1" },

    chatHint:    { fontSize:11.5, color:c.textMuted, marginBottom:10, fontFamily:"sans-serif", lineHeight:1.45 },
    chatScroll:  { maxHeight:280, overflowY:"auto", marginBottom:10, paddingRight:4, display:"flex", flexDirection:"column", gap:8 },
    chatBubbleU: { alignSelf:"flex-end", maxWidth:"85%", background:c.btnBg, color:c.btnText, padding:"9px 13px", borderRadius:"14px 14px 4px 14px", fontSize:13, lineHeight:1.5, fontFamily:"sans-serif", whiteSpace:"pre-wrap", wordBreak:"break-word", animation:"fadeIn 0.18s ease" },
    chatBubbleA: { alignSelf:"flex-start", maxWidth:"90%", background:c.inputBg, color:c.textSecondary, padding:"9px 13px", borderRadius:"14px 14px 14px 4px", fontSize:13, lineHeight:1.55, fontFamily:"sans-serif", border:`1px solid ${c.borderFaint}`, whiteSpace:"pre-wrap", wordBreak:"break-word", animation:"fadeIn 0.18s ease" },
    chatRoleTag: { fontSize:10, color:c.textFaint, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:3, fontFamily:"sans-serif" },
    chatThinkBox:{ alignSelf:"flex-start", background:c.inputBg, color:c.textMuted, padding:"9px 13px", borderRadius:"14px 14px 14px 4px", fontSize:13, fontFamily:"sans-serif", border:`1px solid ${c.borderFaint}`, fontStyle:"italic" },
    chatInputRow:{ display:"flex", gap:8 },
    chatInput:   { flex:1, background:c.inputBg, border:`1px solid ${c.borderStrong}`, borderRadius:9, padding:"10px 13px", fontFamily:"sans-serif", fontSize:13, color:c.text, resize:"none", outline:"none", lineHeight:1.5, minHeight:42 },
    chatSendBtn: { background:c.btnBg, color:c.btnText, border:"none", borderRadius:9, padding:"0 18px", fontFamily:"sans-serif", fontSize:13, fontWeight:500, cursor:"pointer", display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" },
    chatSendBtnDisabled: { opacity:0.5, cursor:"not-allowed" },
    chatErr:     { fontSize:12, color:c.errBox.title, marginTop:8, fontFamily:"sans-serif" },

    disclaimer: { fontSize:11, color:c.textFaint, textAlign:"center", lineHeight:1.55, paddingTop:12, marginTop:6, borderTop:`1px solid ${c.borderFaint}`, fontFamily:"sans-serif" },
  }), [c, dragging, screen]);

  const glossary = results?.glossary || [];
  const G = (text) => <GlossyText text={text} glossary={glossary} />;

  const statusLabel = (status) => t.statusLabels[status] || t.statusLabels.normal;

  return (
    <div style={s.app}>
      {/* ── Header ── */}
      <header style={s.header}>
        <div style={s.brandRow}>
          <div style={s.brandIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c.brandIconStroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
            </svg>
          </div>
          <div>
            <div style={s.brandName}>Lab<span style={s.brandItalic}>Lens</span></div>
            <div style={s.brandSub}>{t.brandSub}</div>
          </div>
        </div>
        <div style={s.headerRight}>
          <div style={s.toggleRow}>
            <button style={s.toggleBtn(lang === "en")}  onClick={() => setLang("en")}>EN</button>
            <button style={s.toggleBtn(lang === "fil")} onClick={() => setLang("fil")}>FIL</button>
            <span style={{ width:8 }} />
            <button style={s.toggleBtn(theme === "light")} onClick={() => setTheme("light")} aria-label="Light mode">☀</button>
            <button style={s.toggleBtn(theme === "dark")}  onClick={() => setTheme("dark")}  aria-label="Dark mode">☾</button>
          </div>
          <div style={s.notAdvice}>{t.notAdvice}</div>
        </div>
      </header>

      {/* ── Upload ── */}
      {screen === "upload" && (
        <div
          style={s.uploadZone}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={(e) => processFile(e.target.files[0])} />
          <div style={s.uploadIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c.iconStroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div style={s.uploadTitle}>{t.uploadTitle}</div>
          <div style={s.uploadSub}>{t.uploadSub}</div>
          <div style={s.uploadBtn}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {t.chooseFile}
          </div>
          <div style={s.uploadFmts}>{t.formats}</div>
        </div>
      )}

      {/* ── Preview ── */}
      {screen === "preview" && (
        <div style={s.previewWrap}>
          <div style={s.previewCard}>
            <img src={previewUrl} alt="Preview" style={s.previewImg} />
            <div style={s.previewMeta}>
              <div style={s.previewName}>{fileName}</div>
              <div style={s.previewSz}>{fileSize}</div>
            </div>
          </div>
          <div style={s.analyzePanel}>
            <div style={s.analyzeTitle}>{t.readyToAnalyze}</div>
            <div>
              <label style={s.ctxLabel}>{t.optionalContext}</label>
              <textarea
                style={s.ctxInput}
                rows={3}
                placeholder={t.contextPlaceholder}
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>
            <button style={s.analyzeBtn} onClick={analyze}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              {t.explainBtn}
            </button>
            <button style={s.changeBtn} onClick={reset}>{t.chooseDifferent}</button>
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {screen === "loading" && (
        <div style={s.loadWrap}>
          <div style={s.spinner} />
          <div style={s.loadTitle}>{t.reading}</div>
          <div style={s.loadSub}>{t.readingSub}</div>
        </div>
      )}

      {/* ── Error ── */}
      {screen === "error" && (
        <div style={s.errWrap}>
          <div style={s.errBox}>
            <div style={s.errTitle}>{t.analysisFailed}</div>
            <div style={s.errMsg}>{errorMsg}</div>
          </div>
          <br />
          <button style={{ ...s.analyzeBtn, maxWidth:260, margin:"0 auto" }} onClick={() => setScreen("preview")}>
            {t.tryAgain}
          </button>
          <br /><br />
          <button style={s.changeBtn} onClick={reset}>{t.uploadDifferent}</button>
        </div>
      )}

      {/* ── Results ── */}
      {screen === "results" && results && (() => {
        const ov = c.overall[results.overallStatus] || c.overall.normal;
        const allResults = results.results || [];
        const counts = allResults.reduce((acc, r) => {
          if (r.status === "normal") acc.normal++;
          else if (r.status === "critical") acc.critical++;
          else acc.attention++;
          return acc;
        }, { normal:0, attention:0, critical:0 });
        return (
          <>
            <div style={s.resultsHeader}>
              <div>
                <div style={s.resultsTitle}>{t.yourResults}</div>
                <div style={s.resultsSub}>
                  {t.analyzed} {new Date().toLocaleDateString(dateLocale, { month:"long", day:"numeric", year:"numeric" })}
                </div>
              </div>
              <button style={s.newBtn} onClick={reset}>{t.analyzeAnother}</button>
            </div>

            <div style={{ ...s.overallCard, borderLeftColor:ov.border, background:ov.bg }}>
              <div style={{ ...s.overallLabel, color:ov.border }}>
                {results.overallLabel || t.overallAssessment}
              </div>
              <div style={s.overallText}>{G(results.summary)}</div>
            </div>

            {allResults.length > 0 && (
              <div style={s.statBar}>
                <span style={s.statTotal}>{t.statResults(allResults.length)}</span>
                {counts.normal > 0 && (
                  <span style={s.statPill(c.statusColors.normal)}>
                    <span style={s.statDot(c.statusColors.normal.dot)} />
                    {counts.normal} {t.statNormal}
                  </span>
                )}
                {counts.attention > 0 && (
                  <span style={s.statPill(c.statusColors.high)}>
                    <span style={s.statDot(c.statusColors.high.dot)} />
                    {counts.attention} {t.statAttention}
                  </span>
                )}
                {counts.critical > 0 && (
                  <span style={s.statPill(c.statusColors.critical)}>
                    <span style={s.statDot(c.statusColors.critical.dot)} />
                    {counts.critical} {t.statConcern}
                  </span>
                )}
                {glossary.length > 0 && (
                  <span style={s.statGlossHint}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    {t.glossaryHint}
                  </span>
                )}
              </div>
            )}

            <div style={s.resultsGrid}>
              {allResults.map((r, i) => {
                const sc = c.statusColors[r.status] || c.statusColors.normal;
                const showDetails = r.status !== "normal" && (r.possibleCauses?.length > 0 || r.possibleRemedies?.length > 0);
                const bothColumns = r.possibleCauses?.length > 0 && r.possibleRemedies?.length > 0;
                return (
                  <div key={i} style={{ ...s.resultItem, borderLeftColor:sc.border }}>
                    <div style={s.riHeader}>
                      <div style={s.riName}>{G(r.name)}</div>
                      <div style={s.riValWrap}>
                        <div style={s.statDot(sc.dot)} />
                        <div style={{ fontFamily:"Georgia,serif", fontSize:15, fontWeight:600, color:sc.text }}>{r.value}</div>
                      </div>
                    </div>
                    {r.referenceRange && <div style={s.riRange}>{t.referenceRange}: {r.referenceRange}</div>}
                    <div style={s.riExp}>{G(r.explanation)}</div>

                    {showDetails && (
                      <div style={bothColumns ? s.detailGrid2 : s.detailGrid}>
                        {r.possibleCauses?.length > 0 && (
                          <div style={s.detailBlock}>
                            <div style={s.detailLabel}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                              </svg>
                              {t.causesLabel}
                            </div>
                            {r.possibleCauses.map((cause, j) => (
                              <div key={j} style={s.detailItem}>
                                <span style={s.detailBullet}>•</span>{G(cause)}
                              </div>
                            ))}
                          </div>
                        )}
                        {r.possibleRemedies?.length > 0 && (
                          <div style={s.detailBlock}>
                            <div style={s.detailLabel}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                              </svg>
                              {t.remediesLabel}
                            </div>
                            {r.possibleRemedies.map((remedy, j) => (
                              <div key={j} style={s.detailItem}>
                                <span style={s.detailBullet}>•</span>{G(remedy)}
                              </div>
                            ))}
                          </div>
                        )}
                        {r.possibleRemedies?.length > 0 && (
                          <div style={s.remedyNote}>{t.remediesNote}</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {(results.questionsToAsk?.length > 0 || results.followUpQuestions?.length > 0) && (
              <div style={s.questionsGrid}>
                {results.questionsToAsk?.length > 0 && (
                  <div style={{ ...s.qSection, marginBottom:0 }}>
                    <div style={s.qTitle}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c.iconStroke} strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      {t.questionsTitle}
                    </div>
                    {results.questionsToAsk.map((q, i) => (
                      <div key={i} style={s.qItem}>→ {G(q)}</div>
                    ))}
                  </div>
                )}

                {results.followUpQuestions?.length > 0 && (
                  <div style={{ ...s.qSection, marginBottom:0 }}>
                    <div style={s.qTitle}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c.iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                      </svg>
                      {t.followUpTitle}
                    </div>
                    {results.followUpQuestions.map((q, i) => (
                      <div key={i} style={s.qItem}>→ {G(q)}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Chat ── */}
            <div style={s.qSection}>
              <div style={s.qTitle}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c.iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                {t.chatTitle}
              </div>
              <div style={s.chatHint}>{t.chatHint}</div>

              {chatMessages.length > 0 && (
                <div ref={chatScrollRef} style={s.chatScroll}>
                  {chatMessages.map((m, i) => (
                    <div key={i} style={{ display:"flex", flexDirection:"column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                      <div style={s.chatRoleTag}>{m.role === "user" ? t.chatYou : t.chatBot}</div>
                      <div style={m.role === "user" ? s.chatBubbleU : s.chatBubbleA}>
                        {m.role === "user" ? m.content : G(m.content)}
                      </div>
                    </div>
                  ))}
                  {chatSending && (
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start" }}>
                      <div style={s.chatRoleTag}>{t.chatBot}</div>
                      <div style={s.chatThinkBox}>{t.chatThinking}</div>
                    </div>
                  )}
                </div>
              )}

              <div style={s.chatInputRow}>
                <textarea
                  style={s.chatInput}
                  rows={1}
                  placeholder={t.chatPlaceholder}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendChat();
                    }
                  }}
                  disabled={chatSending}
                />
                <button
                  style={{ ...s.chatSendBtn, ...(chatSending || !chatInput.trim() ? s.chatSendBtnDisabled : {}) }}
                  onClick={sendChat}
                  disabled={chatSending || !chatInput.trim()}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  {t.chatSend}
                </button>
              </div>
              {chatError && <div style={s.chatErr}>{t.chatErrorPrefix}{chatError}</div>}
            </div>

            <div style={s.disclaimer}>
              {t.disclaimerL1}<br />
              {t.disclaimerL2}
            </div>
          </>
        );
      })()}
    </div>
  );
}
