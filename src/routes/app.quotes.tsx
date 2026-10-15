import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/shell";
import { SectionCard } from "@/components/dashboard/section-card";
import { useAllQuotes } from "@/lib/store";
import { rankQuotes } from "@/lib/quote-scoring";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/app/quotes")({
  component: ReceivedQuotes,
  head: () => ({ meta: [{ title: "Received Quotes · ReverseHub AI" }, { name: "description", content: "Live bids from verified suppliers." }] }),
});

function ReceivedQuotes() {
  const all = useAllQuotes();
  const quotes = useMemo(() => {
    const byRfq = new Map<string, typeof all>();
    all.forEach((q) => byRfq.set(q.requirementId, [...(byRfq.get(q.requirementId) ?? []), q]));
    return [...byRfq.values()].flatMap(rankQuotes).sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""));
  }, [all]);
  return (
    <DashboardShell role="buyer" breadcrumb={["Workspace", "Received Quotes"]} title="Received Quotes">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {quotes.map((q) => (
          <SectionCard key={q.id} className="relative">
            {q.recommended && (
              <div className="absolute -top-2 left-4"><Badge className="bg-gradient-to-r from-primary to-accent border-none"><Sparkles className="h-3 w-3 mr-1" /> AI Recommended</Badge></div>
            )}
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 grid place-items-center text-sm font-semibold">{q.supplierAvatar}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{q.supplier}</div>
                <div className="text-[11px] text-muted-foreground">{q.requirementId} · ★ {q.rating} · {q.experience}</div>
              </div>
              {q.risk === "high" && <ShieldAlert className="h-4 w-4 text-rose-400" />}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-[11px] text-muted-foreground">Price</div><div className="text-lg font-semibold tabular-nums">₹{(q.price/1000).toFixed(0)}k</div></div>
              <div><div className="text-[11px] text-muted-foreground">Delivery</div><div className="font-medium">{q.delivery}</div></div>
              <div><div className="text-[11px] text-muted-foreground">Warranty</div><div className="font-medium">{q.warranty}</div></div>
              <div><div className="text-[11px] text-muted-foreground">AI Score</div><div className="font-medium">{q.aiScore}/100</div></div>
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${q.aiScore}%` }} />
            </div>
            <div className="mt-4 flex gap-2">
              <Button asChild size="sm" className="flex-1"><Link to="/app/compare" search={{ rfq: q.requirementId }}>View</Link></Button>
              <Button asChild size="sm" variant="outline" className="flex-1"><Link to="/app/messages">Message</Link></Button>
            </div>
          </SectionCard>
        ))}
      </div>
    </DashboardShell>
  );
}