import { useState, useRef } from "react";
import "../../artifacts/mockup-sandbox/src/components/mockups/lab-results/_group.css";
import {
  BrandMark, BrandWordmark,
  GlobeIcon, MoonIcon, SunIcon, UploadIcon,
  ChatBubbleIcon, HelpIcon, ListIcon,
  Spinner,
  fileToBase64, fmtDate,
} from "../../artifacts/mockup-sandbox/src/components/mockups/lab-results/_shared";

const COPY = {
  en: {
    eyebrow: "A LabLens essential · Lab result explainer",
    headline: ["Your lab results,", "in plain language."],
    sub: "Snap a photo of your printout, screenshot a portal, or pick an image. We'll translate the medical jargon into something you can act on — what each value means, what's worth asking your doctor, and what to keep an eye on.",
    ctaAnalyze: "Analyze a lab result",
    ctaSample: "Browse a sample report",
    formats: "JPG · PNG · WEBP · HEIC · up to 8 MB",
    analyzing: "Reading your lab result…",
    analyzingHint: "This usually takes 5–15 seconds.",
    errorTitle: "Couldn't analyze that image",
    tryAgain: "Try a different image",
    feat1Title: "Plain-language explanations",
    feat1Body: "Every result rewritten without the jargon, with reference ranges in context.",
    feat2Title: "Tap any term, see the meaning",
    feat2Body: "Underlined medical words come with a one-tap definition you can actually understand.",
    feat3Title: "Ask LabLens anything",
    feat3Body: "A built-in chat that knows your specific results and helps you prep for your doctor.",
    disclaimer: "Not a substitute for professional medical advice. Always discuss your results with your doctor.",
    privacy: "Images are sent to Google Gemini for analysis and are not stored on our servers.",
  },
  fil: {
    eyebrow: "Isang LabLens essential · Tagapagpaliwanag ng lab",
    headline: ["Ang resulta ng iyong lab,", "sa simpleng wika."],
    sub: "Kuhanan ng litrato ang printout, i-screenshot ang portal, o pumili ng imahe. Isasalin namin ang medical jargon sa isang bagay na maaari mong gawan ng aksyon — ano ang ibig sabihin ng bawat halaga, ano ang dapat itanong sa doktor, at ano ang dapat bantayan.",
    ctaAnalyze: "Suriin ang resulta ng lab",
    ctaSample: "Tingnan ang sample na resulta",
    formats: "JPG · PNG · WEBP · HEIC · hanggang 8 MB",
    analyzing: "Binabasa ang iyong resulta…",
    analyzingHint: "Karaniwang tumatagal ito ng 5–15 segundo.",
    errorTitle: "Hindi nasuri ang larawan",
    tryAgain: "Subukan ang ibang larawan",
    feat1Title: "Simpleng paliwanag",
    feat1Body: "Bawat resulta ay isinusulat muli nang walang jargon, kasama ang reference range.",
    feat2Title: "I-tap ang termino, makikita ang ibig sabihin",
    feat2Body: "May guhit ang mga medikal na salita — i-tap para sa simpleng paliwanag.",
    feat3Title: "Magtanong sa LabLens",
    feat3Body: "May built-in na chat na alam ang iyong resulta at tutulong para sa pakikipag-usap sa doktor.",
    disclaimer: "Hindi kapalit ng propesyonal na payong medikal. Palaging talakayin ang resulta sa iyong doktor.",
    privacy: "Ipinapadala ang mga imahe sa Google Gemini para sa pagsusuri at hindi ini-store sa aming server.",
  },
};

