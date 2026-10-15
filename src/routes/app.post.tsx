import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/shell";
import { SectionCard } from "@/components/dashboard/section-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Image as ImageIcon, Send, Upload } from "lucide-react";
import { toast } from "sonner";
import { AiRequirementParser } from "@/components/dashboard/ai-parser";
import { useState } from "react";
import { addRequirement } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/app/post")({
  component: PostRequirement,
  head: () => ({ meta: [{ title: "Post Requirement · ReverseHub AI" }, { name: "description", content: "Post a new RFQ and let AI structure it." }] }),
});

function PostRequirement() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    quantity: "",
    budget: "",
    location: "",
    deadline: "",
  });
  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));

  const applyParsed = (v: Record<string, string>) => {
    setForm((s) => ({
      ...s,
      title: v.product ? `${v.quantity ? v.quantity + " " : ""}${v.product}`.trim() : s.title,
      category: v.category ?? s.category,
      quantity: v.quantity ? (v.quantity.match(/\d+/)?.[0] ?? s.quantity) : s.quantity,
      budget: v.budget ? v.budget.replace(/[^\d]/g, "") : s.budget,
      location: v.location ?? s.location,
    }));
  };

  const submit = () => {
    if (!form.title.trim()) {
      toast.error("Add a title", { description: "Give your RFQ a short descriptive title." });
      return;
    }
    const req = addRequirement({
      title: form.title,
      description: form.description,
      category: form.category,
      quantity: form.quantity ? parseInt(form.quantity) : undefined,
      budget: form.budget ? parseInt(form.budget) : undefined,
      location: form.location,
      deadline: form.deadline,
    });
    toast.success(`${req.id} posted`, { description: "Suppliers are being notified now." });
    navigate({ to: "/app/requests" });
  };

  return (
    <DashboardShell role="buyer" breadcrumb={["Workspace", "Post Requirement"]} title="Post a new requirement">
      <div className="mb-4">
        <AiRequirementParser onApply={applyParsed} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard className="lg:col-span-3" title="Requirement details" description="Fields below can be pre-filled from the AI parser above">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={update("title")} placeholder="e.g. 100 Ergonomic Office Chairs" className="mt-1.5" />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={update("description")} rows={4} placeholder="Specs, use-case, compliance requirements, delivery notes…" className="mt-1.5" />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((s) => ({ ...s, category: v }))}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder={form.category || "Select category"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="furn">Furniture</SelectItem>
                  <SelectItem value="it">IT / Security</SelectItem>
                  <SelectItem value="mfg">Manufacturing</SelectItem>
                  <SelectItem value="pkg">Packaging</SelectItem>
                  <SelectItem value="svc">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantity</Label>
              <Input type="number" value={form.quantity} onChange={update("quantity")} placeholder="100" className="mt-1.5" />
            </div>
            <div>
              <Label>Budget (₹)</Label>
              <Input type="number" value={form.budget} onChange={update("budget")} placeholder="350000" className="mt-1.5" />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={update("location")} placeholder="Pune, IN" className="mt-1.5" />
            </div>
            <div className="md:col-span-2">
              <Label>Delivery deadline</Label>
              <Input type="date" value={form.deadline} onChange={update("deadline")} className="mt-1.5" />
            </div>
          </div>

          <div className="mt-6">
            <Label>Attachments</Label>
            <div className="mt-1.5 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-center hover:border-primary/50 transition cursor-pointer">
                <FileText className="h-6 w-6 mx-auto text-muted-foreground" />
                <div className="mt-2 text-sm">Upload PDF specs</div>
                <div className="text-xs text-muted-foreground">RFP, drawings, BOM</div>
              </div>
              <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-center hover:border-primary/50 transition cursor-pointer">
                <ImageIcon className="h-6 w-6 mx-auto text-muted-foreground" />
                <div className="mt-2 text-sm">Upload images</div>
                <div className="text-xs text-muted-foreground">Reference photos, samples</div>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-primary/25 bg-primary/5 p-3 text-xs text-muted-foreground flex items-center gap-2">
              <Upload className="h-3.5 w-3.5 text-primary" />
              Pro tip — attach a PDF and AI will auto-extract product specs and compliance clauses.
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline">Save draft</Button>
            <Button onClick={submit} className="bg-gradient-to-r from-primary to-accent">
              <Send className="h-4 w-4 mr-2" /> Post Requirement
            </Button>
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  );
}