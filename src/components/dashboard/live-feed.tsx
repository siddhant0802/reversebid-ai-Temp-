import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import { liveFeed } from "@/lib/mock-data";

export function LiveFeed() {
  const [items, setItems] = useState(liveFeed);
  useEffect(() => {
    const id = setInterval(() => {
      setItems((prev) => {
        const next = [...prev];
        const first = next.shift();
        if (first) next.push({ ...first, when: "just now" });
        return next;
      });
    }, 3500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <Radio className="h-3 w-3" /> Live marketplace activity
      </div>
      <div className="space-y-1.5">
        <AnimatePresence initial={false}>
          {items.slice(0, 5).map((f) => (
            <motion.div
              key={f.id + f.when}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-xs"
            >
              <span className="font-medium truncate">{f.who}</span>
              <span className="text-muted-foreground truncate flex-1">{f.what}</span>
              <span className="text-[10px] text-muted-foreground tabular-nums">{f.when}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}