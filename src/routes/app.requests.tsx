import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/shell";
import { SectionCard } from "@/components/dashboard/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Filter } from "lucide-react";
import { useRequirements } from "@/lib/store";

export const Route = createFileRoute("/app/requests")({
  component: MyRequests,
  head: () => ({ meta: [{ title: "My Requests · ReverseHub AI" }, { name: "description", content: "All your active and past RFQs." }] }),
});

const statusStyle: Record<string, string> = {
  open: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  awarded: "bg-primary/15 text-primary border-primary/30",
  closed: "bg-muted/40 text-muted-foreground border-border/60",
};

function MyRequests() {
  const requirements = useRequirements();
  return (
    <DashboardShell
      role="buyer"
      breadcrumb={["Workspace", "My Requests"]}
      title="My Requests"
      actions={<Button asChild className="bg-gradient-to-r from-primary to-accent"><Link to="/app/post"><PlusCircle className="mr-2 h-4 w-4" /> New RFQ</Link></Button>}
    >
      <SectionCard>
        <div className="flex flex-wrap items-center gap-2 pb-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search requests…" className="pl-9 bg-muted/40" />
          </div>
          <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" /> Filters</Button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {requirements.map((r) => (
            <div key={r.id} className="group flex flex-col md:flex-row md:items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 hover:border-primary/40 hover:bg-muted/30 transition">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{r.id}</span>
                  <span>·</span>
                  <span>{r.category}</span>
                  <Badge variant="outline" className={statusStyle[r.status]}>{r.status}</Badge>
                </div>
                <div className="mt-1 font-medium truncate">{r.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{r.description}</div>
              </div>
              <div className="flex gap-6 text-sm">
                <div><div className="text-[11px] text-muted-foreground">Budget</div><div className="font-medium tabular-nums">₹{(r.budget / 100000).toFixed(1)}L</div></div>
                <div><div className="text-[11px] text-muted-foreground">Qty</div><div className="font-medium tabular-nums">{r.quantity}</div></div>
                <div><div className="text-[11px] text-muted-foreground">Quotes</div><div className="font-medium tabular-nums">{r.quotes}</div></div>
                <div><div className="text-[11px] text-muted-foreground">Deadline</div><div className="font-medium">{r.deadline}</div></div>
              </div>
              <Button asChild variant="ghost" size="sm"><Link to="/app/compare" search={{ rfq: r.id }}>Compare</Link></Button>
            </div>
          ))}
        </div>
      </SectionCard>
    </DashboardShell>
  );
}