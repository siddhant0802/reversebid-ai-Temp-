import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Users, ShieldCheck, ShieldAlert, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAdminUsers, useSuppliers, useFraudAlerts, useAllOrders } from "@/lib/store";

/** Global admin search across users, suppliers/verifications, fraud alerts and orders. */
export function AdminSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const users = useAdminUsers();
  const suppliers = useSuppliers();
  const alerts = useFraudAlerts();
  const orders = useAllOrders();

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return null;
    const has = (...v: (string | undefined)[]) => v.some((x) => x?.toLowerCase().includes(t));
    return {
      users: users.filter((u) => has(u.name, u.email, u.id, u.company)).slice(0, 4),
      suppliers: suppliers.filter((s) => has(s.name, s.id, s.gstin, s.contact)).slice(0, 4),
      alerts: alerts.filter((a) => has(a.id, a.target, a.type, a.description)).slice(0, 4),
      orders: orders.filter((o) => has(o.id, o.title, o.supplier)).slice(0, 4),
    };
  }, [q, users, suppliers, alerts, orders]);

  const total = results ? results.users.length + results.suppliers.length + results.alerts.length + results.orders.length : 0;
  const row = "flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted/60";
  const close = () => { setOpen(false); setQ(""); };

  return (
    <div className="relative flex-1 max-w-xl">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => e.key === "Escape" && close()}
        placeholder="Search users, suppliers, alerts, orders…"
        aria-label="Admin search"
        className="pl-9 h-9 bg-muted/40 border-border/60"
      />
      {open && results && (
        <div className="absolute left-0 right-0 top-11 z-50 rounded-xl border border-border/60 bg-popover/95 backdrop-blur-xl p-2 shadow-2xl max-h-[70vh] overflow-auto">
          {total === 0 && <div className="px-3 py-6 text-center text-sm text-muted-foreground">No matches for “{q}”.</div>}
          {results.users.length > 0 && <Group label="Users" />}
          {results.users.map((u) => (
            <Link key={u.id} to="/admin/users" search={{ user: u.id }} className={row} onClick={close}>
              <Users className="h-4 w-4 text-primary" /><span className="flex-1 truncate">{u.name}</span>
              <span className="text-xs text-muted-foreground truncate">{u.email}</span>
            </Link>
          ))}
          {results.suppliers.length > 0 && <Group label="Suppliers & verifications" />}
          {results.suppliers.map((s) => (
            <Link key={s.id} to="/admin/verifications" search={{ review: s.id }} className={row} onClick={close}>
              <ShieldCheck className="h-4 w-4 text-emerald-400" /><span className="flex-1 truncate">{s.name}</span>
              <span className="text-xs text-muted-foreground capitalize">{s.verificationStatus.replace(/_/g, " ")}</span>
            </Link>
          ))}
          {results.alerts.length > 0 && <Group label="Fraud alerts" />}
          {results.alerts.map((a) => (
            <Link key={a.id} to="/admin/fraud-alerts" search={{ alert: a.id }} className={row} onClick={close}>
              <ShieldAlert className="h-4 w-4 text-rose-400" /><span className="flex-1 truncate">{a.id} · {a.type}</span>
              <span className="text-xs text-muted-foreground capitalize">{a.status}</span>
            </Link>
          ))}
          {results.orders.length > 0 && <Group label="Orders" />}
          {results.orders.map((o) => (
            <Link key={o.id} to="/admin/reports" className={row} onClick={close}>
              <Package className="h-4 w-4 text-amber-400" /><span className="flex-1 truncate">{o.id} · {o.title}</span>
              <span className="text-xs text-muted-foreground capitalize">{o.status}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Group({ label }: { label: string }) {
  return <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>;
}
