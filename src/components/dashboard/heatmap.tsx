import { motion } from "framer-motion";

export function ActivityHeatmap({ data }: { data: { i: number; v: number }[] }) {
  const max = Math.max(...data.map((d) => d.v));
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5">
        {data.map((d, idx) => {
          const intensity = d.v / max;
          return (
            <motion.div
              key={d.i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.015 }}
              className="aspect-square rounded-md border border-border/40"
              style={{
                background: `color-mix(in oklab, var(--color-primary) ${Math.round(intensity * 85)}%, transparent)`,
              }}
              title={`${d.v} leads`}
            />
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>4 weeks ago</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          {[0.15, 0.35, 0.55, 0.75, 0.95].map((v) => (
            <span key={v} className="h-2.5 w-2.5 rounded-sm border border-border/40" style={{ background: `color-mix(in oklab, var(--color-primary) ${v * 100}%, transparent)` }} />
          ))}
          <span>More</span>
        </div>
        <span>today</span>
      </div>
    </div>
  );
}