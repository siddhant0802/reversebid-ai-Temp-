import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/shell";
import { SectionCard } from "@/components/dashboard/section-card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { useAllOrders, CURRENT_SELLER } from "@/lib/store";
import { ORDER_STAGES, orderStageIndex } from "@/lib/mock-data";
import { OrderAdvanceButton } from "@/components/dashboard/order-advance-button";

export const Route = createFileRoute("/seller/deals")({
  component: Deals,
  head: () => ({ meta: [{ title: "Won Deals · ReverseHub AI" }, { name: "description", content: "Your closed and awarded deals." }] }),
});

const deals = [
  { id: "D-1102", buyer: "Acme Corp", value: 298000, category: "Furniture", closed: "2d ago" },
  { id: "D-1099", buyer: "Vertex Labs", value: 812000, category: "Packaging", closed: "6d ago" },
  { id: "D-1092", buyer: "Northwind", value: 598000, category: "Manufacturing", closed: "2w ago" },
  { id: "D-1085", buyer: "Initech", value: 452000, category: "Services", closed: "1mo ago" },
];

function Deals() {
  const myOrders = useAllOrders().filter((o) => o.supplier === CURRENT_SELLER.name);
  return (
    <DashboardShell role="seller" breadcrumb={["Seller", "Won Deals"]} title="Won Deals">
      {myOrders.length > 0 && (
        <SectionCard title="Orders to fulfil" description="Move each order forward — the buyer sees updates instantly." className="mb-4">
          <div className="grid grid-cols-1 gap-3">
            {myOrders.map((o) => (
              <div key={o.id} className="flex flex-col md:flex-row md:items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="flex-1">
                  <div className="text-xs font-mono text-muted-foreground">{o.id} · {o.requirementId}</div>
                  <div className="font-medium">{o.title}</div>
                  <div className="text-xs text-muted-foreground">{ORDER_STAGES[orderStageIndex(o)]} · {o.progress}% · {o.status}</div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${o.progress}%` }} />
                  </div>
                </div>
                <div className="text-lg font-semibold tabular-nums">₹{(o.amount / 1000).toFixed(0)}k</div>
                <OrderAdvanceButton order={o} />
              </div>
            ))}
          </div>
        </SectionCard>
      )}
      <SectionCard>
        <div className="grid grid-cols-1 gap-3">
          {deals.map(d => (
            <div key={d.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400/25 to-primary/20 grid place-items-center">
                <Trophy className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-mono text-muted-foreground">{d.id}</div>
                <div className="font-medium">{d.buyer}</div>
                <div className="text-xs text-muted-foreground">{d.category} · closed {d.closed}</div>
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Won</Badge>
              <div className="text-lg font-semibold tabular-nums">₹{(d.value/1000).toFixed(0)}k</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </DashboardShell>
  );
}