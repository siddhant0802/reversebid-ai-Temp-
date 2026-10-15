import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, type Variants } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight, Sparkles, PlayCircle, ShieldCheck, Zap, MessageSquare,
  BarChart3, FileSearch, Handshake, ScanEye, ClipboardList, Send,
  Package, FileText, CreditCard, Bell,
  CheckCircle2, Cpu, Users, Star, X, Check, Award, TrendingUp,
  Factory, HardHat, Stethoscope, ShoppingBag, GraduationCap, Cpu as CpuIcon,
  Twitter, Github, Linkedin, Youtube, Mail, Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/brand/logo";
import { AnimatedBg } from "@/components/landing/animated-bg";
import { LogosMarquee } from "@/components/landing/marquee";
import { AnimatedStat } from "@/components/landing/animated-stat";
import { LandingNav } from "@/components/landing/nav";
import { FloatingCard } from "@/components/landing/floating-card";
import { WorkflowIllustration } from "@/components/landing/workflow-illustration";
import { HeroVisual } from "@/components/landing/hero-visual";
import { Magnetic } from "@/components/landing/magnetic";
import {
  AIParserShowcase,
  ProcurementWorkflow,
  AIQuoteComparison,
  LiveInsights,
  CursorGlow,
} from "@/components/landing/premium-sections";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "ReverseHub AI — AI-Powered Reverse Procurement Marketplace" },
      { name: "description", content: "Post requirements. Suppliers compete. AI finds the best deal. The modern AI procurement platform trusted by enterprise teams." },
      { property: "og:title", content: "ReverseHub AI — AI Procurement, Reimagined" },
      { property: "og:description", content: "Buyers post. Sellers compete. AI ranks. Cut procurement costs by up to 42%." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const steps = [
  { icon: ClipboardList, title: "Buyer Posts Requirement", desc: "Write naturally or drop an RFP PDF. No forms to fight." },
  { icon: ScanEye, title: "AI Extracts Details", desc: "Category, quantity, budget, timeline — auto-structured." },
  { icon: Send, title: "Matching Suppliers Notified", desc: "Verified sellers get ranked, targeted opportunities." },
  { icon: FileText, title: "Suppliers Submit Quotes", desc: "Pricing, delivery, warranty and terms — apples-to-apples." },
  { icon: BarChart3, title: "AI Compares Offers", desc: "Weighted scoring with risk & anomaly detection." },
  { icon: Handshake, title: "Buyer Selects Winner", desc: "One click to award, contract and kick off the order." },
];

const features = [
  { icon: Sparkles, title: "AI Requirement Parser", desc: "Turn a sentence into a structured RFQ in seconds." },
  { icon: Users, title: "Supplier Matching", desc: "Semantic matching across 8,400+ verified vendors." },
  { icon: BarChart3, title: "AI Quote Ranking", desc: "Weighted scoring: price, delivery, quality, risk." },
  { icon: ScanEye, title: "Fraud Detection", desc: "Anomaly signals flag suspicious bids automatically." },
  { icon: MessageSquare, title: "Negotiation Assistant", desc: "AI drafts counter-offers with 78% acceptance." },
  { icon: Zap, title: "Real-Time Messaging", desc: "Chat, share files, and quotes without leaving the deal." },
  { icon: TrendingUp, title: "Smart Analytics", desc: "Spend, savings, cycle time — all live, all explainable." },
  { icon: FileText, title: "Purchase Reports", desc: "Board-ready reports auto-generated per RFQ." },
  { icon: ShieldCheck, title: "Document Verification", desc: "KYC, GST, ISO — verified once, trusted always." },
  { icon: CreditCard, title: "Secure Payments", desc: "Escrow-ready workflows with full audit trails." },
];

const industries = [
  { icon: Factory, label: "Manufacturing" },
  { icon: HardHat, label: "Construction" },
  { icon: Stethoscope, label: "Healthcare" },
  { icon: ShoppingBag, label: "Retail" },
  { icon: GraduationCap, label: "Education" },
  { icon: CpuIcon, label: "Technology" },
];

const parsedFields = [
  { k: "Category", v: "Office Furniture › Seating" },
  { k: "Quantity", v: "150 units" },
  { k: "Budget", v: "₹5,25,000 (≤ ₹3,500 / unit)" },
  { k: "Delivery", v: "Pune, IN · 10 days" },
  { k: "Suppliers Matched", v: "24 verified" },
  { k: "Confidence", v: "98%" },
];

const suppliers = [
  { name: "ErgoWorks Pvt Ltd", rating: 4.9, price: "₹4,68,000", delivery: "8 days", warranty: "5 years", ai: 96, risk: "Low", badges: ["Recommended", "Best Value"], best: true },
  { name: "Nord Furniture Co", rating: 4.7, price: "₹4,92,000", delivery: "10 days", warranty: "3 years", ai: 91, risk: "Low", badges: [], best: false },
  { name: "SeatSmart India", rating: 4.5, price: "₹5,10,000", delivery: "12 days", warranty: "2 years", ai: 84, risk: "Medium", badges: [], best: false },
];

const testimonials = [
  { name: "Priya Nair", role: "Procurement Manager", company: "Meridian Manufacturing", quote: "We cut sourcing cycles from 3 weeks to 2 days. The AI ranking alone saved us ₹40L last quarter." , rating: 5 },
  { name: "Rahul Verma", role: "Head of Operations", company: "Skyline Construction", quote: "Suppliers actually compete for us now. Every RFQ gets 8-12 quotes within hours." , rating: 5 },
  { name: "Anita Sharma", role: "Operations Director", company: "Bharat Textiles", quote: "ReverseHub's fraud detection flagged two shady bids that would have cost us dearly. Priceless." , rating: 5 },
  { name: "Vikram Desai", role: "CFO", company: "Astra Foods", quote: "Board-ready procurement reports, generated automatically. My auditors love it." , rating: 5 },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    tagline: "For small teams testing the waters",
    features: ["Up to 5 RFQs / month", "AI requirement parser", "Basic quote comparison", "Email support"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "₹9,999",
    period: "/ mo",
    tagline: "Growing procurement teams",
    features: ["Unlimited RFQs", "AI quote ranking + negotiation", "Fraud detection", "Analytics dashboard", "Priority support"],
    cta: "Start 14-day trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    tagline: "SOC2 · SSO · dedicated CSM",
    features: ["Everything in Professional", "SSO + role-based access", "Custom AI workflows", "SLA + dedicated CSM", "ERP integrations"],
    cta: "Talk to sales",
    highlighted: false,
  },
];

function Landing() {
  return (
    <div className="relative overflow-hidden [scroll-behavior:smooth]">
      <CursorGlow />
      <LandingNav />
      <HeroSection />
      <MetricsSection />
      <TrustSection />
      <HowItWorksSection />
      <FeaturesBento />
      <AIParserShowcase />
      <ProcurementWorkflow />
      <AIQuoteComparison />
      <LiveInsights />
      <AIShowcaseSection />
      <QuoteComparisonSection />
      <VersusSection />
      <TestimonialsSection />
      <PricingSection />
      <FinalCTA />
      <FooterSection />
    </div>
  );
}

/* ---------------- HERO ---------------- */
function HeroSection() {
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: "easeOut" } },
  };
  return (
    <section className="relative overflow-hidden pt-16 pb-32">
      <AnimatedBg parallax />
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.div variants={item} className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md px-3 py-1 text-xs text-primary">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              AI Copilot v2 · Now in early access
            </motion.div>
            <motion.h1 variants={item} className="mt-6 font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight">
              Buyers Post Requirements. <br />
              Suppliers Compete.{" "}
              <span className="gradient-text">AI Finds the Best Deal.</span>
            </motion.h1>
            <motion.p variants={item} className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
              The modern AI-powered procurement platform where businesses receive
              competitive quotations instead of searching endlessly. Save time,
              reduce costs, and make smarter purchasing decisions.
            </motion.p>

            <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
              <Magnetic>
                <Button
                  asChild
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/60 transition-all"
                >
                  <Link to="/app">
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative flex items-center">
                      Start Free
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                </Button>
              </Magnetic>
              <Magnetic strength={0.25}>
                <Button asChild size="lg" variant="outline" className="group border-border/60 backdrop-blur-md bg-card/30 hover:bg-card/60">
                  <Link to="/app">
                    <PlayCircle className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" /> Watch Demo
                  </Link>
                </Button>
              </Magnetic>
            </motion.div>

            <motion.div variants={item} className="mt-8 inline-flex items-center gap-3 rounded-full border border-border/60 bg-card/30 backdrop-blur-md px-3 py-1.5">
              <div className="flex text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + i * 0.08, duration: 0.35 }}
                  >
                    <Star className="h-3.5 w-3.5 fill-current" />
                  </motion.span>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                Trusted by <span className="text-foreground font-medium">8,400+</span> modern procurement teams
              </div>
            </motion.div>

            <motion.div variants={item} className="mt-10 grid grid-cols-3 gap-6 max-w-lg">
              {[
                { v: 3.2, s: "x", l: "Faster sourcing", d: 1 },
                { v: 42, s: "%", l: "Avg savings", d: 0 },
                { v: 72, s: "h", l: "Avg RFQ close", d: 0 },
              ].map((s) => (
                <AnimatedStat
                  key={s.l}
                  value={s.v}
                  suffix={s.s}
                  label={s.l}
                  decimals={s.d}
                />
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
            className="relative"
          >
            <HeroVisual />

            {/* Floating RFQ cards */}
            <div className="absolute -left-10 -top-6 w-52 hidden md:block">
              <FloatingCard delay={0.6} duration={7}>
                <div className="text-[11px] text-muted-foreground">RFQ · Live</div>
                <div className="mt-1 text-sm font-semibold">Need 120 Laptops</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Budget ₹54,00,000
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-primary">
                  <CheckCircle2 className="h-3 w-3" /> 12 quotes incoming
                </div>
              </FloatingCard>
            </div>

            <div className="absolute -right-8 top-1/3 w-56 hidden lg:block">
              <FloatingCard delay={1.0} duration={8}>
                <div className="flex items-center gap-1.5 text-[11px] text-accent">
                  <Sparkles className="h-3 w-3" /> AI Match
                </div>
                <div className="mt-1 text-sm font-semibold">Office Furniture</div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Match Score</span>
                  <span className="text-accent font-semibold">98%</span>
                </div>
                <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "98%" }}
                    transition={{ duration: 1.4, delay: 1.4 }}
                    className="h-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>
              </FloatingCard>
            </div>

            <div className="absolute -left-6 -bottom-6 w-56 hidden md:block">
              <FloatingCard delay={1.3} duration={9}>
                <div className="flex items-center gap-1.5 text-[11px] text-primary">
                  <ShieldCheck className="h-3 w-3" /> CCTV Installation
                </div>
                <div className="mt-1 text-sm font-semibold">8 Verified Suppliers</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Response in under 2 min
                </div>
              </FloatingCard>
            </div>

            <div className="absolute right-2 -bottom-10 w-52 hidden xl:block">
              <FloatingCard delay={1.6} duration={10}>
                <div className="text-[11px] text-muted-foreground">Medical Equipment</div>
                <div className="mt-1 text-sm font-semibold">17 quotes received</div>
                <div className="mt-1 text-xs text-muted-foreground">Delivery · 12 days</div>
              </FloatingCard>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- METRICS ---------------- */
function MetricsSection() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 -mt-12">
      <div className="glass rounded-3xl p-8 md:p-10 shadow-2xl shadow-primary/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <AnimatedStat value={2450} suffix="+" label="Total RFQs" />
          <AnimatedStat value={8200} suffix="+" label="Verified Suppliers" />
          <AnimatedStat value={56000} suffix="+" label="Quotes Generated" />
          <div className="text-center">
            <div className="font-display text-4xl md:text-5xl font-bold gradient-text tabular-nums">
              ₹12.4 Cr
            </div>
            <div className="mt-2 text-sm text-muted-foreground">Money Saved</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- TRUST ---------------- */
function TrustSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
        Powering procurement across industries
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {industries.map((i, idx) => (
          <motion.div
            key={i.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card/30 backdrop-blur-md py-6 grayscale hover:grayscale-0 hover:border-primary/40 hover:bg-card/60 transition-all"
          >
            <i.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
            <div className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {i.label}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-12">
        <LogosMarquee />
      </div>
    </section>
  );
}

/* ---------------- HOW IT WORKS ---------------- */
function HowItWorksSection() {
  return (
    <section id="how" className="relative mx-auto max-w-7xl px-6 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <Badge className="rounded-full bg-primary/10 text-primary border border-primary/30">
          How It Works
        </Badge>
        <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
          From requirement to signed deal in{" "}
          <span className="gradient-text">six intelligent steps</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          A reverse marketplace, orchestrated end-to-end by AI. No endless scrolling.
        </p>
      </div>

      <div className="relative mt-16">
        {/* connecting line */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent" />

        <div className="space-y-8">
          {steps.map((s, i) => {
            const left = i % 2 === 0;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
                className={`grid lg:grid-cols-2 gap-6 items-center ${
                  left ? "" : "lg:[&>*:first-child]:order-2"
                }`}
              >
                <div className={`glass rounded-3xl p-6 hover:border-primary/40 transition-all group ${left ? "lg:mr-8" : "lg:ml-8"}`}>
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent grid place-items-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                        <s.icon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border border-border grid place-items-center text-[10px] font-mono">
                        {i + 1}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">
                        Step {i + 1}
                      </div>
                      <div className="mt-1 text-xl font-semibold">{s.title}</div>
                      <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FEATURES BENTO ---------------- */
function FeaturesBento() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <Badge className="rounded-full bg-accent/15 text-accent border border-accent/30">
          Platform
        </Badge>
        <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
          Everything procurement teams need,{" "}
          <span className="gradient-text">packaged.</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Source, negotiate, close, pay and analyze — all in one intelligent workspace.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(180px,auto)] gap-4">
        {features.map((f, i) => {
          // Bento sizing pattern
          const span =
            i === 0
              ? "lg:col-span-2 lg:row-span-2"
              : i === 3
              ? "lg:col-span-2"
              : i === 6
              ? "lg:col-span-2"
              : "";
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.05 }}
              className={`group relative overflow-hidden rounded-3xl border border-border/60 bg-card/40 backdrop-blur-xl p-6 hover:bg-card/70 hover:border-primary/40 hover:-translate-y-1 transition-all ${span}`}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
              </div>
              <div className="relative">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary/25 to-accent/20 border border-primary/20 grid place-items-center group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-5 text-lg font-semibold">{f.title}</div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
                {i === 0 && (
                  <div className="mt-6 rounded-xl border border-border/60 bg-background/40 p-4 text-xs font-mono text-muted-foreground">
                    <div className="text-primary">▸ input</div>
                    <div className="mt-1">"Need 100 chairs under ₹3,500 in Pune"</div>
                    <div className="mt-2 text-accent">▸ parsed</div>
                    <div className="mt-1">
                      Category · Qty · Budget · Location · Deadline
                    </div>
                  </div>
                )}
                <button className="mt-4 inline-flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- AI SHOWCASE ---------------- */
function AIShowcaseSection() {
  const prompt =
    "I need 150 office chairs under ₹3,500 each delivered to Pune in 10 days.";
  const [typed, setTyped] = useState("");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(prompt.slice(0, i));
      if (i >= prompt.length) {
        clearInterval(id);
        setTimeout(() => setShowResults(true), 500);
      }
    }, 35);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="solutions" className="mx-auto max-w-7xl px-6 py-24">
      <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-primary/10 via-card/60 to-accent/10 p-8 md:p-14">
        <div className="absolute inset-0 gradient-mesh opacity-40" />
        <div
          className="absolute -top-40 -right-40 h-96 w-96 rounded-full aurora opacity-40"
          style={{ animation: "aurora-drift 20s ease-in-out infinite" }}
        />

        <div className="relative grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge className="rounded-full bg-background/60 border border-primary/30 text-primary">
              <Sparkles className="mr-1.5 h-3 w-3" /> AI Showcase
            </Badge>
            <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
              AI you can actually{" "}
              <span className="gradient-text">deploy on Monday.</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg">
              Type a requirement in plain English. Watch our AI parse it,
              understand it, and match verified suppliers instantly.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                "AI Requirement Parser",
                "AI Quote Ranking",
                "Best-Value Recommender",
                "Scam Detection",
                "Negotiation Suggestions",
                "Budget Prediction",
                "Supplier Recommender",
                "Procurement Insights",
              ].map((t) => (
                <div key={t} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" /> {t}
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground font-mono">
                AI Parser · Live
              </div>
              <div className="flex items-center gap-1 text-[10px] text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Thinking
              </div>
            </div>
            <div className="mt-3 rounded-xl bg-muted/40 border border-border/60 p-4 text-sm min-h-[70px]">
              <FileSearch className="inline h-3.5 w-3.5 text-primary mr-1.5" />
              <span>"{typed}</span>
              <span className="inline-block w-1.5 h-4 bg-primary align-middle animate-pulse" />
              <span>"</span>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {parsedFields.map((f, i) => (
                <motion.div
                  key={f.k}
                  initial={{ opacity: 0, x: -8 }}
                  animate={showResults ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.12 }}
                  className="flex justify-between items-center border-b border-border/50 pb-1.5"
                >
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-primary" /> {f.k}
                  </span>
                  <span className="font-medium">{f.v}</span>
                </motion.div>
              ))}
            </div>
            <Button className="mt-5 w-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30">
              Post this RFQ <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- QUOTE COMPARISON ---------------- */
function QuoteComparisonSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <Badge className="rounded-full bg-primary/10 text-primary border border-primary/30">
          Quote Comparison
        </Badge>
        <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
          Every quote ranked, scored and{" "}
          <span className="gradient-text">stress-tested by AI.</span>
        </h2>
      </div>

      <div className="mt-14 grid md:grid-cols-3 gap-4">
        {suppliers.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`relative rounded-3xl p-6 backdrop-blur-xl transition-all hover:-translate-y-1 ${
              s.best
                ? "glass border-primary/50 glow-ring"
                : "border border-border/60 bg-card/40"
            }`}
          >
            {s.badges.length > 0 && (
              <div className="absolute -top-3 left-6 flex gap-2">
                {s.badges.map((b) => (
                  <span
                    key={b}
                    className="rounded-full bg-gradient-to-r from-primary to-accent px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-md"
                  >
                    {b}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-lg">{s.name}</div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-accent text-accent" /> {s.rating}
                </div>
              </div>
              {s.best && (
                <Award className="h-6 w-6 text-accent drop-shadow-[0_0_8px_color-mix(in_oklab,var(--accent)_60%,transparent)]" />
              )}
            </div>
            <div className="mt-5 text-3xl font-semibold tabular-nums">
              {s.price}
            </div>
            <div className="mt-5 space-y-2.5 text-sm">
              <Row k="Delivery" v={s.delivery} />
              <Row k="Warranty" v={s.warranty} />
              <Row
                k="Risk"
                v={
                  <span
                    className={
                      s.risk === "Low" ? "text-primary" : "text-accent"
                    }
                  >
                    {s.risk}
                  </span>
                }
              />
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">AI Score</span>
                  <span className="font-semibold">{s.ai}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${s.ai}%` }}
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
            </div>
            <Button
              variant={s.best ? "default" : "outline"}
              className={`mt-6 w-full ${
                s.best
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                  : ""
              }`}
            >
              {s.best ? "Award Deal" : "View Quote"}
            </Button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex justify-between border-b border-border/40 pb-1.5">
      <span className="text-muted-foreground">{k}</span>
      <span>{v}</span>
    </div>
  );
}

/* ---------------- VERSUS ---------------- */
function VersusSection() {
  const traditional = [
    "Buyer searches endlessly through catalogs",
    "Limited to visible listings",
    "Hidden or inconsistent pricing",
    "Manual quote comparison in spreadsheets",
    "No fraud or risk signal",
  ];
  const reversehub = [
    "Buyer posts once, in plain English",
    "Suppliers actively compete to win the deal",
    "Transparent, apples-to-apples pricing",
    "AI ranks by best value, not lowest price",
    "Automated fraud + anomaly detection",
  ];
  return (
    <section id="enterprise" className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <Badge className="rounded-full bg-accent/15 text-accent border border-accent/30">
          Why Reverse Marketplace
        </Badge>
        <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
          Stop searching. <span className="gradient-text">Start receiving.</span>
        </h2>
      </div>
      <div className="mt-14 grid md:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-border/60 bg-card/30 p-8 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-destructive/15 grid place-items-center">
              <X className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">The old way</div>
              <div className="font-semibold">Traditional Marketplace</div>
            </div>
          </div>
          <ul className="space-y-3">
            {traditional.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <X className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <span className="line-through decoration-destructive/30">{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl glass p-8 glow-ring"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center shadow-lg shadow-primary/40">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">The new way</div>
              <div className="font-semibold">ReverseHub AI</div>
            </div>
          </div>
          <ul className="space-y-3">
            {reversehub.map((t, i) => (
              <motion.li
                key={t}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.15 + i * 0.08 }}
                className="flex items-start gap-2.5 text-sm"
              >
                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>{t}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- TESTIMONIALS ---------------- */
function TestimonialsSection() {
  return (
    <section id="resources" className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <Badge className="rounded-full bg-primary/10 text-primary border border-primary/30">
          Loved by Procurement Teams
        </Badge>
        <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
          Teams shipping{" "}
          <span className="gradient-text">smarter procurement.</span>
        </h2>
      </div>
      <div className="mt-14 grid md:grid-cols-2 gap-4">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}
            className="glass rounded-3xl p-8 hover:border-primary/40 transition-all group"
          >
            <Quote className="h-6 w-6 text-primary/60 mb-3 group-hover:text-primary transition-colors" />
            <p className="text-lg leading-relaxed">{t.quote}</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-primary-foreground font-semibold text-sm">
                {t.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">
                  {t.role} · {t.company}
                </div>
              </div>
              <div className="flex text-accent">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- PRICING ---------------- */
function PricingSection() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <Badge className="rounded-full bg-accent/15 text-accent border border-accent/30">
          Pricing
        </Badge>
        <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
          Simple pricing. <span className="gradient-text">Serious value.</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Free for buyers · Suppliers pay only on won deals · No lock-in.
        </p>
      </div>

      <div className="mt-14 grid md:grid-cols-3 gap-5 items-stretch">
        {pricingPlans.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`relative rounded-3xl p-8 backdrop-blur-xl transition-all hover:-translate-y-1 flex flex-col ${
              p.highlighted
                ? "glass glow-ring border-primary/50 md:scale-105"
                : "border border-border/60 bg-card/40"
            }`}
          >
            {p.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-[10px] font-semibold text-primary-foreground shadow-md">
                MOST POPULAR
              </div>
            )}
            <div className="text-sm font-medium text-muted-foreground">
              {p.name}
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-4xl font-semibold">
                {p.price}
              </span>
              {p.period && (
                <span className="text-sm text-muted-foreground">{p.period}</span>
              )}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{p.tagline}</div>
            <ul className="mt-6 space-y-3 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              asChild
              className={`mt-8 w-full ${
                p.highlighted
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30"
                  : ""
              }`}
              variant={p.highlighted ? "default" : "outline"}
            >
              <Link to="/app">{p.cta}</Link>
            </Button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- FINAL CTA ---------------- */
function FinalCTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-border/60 p-12 md:p-20 text-center">
        <div className="absolute inset-0 gradient-mesh" />
        <div
          className="absolute -inset-40 aurora opacity-60"
          style={{ animation: "aurora-drift 25s ease-in-out infinite" }}
        />
        <div className="absolute inset-0 bg-background/40 backdrop-blur-xl" />
        <div className="relative">
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">
            Ready to <span className="gradient-text">transform procurement?</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
            Join 8,400+ procurement teams using AI to source smarter, negotiate
            harder, and close faster.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/40 hover:shadow-primary/60 hover:scale-[1.02] transition-all"
            >
              <Link to="/app">
                Start Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="backdrop-blur-md bg-card/40">
              Schedule Demo
            </Button>
          </div>
          <div className="mt-8 flex justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> SOC2 in progress
            </span>
            <span className="flex items-center gap-1">
              <Cpu className="h-3.5 w-3.5" /> AI Copilot included
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> 8,400+ suppliers
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FOOTER ---------------- */
function FooterSection() {
  const cols = [
    { title: "Company", links: ["About", "Careers", "Press", "Partners"] },
    { title: "Resources", links: ["Blog", "Case Studies", "Help Center", "Webinars"] },
    { title: "Developers", links: ["API", "Docs", "Changelog", "Status"] },
    { title: "Support", links: ["Contact", "Community", "Security", "Trust"] },
    { title: "Legal", links: ["Privacy", "Terms", "DPA", "Cookies"] },
  ];
  return (
    <footer className="border-t border-border/60 bg-card/20 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid lg:grid-cols-[1.4fr_repeat(5,1fr)] gap-10">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              The AI-powered reverse marketplace where suppliers compete for your business.
            </p>
            <div className="mt-5 flex gap-2">
              {[Twitter, Linkedin, Github, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-9 w-9 rounded-xl border border-border/60 grid place-items-center text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/10 transition-all"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <div className="mt-6">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Newsletter
              </div>
              <form className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="you@work.com"
                    className="pl-9 bg-background/40 border-border/60"
                  />
                </div>
                <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-sm font-semibold mb-4">{c.title}</div>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 pt-8 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>© 2026 ReverseHub AI · Built for procurement teams that ship.</div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> SOC2 · GDPR · ISO 27001
            </span>
            <span className="flex items-center gap-1">
              <Bell className="h-3 w-3" /> All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
