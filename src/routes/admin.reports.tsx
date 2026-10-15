import { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Download, BarChart3, History } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/shell";
import { SectionCard } from "@/components/dashboard/section-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminUsers, useSuppliers, useFraudAlerts, useAllOrders, useAdminLog, recordReportExport } from "@/lib/store";
import { EmptyState, fmtINR } from "@/components/admin/admin-ui";

const ranges = ["today", "7d", "30d", "month", "all"] as const;
type Range = (typeof ranges)[number];
const rangeLabel: Record<Range, string> = { today: "Today", "7d": "7 Days", "30d": "30 Days", month: "This Month", all: "All Time" };

export const Route = createFileRoute("/admin/reports")({
  validateSearch: zodValidator(z.object({ range: z.enum(ranges).optional() })),
  component: ReportsPage,
  head: () => ({
    meta: [
      { title: "Reports · Admin · ReverseHub AI" },
      { name: "description", content: "User, supplier, order, transaction and fraud reports with date filters and CSV export." },
      { property: "og:title", content: "Reports · Admin · ReverseHub AI" },
      { property: "og:description", content: "User, supplier, order, transaction and fraud reports with date filters and CSV export." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function since(range: Range): number {
  const now = new Date();
  if (range === "all") return 0;
  if (range === "today") return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (range === "month") return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  return now.getTime() - (range === "7d" ? 7 : 30) * 86_400_000;
}

type Metric = { label: string; value: string | number };

function ReportsPage() {
  const { range = "all" } = Route.useSearch();
  const navigate = useNavigate({ from: "/admin/reports" });
  const users = useAdminUsers();
  const suppliers = useSuppliers();
  const alerts = useFraudAlerts();
  const orders = useAllOrders();
  const log = useAdminLog();

  const sections = useMemo(() => {
    const from = since(range);
    const inRange = (iso?: string) => !!iso && new Date(iso).getTime() >= from;
    // Sample orders without a creation date are spread over past weeks so date filters stay meaningful.
    const dated = orders.map((o, i) => ({
      ...o,
      at: o.createdAt ?? o.stageHistory?.[0]?.timestamp ?? new Date(Date.now() - (3 + i * 9) * 86_400_000).toISOString(),
    }));
    const u = users.filter((x) => inRange(x.createdAt));
    const s = suppliers.filter((x) => inRange(x.submittedAt));
    const o = dated.filter((x) => inRange(x.at));
    const a = alerts.filter((x) => inRange(x.createdAt));
    const sum = (list: typeof o) => list.reduce((t, x) => t + x.amount, 0);
    const delivered = o.filter((x) => x.status === "delivered");
    const processing = o.filter((x) => x.status !== "delivered");

    const out: { title: string; metrics: Metric[] }[] = [
      { title: "User Report", metrics: [
        { label: "Total users", value: u.length },
        { label: "Buyers", value: u.filter((x) => x.role === "buyer").length },
        { label: "Sellers", value: u.filter((x) => x.role === "seller").length },
        { label: "Admins", value: u.filter((x) => x.role === "admin").length },
        { label: "Active users", value: u.filter((x) => x.status === "active").length },
        { label: "Suspended users", value: u.filter((x) => x.status === "suspended").length },
      ] },
      { title: "Supplier Report", metrics: [
        { label: "Total suppliers", value: s.length },
        { label: "Verified suppliers", value: s.filter((x) => x.verificationStatus === "verified").length },
        { label: "Pending verification", value: s.filter((x) => x.verificationStatus === "pending" || x.verificationStatus === "information_required").length },
        { label: "Rejected suppliers", value: s.filter((x) => x.verificationStatus === "rejected").length },
      ] },
      { title: "Order Report", metrics: [
        { label: "Total orders", value: o.length },
        { label: "Processing", value: o.filter((x) => x.status === "processing" || x.status === "pending").length },
        { label: "Shipped", value: o.filter((x) => x.status === "shipped").length },
        { label: "Delivered", value: delivered.length },
      ] },
      { title: "Transaction Report", metrics: [
        { label: "Total GMV", value: fmtINR(sum(o)) },
        { label: "Completed transaction value", value: fmtINR(sum(delivered)) },
        { label: "Processing transaction value", value: fmtINR(sum(processing)) },
      ] },
      { title: "Fraud Report", metrics: [
        { label: "Open", value: a.filter((x) => x.status === "open").length },
        { label: "Investigating", value: a.filter((x) => x.status === "investigating").length },
        { label: "Resolved", value: a.filter((x) => x.status === "resolved").length },
        { label: "Dismissed", value: a.filter((x) => x.status === "dismissed").length },
      ] },
    ];
    return out;
  }, [range, users, suppliers, alerts, orders]);

  const empty = sections.every((sec) => sec.metrics.every((m) => m.value === 0 || m.value === "₹0"));

  const exportCsv = () => {
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = [["Report", "Metric", "Value"], ...sections.flatMap((sec) => sec.metrics.map((m) => [sec.title, m.label, m.value]))];
    const csv = [`# ReverseHub AI marketplace report — ${rangeLabel[range]} — generated ${new Date().toLocaleString("en-IN")}`, ...rows.map((r) => r.map(esc).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `reversehub-report-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    recordReportExport(rangeLabel[range]);
    toast.success("Report exported as CSV");
  };

  return (
    <DashboardShell
      role="admin"
      breadcrumb={["Admin", "Reports"]}
      title="Marketplace Reports"
      actions={<Button size="sm" onClick={exportCsv}><Download className="h-4 w-4 mr-1.5" /> Export Report</Button>}
    >
      <Tabs value={range} onValueChange={(v) => navigate({ search: { range: v as Range }, replace: true })} className="mb-4">
        <TabsList className="flex-wrap h-auto">
          {ranges.map((r) => <TabsTrigger key={r} value={r}>{rangeLabel[r]}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      {empty ? (
        <EmptyState icon={BarChart3} title="No activity in this period" body="Try a wider date range to see marketplace numbers." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sections.map((sec) => (
            <SectionCard key={sec.title} title={sec.title}>
              <div className="divide-y divide-border/60">
                {sec.metrics.map((m) => (
                  <div key={m.label} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-semibold tabular-nums">{m.value}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          ))}
        </div>
      )}

      <SectionCard className="mt-4" title="Admin Activity Log" description="Stored on this device" actions={<History className="h-4 w-4 text-primary" />}>
        {log.length === 0 ? (
          <EmptyState icon={History} title="No admin actions yet" body="Actions like approvals, suspensions and exports are recorded here." />
        ) : (
          <div className="divide-y divide-border/60 max-h-80 overflow-auto">
            {log.map((l) => (
              <div key={l.id} className="flex items-center gap-3 py-2 text-sm">
                <span className="font-medium">{l.action}</span>
                <span className="text-muted-foreground flex-1 truncate">{l.target}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{l.admin} · {new Date(l.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </DashboardShell>
  );
}
