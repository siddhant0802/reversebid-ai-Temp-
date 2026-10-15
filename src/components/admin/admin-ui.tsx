import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";
import { FileCheck2, FileClock, FileX2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  approveSupplier, rejectSupplier, requestSupplierInfo, updateFraudAlert, riskBand,
  type ActionResult,
} from "@/lib/store";
import type { FraudAlert, Supplier } from "@/lib/admin-data";

export function runAction(r: ActionResult) {
  if (r.ok) toast.success(r.message);
  else toast.error(r.error);
  return r.ok;
}

export const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const fmtINR = (n: number) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(2)}Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)}L` : `₹${n.toLocaleString("en-IN")}`;

const tones: Record<string, string> = {
  green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  amber: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  red: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  blue: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  muted: "bg-muted/40 text-muted-foreground border-border/60",
};

const toneFor: Record<string, keyof typeof tones> = {
  active: "green", verified: "green", approved: "green", resolved: "green", low: "green",
  pending: "amber", medium: "amber", investigating: "blue", information_required: "blue",
  suspended: "red", rejected: "red", high: "red", critical: "red", open: "red", failed: "red", mismatch: "red", missing: "red",
  dismissed: "muted", buyer: "blue", seller: "muted", admin: "amber",
};

export function StatusBadge({ value, suffix = "" }: { value: string; suffix?: string }) {
  return (
    <Badge variant="outline" className={`capitalize whitespace-nowrap ${tones[toneFor[value] ?? "muted"]}`}>
      {value.replace(/_/g, " ")}{suffix}
    </Badge>
  );
}

export function EmptyState({ icon: Icon, title, body, action }: { icon: LucideIcon; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 rounded-xl border border-dashed border-border/60 bg-muted/10">
      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/25 to-accent/15 grid place-items-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="mt-3 font-medium">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ConfirmDialog({
  open, onOpenChange, title, description, confirmLabel, onConfirm, destructive = true,
}: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description: string;
  confirmLabel: string; onConfirm: () => void; destructive?: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{children}</div>
    </div>
  );
}

export { Field as DetailField };

/** Verification review: Approve / Reject (with reason) / Request more information. */
export function SupplierReviewDialog({ supplier, onOpenChange }: { supplier: Supplier | null; onOpenChange: (o: boolean) => void }) {
  const [mode, setMode] = useState<"view" | "reject" | "info">("view");
  const [text, setText] = useState("");
  const close = (o: boolean) => {
    if (!o) { setMode("view"); setText(""); }
    onOpenChange(o);
  };
  if (!supplier) return null;
  const decided = supplier.verificationStatus === "verified" || supplier.verificationStatus === "rejected";
  const docIcon = { verified: FileCheck2, pending: FileClock, missing: FileX2 } as const;

  const submit = () => {
    const ok = runAction(mode === "reject" ? rejectSupplier(supplier.id, text) : requestSupplierInfo(supplier.id, text));
    if (ok) close(false);
  };

  return (
    <Dialog open={!!supplier} onOpenChange={close}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">{supplier.name} <StatusBadge value={supplier.verificationStatus} /></DialogTitle>
          <DialogDescription>Supplier verification review · {supplier.id}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Contact">{supplier.contact}</Field>
          <Field label="Company">{supplier.name}</Field>
          <Field label="GST">
            <span className="font-mono text-xs">{supplier.gstin}</span> <StatusBadge value={supplier.gstStatus} />
          </Field>
          <Field label="KYC"><StatusBadge value={supplier.kycStatus} /></Field>
          <Field label="Risk level">
            <StatusBadge value={supplier.risk} suffix=" risk" /> <span className="text-xs text-muted-foreground ml-1">score {supplier.riskScore}</span>
          </Field>
          <Field label="Submitted">{fmtDate(supplier.submittedAt)}</Field>
        </div>
        <div className="rounded-lg border border-border/60 p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Documents</div>
          <div className="space-y-1.5">
            {supplier.documents.map((d) => {
              const I = docIcon[d.status];
              return (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <I className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{d.name}</span>
                  <StatusBadge value={d.status} />
                </div>
              );
            })}
          </div>
        </div>
        {supplier.rejectionReason && <p className="text-sm text-rose-400">Rejection reason: {supplier.rejectionReason}</p>}
        {supplier.infoRequest && <p className="text-sm text-sky-400">Information requested: {supplier.infoRequest}</p>}

        {mode !== "view" && (
          <div className="space-y-2">
            <div className="text-sm font-medium">{mode === "reject" ? "Rejection reason" : "What information is needed?"}</div>
            <Textarea autoFocus value={text} onChange={(e) => setText(e.target.value)}
              placeholder={mode === "reject" ? "e.g. GSTIN does not match company name" : "e.g. Please upload a valid PAN card"} />
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          {decided ? (
            <Button variant="outline" onClick={() => close(false)}>Close</Button>
          ) : mode === "view" ? (
            <>
              <Button variant="outline" onClick={() => setMode("info")}>Request more information</Button>
              <Button variant="outline" className="text-rose-400" onClick={() => setMode("reject")}>Reject</Button>
              <Button onClick={() => { if (runAction(approveSupplier(supplier.id))) close(false); }}>Approve</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => { setMode("view"); setText(""); }}>Back</Button>
              <Button variant={mode === "reject" ? "destructive" : "default"} disabled={!text.trim()} onClick={submit}>
                {mode === "reject" ? "Confirm rejection" : "Send request"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Fraud alert detail + workflow actions. Resolve/Dismiss ask for confirmation. */
export function FraudAlertActions({ alert, onView, compact = false }: { alert: FraudAlert; onView?: () => void; compact?: boolean }) {
  const [confirm, setConfirm] = useState<null | "resolve" | "dismiss">(null);
  const closed = alert.status === "resolved" || alert.status === "dismissed";
  return (
    <div className="flex items-center gap-1 justify-end">
      {onView && <Button size="sm" variant="ghost" onClick={onView}>View</Button>}
      {alert.status === "open" && (
        <Button size="sm" variant={compact ? "ghost" : "outline"} onClick={() => runAction(updateFraudAlert(alert.id, "investigate"))}>Investigate</Button>
      )}
      {alert.status === "investigating" && (
        <Button size="sm" variant="outline" onClick={() => setConfirm("resolve")}>Resolve</Button>
      )}
      {!closed && !compact && (
        <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setConfirm("dismiss")}>Dismiss</Button>
      )}
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm === "resolve" ? `Resolve ${alert.id}?` : `Dismiss ${alert.id}?`}
        description={confirm === "resolve"
          ? "Mark this alert as resolved after investigation. It will be removed from the open queue."
          : "Dismiss this alert as a false positive. It will no longer count as an open risk."}
        confirmLabel={confirm === "resolve" ? "Resolve alert" : "Dismiss alert"}
        destructive={confirm === "dismiss"}
        onConfirm={() => { if (confirm) runAction(updateFraudAlert(alert.id, confirm)); setConfirm(null); }}
      />
    </div>
  );
}

export function FraudAlertDialog({ alert, onOpenChange }: { alert: FraudAlert | null; onOpenChange: (o: boolean) => void }) {
  if (!alert) return null;
  return (
    <Dialog open={!!alert} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-400" /> {alert.id} · {alert.type}
          </DialogTitle>
          <DialogDescription>{alert.description}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Target">{alert.target} <span className="text-xs text-muted-foreground capitalize">({alert.targetType})</span></Field>
          <Field label="Status"><StatusBadge value={alert.status} /></Field>
          <Field label="Severity"><StatusBadge value={alert.severity} /></Field>
          <Field label="Risk score">
            {alert.riskScore}/100 <span className="text-xs text-muted-foreground capitalize">· {riskBand(alert.riskScore)} band</span>
          </Field>
          <Field label="Created">{fmtDate(alert.createdAt)}</Field>
          <Field label="Last update">{fmtDate(alert.updatedAt)}</Field>
        </div>
        <p className="text-xs text-muted-foreground">Risk scores come from rule-based checks (GST, KYC, bid patterns), not a machine-learning model.</p>
        <DialogFooter><FraudAlertActions alert={alert} /></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
