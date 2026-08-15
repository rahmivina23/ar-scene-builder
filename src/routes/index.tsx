import { Suspense, lazy, useState } from "react";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import type { ShotResult } from "@/components/ar/ARViewport";
import playIcon from "@/assets/icons/play.png";
import resetIcon from "@/assets/icons/reset.png";
import moveIcon from "@/assets/icons/move.png";
import rotateIcon from "@/assets/icons/rotate.png";
import targetIcon from "@/assets/icons/target.png";
import trajectoryIcon from "@/assets/icons/trajectory.png";
import avatarIcon from "@/assets/icons/avatar.png";

const ARViewport = lazy(() =>
  import("@/components/ar/ARViewport").then((m) => ({ default: m.ARViewport })),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AR Paseran — Simulasi Gerak Parabola Kelas X" },
      {
        name: "description",
        content:
          "Simulator AR 3D gerak parabola berbasis permainan tradisional Paseran: atur sudut elevasi dan kecepatan awal, lalu amati lintasan murid SMA di halaman sekolah.",
      },
      { property: "og:title", content: "AR Paseran — Simulasi Gerak Parabola" },
      {
        property: "og:description",
        content: "Editor 3D gaya game untuk memvisualisasikan lintasan parabola pada permainan Paseran.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const G = 9.81;

function Icon({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className="ui-icon" width={512} height={512} loading="lazy" />;
}

function Index() {
  const [angle, setAngle] = useState(45);
  const [velocity, setVelocity] = useState(14);
  const [running, setRunning] = useState(false);
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [targetDistance, setTargetDistance] = useState(18);
  const [result, setResult] = useState<ShotResult | null>(null);
  const [selected, setSelected] = useState<"murid" | "target" | "lintasan">("murid");
  const [flight, setFlight] = useState(0);

  const rad = (angle * Math.PI) / 180;
  const vx = velocity * Math.cos(rad);
  const vy = velocity * Math.sin(rad);
  const predRange = (vx * (vy + Math.sqrt(vy * vy + 2 * G * 1.35))) / G;
  const predHeight = 1.35 + (vy * vy) / (2 * G);

  const hit = result ? Math.abs(result.range - targetDistance) <= 1.2 : false;

  return (
    <div className="editor">
      {/* TOP BAR */}
      <header className="bar top">
        <div className="brand">
          <span className="brand-mark" aria-hidden />
          <div>
            <div className="brand-title">AR PASERAN</div>
            <div className="brand-sub">Gerak Parabola · Fase E</div>
          </div>
        </div>

        <div className="tools">
          {[
            { k: "murid" as const, icon: moveIcon, label: "Murid" },
            { k: "target" as const, icon: targetIcon, label: "Target" },
            { k: "lintasan" as const, icon: rotateIcon, label: "Kamera" },
          ].map((t) => (
            <button
              key={t.k}
              className={`tool ${selected === t.k ? "is-active" : ""}`}
              onClick={() => setSelected(t.k)}
              title={t.label}
            >
              <Icon src={t.icon} alt={t.label} />
            </button>
          ))}
        </div>

        <div className="transport">
          <button
            className="btn primary"
            onClick={() => {
              setResult(null);
              setFlight(0);
              setRunning(false);
              requestAnimationFrame(() => setRunning(true));
            }}
          >
            <Icon src={playIcon} alt="" />
            <span>Lempar</span>
          </button>
          <button
            className="btn"
            onClick={() => {
              setRunning(false);
              setResult(null);
              setFlight(0);
            }}
          >
            <Icon src={resetIcon} alt="" />
            <span>Reset</span>
          </button>
        </div>
      </header>

      <div className="body">
        {/* HIERARCHY */}
        <aside className="panel left">
          <div className="panel-head">Hierarki Scene</div>
          <ul className="tree">
            <li className="tree-root">Halaman Sekolah</li>
            <li className={selected === "murid" ? "is-active" : ""} onClick={() => setSelected("murid")}>
              <Icon src={avatarIcon} alt="" /> Murid SMA
            </li>
            <li className={selected === "target" ? "is-active" : ""} onClick={() => setSelected("target")}>
              <Icon src={targetIcon} alt="" /> Target Paseran
            </li>
            <li className={selected === "lintasan" ? "is-active" : ""} onClick={() => setSelected("lintasan")}>
              <Icon src={trajectoryIcon} alt="" /> Lintasan
            </li>
            <li className="muted">Gedung · Pohon · Tiang Bendera</li>
          </ul>

          <div className="panel-head">Toggle</div>
          <label className="row-toggle">
            <input
              type="checkbox"
              checked={showTrajectory}
              onChange={(e) => setShowTrajectory(e.target.checked)}
            />
            <span>Tampilkan prediksi lintasan</span>
          </label>
        </aside>

        {/* VIEWPORT */}
        <main className="viewport">
          <ClientOnly fallback={<div className="viewport-loading">Memuat scene 3D…</div>}>
            <Suspense fallback={<div className="viewport-loading">Memuat scene 3D…</div>}>
              <ARViewport
                angle={angle}
                velocity={velocity}
                running={running}
                showTrajectory={showTrajectory}
                targetDistance={targetDistance}
                onTick={(t) => setFlight(t)}
                onLanded={(r) => {
                  setResult(r);
                  setRunning(false);
                }}
              />
            </Suspense>
          </ClientOnly>

          <div className="hud tl">
            <span className="hud-label">Sudut</span>
            <strong>{angle}°</strong>
            <span className="hud-label">v₀</span>
            <strong>{velocity.toFixed(1)} m/s</strong>
            <span className="hud-label">t</span>
            <strong>{flight.toFixed(2)} s</strong>
          </div>

          {result && (
            <div className={`hud result ${hit ? "ok" : ""}`}>
              {hit ? "TEPAT SASARAN" : "MELESET"} · jarak {result.range.toFixed(2)} m · tinggi maks{" "}
              {result.maxH.toFixed(2)} m · waktu {result.time.toFixed(2)} s
            </div>
          )}
        </main>

        {/* INSPECTOR */}
        <aside className="panel right">
          <div className="panel-head">Inspector · {selected === "target" ? "Target" : "Lemparan"}</div>

          <div className="field">
            <div className="field-top">
              <span>Sudut elevasi (θ)</span>
              <span className="val">{angle}°</span>
            </div>
            <input type="range" min={10} max={80} step={1} value={angle} onChange={(e) => setAngle(+e.target.value)} />
          </div>

          <div className="field">
            <div className="field-top">
              <span>Kecepatan awal (v₀)</span>
              <span className="val">{velocity.toFixed(1)} m/s</span>
            </div>
            <input
              type="range"
              min={5}
              max={25}
              step={0.5}
              value={velocity}
              onChange={(e) => setVelocity(+e.target.value)}
            />
          </div>

          <div className="field">
            <div className="field-top">
              <span>Jarak target</span>
              <span className="val">{targetDistance} m</span>
            </div>
            <input
              type="range"
              min={5}
              max={35}
              step={1}
              value={targetDistance}
              onChange={(e) => setTargetDistance(+e.target.value)}
            />
          </div>

          <div className="panel-head">Komponen Vektor</div>
          <dl className="stats">
            <div>
              <dt>vₓ = v₀ cos θ</dt>
              <dd>{vx.toFixed(2)} m/s</dd>
            </div>
            <div>
              <dt>v_y = v₀ sin θ</dt>
              <dd>{vy.toFixed(2)} m/s</dd>
            </div>
            <div>
              <dt>Prediksi jarak</dt>
              <dd>{predRange.toFixed(2)} m</dd>
            </div>
            <div>
              <dt>Prediksi tinggi</dt>
              <dd>{predHeight.toFixed(2)} m</dd>
            </div>
            <div>
              <dt>g</dt>
              <dd>9.81 m/s²</dd>
            </div>
          </dl>
        </aside>
      </div>

      {/* STATUS BAR */}
      <footer className="bar bottom">
        <span>Drag untuk memutar kamera · scroll untuk zoom</span>
        <span className="dot" />
        <span>Objek terpilih: {selected}</span>
        <span className="dot" />
        <span>{running ? "Simulasi berjalan" : "Siap"}</span>
      </footer>
    </div>
  );
}