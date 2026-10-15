import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2, CheckCircle2, Loader2, Pencil, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Field = { key: string; label: string; value: string; confidence: number };

const FIELD_ORDER: { key: string; label: string }[] = [
  { key: "category", label: "Product Category" },
  { key: "product", label: "Product Name" },
  { key: "quantity", label: "Quantity" },
  { key: "budget", label: "Budget" },
  { key: "deadline", label: "Delivery Deadline" },
  { key: "location", label: "Delivery Location" },
  { key: "brand", label: "Preferred Brand" },
];

function parse(text: string): Field[] {
  const t = text.trim();
  if (!t) return [];
  const lower = t.toLowerCase();
  const out: Field[] = [];

  const qty = t.match(/\b(\d{1,6})\s*(units|nos|pcs|pieces|laptops|servers|chairs|panels|boxes|licences|seats)?\b/i);
  // Price must be anchored by a currency cue: prefix (under/below/…), ₹ symbol,
  // magnitude suffix (k/lakh/cr) or trailing each/per unit. Prevents matching bare qty numbers.
  const price = t.match(/(?:(?:under|below|max|upto|up to|around|~|budget(?:\s+of)?|for)\s*₹?\s*([\d,]+(?:\.\d+)?)\s*(k|lakh|l|cr|crore)?(?:\s*(?:each|per\s*unit))?|₹\s*([\d,]+(?:\.\d+)?)\s*(k|lakh|l|cr|crore)?(?:\s*(?:each|per\s*unit))?|([\d,]+(?:\.\d+)?)\s*(k|lakh|l|cr|crore)(?:\s*(?:each|per\s*unit))?|([\d,]+(?:\.\d+)?)\s*(?:each|per\s*unit))/i);
  const days = t.match(/\b(?:within|in)\s+(\d{1,3})\s*(day|days|week|weeks|month|months)\b/i);
  const loc = t.match(/\b(?:to|at|in)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\b/);
  const brandMatch = t.match(/\b(Lenovo|HP|Dell|Apple|Asus|Acer|Samsung|Sony|Cisco|Fortinet|Bosch|Godrej|Tata|Herman Miller|Steelcase)\b/i);

  const brands = ["laptop","server","chair","furniture","panel","packaging","printer","sensor","cable","monitor","desk","camera","router","firewall","software","service"];
  const productHit = brands.find((b) => lower.includes(b));
  const catMap: Record<string, string> = {
    laptop: "IT & Hardware › Laptops", server: "IT & Hardware › Servers", monitor: "IT & Hardware › Displays", router: "IT / Networking",
    firewall: "IT / Security", chair: "Office Furniture › Seating", desk: "Office Furniture › Desking",
    furniture: "Office Furniture", panel: "Energy › Solar", packaging: "Packaging & Print",
    printer: "Office Equipment", sensor: "Industrial › Sensors", cable: "Industrial › Cabling",
    camera: "Security › Surveillance", software: "Software & Licensing", service: "Professional Services",
  };

  const push = (key: string, label: string, value: string, confidence: number) => {
    if (value) out.push({ key, label, value, confidence });
  };

  push("category", "Product Category", productHit ? catMap[productHit] : "", productHit ? 92 : 0);
  const productName = brandMatch && productHit
    ? `${brandMatch[1]} ${productHit.charAt(0).toUpperCase() + productHit.slice(1)}s`
    : productHit ? productHit.charAt(0).toUpperCase() + productHit.slice(1) + "s" : "";
  push("product", "Product Name", productName, productName ? 88 : 0);
  push("quantity", "Quantity", qty ? `${qty[1]} ${qty[2] ?? "units"}` : "", qty ? 97 : 0);

  let budget = "";
  if (price) {
    const numStr = price[1] ?? price[3] ?? price[5] ?? price[7];
    const unitStr = (price[2] ?? price[4] ?? price[6] ?? "").toLowerCase();
    const perUnit = /each|per\s*unit/i.test(price[0]);
    const raw = parseFloat((numStr ?? "0").replace(/,/g, ""));
    const mult = unitStr === "k" ? 1_000 : unitStr === "l" || unitStr === "lakh" ? 100_000 : unitStr === "cr" || unitStr === "crore" ? 10_000_000 : 1;
    const per = raw * mult;
    const total = perUnit && qty ? per * parseInt(qty[1]) : per;
    budget = `₹${total.toLocaleString("en-IN")}`;
  }
  push("budget", "Budget", budget, budget ? 90 : 0);
  push("deadline", "Delivery Deadline", days ? `${days[1]} ${days[2]}` : "", days ? 95 : 0);
  push("location", "Delivery Location", loc ? loc[1] : "", loc ? 86 : 0);
  push("brand", "Preferred Brand", brandMatch ? brandMatch[1] : "", brandMatch ? 94 : 0);

  return out.filter((f) => f.value);
}

