import { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { ClipboardCheck, Search } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { SectionCard } from "@/components/dashboard/section-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSuppliers } from "@/lib/store";
import { StatusBadge, EmptyState, SupplierReviewDialog, fmtDate } from "@/components/admin/admin-ui";

const tabs = ["pending", "information_required", "verified", "rejected", "all"] as const;
const search = z.object({ q: z.string().optional(), tab: z.enum(tabs).optional(), review: z.string().optional() });

export const Route = createFileRoute("/admin/verifications")({
  validateSearch: zodValidator(search),
  component: VerificationsPage,
  head: () => ({
    meta: [
      { title: "Supplier Verifications · Admin · ReverseHub AI" },
      { name: "description", content: "Review supplier GST, KYC and documents, then approve, reject or request more information." },
      { property: "og:title", content: "Supplier Verifications · Admin · ReverseHub AI" },
      { property: "og:description", content: "Review supplier GST, KYC and documents, then approve, reject or request more information." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const tabLabel: Record<(typeof tabs)[number], string> = {
  pending: "Pending", information_required: "Info requested", verified: "Approved", rejected: "Rejected", all: "All",
};

function VerificationsPage() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/admin/verifications" });
  const suppliers = useSuppliers();
  const tab = s.tab ?? "pending";
  const q = s.q ?? "";
  const set = (patch: Partial<z.infer<typeof search>>) => navigate({ search: (p) => ({ ...p, ...patch }), replace: true });

  const counts = useMemo(() => Object.fromEntries(tabs.map((t) => [t, t === "all" ? suppliers.length : suppliers.filter((x) => x.verificationStatus === t).length])), [suppliers]);
  const list = suppliers.filter(
    (x) => (tab === "all" || x.verificationStatus === tab) &&
      (!q.trim() || [x.name, x.contact, x.gstin, x.id].some((v) => v.toLowerCase().includes(q.trim().toLowerCase()))),
  );

  return (
    <DashboardShell role="admin" breadcrumb={["Admin", "Verifications"]} title="Supplier Verifications">
      <SectionCard title="Verification queue" description="GST, KYC and document checks for seller accounts">
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <Tabs value={tab} onValueChange={(v) => set({ tab: v as (typeof tabs)[number] })}>
            <TabsList className="flex-wrap h-auto">
              {tabs.map((t) => <TabsTrigger key={t} value={t}>{tabLabel[t]} ({counts[t]})</TabsTrigger>)}
            </TabsList>
          </Tabs>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => set({ q: e.target.value || undefined })} placeholder="Search supplier, contact or GSTIN" className="pl-9" />
          </div>
        </div>

        {list.length === 0 ? (
          <EmptyState icon={ClipboardCheck} title={tab === "pending" ? "No pending verifications" : "Nothing here"}
            body={tab === "pending" ? "Every supplier submission has been reviewed." : "No suppliers match this view."} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead><TableHead>GST</TableHead><TableHead>KYC</TableHead><TableHead>Documents</TableHead>
                  <TableHead>Submitted</TableHead><TableHead>Risk</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((x) => (
                  <TableRow key={x.id}>
                    <TableCell><div className="font-medium">{x.name}</div><div className="text-xs text-muted-foreground">{x.contact}</div></TableCell>
                    <TableCell><StatusBadge value={x.gstStatus} /></TableCell>
                    <TableCell><StatusBadge value={x.kycStatus} /></TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {x.documents.filter((d) => d.status === "verified").length}/{x.documents.length} verified
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{fmtDate(x.submittedAt)}</TableCell>
                    <TableCell><StatusBadge value={x.risk} suffix={` · ${x.riskScore}`} /></TableCell>
                    <TableCell><StatusBadge value={x.verificationStatus} /></TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => set({ review: x.id })}>
                        {x.verificationStatus === "verified" || x.verificationStatus === "rejected" ? "View" : "Review"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>
      <SupplierReviewDialog supplier={suppliers.find((x) => x.id === s.review) ?? null} onOpenChange={(o) => !o && set({ review: undefined })} />
    </DashboardShell>
  );
}
