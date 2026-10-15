import { createFileRoute } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { DashboardShell } from "@/components/dashboard/shell";
import { conversations } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, Search, FileText, CheckCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRequirements } from "@/lib/store";

export const Route = createFileRoute("/app/messages")({
  component: Messages,
  validateSearch: zodValidator(z.object({ rfq: fallback(z.string(), "").default("") })),
  head: () => ({ meta: [{ title: "Messages · ReverseHub AI" }, { name: "description", content: "Chat with suppliers in real-time." }] }),
});

type Msg = { me: boolean; t: string; time: string; file?: string };
type Conversation = (typeof conversations)[number];

const threads: Record<string, Msg[]> = {
  c1: [
    { me: false, t: "Hi Aarav — thanks for reviewing our quote on RFQ-8842.", time: "10:24" },
    { me: false, t: "We can start production Monday and ship in 8 days.", time: "10:24" },
    { me: true, t: "Great. Can you extend the warranty to 5 years?", time: "10:26" },
    { me: false, t: "Yes — 5 years included at the same price. Attaching updated terms.", time: "10:28", file: "ErgoWorks_Terms_v2.pdf" },
    { me: true, t: "Perfect. Sending the accept via the platform now.", time: "10:31" },
  ],
  c2: [
    { me: false, t: "Sharing our revised quote with FOB Mumbai pricing.", time: "09:12", file: "NordFurniture_Quote_v3.pdf" },
    { me: true, t: "Received. Can you match the 30-day payment terms?", time: "09:20" },
    { me: false, t: "Yes — 30-day net works on this order size.", time: "09:22" },
  ],
  c3: [
    { me: false, t: "Shipment left the warehouse 🚚 tracking below.", time: "Yesterday" },
    { me: false, t: "AWB: PF-8842-991 · ETA 3 days.", time: "Yesterday" },
    { me: true, t: "Thanks — I'll notify the receiving team.", time: "Yesterday" },
  ],
  c4: [
    { me: false, t: "Storyboard v2 is ready for your review.", time: "Mon", file: "StudioNova_Storyboard_v2.pdf" },
    { me: true, t: "Looks great. Two small notes on slide 4.", time: "Mon" },
  ],
  c5: [
    { me: false, t: "Invoice #INV-8821 has been issued for the packaging order.", time: "2d", file: "INV-8821.pdf" },
    { me: true, t: "Processing payment today.", time: "2d" },
  ],
};

function Messages() {
  const { rfq } = Route.useSearch();
  const requirements = useRequirements();
  const [activeId, setActiveId] = useState(rfq ? `rfq-${rfq}` : conversations[0].id);
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<Record<string, Msg[]>>({});

  useEffect(() => {
    if (rfq) setActiveId(`rfq-${rfq}`);
  }, [rfq]);

  const rfqConversations = useMemo<Conversation[]>(
    () => requirements.map((r) => ({
      id: `rfq-${r.id}`,
      name: `${r.id} suppliers`,
      avatar: "AI",
      last: r.quotes > 0 ? `${r.quotes} supplier quotes ready for review.` : "Suppliers are matching to your RFQ now.",
      time: r.postedAt === "just now" ? "now" : r.postedAt,
      unread: r.quotes > 0 ? Math.min(r.quotes, 9) : 1,
      online: true,
    })),
    [requirements],
  );
  const allConversations = useMemo(() => [...rfqConversations, ...conversations], [rfqConversations]);
  const active = allConversations.find((c) => c.id === activeId) ?? allConversations[0];
  const activeRequirement = active.id.startsWith("rfq-")
    ? requirements.find((r) => `rfq-${r.id}` === active.id)
    : undefined;
  const baseThread = useMemo<Msg[]>(() => {
    if (activeRequirement) {
      return [
        { me: false, t: `We received ${activeRequirement.id} for ${activeRequirement.quantity} ${activeRequirement.title}.`, time: "now" },
        { me: false, t: activeRequirement.quotes > 0 ? "Matched suppliers have submitted quotes. You can compare them now." : "Verified suppliers are being notified and shortlisted by AI.", time: "now" },
        { me: true, t: "Please share availability, best pricing, and delivery timeline.", time: "now" },
      ];
    }
    return threads[active.id] ?? [{ me: false, t: "No messages yet. Say hello 👋", time: "" }];
  }, [active.id, activeRequirement]);
  const thread = [...baseThread, ...(sent[active.id] ?? [])];
  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    setSent((s) => ({ ...s, [active.id]: [...(s[active.id] ?? []), { me: true, t: text, time: "now" }] }));
    setDraft("");
  };

  return (
    <DashboardShell role="buyer" breadcrumb={["Workspace", "Messages"]} title="Messages">
      <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl overflow-hidden grid grid-cols-1 md:grid-cols-[320px_1fr] h-[calc(100vh-200px)]">
        <div className="border-r border-border/60 flex flex-col min-h-0">
          <div className="p-3 border-b border-border/60">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations" className="pl-9 bg-muted/40" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {allConversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left p-3 flex gap-3 border-b border-border/40 hover:bg-muted/30 transition ${active.id === c.id ? "bg-muted/40" : ""}`}
              >
                <div className="relative shrink-0">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 grid place-items-center text-xs font-semibold">{c.avatar}</div>
                  {c.online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-card" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <div className="font-medium truncate text-sm">{c.name}</div>
                    <div className="text-[10px] text-muted-foreground">{c.time}</div>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{c.last}</div>
                </div>
                {c.unread > 0 && <div className="h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] grid place-items-center">{c.unread}</div>}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col min-h-0">
          <div className="border-b border-border/60 p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 grid place-items-center text-xs font-semibold">{active.avatar}</div>
            <div>
              <div className="font-medium">{active.name}</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online · typing…</div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {thread.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-md rounded-2xl px-4 py-2 ${m.me ? "bg-gradient-to-br from-primary to-accent text-primary-foreground" : "bg-muted/50"}`}>
                  <div className="text-sm">{m.t}</div>
                  {m.file && (
                    <div className="mt-2 flex items-center gap-2 rounded-lg bg-background/40 px-2 py-1.5 text-xs">
                      <FileText className="h-3.5 w-3.5" /> {m.file}
                    </div>
                  )}
                  <div className={`text-[10px] mt-1 flex items-center gap-1 ${m.me ? "text-primary-foreground/70 justify-end" : "text-muted-foreground"}`}>
                    {m.time} {m.me && <CheckCheck className="h-3 w-3" />}
                  </div>
                </div>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-muted/50 rounded-2xl px-4 py-3 flex gap-1">
                {[0,1,2].map(i => <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-muted-foreground" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />)}
              </div>
            </motion.div>
          </div>
          <div className="border-t border-border/60 p-3 flex gap-2">
            <Button variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Type a message…"
              className="flex-1 bg-muted/40"
            />
            <Button onClick={sendMessage} className="bg-gradient-to-r from-primary to-accent"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}