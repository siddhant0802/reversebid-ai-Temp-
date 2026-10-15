import { motion } from "framer-motion";
import { TrendingDown, ShieldCheck, Target, PiggyBank, Users, Star } from "lucide-react";

const iconMap = { trending: TrendingDown, shield: ShieldCheck, target: Target, piggy: PiggyBank, users: Users, star: Star } as const;

const toneMap = {
  primary: "from-primary/20 to-primary/0 text-primary border-primary/30",
  accent: "from-accent/20 to-accent/0 text-accent border-accent/30",
  success: "from-emerald-400/20 to-emerald-400/0 text-emerald-400 border-emerald-400/30",
} as const;

export function AiInsightCard({ icon, tone, title, body, index = 0 }: {
  icon: keyof typeof iconMap; tone: keyof typeof toneMap; title: string; body: string; index?: number;
}) {
  const Icon = iconMap[icon];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className={`group relative overflow-hidden rounded-xl border bg-card/60 backdrop-blur-xl p-4 transition ${toneMap[tone]}`}
    >
      <div className={`absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gradient-to-br ${toneMap[tone]} blur-2xl opacity-60`} />
      <div className="relative flex gap-3">
        <div className={`h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br ${toneMap[tone]} grid place-items-center border`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{body}</div>
        </div>
      </div>
    </motion.div>
  );
}