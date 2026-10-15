import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

export function AnimatedBg({ variant = "full", parallax = false }: { variant?: "full" | "soft"; parallax?: boolean }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 40, damping: 20, mass: 0.6 });
  const t1x = useTransform(sx, (v) => v * 30);
  const t1y = useTransform(sy, (v) => v * 30);
  const t2x = useTransform(sx, (v) => v * -22);
  const t2y = useTransform(sy, (v) => v * -22);
  const t3x = useTransform(sx, (v) => v * 14);
  const t3y = useTransform(sy, (v) => v * 14);

  useEffect(() => {
    if (!parallax) return;
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth) - 0.5);
      my.set((e.clientY / window.innerHeight) - 0.5);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [parallax, mx, my]);

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Aurora blobs */}
      <motion.div
        style={{ x: t1x, y: t1y }}
        className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full opacity-70"
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background: "radial-gradient(circle, color-mix(in oklab, var(--primary) 55%, transparent), transparent 60%)",
            animation: "blob-float 18s ease-in-out infinite",
            filter: "blur(60px)",
          }}
        />
      </motion.div>
      <motion.div
        style={{ x: t2x, y: t2y }}
        className="absolute top-20 -right-32 h-[480px] w-[480px] rounded-full opacity-60"
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background: "radial-gradient(circle, color-mix(in oklab, var(--accent) 55%, transparent), transparent 60%)",
            animation: "blob-float 22s ease-in-out infinite reverse",
            filter: "blur(70px)",
          }}
        />
      </motion.div>
      <motion.div
        style={{ x: t3x, y: t3y }}
        className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full opacity-50"
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background: "radial-gradient(circle, color-mix(in oklab, var(--primary) 45%, transparent), transparent 60%)",
            animation: "blob-float 26s ease-in-out infinite",
            filter: "blur(80px)",
          }}
        />
      </motion.div>

      {/* Grid */}
      <div className="absolute inset-0 grid-pattern opacity-60" />

      {/* Vignette bottom */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,var(--background))]" />

      {/* Particles */}
      {variant === "full" &&
        Array.from({ length: 22 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-primary/70 shadow-[0_0_10px_2px_color-mix(in_oklab,var(--primary)_60%,transparent)]"
            initial={{ x: `${(i * 37) % 100}%`, y: `${(i * 53) % 100}%`, opacity: 0 }}
            animate={{
              y: [`${(i * 53) % 100}%`, `${((i * 53) % 100) - 22}%`],
              opacity: [0, 0.9, 0],
            }}
            transition={{
              duration: 6 + (i % 5),
              repeat: Infinity,
              delay: (i % 6) * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
    </div>
  );
}