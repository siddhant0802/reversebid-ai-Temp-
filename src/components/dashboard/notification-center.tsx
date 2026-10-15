import { motion, AnimatePresence } from "framer-motion";
import { Bell, Sparkles, Package, MessageSquare, ShieldCheck, IndianRupee, FileText, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications, markAllRead, dismissNotification } from "@/lib/store";
import { useState } from "react";

const catIcon = {
  Quotes: FileText,
  Orders: Package,
  Messages: MessageSquare,
  "AI Insights": Sparkles,
  Payments: IndianRupee,
  Verification: ShieldCheck,
} as const;

const priorityDot = {
  high: "bg-rose-400",
  medium: "bg-amber-400",
  low: "bg-emerald-400",
} as const;

export function NotificationCenter({ audience = "buyer" }: { audience?: "buyer" | "seller" | "admin" }) {
  const items = useNotifications(audience);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const unread = items.filter((n) => n.unread).length;
  const view = tab === "unread" ? items.filter((n) => n.unread) : items;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-gradient-to-br from-primary to-accent text-[10px] font-semibold text-primary-foreground grid place-items-center ring-2 ring-background"
            >
              {unread}
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0 overflow-hidden border-border/60 bg-popover/90 backdrop-blur-xl">
        <div className="p-4 pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold tracking-tight">Notifications</div>
              <div className="text-xs text-muted-foreground">{unread} unread</div>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => markAllRead(audience)}>
              <Check className="h-3 w-3 mr-1" /> Mark all read
            </Button>
          </div>
          <div className="mt-3 inline-flex rounded-lg bg-muted/60 p-0.5 text-xs">
            {(["all", "unread"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 rounded-md capitalize transition ${tab === t ? "bg-background shadow-sm" : "text-muted-foreground"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <AnimatePresence initial={false}>
            {view.map((n) => {
              const Icon = catIcon[n.cat as keyof typeof catIcon] ?? Bell;
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className={`group relative flex gap-3 p-3.5 border-b border-border/40 hover:bg-muted/40 transition cursor-pointer ${n.unread ? "bg-primary/[0.03]" : ""}`}
                >
                  <div className="relative shrink-0">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary/20 to-accent/10 border border-border/60 grid place-items-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ${priorityDot[n.priority as keyof typeof priorityDot]} ring-2 ring-popover`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{n.cat}</span>
                      <span className="text-[10px] text-muted-foreground">· {n.time}</span>
                    </div>
                    <div className="text-sm font-medium leading-tight mt-0.5">{n.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }}
                    className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {view.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">You're all caught up ✨</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}