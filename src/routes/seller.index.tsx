import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { SectionCard } from "@/components/dashboard/section-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Inbox, Percent, IndianRupee, Star, Sparkles, MapPin, Clock, ArrowRight, Flame, TrendingUp } from "lucide-react";
import { leads, spendData, sparkOpen, sparkQuotes, sparkOrders, sparkSaved, heatmap, aiInsights } from "@/lib/mock-data";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, FunnelChart, Funnel, LabelList } from "recharts";
import { ActivityHeatmap } from "@/components/dashboard/heatmap";
import { AiInsightCard } from "@/components/dashboard/ai-insight-card";
import { motion } from "framer-motion";

export const Route = createFileRoute("/seller/")({
  component: SellerDashboard,
  head: () => ({ meta: [{ title: "Seller Dashboard · ReverseHub AI" }, { name: "description", content: "Available leads and won deals for suppliers." }] }),
});

function SellerDashboard() {
  return (
    <DashboardShell role="seller" breadcrumb={["Seller", "Dashboard"]} title="Good morning, ErgoWorks">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="New Buyer Requests" animatedValue={24} delta={18} deltaLabel="today" icon={Inbox} tone="primary" index={0} trend={sparkQuotes} />
        <StatCard label="Quote Acceptance" animatedValue={38} suffix="%" delta={6} deltaLabel="30d" icon={Percent} tone="accent" index={1} trend={sparkOpen} />
        <StatCard label="Revenue (MTD)" animatedValue={42.6} prefix="₹" suffix="L" decimals={1} delta={22} deltaLabel="vs last mo" icon={IndianRupee} tone="success" index={2} trend={sparkSaved} />
        <StatCard label="Average Rating" animatedValue={4.9} decimals={1} delta={2} deltaLabel="vs last mo" icon={Star} tone="warning" index={3} trend={sparkOrders} />
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SectionCard className="xl:col-span-2" title="Revenue Trend" description="Monthly won deals volume">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendData} margin={{ left: -10, right: 10 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="spend" stroke="var(--color-accent)" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="AI Insights" actions={<Sparkles className="h-4 w-4 text-primary" />}>
          <div className="space-y-2.5">
            {aiInsights.slice(0, 4).map((s, i) => (
              <AiInsightCard key={i} index={i} icon={s.icon as never} tone={s.tone as never} title={s.title} body={s.body} />
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SectionCard title="Lead Activity Heatmap" description="Buyer requests over the last 4 weeks" actions={<Flame className="h-4 w-4 text-primary" />}>
          <ActivityHeatmap data={heatmap} />
        </SectionCard>

        <SectionCard className="xl:col-span-2" title="Conversion Funnel" description="Leads → Quoted → Shortlisted → Won" actions={<TrendingUp className="h-4 w-4 text-primary" />}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { label: "Leads seen", value: 248, pct: 100, tone: "from-primary/40 to-primary/10" },
              { label: "Quoted", value: 132, pct: 53, tone: "from-primary/50 to-accent/20" },
              { label: "Shortlisted", value: 61, pct: 25, tone: "from-accent/50 to-accent/15" },
              { label: "Won", value: 24, pct: 10, tone: "from-emerald-400/50 to-emerald-400/10" },
            ].map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br ${f.tone} p-4`}
              >
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{f.label}</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">{f.value}</div>
                <div className="mt-2 text-[11px] text-muted-foreground tabular-nums">{f.pct}% of top</div>
                <div className="mt-2 h-1 rounded-full bg-muted/60 overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${f.pct}%` }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 + i * 0.08 }} className="h-full bg-gradient-to-r from-primary to-accent" />
                </div>
              </motion.div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold tracking-tight">Available Opportunities</h3>
          <Button asChild variant="ghost" size="sm"><Link to="/seller/leads">View all <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {leads.slice(0, 6).map((l) => (
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
              <Button asChild className="mt-4 w-full bg-gradient-to-r from-primary to-accent">
                <Link to="/seller/quote">Send Quote</Link>
              </Button>
            </SectionCard>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}