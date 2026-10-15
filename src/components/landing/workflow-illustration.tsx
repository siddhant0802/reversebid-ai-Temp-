import { motion } from "framer-motion";
import { FileText, Sparkles, Users, Send, BarChart3, CheckCircle2 } from "lucide-react";

const steps = [
  { icon: FileText, label: "Buyer submits RFQ", tone: "primary" },
  { icon: Sparkles, label: "AI analyzes requirements", tone: "accent" },
  { icon: Users, label: "Suppliers compete", tone: "primary" },
  { icon: Send, label: "Quotes arrive", tone: "accent" },
  { icon: BarChart3, label: "AI ranks best supplier", tone: "primary" },
  { icon: CheckCircle2, label: "Order completed", tone: "accent" },
];

export function WorkflowIllustration() {
  return (
    <div className="relative w-full">
      <div className="glass rounded-3xl p-6 shadow-2xl glow-ring">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-accent/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-primary/70" />
          </div>
          <div className="text-[11px] text-muted-foreground font-mono">
            reversehub.ai / live
          </div>
        </div>

        <div className="relative space-y-2.5">
          {steps.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
              className="relative flex items-center gap-3 rounded-2xl border border-border/60 bg-card/40 p-3 backdrop-blur-xl"
            >
              <div
                className={`h-9 w-9 rounded-xl grid place-items-center ${
                  s.tone === "primary"
                    ? "bg-primary/15 text-primary"
                    : "bg-accent/20 text-accent"
                }`}
              >
                <s.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{s.label}</div>
                <div className="mt-1 h-1 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.2, delay: 0.3 + i * 0.15 }}
                    className={`h-full ${
                      s.tone === "primary"
                        ? "bg-gradient-to-r from-primary to-primary/40"
                        : "bg-gradient-to-r from-accent to-accent/40"
                    }`}
                  />
                </div>
              </div>
              <div className="text-xs font-mono text-muted-foreground shrink-0">
                0{i + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}