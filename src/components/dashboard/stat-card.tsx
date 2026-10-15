import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { AnimatedCounter } from "./animated-counter";

type Tone = "primary" | "accent" | "success" | "warning";

const toneMap: Record<Tone, { blob: string; icon: string; stroke: string; grad: string }> = {
  primary: { blob: "from-primary/25 to-primary/0", icon: "text-primary", stroke: "var(--color-primary)", grad: "primary" },
  accent: { blob: "from-accent/25 to-accent/0", icon: "text-accent", stroke: "var(--color-accent)", grad: "accent" },
  success: { blob: "from-emerald-400/25 to-emerald-400/0", icon: "text-emerald-400", stroke: "rgb(52 211 153)", grad: "success" },
  warning: { blob: "from-amber-400/25 to-amber-400/0", icon: "text-amber-400", stroke: "rgb(251 191 36)", grad: "warning" },
};

export function StatCard({
  label, value, delta, deltaLabel, icon: Icon, tone = "primary", index = 0,
  animatedValue, prefix = "", suffix = "", decimals = 0, trend,
}: {
  label: string;
  value?: string;
  delta?: number;
  deltaLabel?: string;
  icon: LucideIcon;
  tone?: Tone;
  index?: number;
  animatedValue?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trend?: { i: number; v: number }[];
}) {
  const positive = (delta ?? 0) >= 0;
  const t = toneMap[tone];
  const gradId = `spark-${t.grad}-${label.replace(/\s+/g, "-")}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl p-5 hover:border-primary/40 hover:shadow-[0_20px_60px_-25px_color-mix(in_oklab,var(--color-primary)_45%,transparent)] transition-all"
    >
      <div className={`absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${t.blob} blur-2xl opacity-70`} />
      <div className="relative flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">
            {animatedValue !== undefined ? (
              <AnimatedCounter value={animatedValue} prefix={prefix} suffix={suffix} decimals={decimals} />
            ) : (
              <span className="tabular-nums">{value}</span>
            )}
          </div>
          {delta !== undefined && (
            <div className={`mt-2 inline-flex items-center gap-1 text-xs ${positive ? "text-emerald-400" : "text-rose-400"}`}>
              {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(delta)}% <span className="text-muted-foreground">{deltaLabel}</span>
            </div>
          )}
        </div>
        <div className={`h-9 w-9 rounded-lg grid place-items-center bg-gradient-to-br ${t.blob} ${t.icon}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {trend && (
        <div className="relative mt-3 -mx-1 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={t.stroke} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={t.stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={t.stroke} strokeWidth={1.75} fill={`url(#${gradId})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}