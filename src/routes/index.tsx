import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useMemo, useState } from "react";

import iconPlay from "@/assets/icon-play.png";
import iconPause from "@/assets/icon-pause.png";
import iconReset from "@/assets/icon-reset.png";
import iconMove from "@/assets/icon-move.png";
import iconRotate from "@/assets/icon-rotate.png";
import iconScale from "@/assets/icon-scale.png";
import iconTrajectory from "@/assets/icon-trajectory.png";
import iconAvatar from "@/assets/icon-avatar.png";
import iconEnvironment from "@/assets/icon-environment.png";
import iconTarget from "@/assets/icon-target.png";
import type { SceneObject, ToolMode } from "@/components/ar/ARViewport";

const ARViewport = lazy(() => import("@/components/ar/ARViewport"));

const G = 9.8;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WebAR Gerak Parabola — Dolanan Paseran | Fisika Fase E" },
      {
        name: "description",
        content:
          "Ruang kerja WebAR 3D untuk memvisualisasikan gerak parabola pada dolanan paseran: atur sudut elevasi dan kecepatan awal, amati lintasan secara interaktif.",
      },
      { property: "og:title", content: "WebAR Gerak Parabola — Dolanan Paseran" },
      {
        property: "og:description",
        content:
          "Simulasi AR interaktif gerak parabola untuk kelas X: sudut elevasi, kecepatan awal, jangkauan, dan tinggi maksimum.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Workspace,
});

function Symbol({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      width={512}
      height={512}
      loading="lazy"
      className={`h-full w-full object-contain opacity-80 ${className}`}
    />
  );
}

function ToolButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-sm border transition-colors ${
        active
          ? "border-foreground/25 bg-secondary"
          : "border-transparent hover:border-border hover:bg-secondary/60"
      }`}
    >
      <span className="h-[15px] w-[15px]">
        <Symbol src={icon} alt={label} />
      </span>
    </button>
  );
}

function Field({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="label-xs">{label}</span>
        <span className="font-mono text-[12px] text-foreground">
          {value.toFixed(step < 1 ? 1 : 0)}
          <span className="ml-1 text-muted-foreground">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/70 py-[7px] last:border-b-0">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="font-mono text-[12px]">{value}</span>
    </div>
  );
}

const OBJECTS: { id: SceneObject; name: string; icon: string; type: string }[] = [
  { id: "environment", name: "Environment", icon: iconEnvironment, type: "GLB" },
  { id: "murid", name: "Murid_Laki_Laki", icon: iconAvatar, type: "GLB · Rigged" },
  { id: "sasaran", name: "Sasaran_Paseran", icon: iconTarget, type: "Mesh" },
];

function Workspace() {
  const [angle, setAngle] = useState(45);
  const [velocity, setVelocity] = useState(12);
  const [playing, setPlaying] = useState(true);
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [tool, setTool] = useState<ToolMode>("translate");
  const [selected, setSelected] = useState<SceneObject | null>("murid");
  const [visible, setVisible] = useState<Record<SceneObject, boolean>>({
    murid: true,
    environment: true,
    sasaran: true,
  });
  const [resetToken, setResetToken] = useState(0);
  const [live, setLive] = useState({ t: 0, x: 0, y: 0, vy: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const derived = useMemo(() => {
    const rad = (angle * Math.PI) / 180;
    const vx = velocity * Math.cos(rad);
    const vy = velocity * Math.sin(rad);
    const h0 = 1.35;
    const t = (vy + Math.sqrt(vy * vy + 2 * G * h0)) / G;
    return {
      vx,
      vy,
      t,
      range: vx * t,
      hmax: h0 + (vy * vy) / (2 * G),
    };
  }, [angle, velocity]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Top bar */}
      <header className="flex h-11 shrink-0 items-center gap-4 border-b border-border bg-panel px-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-[3px] bg-foreground">
            <span className="h-1.5 w-1.5 rounded-[1px] bg-background" />
          </span>
          <div className="leading-tight">
            <p className="text-[12px] font-semibold">Paseran AR Studio</p>
            <p className="label-xs">Gerak Parabola · Fase E</p>
          </div>
        </div>

        <div className="mx-1 h-5 w-px bg-border" />

        <div className="flex items-center gap-1">
          <ToolButton icon={iconMove} label="Pindah objek" active={tool === "translate"} onClick={() => setTool("translate")} />
          <ToolButton icon={iconRotate} label="Putar objek" active={tool === "rotate"} onClick={() => setTool("rotate")} />
          <ToolButton icon={iconScale} label="Skala objek" active={tool === "scale"} onClick={() => setTool("scale")} />
        </div>

        <div className="mx-1 h-5 w-px bg-border" />

        <div className="flex items-center gap-1">
          <ToolButton
            icon={playing ? iconPause : iconPlay}
            label={playing ? "Jeda simulasi" : "Jalankan simulasi"}
            active={playing}
            onClick={() => setPlaying((p) => !p)}
          />
          <ToolButton icon={iconReset} label="Ulangi lemparan" onClick={() => setResetToken((v) => v + 1)} />
          <ToolButton
            icon={iconTrajectory}
            label="Tampilkan lintasan"
            active={showTrajectory}
            onClick={() => setShowTrajectory((v) => !v)}
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGrid((v) => !v)}
            className={`rounded-sm border px-2.5 py-1 text-[11px] transition-colors ${
              showGrid ? "border-foreground/25 bg-secondary" : "border-border hover:bg-secondary/60"
            }`}
          >
            Grid
          </button>
          <span className="rounded-sm border border-border px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
            g = 9,8 m/s²
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Hierarchy */}
        <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-panel">
          <div className="border-b border-border px-3 py-2">
            <span className="label-xs">Hierarki Scene</span>
          </div>
          <div className="flex-1 overflow-y-auto p-1.5">
            {OBJECTS.map((o) => (
              <div
                key={o.id}
                className={`group flex items-center gap-2 rounded-sm px-2 py-1.5 ${
                  selected === o.id ? "bg-secondary" : "hover:bg-secondary/60"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelected(o.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span className="h-[14px] w-[14px] shrink-0">
                    <Symbol src={o.icon} alt="" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[12px]">{o.name}</span>
                    <span className="block font-mono text-[10px] text-muted-foreground">{o.type}</span>
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={`Sembunyikan ${o.name}`}
                  onClick={() => setVisible((v) => ({ ...v, [o.id]: !v[o.id] }))}
                  className="flex h-4 w-4 items-center justify-center rounded-[2px] border border-border"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-[1px] ${visible[o.id] ? "bg-foreground" : "bg-transparent"}`}
                  />
                </button>
              </div>
            ))}
          </div>
          <div className="border-t border-border px-3 py-2">
            <span className="label-xs">Sumber aset</span>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Model GLB murid & environment dimuat dari CDN proyek, dirender dengan WebGL.
            </p>
          </div>
        </aside>

        {/* Viewport */}
        <main className="relative min-w-0 flex-1 bg-[#e9e7e1]">
          {mounted ? (
            <Suspense fallback={<ViewportFallback />}>
              <ARViewport
                angle={angle}
                velocity={velocity}
                playing={playing}
                showTrajectory={showTrajectory}
                showGrid={showGrid}
                selected={selected}
                tool={tool}
                visible={visible}
                resetToken={resetToken}
                onSelect={setSelected}
                onTick={setLive}
              />
            </Suspense>
          ) : (
            <ViewportFallback />
          )}

          <div className="pointer-events-none absolute left-3 top-3 rounded-sm border border-border/70 bg-card/85 px-2.5 py-1.5 backdrop-blur-[2px]">
            <p className="label-xs">Viewport · Perspective</p>
            <p className="mt-1 font-mono text-[11px]">
              t {live.t.toFixed(2)} s · x {live.x.toFixed(2)} m · y {live.y.toFixed(2)} m
            </p>
          </div>

          <div className="pointer-events-none absolute bottom-3 left-3 rounded-sm border border-border/70 bg-card/85 px-2.5 py-1.5">
            <p className="font-mono text-[11px] text-muted-foreground">
              drag kiri: orbit · scroll: zoom · drag kanan: geser
            </p>
          </div>

          <div className="pointer-events-none absolute right-3 top-3 rounded-sm border border-border/70 bg-card/85 px-2.5 py-1.5">
            <p className="label-xs">Objek terpilih</p>
            <p className="mt-1 font-mono text-[11px]">
              {OBJECTS.find((o) => o.id === selected)?.name ?? "—"}
            </p>
          </div>
        </main>

        {/* Inspector */}
        <aside className="flex w-[300px] shrink-0 flex-col border-l border-border bg-panel">
          <div className="border-b border-border px-3 py-2">
            <span className="label-xs">Inspector</span>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto p-3">
            <section className="space-y-4">
              <p className="text-[12px] font-semibold">Parameter Lemparan</p>
              <Field label="Sudut elevasi θ" value={angle} unit="°" min={10} max={80} step={1} onChange={setAngle} />
              <Field
                label="Kecepatan awal v₀"
                value={velocity}
                unit="m/s"
                min={4}
                max={22}
                step={0.5}
                onChange={setVelocity}
              />
            </section>

            <section>
              <p className="mb-1 text-[12px] font-semibold">Komponen & Hasil</p>
              <Readout label="v₀ₓ = v₀ cos θ" value={`${derived.vx.toFixed(2)} m/s`} />
              <Readout label="v₀ᵧ = v₀ sin θ" value={`${derived.vy.toFixed(2)} m/s`} />
              <Readout label="Waktu terbang" value={`${derived.t.toFixed(2)} s`} />
              <Readout label="Jangkauan" value={`${derived.range.toFixed(2)} m`} />
              <Readout label="Tinggi maksimum" value={`${derived.hmax.toFixed(2)} m`} />
              <Readout label="vᵧ saat ini" value={`${live.vy.toFixed(2)} m/s`} />
            </section>

            <section className="space-y-2">
              <p className="text-[12px] font-semibold">Catatan Etnosains</p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Pada dolanan paseran, pemain mengatur sudut lemparan agar peluru mengenai sasaran. Sudut 45°
                memberi jangkauan terjauh pada kecepatan awal yang sama — bandingkan dengan kebiasaan bermain di
                lapangan.
              </p>
            </section>
          </div>

          <div className="border-t border-border p-3">
            <button
              type="button"
              onClick={() => {
                setAngle(45);
                setVelocity(12);
                setResetToken((v) => v + 1);
                setPlaying(true);
              }}
              className="w-full rounded-sm bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Kembalikan ke nilai awal
            </button>
          </div>
        </aside>
      </div>

      {/* Status bar */}
      <footer className="flex h-8 shrink-0 items-center gap-4 border-t border-border bg-panel px-3 font-mono text-[11px] text-muted-foreground">
        <span>{playing ? "SIMULASI: BERJALAN" : "SIMULASI: JEDA"}</span>
        <span>MODE: {tool.toUpperCase()}</span>
        <span>θ {angle}° · v₀ {velocity.toFixed(1)} m/s</span>
        <span className="ml-auto">WebGL · GLB · Modul Ajar Fisika Kelas X</span>
      </footer>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background px-8 text-center portrait:flex landscape:hidden md:hidden">
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Putar perangkat ke mode lanskap untuk membuka ruang kerja AR.
        </p>
      </div>
    </div>
  );
}

function ViewportFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <span className="font-mono text-[11px] text-muted-foreground">Menyiapkan viewport 3D…</span>
    </div>
  );
}