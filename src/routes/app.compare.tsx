import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useRequirements, useAllQuotes, useAllOrders, acceptQuote } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";
import { rankQuotes } from "@/lib/quote-scoring";
import { useMemo } from "react";
import { DashboardShell } from "@/components/dashboard/shell";
import { SectionCard } from "@/components/dashboard/section-card";
import { type Quote, type Requirement } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, ShieldAlert, Check, Star, Clock, ShieldCheck, IndianRupee, Award, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { AiInsightCard } from "@/components/dashboard/ai-insight-card";

export const Route = createFileRoute("/app/compare")({
  component: Compare,
  validateSearch: zodValidator(z.object({ rfq: fallback(z.string(), "").default("") })),
  head: () => ({ meta: [{ title: "Compare Quotes · ReverseHub AI" }, { name: "description", content: "AI-ranked side-by-side supplier comparison." }] }),
});

const generatedSupplierPool = [
  { supplier: "PrimeSource India", supplierAvatar: "PS", multiplier: 0.91, deliveryDays: 7, warranty: "3 years", rating: 4.9, experience: "11 yrs", aiScore: 95, risk: "low" as const, notes: "AI-generated bid · strongest value and delivery fit." },
  { supplier: "NexaTrade Solutions", supplierAvatar: "NT", multiplier: 0.98, deliveryDays: 9, warranty: "2 years", rating: 4.7, experience: "8 yrs", aiScore: 89, risk: "low" as const, notes: "Verified supplier · balanced pricing and reliability." },
  { supplier: "SwiftProcure Co", supplierAvatar: "SP", multiplier: 0.86, deliveryDays: 15, warranty: "1 year", rating: 4.3, experience: "5 yrs", aiScore: 78, risk: "medium" as const, notes: "Lowest price, but delivery confidence is lower." },
  { supplier: "ValueBridge Vendors", supplierAvatar: "VB", multiplier: 1.07, deliveryDays: 5, warranty: "3 years", rating: 4.8, experience: "9 yrs", aiScore: 84, risk: "low" as const, notes: "Premium price with the fastest delivery window." },
];

function buildQuotesForRequirement(allQuotes: Quote[], req?: Requirement): Quote[] {
  const rfqId = req?.id ?? "RFQ-8842";
  const existing = allQuotes.filter((q) => q.requirementId === rfqId);
  const hasDemo = existing.some((q) => q.source === "demo" || (!q.source && !q.submittedAt));
  if (!req || hasDemo) return existing;

  const baseline = req.budget > 0 ? req.budget : Math.max(req.quantity, 1) * 20000;
  return generatedSupplierPool.map((supplier, index): Quote => ({
    id: `${req.id}-Q-${index + 1}`,
    requirementId: req.id,
    supplier: supplier.supplier,
    supplierAvatar: supplier.supplierAvatar,
    price: Math.max(10000, Math.round((baseline * supplier.multiplier) / 1000) * 1000),
    gst: 18,
    delivery: `${supplier.deliveryDays} days`,
    warranty: supplier.warranty,
    rating: supplier.rating,
    experience: supplier.experience,
    aiScore: supplier.aiScore,
    risk: supplier.risk,
    recommended: index === 0,
    bestValue: index === 0,
    notes: supplier.notes,
    source: "generated",
  })).filter((g) => !existing.some((e) => e.id === g.id)).concat(existing);
}

