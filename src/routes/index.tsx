import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Check,
  ChevronRight,
  CircleDot,
  FileVideo,
  Gauge,
  Grid3X3,
  Map,
  Menu,
  MonitorCog,
  Play,
  RotateCcw,
  ScanLine,
  Settings2,
  Upload,
  Video,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";


import terrainImage from "@/assets/kavacha-terrain.jpg";

type Screen = "landing" | "acquisition" | "processing" | "results" | "analysis" | "system";
type VideoMeta = { name: string; duration: number; width: number; height: number };

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

type MissionResult = {
  status: string;
  mission: {
    filename: string;
    frames: number;
    duration_seconds: number;
  };
  output: {
    video: string;
  };
};
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KAVACHA | Adaptive 2.5D Reconnaissance System" },
      { name: "description", content: "Mission-control interface for KAVACHA autonomous UGV reconnaissance and adaptive spatial representation." },
      { property: "og:title", content: "KAVACHA | Adaptive 2.5D Reconnaissance System" },
      { property: "og:description", content: "Mission-control interface for autonomous UGV reconnaissance and adaptive spatial representation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KavachaApp,
});

const metrics = [
  ["35,656", "UNIFORM CELLS / FRAME"],
  ["33,923", "KAVACHA CELLS / FRAME"],
  ["4.86%", "CELL REDUCTION"],
  ["53.91 ms", "AVG LATENCY"],
  ["52.62 ms", "MEDIAN LATENCY"],
  ["18.55 FPS", "PROCESSING RATE"],
];

const navItems = [
  { id: "acquisition" as const, label: "MISSION", icon: Map },
  { id: "results" as const, label: "RESULTS", icon: Video },
  { id: "analysis" as const, label: "ANALYSIS", icon: BarChart3 },
  { id: "system" as const, label: "SYSTEM", icon: MonitorCog },
];

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds)) return "--:--";
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