export function AiRequirementParser({ example, onApply }: { example?: string; onApply?: (values: Record<string, string>) => void }) {
  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [fields, setFields] = useState<Field[]>([]);
  const [editing, setEditing] = useState<string | null>(null);

  // Debounced live parse
  useEffect(() => {
    if (!text.trim()) { setFields([]); setParsing(false); return; }
    setParsing(true);
    const t = setTimeout(() => {
      setFields(parse(text));
      setParsing(false);
    }, 550);
    return () => clearTimeout(t);
  }, [text]);

  const confidence = useMemo(() => {
    if (!fields.length) return 0;
    return Math.round(fields.reduce((a, f) => a + f.confidence, 0) / fields.length);
  }, [fields]);

  const detected = fields.length;
  const total = FIELD_ORDER.length;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl">
      <div className="absolute inset-0 -z-10 opacity-60">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="p-5 pb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold tracking-tight">AI Requirement Parser</h3>
              <p className="text-xs text-muted-foreground">Describe your requirement — AI extracts structured fields in real time.</p>
            </div>
          </div>
        </div>
        <Badge className="bg-primary/15 text-primary border border-primary/30 whitespace-nowrap">
          <Wand2 className="h-3 w-3 mr-1" /> Live parsing
        </Badge>
      </div>

      <div className="px-5 pb-5">
        <Textarea
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={example ?? "e.g. I need 100 Lenovo ThinkPad laptops under ₹55,000 each delivered to Pune within 12 days."}
          className="bg-muted/30 border-border/60 resize-none"
        />

        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            {parsing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            ) : detected ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
            )}
            <span>{parsing ? "Analyzing…" : detected ? `${detected}/${total} fields detected` : "Awaiting input"}</span>
          </div>
          {detected > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <span>Confidence</span>
              <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
              <span className="tabular-nums font-medium text-foreground">{confidence}%</span>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <AnimatePresence mode="popLayout">
            {fields.map((f, i) => (
              <motion.div
                key={f.key}
                layout
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 220, damping: 22 }}
                className="group relative overflow-hidden rounded-xl border border-primary/25 bg-gradient-to-br from-primary/[0.07] to-transparent p-3"
              >
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> {f.label}</span>
                  <span className="tabular-nums">{f.confidence}%</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  {editing === f.key ? (
                    <>
                      <Input
                        autoFocus
                        defaultValue={f.value}
                        onBlur={(e) => { setFields(fields.map((x) => x.key === f.key ? { ...x, value: e.target.value } : x)); setEditing(null); }}
                        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                        className="h-7 text-sm"
                      />
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-medium truncate flex-1">{f.value}</div>
                      <button onClick={() => setEditing(f.key)} className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-primary">
                        <Pencil className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
                <div className="mt-2 h-0.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${f.confidence}%` }}
                    transition={{ delay: 0.15 + i * 0.04, duration: 0.55 }}
                  />
                </div>
              </motion.div>
            ))}
            {parsing && !fields.length &&
              [...Array(4)].map((_, i) => (
                <motion.div key={`sk-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-xl border border-border/60 bg-muted/20 h-16 animate-pulse" />
              ))}
          </AnimatePresence>
        </div>

        {fields.length > 0 && (
          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">Review the extracted fields — click any card to edit.</div>
            <Button
              className="bg-gradient-to-r from-primary to-accent"
              onClick={() => {
                const values = Object.fromEntries(fields.map((f) => [f.key, f.value]));
                onApply?.(values);
                toast.success("Values applied", {
                  description: `${fields.length} field${fields.length === 1 ? "" : "s"} added to your requirement form.`,
                });
              }}
            >
              Use these values
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}