import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function FloatingCard({
  children,
  className = "",
  delay = 0,
  duration = 6,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
        className="glass rounded-2xl p-4 shadow-2xl shadow-primary/20"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}