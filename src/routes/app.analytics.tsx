import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/shell";
import { SectionCard } from "@/components/dashboard/section-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { spendData, categoryData, responseTimeData } from "@/lib/mock-data";
import { TrendingUp, Trophy, Percent, IndianRupee } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/app/analytics")({
  component: Analytics,
  head: () => ({ meta: [{ title: "Analytics · ReverseHub AI" }, { name: "description", content: "Procurement analytics dashboard." }] }),
});

const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)", "var(--color-primary)"];

function Analytics() {
  return (
    <DashboardShell role="buyer" breadcrumb={["Workspace", "Analytics"]} title="Procurement Analytics">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="YTD Spend" value="₹4.7Cr" delta={22} deltaLabel="YoY" icon={IndianRupee} tone="primary" index={0}/>
        <StatCard label="Savings" value="₹94L" delta={41} deltaLabel="vs FY24" icon={TrendingUp} tone="success" index={1}/>
        <StatCard label="Win Rate" value="72%" delta={5} deltaLabel="rolling 30d" icon={Trophy} tone="accent" index={2}/>
        <StatCard label="Quote Acceptance" value="38%" delta={-2} deltaLabel="quarter" icon={Percent} tone="warning" index={3}/>
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SectionCard className="xl:col-span-2" title="Monthly Growth" description="Spend & AI-driven savings">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendData} margin={{ left: -10, right: 10 }}>
                <defs>
                  <linearGradient id="a1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="spend" stroke="var(--color-chart-1)" fill="url(#a1)" strokeWidth={2} />
                <Area type="monotone" dataKey="saved" stroke="var(--color-chart-2)" fill="none" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Category Distribution">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SectionCard title="Supplier Response Time" description="Median hours to first quote (day of week)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={responseTimeData} margin={{ left: -10, right: 10 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Bar dataKey="hours" fill="var(--color-primary)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard title="Quote Success Rate" description="Weekly acceptance vs decline">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendData.map(d => ({ m: d.m, accepted: Math.round(d.spend/12), declined: Math.round(d.saved/2) }))} margin={{ left: -10, right: 10 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Bar dataKey="accepted" fill="var(--color-chart-2)" radius={[6,6,0,0]} />
                <Bar dataKey="declined" fill="var(--color-chart-3)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  );
}