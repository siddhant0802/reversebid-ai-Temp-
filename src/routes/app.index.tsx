import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Inbox, Package, PiggyBank, Sparkles, MessageSquare, ShieldAlert, CheckCircle2, PlusCircle, Clock, AlertTriangle } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { SectionCard } from "@/components/dashboard/section-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAllOrders } from "@/lib/store";
import { quotes, spendData, responseTimeData, activities, sparkOpen, sparkQuotes, sparkOrders, sparkSaved, deadlines, aiInsights } from "@/lib/mock-data";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, LineChart, Line } from "recharts";
import { AiInsightCard } from "@/components/dashboard/ai-insight-card";
import { LiveFeed } from "@/components/dashboard/live-feed";
import { motion } from "framer-motion";

export const Route = createFileRoute("/app/")({
  component: BuyerDashboard,
  head: () => ({ meta: [{ title: "Buyer Dashboard · ReverseHub AI" }, { name: "description", content: "Track your RFQs, quotes and orders." }] }),
});

const iconMap = { sparkles: Sparkles, check: CheckCircle2, message: MessageSquare, alert: ShieldAlert, package: Package } as const;

function BuyerDashboard() {
  const pendingOrders = useAllOrders().filter((o) => o.status !== "delivered").length + 3;
  return (
    <DashboardShell
      role="buyer"
      breadcrumb={["Workspace", "Dashboard"]}
      title="Welcome back, Aarav"
      actions={
        <Button asChild className="bg-gradient-to-r from-primary to-accent">
          <Link to="/app/post"><PlusCircle className="mr-2 h-4 w-4" /> Post Requirement</Link>
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Open Requests" animatedValue={14} delta={12} deltaLabel="this week" icon={FileText} tone="primary" index={0} trend={sparkOpen} />
        <StatCard label="Active Quotes" animatedValue={47} delta={28} deltaLabel="vs last week" icon={Inbox} tone="accent" index={1} trend={sparkQuotes} />
        <StatCard label="Pending Orders" animatedValue={pendingOrders} delta={-3} deltaLabel="closing soon" icon={Package} tone="warning" index={2} trend={sparkOrders} />
        <StatCard label="Money Saved" animatedValue={18.2} prefix="₹" suffix="L" decimals={1} delta={41} deltaLabel="YTD" icon={PiggyBank} tone="success" index={3} trend={sparkSaved} />
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SectionCard
          className="xl:col-span-2"
          title="Spending & Savings"
          description="Monthly procurement spend vs AI-driven savings"
          actions={<Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/30">Last 8 months</Badge>}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendData} margin={{ left: -10, right: 10 }}>
                <defs>
                  <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="saved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="spend" stroke="var(--color-chart-1)" fill="url(#spend)" strokeWidth={2} />
                <Area type="monotone" dataKey="saved" stroke="var(--color-chart-2)" fill="url(#saved)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="AI Procurement Insights" description="Real-time intelligence from Copilot" actions={<Sparkles className="h-4 w-4 text-primary" />}>
          <div className="space-y-2.5">
            {aiInsights.slice(0, 4).map((s, i) => (
              <AiInsightCard key={i} index={i} icon={s.icon as never} tone={s.tone as never} title={s.title} body={s.body} />
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SectionCard title="Upcoming Deadlines" description="RFQs closing soon" actions={<Clock className="h-4 w-4 text-primary" />}>
          <div className="space-y-3">
            {deadlines.map((d, i) => {
              const tone = d.urgency === "high" ? "bg-rose-400" : d.urgency === "medium" ? "bg-amber-400" : "bg-emerald-400";
              const pct = d.urgency === "high" ? 82 : d.urgency === "medium" ? 55 : 28;
              return (
                <motion.div key={d.id} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`h-2 w-2 rounded-full ${tone}`} />
                      <span className="font-medium truncate">{d.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{d.when}</span>
                  </div>
                  <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 0.7 }} className={`h-full ${tone}`} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Live Activity" description="Marketplace pulse" className="xl:col-span-2">
          <LiveFeed />
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SectionCard title="Recent Quotes" description="Live bids from verified suppliers" className="xl:col-span-2">
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground text-left">
                <tr className="border-b border-border/60">
                  <th className="py-2 px-2 font-medium">Supplier</th>
                  <th className="py-2 px-2 font-medium">Price</th>
                  <th className="py-2 px-2 font-medium">Delivery</th>
                  <th className="py-2 px-2 font-medium">AI Score</th>
                  <th className="py-2 px-2 font-medium">Risk</th>
                  <th className="py-2 px-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q.id} className="border-b border-border/40 hover:bg-muted/30 transition">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/30 to-accent/20 grid place-items-center text-xs font-medium">{q.supplierAvatar}</div>
                        <div>
                          <div className="font-medium">{q.supplier}</div>
                          <div className="text-[11px] text-muted-foreground">★ {q.rating} · {q.experience}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 tabular-nums">₹{(q.price / 1000).toFixed(0)}k</td>
                    <td className="py-3 px-2 text-muted-foreground">{q.delivery}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2 w-24">
                        <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${q.aiScore}%` }} />
                        </div>
                        <span className="text-xs tabular-nums">{q.aiScore}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant="secondary" className={
                        q.risk === "low" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : q.risk === "medium" ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                      }>
                        {q.risk}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <Button asChild size="sm" variant="ghost"><Link to="/app/compare">View</Link></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Recent Activity" description="Your workspace timeline">
          <div className="space-y-3">
            {activities.map((a, i) => {
              const Icon = iconMap[a.icon as keyof typeof iconMap];
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted/40 border border-border/60 grid place-items-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm">{a.text}</div>
                    <div className="text-[11px] text-muted-foreground">{a.time}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="Supplier Response Time" description="Median hours to first quote">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseTimeData} margin={{ left: -10, right: 10 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="hours" stroke="var(--color-chart-2)" strokeWidth={2.5} dot={{ fill: "var(--color-chart-2)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  );
}