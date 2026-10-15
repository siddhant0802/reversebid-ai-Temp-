import { motion, useMotionValue, useTransform, animate, useInView, type Variants } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Sparkles, ScanEye, Send, FileText, BarChart3, Handshake, ClipboardList,
  Package, Wallet, MapPin, Calendar, Tag, Building2, Cpu, Check,
  Award, Star, ShieldCheck, TrendingUp, Zap, Users, Percent, Timer,
  ArrowRight,
} from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ============================================================
   Shared bits
============================================================ */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: "easeOut" } },
};

function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) =>
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-IN"),
  );
  const [display, setDisplay] = useState("0");
  useEffect(() => rounded.on("change", setDisplay), [rounded]);
  useEffect(() => {
    if (inView) {
      const c = animate(mv, value, { duration: 1.6, ease: "easeOut" });
      return c.stop;
    }
  }, [inView, mv, value]);
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

function CircularProgress({ value, size = 96 }: { value: number; size?: number }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const offset = useTransform(mv, (v) => c - (v / 100) * c);
  const [pct, setPct] = useState(0);
  useEffect(() => mv.on("change", (v) => setPct(Math.round(v))), [mv]);
  useEffect(() => {
    if (inView) {
      const a = animate(mv, value, { duration: 1.6, ease: "easeOut" });
      return a.stop;
    }
  }, [inView, mv, value]);
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg ref={ref} width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="cp-grad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="color-mix(in oklab, var(--foreground) 10%, transparent)"
          strokeWidth={6}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#cp-grad)"
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          style={{ strokeDashoffset: offset }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-2xl font-semibold gradient-text tabular-nums">{pct}%</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Confidence
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   1. AI REQUIREMENT PARSER SHOWCASE
============================================================ */

const PROMPT =
  "I need 100 Dell laptops under ₹55,000 each delivered to Pune within 12 days.";

const EXTRACTED = [
  { icon: Package, label: "Product", value: "Dell Laptop", tone: "primary" as const },
  { icon: Cpu, label: "Quantity", value: "100 Units", tone: "accent" as const },
  { icon: Wallet, label: "Budget", value: "₹55,00,000", tone: "primary" as const },
  { icon: Calendar, label: "Delivery", value: "12 Days", tone: "accent" as const },
  { icon: MapPin, label: "Location", value: "Pune", tone: "primary" as const },
  { icon: Tag, label: "Category", value: "Electronics", tone: "accent" as const },
  { icon: Building2, label: "Preferred Brand", value: "Dell", tone: "primary" as const },
];

export function AIParserShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-120px" });
  const [typed, setTyped] = useState("");
  const [processing, setProcessing] = useState(false);
  const [revealCount, setRevealCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(PROMPT.slice(0, i));
      if (i >= PROMPT.length) {
        clearInterval(id);
        setProcessing(true);
        setTimeout(() => {
          setProcessing(false);
          let n = 0;
          const step = setInterval(() => {
            n++;
            setRevealCount(n);
            if (n >= EXTRACTED.length) clearInterval(step);
          }, 180);
        }, 1400);
      }
    }, 32);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <section ref={sectionRef} className="relative mx-auto max-w-7xl px-6 py-28">
      <div className="text-center max-w-3xl mx-auto">
        <Badge className="rounded-full bg-primary/10 text-primary border border-primary/30">
          <Sparkles className="mr-1.5 h-3 w-3" /> AI Requirement Parser
        </Badge>
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-4 font-display text-4xl md:text-5xl font-semibold tracking-tight"
        >
          Turn natural language into{" "}
          <span className="gradient-text">structured procurement requests</span>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-4 text-muted-foreground"
        >
          Simply describe what you need. Our AI extracts quantities, budgets,
          delivery timelines, product categories and supplier requirements — in seconds.
        </motion.p>
      </div>

      <div className="mt-14 grid lg:grid-cols-[1.05fr_1fr] gap-8 items-start">
        {/* LEFT — Prompt + extraction list */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="glass relative rounded-3xl p-6 md:p-8 shadow-2xl shadow-primary/10 glow-ring"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-destructive/70" />
              <span className="h-2 w-2 rounded-full bg-accent/70" />
              <span className="h-2 w-2 rounded-full bg-primary/70" />
              <span className="ml-2">reversehub.ai / parser</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-primary">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              Live
            </div>
          </div>

          <div className="relative mt-5 rounded-2xl border border-border/60 bg-background/50 p-5 min-h-[110px]">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
              Buyer prompt
            </div>
            <div className="text-base md:text-lg leading-relaxed font-medium">
              {typed}
              <span className="inline-block w-[2px] h-5 bg-primary align-middle animate-pulse ml-0.5" />
            </div>

            {processing && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary"
                />
                <div className="text-xs text-primary font-medium">
                  AI processing · scanning entities
                </div>
                <div className="ml-auto text-[10px] text-muted-foreground font-mono">
                  parser-v2
                </div>
                <motion.div
                  className="absolute inset-x-0 bottom-0 h-px overflow-hidden rounded-b-2xl"
                  aria-hidden
                >
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    className="h-px w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"
                  />
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* Extracted fields */}
          <div className="mt-6 grid sm:grid-cols-2 gap-2.5">
            {EXTRACTED.map((f, i) => {
              const shown = revealCount > i;
              return (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, x: -12, filter: "blur(4px)" }}
                  animate={shown ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="group relative flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 backdrop-blur-md p-3 hover:border-primary/40 hover:-translate-y-0.5 transition-all"
                >
                  <div
                    className={`h-9 w-9 shrink-0 rounded-lg grid place-items-center ${
                      f.tone === "primary"
                        ? "bg-primary/15 text-primary"
                        : "bg-accent/20 text-accent"
                    }`}
                  >
                    <f.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {f.label}
                    </div>
                    <div className="text-sm font-semibold truncate">{f.value}</div>
                  </div>
                  <Check className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  {shown && (
                    <motion.span
                      layoutId={`tick-${f.label}`}
                      className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Confidence */}
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md p-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                AI Confidence
              </div>
              <div className="mt-1 text-sm text-muted-foreground max-w-xs">
                All 7 fields extracted cleanly. Ready to post to 24 verified suppliers.
              </div>
            </div>
            <CircularProgress value={98} />
          </div>
        </motion.div>

        {/* RIGHT — Floating extraction cards with SVG connections */}
        <div className="relative h-[560px] hidden lg:block">
          <svg
            viewBox="0 0 400 560"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden
          >
            <defs>
              <linearGradient id="line-grad" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
                <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[
              "M 200,280 C 120,180 100,120 70,80",
              "M 200,280 C 300,180 320,140 340,90",
              "M 200,280 C 130,300 100,340 60,380",
              "M 200,280 C 300,320 320,360 350,420",
              "M 200,280 C 200,400 200,460 200,520",
            ].map((d, i) => (
              <motion.path
                key={i}
                d={d}
                stroke="url(#line-grad)"
                strokeWidth={1.2}
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, delay: 0.3 + i * 0.15, ease: "easeInOut" }}
              />
            ))}
          </svg>

          {/* Central AI node */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="relative h-24 w-24 rounded-3xl glass grid place-items-center glow-ring">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-3xl border border-primary/30"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent, color-mix(in oklab, var(--primary) 50%, transparent), transparent)",
                  mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                  WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                  padding: 1,
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                }}
              />
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-3 text-center text-xs font-mono text-muted-foreground">
              AI Parser Core
            </div>
          </motion.div>

          {/* Floating cards */}
          {[
            { top: "2%", left: "0%", icon: Package, label: "Product", value: "Dell Laptop", delay: 0.4 },
            { top: "2%", right: "0%", icon: Cpu, label: "Quantity", value: "100 Units", delay: 0.55 },
            { top: "55%", left: "0%", icon: Wallet, label: "Budget", value: "₹55,00,000", delay: 0.7 },
            { top: "62%", right: "0%", icon: Calendar, label: "Delivery", value: "12 Days", delay: 0.85 },
            { bottom: "0%", left: "50%", icon: MapPin, label: "Location", value: "Pune", delay: 1.0 },
          ].map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: c.delay }}
              style={{
                position: "absolute",
                top: c.top,
                bottom: c.bottom,
                left: c.left,
                right: c.right,
                transform: c.left === "50%" ? "translateX(-50%)" : undefined,
              }}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                className="glass rounded-2xl p-3.5 min-w-[150px] shadow-xl shadow-primary/10"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/25 to-accent/20 grid place-items-center">
                    <c.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {c.label}
                    </div>
                    <div className="text-sm font-semibold">{c.value}</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   2. PROCUREMENT WORKFLOW
============================================================ */

const WORKFLOW = [
  { icon: ClipboardList, title: "Buyer Creates RFQ", desc: "Describe once — plain text or PDF." },
  { icon: ScanEye, title: "AI Extracts Requirements", desc: "Structured fields in seconds." },
  { icon: Send, title: "Suppliers Receive Opportunity", desc: "Targeted, ranked, real-time." },
  { icon: FileText, title: "Suppliers Submit Quotes", desc: "Apples-to-apples, verified." },
  { icon: BarChart3, title: "AI Compares Suppliers", desc: "Weighted scoring + risk signals." },
  { icon: Handshake, title: "Buyer Selects Winner", desc: "One-click award and contract." },
];

export function ProcurementWorkflow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="workflow" ref={ref} className="relative mx-auto max-w-7xl px-6 py-28">
      <div className="text-center max-w-2xl mx-auto">
        <Badge className="rounded-full bg-accent/15 text-accent border border-accent/30">
          Workflow
        </Badge>
        <h2 className="mt-4 font-display text-4xl md:text-5xl font-semibold tracking-tight">
          Procurement, orchestrated{" "}
          <span className="gradient-text">end-to-end.</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Six intelligent steps replace weeks of back-and-forth.
        </p>
      </div>

      <div className="relative mt-16">
        {/* horizontal animated connector (desktop) */}
        <div className="hidden xl:block absolute left-0 right-0 top-12 h-px">
          <div className="relative h-full bg-gradient-to-r from-transparent via-border to-transparent">
            <motion.div
              initial={{ width: "0%" }}
              animate={inView ? { width: "100%" } : {}}
              transition={{ duration: 2.2, ease: "easeInOut" }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-accent to-primary"
            />
            <motion.span
              animate={{ left: ["0%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-1 h-2 w-2 rounded-full bg-primary shadow-[0_0_16px_var(--primary)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {WORKFLOW.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: "easeOut" }}
              className="group relative"
            >
              {/* step number bubble aligned with connector */}
              <div className="flex justify-center">
                <div className="relative h-24 w-24 rounded-full grid place-items-center">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/15 blur-xl opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="relative h-16 w-16 rounded-full glass grid place-items-center border border-primary/40 group-hover:scale-110 transition-transform">
                    <s.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="absolute -bottom-1 right-1 h-6 w-6 rounded-full bg-background border border-border grid place-items-center text-[10px] font-mono font-semibold">
                    {i + 1}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xl p-4 text-center group-hover:border-primary/40 group-hover:-translate-y-1 transition-all">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Step {i + 1}
                </div>
                <div className="mt-1 text-sm font-semibold">{s.title}</div>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
                <div className="mt-3 h-0.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, delay: 0.3 + i * 0.12 }}
                    className="h-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   3. AI QUOTE COMPARISON
============================================================ */

type CompareSupplier = {
  name: string;
  badge: string;
  badgeTone: "primary" | "accent" | "muted";
  price: number;
  delivery: string;
  rating: number;
  warranty: string;
  aiScore: number;
  risk: "Low" | "Medium" | "High";
  best: boolean;
  metrics: { price: number; delivery: number; warranty: number; trust: number; response: number; experience: number };
};

const COMPARE: CompareSupplier[] = [
  {
    name: "TechSupply Pvt Ltd",
    badge: "BEST VALUE",
    badgeTone: "primary",
    price: 52000,
    delivery: "7 Days",
    rating: 4.9,
    warranty: "3 Years",
    aiScore: 98,
    risk: "Low",
    best: true,
    metrics: { price: 90, delivery: 88, warranty: 95, trust: 96, response: 92, experience: 94 },
  },
  {
    name: "QuickTrade",
    badge: "FASTEST DELIVERY",
    badgeTone: "accent",
    price: 54500,
    delivery: "2 Days",
    rating: 4.8,
    warranty: "2 Years",
    aiScore: 94,
    risk: "Medium",
    best: false,
    metrics: { price: 78, delivery: 99, warranty: 78, trust: 88, response: 96, experience: 82 },
  },
  {
    name: "Budget Electronics",
    badge: "LOWEST PRICE",
    badgeTone: "muted",
    price: 49900,
    delivery: "14 Days",
    rating: 4.3,
    warranty: "1 Year",
    aiScore: 89,
    risk: "Medium",
    best: false,
    metrics: { price: 100, delivery: 62, warranty: 60, trust: 80, response: 78, experience: 74 },
  },
];

const RADAR_DATA = ["Price", "Delivery", "Warranty", "Trust", "Response", "Experience"].map((axis) => ({
  axis,
  TechSupply: COMPARE[0].metrics[axis.toLowerCase() as keyof CompareSupplier["metrics"]],
  QuickTrade: COMPARE[1].metrics[axis.toLowerCase() as keyof CompareSupplier["metrics"]],
  Budget: COMPARE[2].metrics[axis.toLowerCase() as keyof CompareSupplier["metrics"]],
}));

export function AIQuoteComparison() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-28">
      <div className="text-center max-w-2xl mx-auto">
        <Badge className="rounded-full bg-primary/10 text-primary border border-primary/30">
          <BarChart3 className="mr-1.5 h-3 w-3" /> Live Comparison
        </Badge>
        <h2 className="mt-4 font-display text-4xl md:text-5xl font-semibold tracking-tight">
          AI instantly compares{" "}
          <span className="gradient-text">every supplier.</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Weighted across price, delivery, warranty, trust and risk — with a
          human-readable recommendation.
        </p>
      </div>

      <div className="mt-14 grid lg:grid-cols-[1.15fr_1fr] gap-6 items-stretch">
        {/* Supplier cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {COMPARE.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className={`group relative flex flex-col rounded-3xl p-5 backdrop-blur-xl transition-all hover:-translate-y-1 ${
                s.best
                  ? "glass border-primary/50 glow-ring shadow-2xl shadow-primary/20"
                  : "border border-border/60 bg-card/40 hover:border-primary/40"
              }`}
            >
              {s.best && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-[10px] font-semibold text-primary-foreground shadow-lg shadow-primary/40 whitespace-nowrap"
                >
                  <Award className="h-3 w-3" /> RECOMMENDED BY AI
                </motion.div>
              )}

              <span
                className={`self-start rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                  s.badgeTone === "primary"
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : s.badgeTone === "accent"
                    ? "bg-accent/20 text-accent border border-accent/30"
                    : "bg-muted text-muted-foreground border border-border/60"
                }`}
              >
                {s.badge}
              </span>

              <div className="mt-3">
                <div className="text-base font-semibold leading-tight">{s.name}</div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-accent text-accent" /> {s.rating}
                </div>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-semibold gradient-text tabular-nums">
                  ₹<AnimatedNumber value={s.price} />
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <CompareRow icon={Timer} k="Delivery" v={s.delivery} />
                <CompareRow icon={ShieldCheck} k="Warranty" v={s.warranty} />
                <CompareRow
                  icon={Zap}
                  k="Risk"
                  v={
                    <span
                      className={
                        s.risk === "Low"
                          ? "text-primary font-medium"
                          : s.risk === "Medium"
                          ? "text-accent font-medium"
                          : "text-destructive font-medium"
                      }
                    >
                      {s.risk}
                    </span>
                  }
                />
              </div>

              <div className="mt-5">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">AI Score</span>
                  <span className="font-semibold">{s.aiScore}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${s.aiScore}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.3 + i * 0.1 }}
                    className={`h-full ${
                      s.best
                        ? "bg-gradient-to-r from-primary to-accent"
                        : "bg-muted-foreground/60"
                    }`}
                  />
                </div>
              </div>

              <Button
                variant={s.best ? "default" : "outline"}
                className={`mt-5 w-full ${
                  s.best
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30"
                    : ""
                }`}
                size="sm"
              >
                {s.best ? "Award Deal" : "View Quote"}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Radar chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass rounded-3xl p-6 flex flex-col"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Multi-axis comparison
              </div>
              <div className="mt-1 text-lg font-semibold">Supplier Radar</div>
            </div>
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>

          <div className="flex-1 min-h-[280px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={RADAR_DATA} outerRadius="75%">
                <PolarGrid stroke="color-mix(in oklab, var(--foreground) 12%, transparent)" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="TechSupply"
                  dataKey="TechSupply"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.35}
                  strokeWidth={2}
                />
                <Radar
                  name="QuickTrade"
                  dataKey="QuickTrade"
                  stroke="var(--accent)"
                  fill="var(--accent)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Radar
                  name="Budget"
                  dataKey="Budget"
                  stroke="var(--muted-foreground)"
                  fill="var(--muted-foreground)"
                  fillOpacity={0.12}
                  strokeWidth={1.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
            <LegendDot color="var(--primary)" label="TechSupply" />
            <LegendDot color="var(--accent)" label="QuickTrade" />
            <LegendDot color="var(--muted-foreground)" label="Budget" />
          </div>

          <div className="mt-4 rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs">
            <div className="flex items-center gap-1.5 text-primary font-semibold">
              <Sparkles className="h-3 w-3" /> AI Recommendation
            </div>
            <p className="mt-1 text-muted-foreground">
              <span className="text-foreground font-medium">TechSupply</span> wins
              on weighted score. Slightly higher price is offset by faster
              delivery, longer warranty and lowest risk.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CompareRow({ icon: Icon, k, v }: { icon: typeof Timer; k: string; v: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {k}
      </span>
      <span>{v}</span>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}

/* ============================================================
   4. LIVE PROCUREMENT INSIGHTS
============================================================ */

type Insight = {
  icon: typeof TrendingUp;
  tone: "primary" | "accent";
  title: string;
  value: ReactNode;
  desc: string;
};

function InsightCard({ i, delay }: { i: Insight; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay }}
      className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/40 backdrop-blur-xl p-6 hover:border-primary/40 hover:-translate-y-1 transition-all"
    >
      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/15 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative flex items-start gap-4">
        <div
          className={`h-11 w-11 rounded-2xl grid place-items-center shrink-0 ${
            i.tone === "primary"
              ? "bg-primary/15 text-primary"
              : "bg-accent/20 text-accent"
          }`}
        >
          <i.icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-sm text-muted-foreground leading-relaxed">
            {i.title}
          </div>
          <div className="mt-2 text-3xl font-semibold gradient-text">{i.value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{i.desc}</div>
        </div>
      </div>
    </motion.div>
  );
}

export function LiveInsights() {
  const insights: Insight[] = [
    {
      icon: TrendingUp,
      tone: "primary",
      title: "Supplier A is cheaper than market average by",
      value: <AnimatedNumber value={14} suffix="%" />,
      desc: "Based on last 30 days of comparable RFQs",
    },
    {
      icon: Wallet,
      tone: "accent",
      title: "Estimated savings on this deal",
      value: <>₹<AnimatedNumber value={340000} /></>,
      desc: "vs. list price across matched suppliers",
    },
    {
      icon: ShieldCheck,
      tone: "primary",
      title: "Delivery risk detected",
      value: <span className="text-primary">Low</span>,
      desc: "Cross-checked against 240 past shipments",
    },
    {
      icon: Users,
      tone: "accent",
      title: "Expected quotation count",
      value: <><AnimatedNumber value={12} /> <span className="text-lg text-muted-foreground">Suppliers</span></>,
      desc: "Live matches based on your requirement",
    },
    {
      icon: Star,
      tone: "primary",
      title: "Supplier reliability score",
      value: <AnimatedNumber value={97} suffix="%" />,
      desc: "Weighted trust across ratings and on-time %",
    },
    {
      icon: Percent,
      tone: "accent",
      title: "Budget optimization potential",
      value: <AnimatedNumber value={8} suffix="%" />,
      desc: "Suggested by AI counter-offer engine",
    },
  ];

  return (
    <section id="insights" className="relative mx-auto max-w-7xl px-6 py-28">
      <div className="text-center max-w-2xl mx-auto">
        <Badge className="rounded-full bg-accent/15 text-accent border border-accent/30">
          <Sparkles className="mr-1.5 h-3 w-3" /> Live AI Insights
        </Badge>
        <h2 className="mt-4 font-display text-4xl md:text-5xl font-semibold tracking-tight">
          Every decision, backed by{" "}
          <span className="gradient-text">explainable AI.</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Real-time insights so procurement teams act on data — not gut feel.
        </p>
      </div>

      <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((i, idx) => (
          <InsightCard key={idx} i={i} delay={idx * 0.08} />
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   CURSOR GLOW — page-wide micro-interaction
============================================================ */

export function CursorGlow() {
  const x = useMotionValue(-500);
  const y = useMotionValue(-500);
  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);
  const bg = useTransform([x, y], ([lx, ly]: number[]) =>
    `radial-gradient(320px circle at ${lx}px ${ly}px, color-mix(in oklab, var(--primary) 12%, transparent), transparent 65%)`,
  );
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 hidden md:block"
      style={{ background: bg, mixBlendMode: "screen" }}
    />
  );
}