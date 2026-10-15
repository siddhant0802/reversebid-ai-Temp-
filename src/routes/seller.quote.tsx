import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useState } from "react";
import { useRequirements, submitQuote } from "@/lib/store";
import { DashboardShell } from "@/components/dashboard/shell";
import { SectionCard } from "@/components/dashboard/section-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Upload, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/seller/quote")({
  component: QuoteSubmit,
  validateSearch: zodValidator(z.object({ rfq: fallback(z.string(), "").default("") })),
  head: () => ({ meta: [{ title: "Submit Quote · ReverseHub AI" }, { name: "description", content: "Send a competitive quote to a buyer." }] }),
});

function QuoteSubmit() {
  const { rfq } = Route.useSearch();
  const requirements = useRequirements();
  const req = requirements.find((r) => r.id === (rfq || "RFQ-8842")) ?? requirements[0];
  const [form, setForm] = useState({ unitPrice: "", gst: "18", delivery: "", warranty: "", notes: "" });
  const [agree, setAgree] = useState(true);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const unit = Number(form.unitPrice);
  const gst = Number(form.gst);
  const qty = Math.max(1, req?.quantity ?? 1);
  const subtotal = unit > 0 ? unit * qty : 0;
  const total = subtotal + Math.round((subtotal * (gst || 0)) / 100);

  const onSubmit = () => {
    if (!req) return toast.error("No RFQ selected");
    if (!(unit > 0)) return toast.error("Enter a valid unit price");
    if (!(gst >= 0 && gst <= 28)) return toast.error("GST must be between 0 and 28%");
    if (!form.delivery.trim()) return toast.error("Enter estimated delivery");
    if (!form.warranty.trim()) return toast.error("Enter warranty");
    if (!agree) return toast.error("Please accept the supplier terms");
    const { quote, revised } = submitQuote({ requirementId: req.id, unitPrice: unit, gst, delivery: form.delivery.trim(), warranty: form.warranty.trim(), notes: form.notes.trim() });
    toast.success(revised ? "Quote revised" : "Quote submitted", { description: `₹${quote.totalAmount!.toLocaleString("en-IN")} incl. GST sent to the buyer for ${req.id}.` });
  };

  return (
    <DashboardShell role="seller" breadcrumb={["Seller", "Submit Quote"]} title="Submit your quote">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard className="lg:col-span-2" title={req ? `${req.id} · ${req.title}` : "No RFQ selected"} description={req ? `${req.location} · Budget ₹${(req.budget / 100000).toFixed(1)}L · Qty ${qty} · Due ${req.deadline}` : ""}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Unit price (₹)</Label><Input type="number" min={1} value={form.unitPrice} onChange={set("unitPrice")} placeholder="2980" className="mt-1.5" /></div>
            <div><Label>GST %</Label><Input type="number" min={0} max={28} value={form.gst} onChange={set("gst")} placeholder="18" className="mt-1.5" /></div>
            <div><Label>Estimated delivery</Label><Input value={form.delivery} onChange={set("delivery")} placeholder="8 days" className="mt-1.5" /></div>
            <div><Label>Warranty</Label><Input value={form.warranty} onChange={set("warranty")} placeholder="5 years" className="mt-1.5" /></div>
            <div className="md:col-span-2"><Label>Notes</Label><Textarea rows={3} value={form.notes} onChange={set("notes")} placeholder="Free assembly, on-site delivery, dedicated PM…" className="mt-1.5" /></div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground tabular-nums">
            {qty} × ₹{(unit || 0).toLocaleString("en-IN")} = ₹{subtotal.toLocaleString("en-IN")} + {gst || 0}% GST → <span className="font-semibold text-foreground">₹{total.toLocaleString("en-IN")}</span>
          </div>
          <div className="mt-6">
            <Label>Attachments</Label>
            <div className="mt-1.5 rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-center hover:border-primary/50 transition cursor-pointer">
              <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
              <div className="mt-2 text-sm">Upload spec sheets & certifications</div>
              <div className="text-xs text-muted-foreground">PDF, PNG, JPG · Up to 25MB</div>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2">
            <Checkbox id="terms" className="mt-1" checked={agree} onCheckedChange={(v) => setAgree(v === true)} />
            <label htmlFor="terms" className="text-sm text-muted-foreground">I agree to ReverseHub's supplier terms and quotation policy.</label>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button asChild variant="outline"><Link to="/seller/leads">Back to leads</Link></Button>
            <Button onClick={onSubmit} className="bg-gradient-to-r from-primary to-accent">
              <Send className="h-4 w-4 mr-2" /> Submit Quote
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="AI Negotiation Assistant" actions={<Badge className="bg-primary/15 text-primary border border-primary/30"><Sparkles className="h-3 w-3 mr-1" /> Copilot</Badge>}>
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-primary/25 bg-primary/5 p-3">
              <div className="text-xs text-primary font-medium mb-1">Winning zone</div>
              Bids between <b>₹2,80,000 – ₹3,05,000</b> won 76% of similar RFQs.
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              Include a <b>5-year warranty</b> — mentioned in 3 of the last 4 wins.
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              Buyer values fast delivery: quotes ≤ 8 days score +12 AI points.
            </div>
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  );
}