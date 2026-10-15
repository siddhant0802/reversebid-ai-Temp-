import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Search, UserX } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { SectionCard } from "@/components/dashboard/section-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  useAdminUsers, useAllQuotes, useAllOrders, useFraudAlerts, useRequirements, useSuppliers,
  setUserStatus, setUserVerification,
} from "@/lib/store";
import type { AdminUser } from "@/lib/admin-data";
import { StatusBadge, EmptyState, ConfirmDialog, DetailField, runAction, fmtDate } from "@/components/admin/admin-ui";

const search = z.object({
  q: z.string().optional(),
  role: z.enum(["all", "buyer", "seller", "admin"]).optional(),
  status: z.enum(["all", "active", "suspended", "pending"]).optional(),
  verification: z.enum(["all", "verified", "pending", "rejected"]).optional(),
  user: z.string().optional(),
});

export const Route = createFileRoute("/admin/users")({
  validateSearch: zodValidator(search),
  component: UsersPage,
  head: () => ({
    meta: [
      { title: "Users · Admin · ReverseHub AI" },
      { name: "description", content: "Search, filter, verify and suspend buyer, seller and admin accounts." },
      { property: "og:title", content: "Users · Admin · ReverseHub AI" },
      { property: "og:description", content: "Search, filter, verify and suspend buyer, seller and admin accounts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function UsersPage() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/admin/users" });
  const users = useAdminUsers();
  const [confirm, setConfirm] = useState<null | { user: AdminUser; kind: "suspend" | "reject" }>(null);
  const set = (patch: Partial<z.infer<typeof search>>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const q = s.q ?? "";
  const role = s.role ?? "all";
  const status = s.status ?? "all";
  const verification = s.verification ?? "all";

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return users.filter(
      (u) =>
        (!t || u.name.toLowerCase().includes(t) || u.email.toLowerCase().includes(t) || u.id.toLowerCase().includes(t)) &&
        (role === "all" || u.role === role) &&
        (status === "all" || u.status === status) &&
        (verification === "all" || u.verificationStatus === verification),
    );
  }, [users, q, role, status, verification]);

  const viewing = users.find((u) => u.id === s.user) ?? null;

  return (
    <DashboardShell role="admin" breadcrumb={["Admin", "Users"]} title="User Management">
      <SectionCard title={`${filtered.length} of ${users.length} users`} description="Buyers, sellers and administrators">
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => set({ q: e.target.value || undefined })} placeholder="Search by name, email or user ID" className="pl-9" aria-label="Search users" />
          </div>
          <FilterSelect label="Role" value={role} onChange={(v) => set({ role: v as never })} options={["all", "buyer", "seller", "admin"]} />
          <FilterSelect label="Status" value={status} onChange={(v) => set({ status: v as never })} options={["all", "active", "suspended", "pending"]} />
          <FilterSelect label="Verification" value={verification} onChange={(v) => set({ verification: v as never })} options={["all", "verified", "pending", "rejected"]} />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={UserX} title="No users match" body="Try a different search term or clear the filters."
            action={<Button variant="outline" size="sm" onClick={() => navigate({ search: {}, replace: true })}>Clear filters</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead>
                  <TableHead>Verification</TableHead><TableHead>Joined</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{u.id}{u.company ? ` · ${u.company}` : ""}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell><StatusBadge value={u.role} /></TableCell>
                    <TableCell><StatusBadge value={u.status} /></TableCell>
                    <TableCell><StatusBadge value={u.verificationStatus} /></TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{fmtDate(u.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => set({ user: u.id })}>View</Button>
                        {u.role !== "admin" && (u.status === "suspended" ? (
                          <Button size="sm" variant="outline" onClick={() => runAction(setUserStatus(u.id, "active"))}>Activate</Button>
                        ) : (
                          <Button size="sm" variant="ghost" className="text-rose-400" onClick={() => setConfirm({ user: u, kind: "suspend" })}>Suspend</Button>
                        ))}
                        {u.verificationStatus !== "verified" && (
                          <Button size="sm" variant="outline" onClick={() => runAction(setUserVerification(u.id, "verified"))}>Verify</Button>
                        )}
                        {u.verificationStatus === "pending" && (
                          <Button size="sm" variant="ghost" className="text-rose-400" onClick={() => setConfirm({ user: u, kind: "reject" })}>Reject</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>

      <UserDetail user={viewing} onClose={() => set({ user: undefined })} />
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.kind === "suspend" ? `Suspend ${confirm.user.name}?` : `Reject ${confirm?.user.name}?`}
        description={confirm?.kind === "suspend"
          ? "They will lose access to the marketplace until reactivated."
          : "Their verification will be marked as rejected."}
        confirmLabel={confirm?.kind === "suspend" ? "Suspend user" : "Reject verification"}
        onConfirm={() => {
          if (confirm) runAction(confirm.kind === "suspend" ? setUserStatus(confirm.user.id, "suspended") : setUserVerification(confirm.user.id, "rejected"));
          setConfirm(null);
        }}
      />
    </DashboardShell>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="md:w-40" aria-label={label}><SelectValue /></SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o} value={o} className="capitalize">{o === "all" ? `All ${label.toLowerCase()}s` : o[0].toUpperCase() + o.slice(1)}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function UserDetail({ user, onClose }: { user: AdminUser | null; onClose: () => void }) {
  const quotes = useAllQuotes();
  const orders = useAllOrders();
  const alerts = useFraudAlerts();
  const reqs = useRequirements();
  const suppliers = useSuppliers();
  if (!user) return null;
  const supplier = suppliers.find((s) => s.id === user.supplierId);
  const name = supplier?.name ?? "";
  const match = (x: string) => !!name && (x === name || name.startsWith(x) || x.startsWith(name.split(" ")[0]));
  const activity =
    user.role === "seller"
      ? [
          { label: "Quotes submitted", value: quotes.filter((q) => match(q.supplier)).length },
          { label: "Orders won", value: orders.filter((o) => match(o.supplier)).length },
        ]
      : user.role === "buyer"
        ? [
            { label: "RFQs posted", value: user.id === "U-1002" ? reqs.length : 0 },
            { label: "Orders placed", value: user.id === "U-1002" ? orders.length : 0 },
          ]
        : [{ label: "Role", value: "Administrator" }];
  const userAlerts = alerts.filter((a) => a.targetId === user.id || (supplier && a.targetId === supplier.id));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{user.name}</DialogTitle>
          <DialogDescription>{user.id}{user.company ? ` · ${user.company}` : ""}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          <DetailField label="Email">{user.email}</DetailField>
          <DetailField label="Role"><StatusBadge value={user.role} /></DetailField>
          <DetailField label="Status"><StatusBadge value={user.status} /></DetailField>
          <DetailField label="Verification"><StatusBadge value={user.verificationStatus} /></DetailField>
          <DetailField label="Joined">{fmtDate(user.createdAt)}</DetailField>
          {activity.map((a) => <DetailField key={a.label} label={a.label}>{a.value}</DetailField>)}
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Risk alerts</div>
          {userAlerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No fraud alerts linked to this account.</p>
          ) : userAlerts.map((a) => (
            <div key={a.id} className="flex items-center gap-2 text-sm py-1">
              <span className="font-mono text-xs text-muted-foreground">{a.id}</span>
              <span className="flex-1">{a.type}</span>
              <StatusBadge value={a.status} />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
