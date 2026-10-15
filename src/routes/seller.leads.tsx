import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/shell";
import { SectionCard } from "@/components/dashboard/section-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MapPin, Clock } from "lucide-react";
import { useRequirements } from "@/lib/store";
import { useMemo } from "react";

export const Route = createFileRoute("/seller/leads")({
  component: Leads,
  head: () => ({ meta: [{ title: "Available Leads · ReverseHub AI" }, { name: "description", content: "Open buyer RFQs matched to your business." }] }),
});

function Leads() {
  const requirements = useRequirements();
  const leads = useMemo(
    () =>
      requirements
        .filter((r) => r.status === "open")
        .map((r) => ({ ...r, match: 70 + ((r.id.charCodeAt(r.id.length - 1) * 7) % 28) })),
    [requirements],
  );
  return (
    <DashboardShell role="seller" breadcrumb={["Seller", "Available Leads"]} title="Available Leads">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {leads.map((l) => (
          <SectionCard key={l.id}>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono">{l.id}</span>
              <Badge className="bg-primary/15 text-primary border border-primary/30">
                <Sparkles className="h-3 w-3 mr-1" /> Match {l.match}%
              </Badge>
            </div>
            <div className="mt-2 font-medium">{l.title}</div>
            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{l.description}</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div><div className="text-muted-foreground">Budget</div><div className="font-medium tabular-nums">₹{(l.budget/100000).toFixed(1)}L</div></div>
              <div><div className="text-muted-foreground">Delivery</div><div className="font-medium">{l.deadline}</div></div>
              <div className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" /> {l.location}</div>
              <div className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" /> {l.postedAt}</div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${l.match}%` }} />
            </div>
            <Button asChild className="mt-4 w-full bg-gradient-to-r from-primary to-accent">
              <Link to="/seller/quote" search={{ rfq: l.id }}>Send Quote</Link>
            </Button>
          </SectionCard>
        ))}
      </div>
    </DashboardShell>
  );
}