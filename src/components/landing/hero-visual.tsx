import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Sparkles, ShieldCheck, CheckCircle2, Cpu, FileText, Users, Award,
} from "lucide-react";

const STAGES = [
  { label: "Buyer publishes RFQ", icon: FileText },
  { label: "AI analyzes request", icon: Cpu },
  { label: "Matching suppliers", icon: Users },
  { label: "Quotations received", icon: FileText },
  { label: "AI ranks suppliers", icon: Sparkles },
  { label: "Winner selected", icon: Award },
];

const NOTIFICATIONS = [
  { icon: CheckCircle2, text: "New supplier joined", tone: "primary" },
  { icon: FileText, text: "Quote received · ₹4.68L", tone: "accent" },
  { icon: Sparkles, text: "AI match found · 98%", tone: "primary" },
  { icon: Award, text: "Best offer updated", tone: "accent" },
  { icon: ShieldCheck, text: "Supplier verified", tone: "primary" },
];

const SUPPLIERS = [
  { name: "ErgoWorks", score: 96, angle: -70 },
  { name: "Nord Co", score: 91, angle: -20 },
  { name: "SeatSmart", score: 84, angle: 30 },
  { name: "PrimeSup", score: 88, angle: 80 },
];

export function HeroVisual() {
  const [stage, setStage] = useState(0);
  const [confidence, setConfidence] = useState(72);
  const [notif, setNotif] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStage((s) => (s + 1) % STAGES.length), 2200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setConfidence((c) => {
        const next = c + Math.round((100 - c) * 0.25 + 1);
        return next >= 100 ? 72 : next;
      });
    }, 700);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNotif((n) => (n + 1) % NOTIFICATIONS.length), 2600);
    return () => clearInterval(t);
  }, []);

  const current = NOTIFICATIONS[notif];

  return (
    <div className="relative aspect-[5/6] sm:aspect-[6/5] w-full">
      {/* Glow ring behind */}
      <div
        className="absolute inset-6 rounded-[2rem] opacity-70 blur-2xl -z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in oklab, var(--primary) 45%, transparent), transparent 70%)",
        }}
      />

      <div className="relative h-full w-full glass rounded-[2rem] p-5 sm:p-6 glow-ring overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-accent/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-primary/70" />
          </div>
          <div className="text-[10px] font-mono text-muted-foreground">
            reversehub.ai · live
          </div>
        </div>

        {/* Central AI core + orbits */}
        <div className="relative mt-4 h-[62%]">
          <ConnectionLines />

          {/* Suppliers */}
          {SUPPLIERS.map((s, i) => {
            const rad = (s.angle * Math.PI) / 180;
            const rx = 38;
            const ry = 40;
            const left = 50 + Math.cos(rad) * rx;
            const top = 50 + Math.sin(rad) * ry;
            return (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.12, duration: 0.5 }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
                  className="glass rounded-2xl px-2.5 py-1.5 flex items-center gap-2 shadow-lg shadow-primary/10"
                >
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-[10px] font-semibold text-primary-foreground">
                    {s.name[0]}
                  </div>
                  <div className="leading-tight">
                    <div className="text-[10px] font-semibold">{s.name}</div>
                    <div className="text-[9px] text-muted-foreground">★ {(s.score / 20).toFixed(1)} · 2m</div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}

          {/* AI Core */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative h-28 w-28">
              {/* pulse */}
              <motion.div
                animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-full bg-primary/30"
              />
              <motion.div
                animate={{ scale: [1, 1.6, 1], opacity: [0.35, 0, 0.35] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
                className="absolute inset-0 rounded-full bg-accent/30"
              />
              {/* rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-1 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, var(--primary) 80%, transparent) 90deg, transparent 180deg, color-mix(in oklab, var(--accent) 80%, transparent) 270deg, transparent 360deg)",
                  mask: "radial-gradient(closest-side, transparent 68%, black 70%)",
                  WebkitMask: "radial-gradient(closest-side, transparent 68%, black 70%)",
                }}
              />
              {/* core */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary via-primary to-accent grid place-items-center shadow-[0_0_40px_-4px_color-mix(in_oklab,var(--primary)_70%,transparent)]">
                <Cpu className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom panel: stage + AI matching bar */}
        <div className="mt-3 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xl p-3">
          <div className="flex items-center justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-2 text-xs font-medium"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                {STAGES[stage].label}
              </motion.div>
            </AnimatePresence>
            <div className="text-[10px] font-mono text-muted-foreground">
              {String(stage + 1).padStart(2, "0")} / {STAGES.length}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                animate={{ width: `${confidence}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-primary to-accent"
              />
            </div>
            <div className="text-[11px] font-mono tabular-nums text-accent">
              {confidence}%
            </div>
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            AI matching · analyzing 8,400 suppliers
          </div>
        </div>

        {/* Live notification toast */}
        <div className="absolute top-14 right-4 w-52 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={notif}
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="glass rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg shadow-primary/10"
            >
              <div
                className={`h-6 w-6 rounded-lg grid place-items-center ${
                  current.tone === "primary"
                    ? "bg-primary/15 text-primary"
                    : "bg-accent/20 text-accent"
                }`}
              >
                <current.icon className="h-3.5 w-3.5" />
              </div>
              <div className="text-[11px] font-medium truncate">{current.text}</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ConnectionLines() {
  // Curves from AI core (center) to each supplier position (approx)
  const paths = [
    "M 50 50 Q 30 20 15 12",
    "M 50 50 Q 70 25 88 15",
    "M 50 50 Q 78 60 92 78",
    "M 50 50 Q 22 60 8 82",
  ];
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      fill="none"
    >
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.7 0.15 160)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="oklch(0.82 0.14 85)" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      {paths.map((d, i) => (
        <g key={i}>
          <path d={d} stroke="url(#lineGrad)" strokeWidth="0.35" vectorEffect="non-scaling-stroke" />
          <motion.circle
            r="0.7"
            fill="oklch(0.85 0.15 120)"
            initial={{ offsetDistance: "0%" }}
            animate={{ offsetDistance: "100%" }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
            style={{ offsetPath: `path("${d}")`, offsetRotate: "0deg" } as React.CSSProperties}
          />
        </g>
      ))}
    </svg>
  );
}