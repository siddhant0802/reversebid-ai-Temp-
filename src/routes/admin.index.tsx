import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, ShieldCheck, ShieldAlert, IndianRupee, ScanEye, ClipboardCheck, History, ArrowRight } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { SectionCard } from "@/components/dashboard/section-card";
import { Button } from "@/components/ui/button";
import { useAdminUsers, useSuppliers, useFraudAlerts, useAllOrders, useAdminLog } from "@/lib/store";
import {
  StatusBadge, EmptyState, SupplierReviewDialog, FraudAlertActions, FraudAlertDialog, fmtDate,
} from "@/components/admin/admin-ui";

export const Route = createFileRoute("/admin/")({
  component: Admin,
  head: () => ({
    meta: [
      { title: "Admin Overview · ReverseHub AI" },
      { name: "description", content: "Live marketplace administration: users, supplier verification, fraud alerts and GMV." },
      { property: "og:title", content: "Admin Overview · ReverseHub AI" },
      { property: "og:description", content: "Live marketplace administration: users, supplier verification, fraud alerts and GMV." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function Admin() {
  const users = useAdminUsers();
  const suppliers = useSuppliers();
  const alerts = useFraudAlerts();
  const orders = useAllOrders();
  const log = useAdminLog();
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [alertId, setAlertId] = useState<string | null>(null);

  const verified = suppliers.filter((s) => s.verificationStatus === "verified").length;
  const pending = suppliers.filter((s) => s.verificationStatus === "pending" || s.verificationStatus === "information_required");
  const openAlerts = alerts.filter((a) => a.status === "open");
  const activeAlerts = alerts.filter((a) => a.status === "open" || a.status === "investigating");
  const gmv = orders.reduce((sum, o) => sum + o.amount, 0);
  const gmvLakh = gmv / 1e5;

  return (
    <DashboardShell role="admin" breadcrumb={["Admin", "Overview"]} title="Platform Overview">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Link to="/admin/users" className="block"><StatCard label="Total Users" animatedValue={users.length} icon={Users} tone="primary" index={0} /></Link>
        <Link to="/admin/verifications" className="block"><StatCard label="Verified Suppliers" animatedValue={verified} icon={ShieldCheck} tone="success" index={1} /></Link>
        <Link to="/admin/reports" className="block"><StatCard label="GMV (All orders)" animatedValue={gmvLakh} prefix="₹" suffix="L" decimals={1} icon={IndianRupee} tone="accent" index={2} /></Link>
        <Link to="/admin/fraud-alerts" className="block"><StatCard label="Fraud Alerts Open" animatedValue={openAlerts.length} icon={ShieldAlert} tone="warning" index={3} /></Link>
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SectionCard
          title={`Pending Verifications (${pending.length})`}
          description="KYC / GST / document checks"
          actions={<Button asChild size="sm" variant="ghost"><Link to="/admin/verifications">View all <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link></Button>}
        >
          {pending.length === 0 ? (
            <EmptyState icon={ClipboardCheck} title="All caught up" body="No supplier verifications are waiting for review." />
          ) : (
            <div className="space-y-2">
              {pending.slice(0, 5).map((v) => (
                <div key={v.id} className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary/25 to-accent/20 grid place-items-center text-xs font-semibold">
                    {v.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{v.name}</div>
                    <div className="text-xs text-muted-foreground">Seller · submitted {fmtDate(v.submittedAt)}</div>
                  </div>
                  <StatusBadge value={v.risk} suffix=" risk" />
                  <Button size="sm" variant="outline" onClick={() => setReviewId(v.id)}>Review</Button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Fraud Monitoring"
          description="Rule-based signals from KYC, GST and bid patterns"
          actions={<ScanEye className="h-4 w-4 text-primary" />}
        >
          {activeAlerts.length === 0 ? (
            <EmptyState icon={ShieldCheck} title="No active alerts" body="Every fraud alert has been resolved or dismissed." />
          ) : (
            <div className="space-y-2">
              {activeAlerts.slice(0, 5).map((f) => (
                <div key={f.id} className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                  <ShieldAlert className={`h-4 w-4 shrink-0 ${f.severity === "critical" || f.severity === "high" ? "text-rose-400" : f.severity === "medium" ? "text-amber-400" : "text-muted-foreground"}`} />
                  <button className="flex-1 min-w-0 text-left" onClick={() => setAlertId(f.id)}>
                    <div className="text-xs font-mono text-muted-foreground">{f.id} · <span className="capitalize">{f.status}</span></div>
                    <div className="text-sm truncate">{f.description}</div>
                  </button>
                  <FraudAlertActions alert={f} compact />
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard className="mt-4" title="Admin Activity" description="Every administrative action, newest first" actions={<History className="h-4 w-4 text-primary" />}>
        {log.length === 0 ? (
          <EmptyState icon={History} title="No admin actions yet" body="Approvals, suspensions, alert updates and exports will appear here." />
        ) : (
          <div className="divide-y divide-border/60">
            {log.slice(0, 8).map((l) => (
              <div key={l.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="font-medium">{l.action}</span>
                <span className="text-muted-foreground flex-1 truncate">{l.target}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{l.admin} · {new Date(l.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SupplierReviewDialog supplier={suppliers.find((s) => s.id === reviewId) ?? null} onOpenChange={(o) => !o && setReviewId(null)} />
      <FraudAlertDialog alert={alerts.find((a) => a.id === alertId) ?? null} onOpenChange={(o) => !o && setAlertId(null)} />
    </DashboardShell>
  );
}
