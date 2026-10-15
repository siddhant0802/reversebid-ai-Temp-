import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/shell";
import { SectionCard } from "@/components/dashboard/section-card";
import { type Order, ORDER_STAGES, orderStageIndex } from "@/lib/mock-data";
import { useAllOrders } from "@/lib/store";
import { OrderAdvanceButton } from "@/components/dashboard/order-advance-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Truck, Package, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/orders")({
  component: Orders,
  head: () => ({ meta: [{ title: "Orders · ReverseHub AI" }, { name: "description", content: "Track and manage orders." }] }),
});

const statusIcon: Record<string, typeof Truck> = { processing: Clock, shipped: Truck, delivered: CheckCircle2, pending: Package };

function downloadInvoice(o: Order) {
  // User orders store a GST-inclusive amount with a breakdown; demo orders store the pre-GST subtotal.
  const gstPct = o.gst ?? 18;
  const subtotal = o.subtotal ?? o.amount;
  const gstAmount = o.gstAmount ?? Math.round(subtotal * gstPct / 100);
  const total = o.subtotal != null ? o.amount : subtotal + gstAmount;
  const inv = `INV-${o.id.replace(/^ORD-/, "")}`;
  const lines = [
    "ReverseHub AI — Tax Invoice",
    "================================",
    `Invoice No : ${inv}`,
    `Order ID   : ${o.id}`,
    `Date       : ${new Date(o.createdAt ?? Date.now()).toLocaleDateString("en-IN")}`,
    ...(o.requirementId ? [`RFQ ID     : ${o.requirementId}`] : []),
    "",
    `Supplier   : ${o.supplier}`,
    `Item       : ${o.title}`,
    `Status     : ${o.status}`,
    `ETA        : ${o.eta}`,
    ...(o.quantity ? [`Quantity   : ${o.quantity}`] : []),
    ...(o.unitPrice ? [`Unit price : ₹${o.unitPrice.toLocaleString("en-IN")}`] : []),
    ...(o.delivery ? [`Delivery   : ${o.delivery}`] : []),
    ...(o.warranty ? [`Warranty   : ${o.warranty}`] : []),
    "",
    `Subtotal   : ₹${subtotal.toLocaleString("en-IN")}`,
    `GST (${gstPct}%)  : ₹${gstAmount.toLocaleString("en-IN")}`,
    `Total      : ₹${total.toLocaleString("en-IN")}`,
    "",
    "Thank you for your business.",
  ].join("\n");
  const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${inv}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast.success("Invoice downloaded", { description: `${inv} saved to your device.` });
}

function Orders() {
  const orders = useAllOrders();
  return (
    <DashboardShell role="buyer" breadcrumb={["Workspace", "Orders"]} title="Orders">
      <div className="grid grid-cols-1 gap-4">
        {orders.map((o) => {
          const Icon = statusIcon[o.status];
          return (
            <SectionCard key={o.id}>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">{o.id}</span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/30">
                      <Icon className="h-3 w-3 mr-1" />{o.status}
                    </Badge>
                  </div>
                  <div className="mt-1 font-medium">{o.title}</div>
                  <div className="text-xs text-muted-foreground">{o.supplier} · ETA {o.eta}</div>
                </div>
                <div className="w-full md:w-72">
                  <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Progress</span><span className="tabular-nums">{o.progress}%</span></div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${o.progress}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Amount</div>
                  <div className="text-lg font-semibold tabular-nums">₹{(o.amount / 1000).toFixed(0)}k</div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" onClick={() => downloadInvoice(o)}>
                    <Download className="h-3.5 w-3.5 mr-1" /> Invoice
                  </Button>
                  <OrderAdvanceButton order={o} />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2">
                {ORDER_STAGES.map((step, i, arr) => {
                  const done = orderStageIndex(o) >= i;
                  return (
                    <div key={step} className="flex-1 flex items-center gap-2">
                      <div className={`h-6 w-6 rounded-full grid place-items-center text-[10px] ${done ? "bg-gradient-to-br from-primary to-accent text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {done ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
                      </div>
                      <div className="text-[11px] flex-1 truncate">{step}</div>
                      {i < arr.length - 1 && <div className={`h-0.5 flex-1 ${done ? "bg-gradient-to-r from-primary to-accent" : "bg-muted"}`} />}
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          );
        })}
      </div>
    </DashboardShell>
  );
}