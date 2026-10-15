import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

export function AnimatedStat({
  value,
  suffix = "",
  label,
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  label: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) =>
    v.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
  );

  useEffect(() => {
    if (inView) {
      const controls = animate(mv, value, { duration: 1.8, ease: "easeOut" });
      return controls.stop;
    }
  }, [inView, mv, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight gradient-text tabular-nums whitespace-nowrap">
        <motion.span>{rounded}</motion.span>
        {suffix}
      </div>
      <div className="mt-2 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}