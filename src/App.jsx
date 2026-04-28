import { useState, useRef, useCallback } from "react";

const SYSTEM_PROMPT = `You are LabLens, an expert medical lab result interpreter. Your job is to translate lab results into plain language that a non-medical person can understand.

Analyze the lab result image and respond ONLY with a valid JSON object in this exact format:

{
  "overallStatus": "normal" | "attention" | "concern",
  "overallLabel": "Short status label",
  "summary": "2-3 sentence plain-language overall summary",
  "results": [
    {
      "name": "Test name",
      "value": "Value with unit",
      "referenceRange": "Reference range or null",
      "status": "normal" | "low" | "high" | "critical",
      "explanation": "Plain-language explanation under 40 words"
    }
  ],
  "questionsToAsk": ["Question 1", "Question 2", "Question 3"]
}

Rules:
- Extract every individual test result visible in the image
- Keep explanations simple, no jargon
- If value is flagged H or L, reflect that in status
- If not a lab result, set results to [] and explain in summary
- Return ONLY JSON, no markdown, no backticks
- Keep each explanation under 40 words
- questionsToAsk: maximum 3 items`;

const STATUS_COLORS = {
  normal:   { dot: "#2d6a4f", text: "#2d6a4f", bg: "#e8f4ef", border: "#a8d5bb", label: "Within range" },
  low:      { dot: "#c87941", text: "#c87941", bg: "#fdf0e6", border: "#f0c090", label: "Below range" },
  high:     { dot: "#c87941", text: "#c87941", bg: "#fdf0e6", border: "#f0c090", label: "Above range" },
  critical: { dot: "#c0392b", text: "#c0392b", bg: "#fdecea", border: "#f5a9a3", label: "Needs attention" },
};

