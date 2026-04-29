import { useEffect, useState } from "react";
import HomeScreen from "./components/HomeScreen";
import { SplitRail } from "../artifacts/mockup-sandbox/src/components/mockups/lab-results/SplitRail";
import { SplitRailTablet } from "../artifacts/mockup-sandbox/src/components/mockups/lab-results/SplitRailTablet";
import { SplitRailDesktop } from "../artifacts/mockup-sandbox/src/components/mockups/lab-results/SplitRailDesktop";

const MOBILE_MAX = 720;
const TABLET_MAX = 1100;

function useViewportWidth() {
  const [w, setW] = useState(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth,
  );
  useEffect(() => {
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setW(window.innerWidth));
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return w;
}

export default function App() {
  const w = useViewportWidth();
  const [screen, setScreen] = useState("home");
  const [theme, setTheme] = useState("light");
  const [lang, setLang] = useState("en");
  const [initialData, setInitialData] = useState(undefined);

  useEffect(() => {
    document.body.dataset.theme = theme;
    return () => {
      delete document.body.dataset.theme;
    };
  }, [theme]);

  if (screen === "home") {
    return (
      <HomeScreen
        theme={theme}
        lang={lang}
        onTheme={setTheme}
        onLang={setLang}
        onAnalyzed={(data) => {
          setInitialData(data);
          setScreen("app");
        }}
        onUseSample={() => {
          setInitialData(undefined);
          setScreen("app");
        }}
      />
    );
  }

  let Layout;
  if (w < MOBILE_MAX) Layout = SplitRail;
  else if (w < TABLET_MAX) Layout = SplitRailTablet;
  else Layout = SplitRailDesktop;

  return (
    <Layout
      width="100%"
      height="100dvh"
      chrome={false}
      initialData={initialData}
      initialTheme={theme}
      initialLang={lang}
      onThemeChange={setTheme}
      onLangChange={setLang}
      onHome={() => setScreen("home")}
    />
  );
}
