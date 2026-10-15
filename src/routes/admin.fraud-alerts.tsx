import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { ShieldCheck, Search } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { SectionCard } from "@/components/dashboard/section-card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFraudAlerts, riskBand } from "@/lib/store";
import { StatusBadge, EmptyState, FraudAlertActions, FraudAlertDialog, fmtDate } from "@/components/admin/admin-ui";

const statuses = ["open", "investigating", "resolved", "dismissed", "all"] as const;
const severities = ["all", "low", "medium", "high", "critical"] as const;
const search = z.object({
  q: z.string().optional(),
  status: z.enum(statuses).optional(),
  severity: z.enum(severities).optional(),
  alert: z.string().optional(),
});

export const Route = createFileRoute("/admin/fraud-alerts")({
  validateSearch: zodValidator(search),
  component: FraudPage,
  head: () => ({
    meta: [
      { title: "Fraud Alerts · Admin · ReverseHub AI" },
      { name: "description", content: "Investigate, resolve or dismiss marketplace risk alerts with rule-based risk scores." },
      { property: "og:title", content: "Fraud Alerts · Admin · ReverseHub AI" },
      { property: "og:description", content: "Investigate, resolve or dismiss marketplace risk alerts with rule-based risk scores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function FraudPage() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/admin/fraud-alerts" });
  const alerts = useFraudAlerts();
  const status = s.status ?? "open";
  const severity = s.severity ?? "all";
  const q = (s.q ?? "").trim().toLowerCase();
  const set = (patch: Partial<z.infer<typeof search>>) => navigate({ search: (p) => ({ ...p, ...patch }), replace: true });

  const list = alerts.filter(
    (a) => (status === "all" || a.status === status) && (severity === "all" || a.severity === severity) &&
      (!q || [a.id, a.target, a.type, a.description].some((v) => v.toLowerCase().includes(q))),
  );

  return (
    <DashboardShell role="admin" breadcrumb={["Admin", "Fraud Alerts"]} title="Fraud Alerts">
      <SectionCard title="Risk queue" description="Scores: 0–30 low · 31–60 medium · 61–80 high · 81–100 critical (rule-based)">
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <Tabs value={status} onValueChange={(v) => set({ status: v as (typeof statuses)[number] })}>
            <TabsList className="flex-wrap h-auto">
              {statuses.map((t) => (
                <TabsTrigger key={t} value={t} className="capitalize">
                  {t} ({t === "all" ? alerts.length : alerts.filter((a) => a.status === t).length})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={s.q ?? ""} onChange={(e) => set({ q: e.target.value || undefined })} placeholder="Search alert ID, target or type" className="pl-9" />
          </div>
          <Select value={severity} onValueChange={(v) => set({ severity: v as (typeof severities)[number] })}>
            <SelectTrigger className="lg:w-40" aria-label="Severity"><SelectValue /></SelectTrigger>
            <SelectContent>
              {severities.map((v) => <SelectItem key={v} value={v} className="capitalize">{v === "all" ? "All severities" : v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {list.length === 0 ? (
          <EmptyState icon={ShieldCheck} title={status === "open" ? "No open fraud alerts" : "No alerts here"} body="Nothing matches this view right now." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert</TableHead><TableHead>Target</TableHead><TableHead>Severity</TableHead><TableHead>Risk score</TableHead>
                  <TableHead>Created</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="max-w-xs">
                      <div className="font-medium">{a.type}</div>
                      <div className="text-xs text-muted-foreground truncate"><span className="font-mono">{a.id}</span> · {a.description}</div>
                    </TableCell>
                    <TableCell>{a.target}<div className="text-xs text-muted-foreground capitalize">{a.targetType}</div></TableCell>
                    <TableCell><StatusBadge value={a.severity} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-28">
                        <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full ${a.riskScore > 60 ? "bg-rose-400" : a.riskScore > 30 ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width: `${a.riskScore}%` }} />
                        </div>
                        <span className="text-xs tabular-nums" title={riskBand(a.riskScore)}>{a.riskScore}</span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{fmtDate(a.createdAt)}</TableCell>
                    <TableCell><StatusBadge value={a.status} /></TableCell>
                    <TableCell><FraudAlertActions alert={a} onView={() => set({ alert: a.id })} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>
      <FraudAlertDialog alert={alerts.find((a) => a.id === s.alert) ?? null} onOpenChange={(o) => !o && set({ alert: undefined })} />
    </DashboardShell>
  );
}
