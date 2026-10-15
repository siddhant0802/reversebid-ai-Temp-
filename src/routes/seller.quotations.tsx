import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/shell";
import { SectionCard } from "@/components/dashboard/section-card";
import { Badge } from "@/components/ui/badge";
import { useAllQuotes, useSubmittedQuotes } from "@/lib/store";
import { rankQuotes } from "@/lib/quote-scoring";

export const Route = createFileRoute("/seller/quotations")({
  component: MyQuotations,
  head: () => ({ meta: [{ title: "My Quotations · ReverseHub AI" }, { name: "description", content: "All quotes you have submitted." }] }),
});

const demoRows = [
  { id: "Q-2210", rfq: "RFQ-8842", buyer: "Acme Corp", price: 298000, status: "pending", ai: 96 },
  { id: "Q-2208", rfq: "RFQ-8831", buyer: "Vertex Labs", price: 812000, status: "won", ai: 92 },
  { id: "Q-2201", rfq: "RFQ-8820", buyer: "Northwind", price: 598000, status: "lost", ai: 74 },
  { id: "Q-2195", rfq: "RFQ-8815", buyer: "Initech", price: 452000, status: "pending", ai: 88 },
];

const style: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  won: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  lost: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  submitted: "bg-primary/15 text-primary border-primary/30",
};

function MyQuotations() {
  const mine = useSubmittedQuotes();
  const all = useAllQuotes();
  const rows = [
    ...mine.map((q) => {
      const ranked = rankQuotes(all.filter((x) => x.requirementId === q.requirementId)).find((x) => x.id === q.id);
      return { id: q.id.slice(0, 14), rfq: q.requirementId, buyer: "Buyer workspace", price: q.totalAmount ?? q.price, status: q.status ?? "submitted", ai: ranked?.aiScore ?? 0 };
    }),
    ...demoRows,
  ];
  return (
    <DashboardShell role="seller" breadcrumb={["Seller", "My Quotations"]} title="My Quotations">
      <SectionCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground text-left">
              <tr className="border-b border-border/60">
                {["Quote","RFQ","Buyer","Price","AI Score","Status"].map(h => <th key={h} className="py-3 px-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b border-border/40 hover:bg-muted/30 transition">
                  <td className="py-3 px-3 font-mono">{r.id}</td>
                  <td className="py-3 px-3 font-mono text-muted-foreground">{r.rfq}</td>
                  <td className="py-3 px-3">{r.buyer}</td>
                  <td className="py-3 px-3 tabular-nums">₹{(r.price/1000).toFixed(0)}k</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2 w-24">
                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${r.ai}%` }} />
                      </div>
                      <span className="text-xs tabular-nums">{r.ai}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3"><Badge variant="outline" className={style[r.status]}>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </DashboardShell>
  );
}