export default function HomeScreen({
  theme,
  lang,
  onTheme,
  onLang,
  onAnalyzed,
  onUseSample,
}) {
  const t = COPY[lang] || COPY.en;
  const fileRef = useRef(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [err, setErr] = useState(null);

  function pickFile() {
    setErr(null);
    fileRef.current?.click();
  }

  async function onFilePicked(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      setErr("Please choose an image file (JPG, PNG, WEBP, HEIC).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErr("Image is too large. Please choose one under 8 MB.");
      return;
    }
    setAnalyzing(true);
    setErr(null);
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
      const newData = {
        overallStatus: c.overallStatus || "attention",
        overallLabel: c.overallLabel || "",
        summary: c.summary || "",
        results: c.results,
        questionsToAsk: c.questionsToAsk || [],
        followUpQuestions: c.followUpQuestions || [],
        glossary: c.glossary || [],
        analyzedDate: fmtDate(lang),
      };
      onAnalyzed?.(newData);
    } catch (e2) {
      setErr(e2?.message || "Couldn't analyze that image.");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div
      className="lab-results-root home-root"
      data-theme={theme}
      style={{
        width: "100%",
        height: "100dvh",
        background: "var(--lr-page-bg)",
        color: "var(--lr-text)",
        position: "relative",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*"
        onChange={onFilePicked}
        style={{ display: "none" }}
      />

      {/* Background image */}
      <div
        aria-hidden
        className={`home-hero-bg ${theme === "dark" ? "home-hero-bg--dark" : ""}`}
      />

      {/* Decorative glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(60% 50% at 50% 0%, var(--lr-overall-attn-bg) 0%, transparent 70%), radial-gradient(40% 35% at 100% 100%, var(--lr-overall-normal-bg) 0%, transparent 60%)",
          opacity: 0.85,
        }}
      />

      {/* Top bar */}
      <header
        style={{
          position: "relative",
          padding: "20px clamp(20px, 5vw, 56px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <BrandMark size={32} />
          <BrandWordmark size={20} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IconButton
            title="Toggle theme"
            onClick={() => onTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <SunIcon /> : <MoonIcon />}
          </IconButton>
          <IconButton
            title="Switch language"
            onClick={() => onLang(lang === "en" ? "fil" : "en")}
            label={lang.toUpperCase()}
          >
            <GlobeIcon />
          </IconButton>
        </div>
      </header>

      {/* Hero */}
      <main
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px clamp(20px, 5vw, 56px) 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 760, width: "100%", animation: "homeRise 0.5s ease both" }}>
          <div
            className="sans"
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--lr-text-muted)",
              marginBottom: 22,
            }}
          >
            {t.eyebrow}
          </div>

          <h1
            style={{
              fontFamily: "Playfair Display, Georgia, serif",
              fontWeight: 500,
              fontSize: "clamp(34px, 6vw, 64px)",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              color: "var(--lr-text)",
              margin: 0,
            }}
          >
            <span>{t.headline[0]}</span>
            <br />
            <span style={{ fontStyle: "italic", color: "var(--lr-text-secondary)" }}>{t.headline[1]}</span>
          </h1>

          <p
            className="sans"
            style={{
              fontSize: "clamp(15px, 1.5vw, 17px)",
              lineHeight: 1.65,
              color: "var(--lr-text-secondary)",
              maxWidth: 600,
              margin: "22px auto 0",
              fontWeight: 400,
            }}
          >
            {t.sub}
          </p>

          {/* CTA group */}
          <div style={{ marginTop: 36, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            {analyzing ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 14,
                  padding: "20px 24px",
                  background: "var(--lr-input-bg)",
                  border: "1px solid var(--lr-border)",
                  borderRadius: 14,
                  width: "100%",
                  maxWidth: 420,
                }}
              >
                <Spinner size={28} />
                <div className="sans" style={{ fontSize: 15, fontWeight: 600, color: "var(--lr-text)" }}>
                  {t.analyzing}
                </div>
                <div className="sans" style={{ fontSize: 12.5, color: "var(--lr-text-muted)" }}>
                  {t.analyzingHint}
                </div>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    justifyContent: "center",
                  }}
                >
                  <button onClick={pickFile} className="sans home-cta-primary">
                    <UploadIcon />
                    <span>{t.ctaAnalyze}</span>
                  </button>
                </div>
                <div className="sans" style={{ fontSize: 11.5, color: "var(--lr-text-faint)", letterSpacing: "0.06em" }}>
                  {t.formats}
                </div>
              </>
            )}

            {err && !analyzing && (
              <div
                role="alert"
                style={{
                  marginTop: 6,
                  background: "var(--lr-overall-crit-bg)",
                  border: "1px solid var(--lr-overall-crit-border)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  maxWidth: 420,
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <div className="sans" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--lr-overall-crit-border)", marginBottom: 4 }}>
                  {t.errorTitle}
                </div>
                <div className="sans" style={{ fontSize: 12.5, color: "var(--lr-text-secondary)", lineHeight: 1.5 }}>
                  {err}
                </div>
                <button
                  onClick={pickFile}
                  className="sans"
                  style={{
                    marginTop: 8,
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    color: "var(--lr-text)",
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  {t.tryAgain}
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div
            aria-hidden
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              maxWidth: 520,
              margin: "56px auto 28px",
              opacity: 0.5,
            }}
          >
            <span style={{ flex: 1, height: 1, background: "var(--lr-border)" }} />
            <span style={{ fontFamily: "Playfair Display, serif", fontSize: 18, color: "var(--lr-text-muted)" }}>·</span>
            <span style={{ flex: 1, height: 1, background: "var(--lr-border)" }} />
          </div>

          {/* Feature trio */}
          <div className="home-features">
            <Feature icon={<ListIcon />} title={t.feat1Title} body={t.feat1Body} />
            <Feature icon={<HelpIcon />} title={t.feat2Title} body={t.feat2Body} />
            <Feature icon={<ChatBubbleIcon />} title={t.feat3Title} body={t.feat3Body} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          position: "relative",
          padding: "22px clamp(20px, 5vw, 56px) 28px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div className="sans" style={{ fontSize: 11.5, color: "var(--lr-text-muted)", lineHeight: 1.5 }}>
          {t.disclaimer}
        </div>
        <div className="sans" style={{ fontSize: 11, color: "var(--lr-text-faint)", lineHeight: 1.5 }}>
          {t.privacy}
        </div>
      </footer>

      <style>{`
        @keyframes homeRise {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .home-hero-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: url('/hero-bg.png');
          background-repeat: no-repeat;
          background-position: center center;
          background-size: cover;
          opacity: 0.10;
          -webkit-mask-image: radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 55%, rgba(0,0,0,1) 100%);
          mask-image: radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 55%, rgba(0,0,0,1) 100%);
        }
        .home-hero-bg--dark { opacity: 0.16; }

        @media (max-width: 960px) {
          .home-hero-bg { opacity: 0.09; background-position: 70% center; }
          .home-hero-bg--dark { opacity: 0.14; }
        }
        @media (max-width: 560px) {
          .home-hero-bg {
            opacity: 0.08;
            background-position: center 20%;
            -webkit-mask-image: radial-gradient(ellipse 95% 60% at 50% 35%, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,1) 100%);
            mask-image: radial-gradient(ellipse 95% 60% at 50% 35%, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,1) 100%);
          }
          .home-hero-bg--dark { opacity: 0.13; }
        }

        .home-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--lr-btn-bg);
          color: var(--lr-btn-text);
          border: none;
          border-radius: 12px;
          padding: 14px 22px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease;
          box-shadow: 0 4px 14px rgba(26, 22, 18, 0.12);
        }
        .home-cta-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(26, 22, 18, 0.18); }
        .home-cta-primary:active { transform: translateY(0); }

        .home-cta-secondary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          color: var(--lr-text);
          border: 1px solid var(--lr-border-strong);
          border-radius: 12px;
          padding: 13px 20px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .home-cta-secondary:hover {
          background: var(--lr-input-bg);
          border-color: var(--lr-text-muted);
        }

        .home-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 8px;
          text-align: left;
        }
        @media (max-width: 960px) {
          .home-features { gap: 20px; }
        }
        @media (max-width: 760px) {
          .home-features { grid-template-columns: 1fr; gap: 18px; max-width: 360px; margin-left: auto; margin-right: auto; }
        }
        @media (max-width: 560px) {
          .home-cta-primary { padding: 13px 18px; font-size: 14.5px; }
          .home-cta-secondary { padding: 12px 16px; font-size: 14.5px; }
        }
      `}</style>
    </div>
  );
}

function IconButton({ children, onClick, title, label }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="sans"
      style={{
        height: 38,
        minWidth: 38,
        padding: label ? "0 12px 0 10px" : 0,
        background: "transparent",
        border: "1px solid var(--lr-border)",
        borderRadius: 10,
        color: "var(--lr-text)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.04em",
      }}
    >
      {children}
      {label && <span>{label}</span>}
    </button>
  );
}

function Feature({ icon, title, body }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "var(--lr-surface-alt)",
          color: "var(--lr-text)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div className="sans" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--lr-text)" }}>
        {title}
      </div>
      <div className="sans" style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--lr-text-muted)" }}>
        {body}
      </div>
    </div>
  );
}