const OVERALL = {
  normal:    { bg: "#e8f4ef", border: "#2d6a4f" },
  attention: { bg: "#fdf0e6", border: "#c87941" },
  concern:   { bg: "#fdecea", border: "#c0392b" },
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
  const fileRef = useRef();

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
      // Calls our serverless function — key never exposed to browser
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: imageData } },
              { type: "text", text: context
                  ? `Analyze this lab result. Patient context: ${context}`
                  : "Analyze this lab result." }
            ]
          }]
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `API error ${response.status}`);
      }

      const data = await response.json();
      const rawText = (data.content?.[0]?.text || "")
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/```\s*$/, "");

      const match = rawText.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Claude did not return structured data. Please try again.");

      let parsed;
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        // Try auto-closing common truncations
        const fixes = ["]}",'"]}','"]}}',"]}}}",'"]}}}}"'];
        let fixed = false;
        for (const suffix of fixes) {
          try { parsed = JSON.parse(match[0] + suffix); fixed = true; break; } catch {}
        }
        if (!fixed) throw new Error("Response was cut off. Please try again.");
      }

      setResults(parsed);
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

  // ─── Styles ────────────────────────────────────────────────────────────────
  const s = {
    app:         { fontFamily:"Georgia,serif", background:"#f7f3ee", minHeight:"100vh", padding:"0 20px 60px", maxWidth:820, margin:"0 auto" },
    header:      { padding:"32px 0 24px", display:"flex", alignItems:"flex-end", justifyContent:"space-between", borderBottom:"1px solid rgba(26,22,18,0.1)", marginBottom:36 },
    brandRow:    { display:"flex", alignItems:"center", gap:12 },
    brandIcon:   { width:40, height:40, background:"#1a1612", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" },
    brandName:   { fontSize:22, fontWeight:600, letterSpacing:"-0.02em", lineHeight:1 },
    brandItalic: { fontStyle:"italic", fontWeight:400, color:"#2d6a4f" },
    brandSub:    { fontSize:11, color:"#7a7068", letterSpacing:"0.05em", textTransform:"uppercase", marginTop:3, fontFamily:"sans-serif" },
    notAdvice:   { fontSize:11, color:"#b0a89e", textAlign:"right", maxWidth:160, lineHeight:1.5, fontFamily:"sans-serif" },

    uploadZone:  { background: dragging ? "#e8f4ef" : "#faf8f5", border:`2px dashed ${dragging ? "#2d6a4f" : "rgba(26,22,18,0.12)"}`, borderRadius:18, padding:"52px 32px", textAlign:"center", cursor:"pointer", transition:"all 0.2s" },
    uploadIcon:  { width:52, height:52, background:"#efe9e0", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", border:"1px solid rgba(26,22,18,0.1)" },
    uploadTitle: { fontSize:19, fontWeight:600, marginBottom:6, color:"#1a1612" },
    uploadSub:   { fontSize:13, color:"#7a7068", marginBottom:20, fontFamily:"sans-serif" },
    uploadBtn:   { display:"inline-flex", alignItems:"center", gap:7, background:"#1a1612", color:"#f7f3ee", fontSize:13, fontWeight:500, padding:"9px 20px", borderRadius:9, border:"none", fontFamily:"sans-serif" },
    uploadFmts:  { marginTop:12, fontSize:11, color:"#b0a89e", letterSpacing:"0.04em", fontFamily:"sans-serif" },

    previewWrap: { display:"flex", gap:20, flexWrap:"wrap", marginBottom:28 },
    previewCard: { flex:"0 0 220px", background:"#faf8f5", border:"1px solid rgba(26,22,18,0.1)", borderRadius:14, overflow:"hidden", boxShadow:"0 1px 3px rgba(26,22,18,0.08)" },
    previewImg:  { width:"100%", height:150, objectFit:"cover", display:"block", borderBottom:"1px solid rgba(26,22,18,0.06)" },
    previewMeta: { padding:"10px 12px" },
    previewName: { fontSize:12, fontWeight:500, color:"#3d3630", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontFamily:"sans-serif" },
    previewSz:   { fontSize:11, color:"#b0a89e", fontFamily:"sans-serif" },

    analyzePanel: { flex:1, minWidth:240, background:"#faf8f5", border:"1px solid rgba(26,22,18,0.1)", borderRadius:14, padding:22, display:"flex", flexDirection:"column", gap:12, boxShadow:"0 1px 3px rgba(26,22,18,0.08)" },
    analyzeTitle: { fontSize:17, fontWeight:600, color:"#1a1612" },
    ctxLabel:     { fontSize:11, fontWeight:500, color:"#7a7068", letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:5, fontFamily:"sans-serif", display:"block" },
    ctxInput:     { width:"100%", background:"#f7f3ee", border:"1px solid rgba(26,22,18,0.12)", borderRadius:9, padding:"9px 13px", fontFamily:"sans-serif", fontSize:13, color:"#1a1612", resize:"none", outline:"none", lineHeight:1.5 },
    analyzeBtn:   { width:"100%", background:"#1a1612", color:"#f7f3ee", fontSize:13.5, fontWeight:500, padding:11, borderRadius:9, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, fontFamily:"sans-serif" },
    changeBtn:    { background:"transparent", border:"1px solid rgba(26,22,18,0.15)", color:"#7a7068", fontSize:12, padding:"7px 13px", borderRadius:8, cursor:"pointer", fontFamily:"sans-serif", textAlign:"center" },

    loadWrap:  { textAlign:"center", padding:"56px 0" },
    spinner:   { width:36, height:36, border:"2px solid #efe9e0", borderTopColor:"#2d6a4f", borderRadius:"50%", margin:"0 auto 16px", animation:"spin 0.9s linear infinite" },
    loadTitle: { fontSize:17, fontStyle:"italic", color:"#3d3630", marginBottom:5 },
    loadSub:   { fontSize:13, color:"#7a7068", fontFamily:"sans-serif" },

    errWrap:  { textAlign:"center", padding:"48px 0" },
    errBox:   { background:"#fdecea", border:"1px solid #f5a9a3", borderRadius:14, padding:"20px 24px", display:"inline-block", maxWidth:480, marginBottom:20 },
    errTitle: { fontSize:15, fontWeight:600, color:"#c0392b", marginBottom:6 },
    errMsg:   { fontSize:13, color:"#7a3028", fontFamily:"sans-serif", lineHeight:1.5 },

    resultsHeader: { display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:22, paddingBottom:16, borderBottom:"1px solid rgba(26,22,18,0.1)" },
    resultsTitle:  { fontSize:21, fontWeight:600 },
    resultsSub:    { fontSize:12, color:"#7a7068", marginTop:3, fontFamily:"sans-serif" },
    newBtn:        { background:"transparent", border:"1px solid rgba(26,22,18,0.15)", color:"#7a7068", fontSize:12, padding:"7px 14px", borderRadius:8, cursor:"pointer", fontFamily:"sans-serif", whiteSpace:"nowrap" },

    resultItem: { background:"#faf8f5", border:"1px solid rgba(26,22,18,0.1)", borderRadius:13, padding:"16px 18px", boxShadow:"0 1px 3px rgba(26,22,18,0.06)", marginBottom:10 },
    riHeader:   { display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10, marginBottom:8 },
    riName:     { fontWeight:600, fontSize:14.5, color:"#1a1612" },
    riValWrap:  { display:"flex", alignItems:"center", gap:7, flexShrink:0 },
    riRange:    { fontSize:11.5, color:"#b0a89e", marginBottom:7, fontFamily:"sans-serif" },
    riExp:      { fontSize:13, color:"#3d3630", lineHeight:1.65, fontFamily:"sans-serif" },
    riFlag:     { display:"inline-flex", alignItems:"center", fontSize:11, fontWeight:500, padding:"3px 8px", borderRadius:20, marginTop:8, letterSpacing:"0.03em", textTransform:"uppercase", fontFamily:"sans-serif" },

    qSection: { background:"#faf8f5", border:"1px solid rgba(26,22,18,0.1)", borderRadius:14, padding:20, marginBottom:22, boxShadow:"0 1px 3px rgba(26,22,18,0.06)" },
    qTitle:   { fontSize:15, fontWeight:600, marginBottom:12, display:"flex", alignItems:"center", gap:7 },
    qItem:    { fontSize:13, color:"#3d3630", padding:"9px 13px", background:"#f7f3ee", borderRadius:9, lineHeight:1.5, marginBottom:7, border:"1px solid rgba(26,22,18,0.06)", fontFamily:"sans-serif" },

    disclaimer: { fontSize:11.5, color:"#b0a89e", textAlign:"center", lineHeight:1.6, paddingTop:14, borderTop:"1px solid rgba(26,22,18,0.07)", fontFamily:"sans-serif" },
  };

  return (
    <div style={s.app}>
      {/* ── Header ── */}
      <header style={s.header}>
        <div style={s.brandRow}>
          <div style={s.brandIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
            </svg>
          </div>
          <div>
            <div style={s.brandName}>Lab<span style={s.brandItalic}>Lens</span></div>
            <div style={s.brandSub}>Lab result explainer</div>
          </div>
        </div>
        <div style={s.notAdvice}>Not a substitute for professional medical advice</div>
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7a7068" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div style={s.uploadTitle}>Upload your lab results</div>
          <div style={s.uploadSub}>Photo a printout, screenshot a portal, or snap a picture</div>
          <div style={s.uploadBtn}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Choose file
          </div>
          <div style={s.uploadFmts}>JPG · PNG · WEBP · HEIC</div>
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
            <div style={s.analyzeTitle}>Ready to analyze</div>
            <div>
              <label style={s.ctxLabel}>Optional context</label>
              <textarea
                style={s.ctxInput}
                rows={3}
                placeholder="e.g. 34F, routine checkup, on metformin..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>
            <button style={s.analyzeBtn} onClick={analyze}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              Explain my results
            </button>
            <button style={s.changeBtn} onClick={reset}>↩ Choose a different file</button>
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {screen === "loading" && (
        <div style={s.loadWrap}>
          <div style={s.spinner} />
          <div style={s.loadTitle}>Reading your lab results…</div>
          <div style={s.loadSub}>Claude is analyzing each value and what it means for you</div>
        </div>
      )}

      {/* ── Error ── */}
      {screen === "error" && (
        <div style={s.errWrap}>
          <div style={s.errBox}>
            <div style={s.errTitle}>Analysis failed</div>
            <div style={s.errMsg}>{errorMsg}</div>
          </div>
          <br />
          <button style={{ ...s.analyzeBtn, maxWidth:260, margin:"0 auto" }} onClick={() => setScreen("preview")}>
            ↩ Try again
          </button>
          <br /><br />
          <button style={s.changeBtn} onClick={reset}>Upload a different file</button>
        </div>
      )}

      {/* ── Results ── */}
      {screen === "results" && results && (() => {
        const ov = OVERALL[results.overallStatus] || OVERALL.normal;
        return (
          <>
            <div style={s.resultsHeader}>
              <div>
                <div style={s.resultsTitle}>Your results, explained</div>
                <div style={s.resultsSub}>
                  Analyzed {new Date().toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" })}
                </div>
              </div>
              <button style={s.newBtn} onClick={reset}>↩ Analyze another</button>
            </div>

            <div style={{ background:ov.bg, borderLeft:`4px solid ${ov.border}`, borderRadius:14, padding:"18px 22px", marginBottom:24 }}>
              <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:ov.border, marginBottom:4, fontFamily:"sans-serif" }}>
                {results.overallLabel || "Overall Assessment"}
              </div>
              <div style={{ fontSize:14, color:"#3d3630", lineHeight:1.65, fontFamily:"sans-serif" }}>{results.summary}</div>
            </div>

            <div style={{ marginBottom:24 }}>
              {(results.results || []).map((r, i) => {
                const sc = STATUS_COLORS[r.status] || STATUS_COLORS.normal;
                return (
                  <div key={i} style={s.resultItem}>
                    <div style={s.riHeader}>
                      <div style={s.riName}>{r.name}</div>
                      <div style={s.riValWrap}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:sc.dot, flexShrink:0 }} />
                        <div style={{ fontFamily:"Georgia,serif", fontSize:17, fontWeight:600, color:sc.text }}>{r.value}</div>
                      </div>
                    </div>
                    {r.referenceRange && <div style={s.riRange}>Reference range: {r.referenceRange}</div>}
                    <div style={s.riExp}>{r.explanation}</div>
                    <div style={{ ...s.riFlag, background:sc.bg, color:sc.text, border:`1px solid ${sc.border}` }}>{sc.label}</div>
                  </div>
                );
              })}
            </div>

            {results.questionsToAsk?.length > 0 && (
              <div style={s.qSection}>
                <div style={s.qTitle}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7a7068" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  Questions to ask your doctor
                </div>
                {results.questionsToAsk.map((q, i) => (
                  <div key={i} style={s.qItem}>→ {q}</div>
                ))}
              </div>
            )}

            <div style={s.disclaimer}>
              LabLens uses AI to translate medical jargon into plain language. It does not diagnose, treat, or replace a licensed medical professional.<br />
              Always discuss your results with your doctor before making any health decisions.
            </div>
          </>
        );
      })()}
    </div>
  );
}