function shortMoney(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${(value / 1000).toFixed(0)}k`;
}

function deliveryScore(delivery: string) {
  const days = Number.parseInt(delivery, 10);
  if (!Number.isFinite(days)) return 70;
  return Math.max(45, Math.min(98, 110 - days * 4));
}

function warrantyScore(warranty: string) {
  const years = Number.parseInt(warranty, 10);
  if (!Number.isFinite(years)) return 65;
  return Math.max(45, Math.min(100, 45 + years * 12));
}

function riskScore(risk: Quote["risk"]) {
  return risk === "low" ? 94 : risk === "medium" ? 72 : 48;
}

function supplierKey(q: Quote, index: number) {
  return q.supplier.split(/\s+/)[0]?.replace(/[^a-z0-9]/gi, "") || `Supplier${index + 1}`;
}

function buildRadar(rows: Quote[]) {
  const keys = rows.map(supplierKey);
  const maxPrice = Math.max(...rows.map((q) => q.price), 1);
  const createRow = (axis: string, value: (q: Quote) => number) => ({
    axis,
    ...Object.fromEntries(rows.map((q, index) => [keys[index], Math.round(value(q))])),
  });

  return {
    keys,
    data: [
      createRow("Price", (q) => Math.max(52, 104 - (q.price / maxPrice) * 42)),
      createRow("Delivery", (q) => deliveryScore(q.delivery)),
      createRow("Rating", (q) => q.rating * 20),
      createRow("Warranty", (q) => warrantyScore(q.warranty)),
      createRow("Trust", (q) => riskScore(q.risk)),
      createRow("AI Fit", (q) => q.aiScore),
    ],
  };
}

function buildInsights(rows: Quote[]) {
  const winner = rows[0];
  const cheapest = [...rows].sort((a, b) => a.price - b.price)[0];
  const fastest = [...rows].sort((a, b) => deliveryScore(b.delivery) - deliveryScore(a.delivery))[0];
  return [
    { icon: "trending", tone: "success", title: "Best total value", body: `${winner.supplier} leads with ${shortMoney(winner.price)}, ${winner.delivery} delivery and AI Score ${winner.aiScore}.` },
    { icon: "target", tone: "accent", title: "Price benchmark", body: `${cheapest.supplier} is the lowest bid at ${shortMoney(cheapest.price)}, useful for negotiation leverage.` },
    { icon: "shield", tone: "primary", title: "Lowest risk path", body: `${winner.supplier} combines strong verification, reliable delivery, and ${winner.warranty} warranty coverage.` },
    { icon: "star", tone: "accent", title: "Fastest fulfilment", body: `${fastest.supplier} can deliver in ${fastest.delivery}, ideal if timeline matters more than price.` },
  ] as const;
}

function formatCompareTitle(req?: Requirement) {
  if (!req) return "RFQ-8842 · 100 Ergonomic Office Chairs";
  const normalizedTitle = req.title.trim().toLowerCase();
  const startsWithQuantity = normalizedTitle.startsWith(`${req.quantity} `);
  return `${req.id} · ${startsWithQuantity ? req.title : `${req.quantity} ${req.title}`}`;
}

function Compare() {
  const { rfq } = Route.useSearch();
  const requirements = useRequirements();
  const selected = rfq ? requirements.find((r) => r.id === rfq) : undefined;
  const title = formatCompareTitle(selected);

  const allQuotes = useAllQuotes();
  const allOrders = useAllOrders();
  const navigate = useNavigate();
  const orderFor = (q: Quote) => allOrders.find((o) => o.quoteId === q.id);
  const onAccept = (q: Quote) => {
    const { order, existed } = acceptQuote(q);
    if (existed) {
      toast.info("This quote already has an order.", { description: `${order.id} · ${order.title}`, action: { label: "View", onClick: () => navigate({ to: "/app/orders" }) } });
    } else {
      toast.success(`Quote accepted from ${q.supplier}`, { description: `Order ${order.id} created — track it in Orders.`, action: { label: "View", onClick: () => navigate({ to: "/app/orders" }) } });
    }
  };
  const sorted = useMemo(() => rankQuotes(buildQuotesForRequirement(allQuotes, selected)), [allQuotes, selected]);
  const topRows = sorted.slice(0, 4);
  const radar = buildRadar(topRows);
  const insights = buildInsights(sorted);
  const seriesColors = ["var(--color-primary)", "var(--color-accent)", "var(--color-chart-3)", "var(--color-chart-4)"] as const;
  return (
    <DashboardShell
      role="buyer"
      breadcrumb={["Workspace", "Compare Quotes"]}
      title={title}
      actions={selected && (
        <Button asChild variant="outline">
          <Link to="/app/messages" search={{ rfq: selected.id }}>
            <MessageSquare className="h-4 w-4 mr-2" /> Message suppliers
          </Link>
        </Button>
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {topRows.map((q, i) => {
          const winner = i === 0;
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -3 }}
              className={`relative overflow-hidden rounded-2xl border p-5 backdrop-blur-xl transition ${
                winner
                  ? "border-primary/50 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent shadow-[0_30px_80px_-25px_color-mix(in_oklab,var(--color-primary)_55%,transparent)]"
                  : "border-border/60 bg-card/60 hover:border-primary/30"
              }`}
            >
              {winner && (
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
              )}
              {winner && (
                <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br from-primary/40 to-accent/20 blur-3xl" />
              )}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 border border-border/60 grid place-items-center text-sm font-semibold">
                    {q.supplierAvatar}
                  </div>
                  <div>
                    <div className="font-semibold leading-tight">{q.supplier}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" /> {q.rating} · {q.experience}
                    </div>
                  </div>
                </div>
                {winner && (
                  <Badge className="bg-gradient-to-r from-primary to-accent border-none text-[10px]">
                    <Award className="h-3 w-3 mr-0.5" /> Winner
                  </Badge>
                )}
              </div>

              <div className="relative mt-4">
                <div className="text-3xl font-semibold tabular-nums">₹{(q.price / 1000).toFixed(0)}k</div>
                <div className="text-xs text-muted-foreground">Inclusive of {q.gst}% GST</div>
              </div>

              <div className="relative mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-muted/30 border border-border/50 p-2">
                  <div className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Delivery</div>
                  <div className="font-medium mt-0.5">{q.delivery}</div>
                </div>
                <div className="rounded-lg bg-muted/30 border border-border/50 p-2">
                  <div className="text-muted-foreground flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Warranty</div>
                  <div className="font-medium mt-0.5">{q.warranty}</div>
                </div>
              </div>

              <div className="relative mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1"><Sparkles className="h-3 w-3 text-primary" /> AI Score</span>
                  <span className="tabular-nums font-semibold">{q.aiScore}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${q.aiScore}%` }}
                    transition={{ delay: 0.2 + i * 0.07, duration: 0.7 }}
                    className="h-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>
              </div>

              <div className="relative mt-3 flex items-center justify-between">
                <Badge variant="secondary" className={
                  q.risk === "low" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : q.risk === "medium" ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                }>
                  {q.risk === "high" && <ShieldAlert className="h-3 w-3 mr-1" />}
                  {q.risk} risk
                </Badge>
                {q.bestValue && (
                  <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400">
                    <Trophy className="h-2.5 w-2.5 mr-0.5" /> Best value
                  </Badge>
                )}
              </div>

              <Button
                size="sm"
                onClick={() => onAccept(q)}
                className={`relative mt-4 w-full ${winner ? "bg-gradient-to-r from-primary to-accent" : ""}`}
                variant={winner ? "default" : "outline"}
              >
                <Check className="h-3.5 w-3.5 mr-1" /> {orderFor(q) ? `Accepted · ${orderFor(q)!.id}` : winner ? "Accept winner" : "Accept quote"}
              </Button>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SectionCard className="xl:col-span-2" title="Multi-axis Comparison" description="Radar view across all evaluation dimensions" actions={<Badge className="bg-primary/15 text-primary border border-primary/30"><Sparkles className="h-3 w-3 mr-1" /> AI Ranked</Badge>}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar.data} outerRadius="72%">
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} stroke="var(--color-border)" />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {radar.keys.map((k, i) => (
                  <Radar key={k} name={k} dataKey={k} stroke={seriesColors[i]} fill={seriesColors[i]} fillOpacity={i === 0 ? 0.35 : 0.12} strokeWidth={i === 0 ? 2.5 : 1.5} />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="AI Insights" description={`Why ${sorted[0].supplier} leads`} actions={<Sparkles className="h-4 w-4 text-primary" />}>
          <div className="space-y-2.5">
            {insights.map((s, i) => (
              <AiInsightCard key={i} index={i} icon={s.icon as never} tone={s.tone as never} title={s.title} body={s.body} />
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
      <SectionCard title="Full Comparison Table" description="Weighted by price, delivery, rating, risk & warranty" actions={<Badge className="bg-primary/15 text-primary border border-primary/30"><IndianRupee className="h-3 w-3 mr-1" /> {sorted.length} bids</Badge>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="text-xs text-muted-foreground text-left">
              <tr className="border-b border-border/60">
                {["Supplier", "Price", "Delivery", "Rating", "Warranty", "Experience", "AI Score", "Risk", ""].map((h) => (
                  <th key={h} className="py-3 px-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((q) => (
                <tr key={q.id} className={`border-b border-border/40 hover:bg-muted/30 transition ${q.recommended ? "bg-primary/5" : ""}`}>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary/30 to-accent/20 grid place-items-center text-xs font-semibold">{q.supplierAvatar}</div>
                      <div>
                        <div className="font-medium flex items-center gap-1.5">
                          {q.supplier}
                          {q.recommended && <Badge className="bg-gradient-to-r from-primary to-accent border-none text-[10px] h-4"><Sparkles className="h-2.5 w-2.5 mr-0.5" />Recommended</Badge>}
                          {q.bestValue && <Badge variant="outline" className="text-[10px] h-4 border-emerald-500/40 text-emerald-400"><Trophy className="h-2.5 w-2.5 mr-0.5" />Best value</Badge>}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{q.notes ?? "Verified · GST filed"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 tabular-nums font-medium">₹{(q.price/1000).toFixed(0)}k</td>
                  <td className="py-3 px-3">{q.delivery}</td>
                  <td className="py-3 px-3">★ {q.rating}</td>
                  <td className="py-3 px-3">{q.warranty}</td>
                  <td className="py-3 px-3">{q.experience}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2 w-28">
                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${q.aiScore}%` }} />
                      </div>
                      <span className="text-xs tabular-nums">{q.aiScore}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant="secondary" className={
                      q.risk === "low" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : q.risk === "medium" ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                      : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                    }>
                      {q.risk === "high" && <ShieldAlert className="h-3 w-3 mr-1" />}
                      {q.risk}
                    </Badge>
                  </td>
                  <td className="py-3 px-3">
                    <Button size="sm" onClick={() => onAccept(q)} className="bg-gradient-to-r from-primary to-accent">
                      <Check className="h-3.5 w-3.5 mr-1" /> {orderFor(q) ? "Accepted" : "Accept"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
      </div>
    </DashboardShell>
  );
}