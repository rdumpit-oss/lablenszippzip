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
    causesLabel: "Possible causes",
    remediesLabel: "Possible remedies",
    remediesNote: "Discuss these with your doctor before acting on them.",
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
    causesLabel: "Mga posibleng dahilan",
    remediesLabel: "Mga posibleng lunas",
    remediesNote: "Talakayin muna ito sa iyong doktor bago gawin.",
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
    if (fileRef.current) fileRef.current.value = "";
  };

  const dateLocale = lang === "fil" ? "fil-PH" : "en-US";

  // ─── Styles ──────────────────────────────────────────────────────────────
  const s = useMemo(() => ({
    app:         { fontFamily:"Georgia,serif", background:c.pageBg, color:c.text, minHeight:"100vh", padding:"0 20px 60px", maxWidth:820, margin:"0 auto", transition:"background 0.25s ease, color 0.25s ease" },
    header:      { padding:"32px 0 24px", display:"flex", alignItems:"flex-end", justifyContent:"space-between", borderBottom:`1px solid ${c.border}`, marginBottom:36, gap:16, flexWrap:"wrap" },
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

    resultsHeader: { display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:22, paddingBottom:16, borderBottom:`1px solid ${c.border}`, gap:12, flexWrap:"wrap" },
    resultsTitle:  { fontSize:21, fontWeight:600, color:c.text },
    resultsSub:    { fontSize:12, color:c.textMuted, marginTop:3, fontFamily:"sans-serif" },
    newBtn:        { background:"transparent", border:`1px solid ${c.borderStrong}`, color:c.textMuted, fontSize:12, padding:"7px 14px", borderRadius:8, cursor:"pointer", fontFamily:"sans-serif", whiteSpace:"nowrap" },

    resultItem: { background:c.surface, border:`1px solid ${c.border}`, borderRadius:13, padding:"16px 18px", boxShadow:c.shadow, marginBottom:10 },
    riHeader:   { display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10, marginBottom:8 },
    riName:     { fontWeight:600, fontSize:14.5, color:c.text },
    riValWrap:  { display:"flex", alignItems:"center", gap:7, flexShrink:0 },
    riRange:    { fontSize:11.5, color:c.textFaint, marginBottom:7, fontFamily:"sans-serif" },
    riExp:      { fontSize:13, color:c.textSecondary, lineHeight:1.65, fontFamily:"sans-serif" },
    riFlag:     { display:"inline-flex", alignItems:"center", fontSize:11, fontWeight:500, padding:"3px 8px", borderRadius:20, marginTop:8, letterSpacing:"0.03em", textTransform:"uppercase", fontFamily:"sans-serif" },

    qSection: { background:c.surface, border:`1px solid ${c.border}`, borderRadius:14, padding:20, marginBottom:18, boxShadow:c.shadow },
    qTitle:   { fontSize:15, fontWeight:600, marginBottom:12, display:"flex", alignItems:"center", gap:7, color:c.text },
    qItem:    { fontSize:13, color:c.textSecondary, padding:"9px 13px", background:c.inputBg, borderRadius:9, lineHeight:1.5, marginBottom:7, border:`1px solid ${c.borderFaint}`, fontFamily:"sans-serif" },

    detailBlock:    { marginTop:12, paddingTop:12, borderTop:`1px solid ${c.borderFaint}` },
    detailLabel:    { fontSize:10.5, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:c.textMuted, marginBottom:7, fontFamily:"sans-serif", display:"flex", alignItems:"center", gap:6 },
    detailItem:     { fontSize:12.5, color:c.textSecondary, lineHeight:1.55, padding:"5px 0 5px 14px", position:"relative", fontFamily:"sans-serif" },
    detailBullet:   { position:"absolute", left:0, top:5, color:c.textMuted },
    remedyNote:     { fontSize:11, color:c.textFaint, fontStyle:"italic", marginTop:6, fontFamily:"sans-serif" },

    disclaimer: { fontSize:11.5, color:c.textFaint, textAlign:"center", lineHeight:1.6, paddingTop:14, marginTop:8, borderTop:`1px solid ${c.borderFaint}`, fontFamily:"sans-serif" },
  }), [c, dragging]);

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

            <div style={{ background:ov.bg, borderLeft:`4px solid ${ov.border}`, borderRadius:14, padding:"18px 22px", marginBottom:24 }}>
              <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:ov.border, marginBottom:4, fontFamily:"sans-serif" }}>
                {results.overallLabel || t.overallAssessment}
              </div>
              <div style={{ fontSize:14, color:c.textSecondary, lineHeight:1.65, fontFamily:"sans-serif" }}>{results.summary}</div>
            </div>

            <div style={{ marginBottom:24 }}>
              {(results.results || []).map((r, i) => {
                const sc = c.statusColors[r.status] || c.statusColors.normal;
                return (
                  <div key={i} style={s.resultItem}>
                    <div style={s.riHeader}>
                      <div style={s.riName}>{r.name}</div>
                      <div style={s.riValWrap}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:sc.dot, flexShrink:0 }} />
                        <div style={{ fontFamily:"Georgia,serif", fontSize:17, fontWeight:600, color:sc.text }}>{r.value}</div>
                      </div>
                    </div>
                    {r.referenceRange && <div style={s.riRange}>{t.referenceRange}: {r.referenceRange}</div>}
                    <div style={s.riExp}>{r.explanation}</div>
                    <div style={{ ...s.riFlag, background:sc.bg, color:sc.text, border:`1px solid ${sc.border}` }}>{statusLabel(r.status)}</div>

                    {r.status !== "normal" && r.possibleCauses?.length > 0 && (
                      <div style={s.detailBlock}>
                        <div style={s.detailLabel}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          {t.causesLabel}
                        </div>
                        {r.possibleCauses.map((cause, j) => (
                          <div key={j} style={s.detailItem}>
                            <span style={s.detailBullet}>•</span>{cause}
                          </div>
                        ))}
                      </div>
                    )}

                    {r.status !== "normal" && r.possibleRemedies?.length > 0 && (
                      <div style={s.detailBlock}>
                        <div style={s.detailLabel}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                          {t.remediesLabel}
                        </div>
                        {r.possibleRemedies.map((remedy, j) => (
                          <div key={j} style={s.detailItem}>
                            <span style={s.detailBullet}>•</span>{remedy}
                          </div>
                        ))}
                        <div style={s.remedyNote}>{t.remediesNote}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {results.questionsToAsk?.length > 0 && (
              <div style={s.qSection}>
                <div style={s.qTitle}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c.iconStroke} strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  {t.questionsTitle}
                </div>
                {results.questionsToAsk.map((q, i) => (
                  <div key={i} style={s.qItem}>→ {q}</div>
                ))}
              </div>
            )}

            {results.followUpQuestions?.length > 0 && (
              <div style={s.qSection}>
                <div style={s.qTitle}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c.iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                  {t.followUpTitle}
                </div>
                {results.followUpQuestions.map((q, i) => (
                  <div key={i} style={s.qItem}>→ {q}</div>
                ))}
              </div>
            )}

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