function KavachaApp() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputUrl, setInputUrl] = useState<string>();
  const [outputUrl, setOutputUrl] = useState<string>();
  const [inputFile, setInputFile] = useState<File>();
  const [videoMeta, setVideoMeta] = useState<VideoMeta>();
  const [processingStep, setProcessingStep] = useState(0);

  const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

  const runMission = async () => {
    const inputFile = (document.querySelector(
      'input[type="file"][accept="video/*"]'
    ) as HTMLInputElement)?.files?.[0];

    if (!inputFile) {
      window.alert("Please acquire a mission video first.");
      return;
    }

    if (!API_BASE_URL) {
      window.alert("KAVACHA backend URL is not configured.");
      return;
    }

    setScreen("processing");
    setProcessingStep(0);

    try {
      const formData = new FormData();
      formData.append("video", inputFile);

      const response = await fetch(`${API_BASE_URL}/run-mission`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.status !== "complete") {
        throw new Error(data.message || "KAVACHA mission processing failed.");
      }

      setOutputUrl(`${API_BASE_URL}${data.output.video}`);
      setProcessingStep(5);

      window.setTimeout(() => {
        setScreen("results");
      }, 700);
    } catch (error) {
      console.error("KAVACHA backend error:", error);
      window.alert("KAVACHA backend could not process this mission.");
      setScreen("acquisition");
    }
  };

  useEffect(() => () => {
    if (inputUrl) URL.revokeObjectURL(inputUrl);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
  }, [inputUrl, outputUrl]);

  useEffect(() => {
    if (screen !== "processing") return;

    setProcessingStep(0);

    const timer = window.setInterval(() => {
      setProcessingStep((step) => {
        if (step >= 4) {
          window.clearInterval(timer);
          return 5;
        }

        return step + 1;
      });
    }, 650);

    return () => window.clearInterval(timer);
  }, [screen]);

  const handleVideo = (event: ChangeEvent<HTMLInputElement>, kind: "input" | "output") => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (kind === "output") {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(url);
      return;
    }
    if (inputUrl) URL.revokeObjectURL(inputUrl);
    setInputFile(file);
    setInputUrl(url);
    setVideoMeta({ name: file.name, duration: Number.NaN, width: 0, height: 0 });
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      setVideoMeta({ name: file.name, duration: probe.duration, width: probe.videoWidth, height: probe.videoHeight });
    };
    probe.src = url;
  };

  const runMission = async () => {
  if (!inputFile) return;

  if (!API_BASE_URL) {
    window.alert("KAVACHA backend URL is not configured.");
    return;
  }

  setScreen("processing");
  setProcessingStep(0);

  try {
    const formData = new FormData();
    formData.append("video", inputFile);

    const response = await fetch(`${API_BASE_URL}/run-mission`, {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as MissionResult;

    if (!response.ok || data.status !== "complete") {
      throw new Error(
        "message" in data
          ? String((data as MissionResult & { message?: string }).message)
          : "KAVACHA mission processing failed."
      );
    }

    const backendOutputUrl = `${API_BASE_URL}${data.output.video}`;

    setOutputUrl(backendOutputUrl);
    setProcessingStep(5);

    window.setTimeout(() => {
      setScreen("results");
    }, 700);
  } catch (error) {
    console.error("KAVACHA backend error:", error);

    window.alert(
      "KAVACHA backend could not process this mission. Please try again."
    );

    setScreen("acquisition");
  }
};

  const resetMission = () => {
    if (inputUrl) URL.revokeObjectURL(inputUrl);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setInputUrl(undefined);
    setOutputUrl(undefined);
    setInputFile(undefined);
    setVideoMeta(undefined);
    setScreen("acquisition");
  };

  if (screen === "landing") return <Landing onInitialize={() => setScreen("acquisition")} />;

  return (
    <div className="console-shell">
      <Sidebar current={screen} open={sidebarOpen} onToggle={() => setSidebarOpen((value) => !value)} onSelect={setScreen} />
      <main className="console-main">
        <ConsoleHeader screen={screen} onMenu={() => setSidebarOpen((value) => !value)} />
        {screen === "acquisition" && <Acquisition inputUrl={inputUrl} outputUrl={outputUrl} meta={videoMeta} onVideo={handleVideo} onProcess={runMission} />}
        {screen === "processing" && <Processing activeStep={processingStep} />}
        {screen === "results" && <Results inputUrl={inputUrl} outputUrl={outputUrl} meta={videoMeta} onAnalysis={() => setScreen("analysis")} />}
        {screen === "analysis" && <Analysis />}
        {screen === "system" && <SystemView onReset={resetMission} />}
      </main>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-lockup ${compact ? "brand-compact" : ""}`}>
      <img src="/kavacha-logo.png" alt="KAVACHA official logo" />
      {!compact && <div><strong>KAVACHA</strong><span>ADAPTIVE 2.5D RECONNAISSANCE</span></div>}
    </div>
  );
}

function Landing({ onInitialize }: { onInitialize: () => void }) {
  return (
    <main className="landing">
      <img className="landing-image" src={terrainImage} alt="Autonomous tracked UGV scanning rugged terrain" width={1920} height={1088} />
      <div className="landing-shade" />
      <div className="landing-grid" />
      <header className="landing-top"><Brand /><Status label="SYSTEM READY" /></header>
      <section className="landing-content">
        <div className="coordinate-label">SYS / KVC-2.5D &nbsp;&nbsp; 28.6139° N / 77.2090° E</div>
        <div className="landing-logo-wrap"><img src="/kavacha-logo.png" alt="KAVACHA official logo" /></div>
        <p className="eyebrow">AUTONOMOUS UGV ENVIRONMENT PERCEPTION</p>
        <h1>KAVACHA</h1>
        <h2>Adaptive 2.5D Reconnaissance System</h2>
        <p className="landing-description">Adaptive spatial representation for autonomous UGV navigation and reconnaissance.</p>
        <button className="primary-action" onClick={onInitialize}><ScanLine size={18} /> INITIALIZE MISSION <ChevronRight size={17} /></button>
      </section>
      <footer className="landing-status">
        <Status label="SENSOR PIPELINE READY" /><Status label="2.5D REPRESENTATION READY" />
        <span className="build-label">KAVACHA / DEMONSTRATION INTERFACE</span>
      </footer>
    </main>
  );
}

function Sidebar({ current, open, onToggle, onSelect }: { current: Screen; open: boolean; onToggle: () => void; onSelect: (screen: Screen) => void }) {
  return (
    <aside className={`mission-sidebar ${open ? "" : "collapsed"}`}>
      <div className="sidebar-brand"><Brand compact={!open} /></div>
      <nav aria-label="Mission console">
        {navItems.map((item) => {
          const Icon = item.icon;
          return <button key={item.id} className={current === item.id ? "active" : ""} onClick={() => onSelect(item.id)} title={item.label}><Icon size={17} /><span>{item.label}</span></button>;
        })}
      </nav>
      <div className="sidebar-lower"><Status label={open ? "SYSTEM ONLINE" : ""} /><button className="icon-button" onClick={onToggle} aria-label={open ? "Collapse navigation" : "Expand navigation"}><Menu size={18} /></button></div>
    </aside>
  );
}

function ConsoleHeader({ screen, onMenu }: { screen: Screen; onMenu: () => void }) {
  return (
    <header className="console-header">
      <button className="mobile-menu icon-button" onClick={onMenu} aria-label="Toggle navigation"><Menu size={18} /></button>
      <div><span>MISSION CONSOLE</span><strong>{screen === "processing" ? "PROCESSING SEQUENCE" : screen.toUpperCase()}</strong></div>
      <div className="header-right"><span className="mission-id">MISSION 01</span><Status label={screen === "results" ? "PROCESSING COMPLETE" : "SYSTEM READY"} /></div>
    </header>
  );
}

function Acquisition({ inputUrl, outputUrl, meta, onVideo, onProcess }: { inputUrl: string | undefined; outputUrl: string | undefined; meta: VideoMeta | undefined; onVideo: (event: ChangeEvent<HTMLInputElement>, kind: "input" | "output") => void; onProcess: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLInputElement>(null);
  return (
    <section className="screen acquisition-screen animate-fade-in">
      <ScreenTitle code="ACQ / 01" title="New Reconnaissance Mission" subtitle="Acquire UGV camera feed and prepare the KAVACHA demonstration pipeline." />
      <div className={`acquisition-frame ${inputUrl ? "has-video" : ""}`}>
        <CornerBrackets />
        {inputUrl ? <video src={inputUrl} controls playsInline aria-label="Uploaded UGV camera video" /> : <div className="upload-empty"><div className="scanner-ring"><ScanLine size={30} /></div><strong>UGV CAMERA FEED</strong><span>Awaiting mission video acquisition</span><button className="secondary-action" onClick={() => inputRef.current?.click()}><Upload size={16} /> ACQUIRE VIDEO</button></div>}
        <div className="scan-line" />
        <input ref={inputRef} className="sr-only" type="file" accept="video/*" onChange={(event) => onVideo(event, "input")} />
        {inputUrl && <button className="replace-video" onClick={() => inputRef.current?.click()}><Upload size={14} /> REPLACE FEED</button>}
      </div>
      <div className="acquisition-readout">
        <Readout icon={<FileVideo size={16} />} label="MISSION VIDEO" value={meta?.name ?? "NOT ACQUIRED"} />
        <Readout label="DURATION" value={meta ? formatDuration(meta.duration) : "--:--"} />
        <Readout label="RESOLUTION" value={meta?.width ? `${meta.width} × ${meta.height}` : "---- × ----"} />
        <Readout label="FRAME COUNT" value={meta ? "AVAILABLE AFTER PIPELINE" : "-----"} />
        <div className="mission-acquired"><Status label={inputUrl ? "MISSION VIDEO ACQUIRED" : "AWAITING INPUT"} /></div>
      </div>
      <div className="acquisition-actions">
        <label className="output-attach"><input ref={outputRef} type="file" accept="video/*" onChange={(event) => onVideo(event, "output")} /><FileVideo size={15} /><span>{outputUrl ? "PREPARED 2.5D OUTPUT ATTACHED" : "ATTACH PREPARED 2.5D OUTPUT"}</span></label>
        <button className="primary-action" disabled={!inputUrl} onClick={onProcess}><Activity size={17} /> INITIALIZE KAVACHA <ChevronRight size={17} /></button>
      </div>
    </section>
  );
}

function Processing({ activeStep }: { activeStep: number }) {
  const steps = ["MISSION ACQUISITION", "SPATIAL REPRESENTATION", "ADAPTIVE RESOLUTION", "SAFETY GATE", "2.5D MAP GENERATION"];
  return (
    <section className="processing-screen">
      <div className="processing-visual"><div className="radar-grid"><div className="radar-sweep" /><div className="radar-core"><ScanLine size={28} /></div></div><div className="terrain-lines"><i /><i /><i /><i /></div></div>
      <div className="processing-panel">
        <p className="eyebrow">PREPARED DEMONSTRATION WORKFLOW</p><h1>KAVACHA PROCESSING</h1><p className="processing-note">Visualizing the KAVACHA processing sequence. No live inference is performed in this interface.</p>
        <div className="process-steps">{steps.map((step, index) => <div key={step} className={index <= activeStep ? "complete" : ""}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong><i>{index <= activeStep ? <Check size={15} /> : null}</i></div>)}</div>
        <div className="progress-track"><span style={{ width: `${((activeStep + 1) / 5) * 100}%` }} /></div>
      </div>
    </section>
  );
}

function Results({ inputUrl, outputUrl, meta, onAnalysis }: { inputUrl: string | undefined; outputUrl: string | undefined; meta: VideoMeta | undefined; onAnalysis: () => void }) {
  return (
    <section className="screen results-screen animate-fade-in">
      <ScreenTitle code="RSLT / M01" title="Real-World Reconnaissance → KAVACHA Representation" subtitle="Prepared demonstration result synchronized with the acquired mission feed." />
      <div className="feed-grid">
        <FeedPanel label="UGV CAMERA INPUT" tag="SOURCE / RGB" meta={meta ? `${meta.width}×${meta.height} / ${formatDuration(meta.duration)}` : "NO SOURCE"}>{inputUrl ? <video src={inputUrl} controls loop playsInline /> : <FeedFallback label="NO MISSION FEED" />}</FeedPanel>
        <FeedPanel label="KAVACHA 2.5D OUTPUT" tag={outputUrl ? "PREPARED OUTPUT" : "REPRESENTATION PREVIEW"} meta="ADAPTIVE GRID / 0–100 m">{outputUrl ? <video src={outputUrl} controls loop playsInline /> : <SpatialPreview />}</FeedPanel>
      </div>
      <section className="metric-strip" aria-label="Mission performance">{metrics.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</section>
      <div className="result-footer"><div><Status label="GEOMETRY-BASED COARSENING VETO ACTIVE" /><span>Candidate coarsening is accepted only when local safety interpretation remains unchanged.</span></div><button className="secondary-action" onClick={onAnalysis}>OPEN DETAILED ANALYSIS <ChevronRight size={16} /></button></div>
    </section>
  );
}

function FeedPanel({ label, tag, meta, children }: { label: string; tag: string; meta: string; children: ReactNode }) {
  return <article className="feed-panel"><header><div><CircleDot size={14} /><strong>{label}</strong></div><span>{tag}</span></header><div className="feed-media">{children}<div className="feed-reticle" /><div className="scan-line" /></div><footer><span>MISSION 01</span><span>{meta}</span><span>FRAME / LIVE</span></footer></article>;
}

function FeedFallback({ label }: { label: string }) { return <div className="feed-fallback"><Video size={28} /><span>{label}</span></div>; }

function SpatialPreview() {
  return <div className="spatial-preview"><div className="spatial-horizon" /><div className="spatial-grid"><i /><i /><i /><i /><i /></div><div className="point-cloud">{Array.from({ length: 34 }).map((_, index) => <b key={index} style={{ left: `${7 + ((index * 19) % 88)}%`, top: `${18 + ((index * 31) % 64)}%` }} />)}</div><div className="ugv-marker"><ScanLine size={25} /></div><span>PREPARED 2.5D REPRESENTATION</span></div>;
}

function Analysis() {
  return (
    <section className="screen analysis-screen animate-fade-in">
      <ScreenTitle code="ANL / M01" title="Adaptive Spatial Analysis" subtitle="Measured KAVACHA representation behavior and benchmark comparison." />
      <div className="analysis-layout">
        <section className="analysis-module resolution-module"><ModuleTitle icon={<Grid3X3 size={17} />} title="ADAPTIVE RESOLUTION FIELD" code="RANGE / CELL SIZE" /><div className="resolution-field">{[["0–10 m","5 cm"],["10–25 m","10 cm"],["25–50 m","20 cm"],["50–75 m","35 cm"],["75–100 m","50 cm"]].map(([range,size], index) => <div key={range} className={`resolution-band band-${index}`}><span>{range}</span><div className="cell-pattern" /><strong>{size}</strong></div>)}</div><div className="range-scale"><span>NEAR / FINE</span><i /><span>FAR / COARSE</span></div></section>
        <section className="analysis-module decision-module"><ModuleTitle icon={<Settings2 size={17} />} title="COARSENING DECISIONS" code="AVERAGE / FRAME" /><div className="decision-flow"><span>DISTANCE PROPOSAL</span><ChevronRight size={15} /><span>SAFETY INTERPRETATION CHECK</span><ChevronRight size={15} /><span>MERGE OR KEEP / REFINE</span></div><div className="decision-bar"><i className="merge" style={{ width: "3.22%" }} /><i className="refine" style={{ width: ".51%" }} /><i className="keep" style={{ width: "13.59%" }} /><i className="unknown" style={{ width: "82.68%" }} /></div><div className="decision-values"><Readout label="MERGE" value="1,036" /><Readout label="REFINE" value="163" /><Readout label="KEEP FINE" value="4,372" /><Readout label="UNKNOWN" value="26,600" /></div><p>REFINE = geometry-based coarsening veto / refinement.</p></section>
        <section className="analysis-module benchmark-module"><ModuleTitle icon={<Gauge size={17} />} title="BENCHMARK COMPARISON" code="MEASURED VALUES" /><Benchmark /></section>
        <section className="analysis-module safety-module"><ModuleTitle icon={<Activity size={17} />} title="SAFETY-PRESERVING COARSENING" code="INTERPRETATION GATE" /><div className="safety-state"><span>GEOMETRY-BASED COARSENING VETO</span><strong>ACTIVE</strong></div><p>Candidate coarsening is accepted only when the local safety interpretation remains unchanged.</p></section>
      </div>
    </section>
  );
}

function Benchmark() {
  const rows = [
    { name: "UNIFORM 5 cm", cells: "35,656", reduction: "BASELINE", latency: "—", fps: "—", width: "100%" },
    { name: "DISTANCE-ADAPTIVE", cells: "32,172", reduction: "9.77%", latency: "64.17 ms", fps: "15.58", width: "90.2%" },
    { name: "KAVACHA", cells: "33,923", reduction: "4.86%", latency: "53.91 ms", fps: "18.55", width: "95.1%", active: true },
  ];
  return <div className="benchmark"><div className="benchmark-head"><span>SYSTEM</span><span>CELLS / FRAME</span><span>REDUCTION</span><span>LATENCY</span><span>FPS</span></div>{rows.map((row) => <div className={`benchmark-row ${row.active ? "active" : ""}`} key={row.name}><strong>{row.name}</strong><div className="bar-cell"><i style={{ width: row.width }} /></div><span>{row.cells}</span><span>{row.reduction}</span><span>{row.latency}</span><span>{row.fps}</span></div>)}</div>;
}

function SystemView({ onReset }: { onReset: () => void }) {
  return <section className="screen system-screen animate-fade-in"><ScreenTitle code="SYS / 01" title="System Readiness" subtitle="KAVACHA prepared demonstration interface status." /><div className="system-matrix">{["MISSION ACQUISITION","VIDEO PREVIEW","SPATIAL REPRESENTATION","ADAPTIVE RESOLUTION","SAFETY INTERPRETATION GATE","RESULT VISUALIZATION"].map((label, index) => <div key={label}><span>{String(index + 1).padStart(2,"0")}</span><strong>{label}</strong><Status label="READY" /></div>)}</div><div className="system-notice"><Activity size={19} /><div><strong>DEMONSTRATION MODE</strong><p>The interface visualizes prepared KAVACHA results. Backend processing can be connected to the mission pipeline without changing the operator workflow.</p></div></div><button className="secondary-action" onClick={onReset}><RotateCcw size={16} /> RESET MISSION</button></section>;
}

function ScreenTitle({ code, title, subtitle }: { code: string; title: string; subtitle: string }) { return <header className="screen-title"><div><span>{code}</span><h1>{title}</h1><p>{subtitle}</p></div><div className="title-mark"><i /><i /><i /></div></header>; }
function ModuleTitle({ icon, title, code }: { icon: ReactNode; title: string; code: string }) { return <header className="module-title"><div>{icon}<strong>{title}</strong></div><span>{code}</span></header>; }
function Readout({ icon, label, value }: { icon?: ReactNode; label: string; value: string }) { return <div className="readout">{icon}<div><span>{label}</span><strong title={value}>{value}</strong></div></div>; }
function Status({ label }: { label: string }) { return <span className="status"><i />{label}</span>; }
function CornerBrackets() { return <><i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" /></>; }
