export type Requirement = {
  id: string;
  title: string;
  category: string;
  quantity: number;
  budget: number;
  location: string;
  deadline: string;
  status: "open" | "closed" | "awarded";
  quotes: number;
  postedAt: string;
  description: string;
  acceptedQuoteId?: string;
  orderId?: string;
};

export type Quote = {
  id: string;
  requirementId: string;
  supplier: string;
  supplierAvatar: string;
  price: number;
  gst: number;
  delivery: string;
  warranty: string;
  rating: number;
  experience: string;
  aiScore: number;
  risk: "low" | "medium" | "high";
  recommended?: boolean;
  bestValue?: boolean;
  notes?: string;
  /** Fields set on seller-submitted quotes. `price` equals totalAmount (incl. GST). */
  unitPrice?: number;
  quantity?: number;
  subtotal?: number;
  gstAmount?: number;
  totalAmount?: number;
  submittedAt?: string;
  status?: "submitted" | "accepted" | "rejected";
  orderId?: string;
  source?: "demo" | "seller" | "generated";
};

export type Order = {
  id: string;
  title: string;
  supplier: string;
  amount: number;
  status: "processing" | "shipped" | "delivered" | "pending";
  eta: string;
  progress: number;
  requirementId?: string;
  quoteId?: string;
  currentStage?: string;
  createdAt?: string;
  delivery?: string;
  warranty?: string;
  unitPrice?: number;
  quantity?: number;
  gst?: number;
  subtotal?: number;
  gstAmount?: number;
  source?: "demo" | "user";
  stageHistory?: { stage: string; timestamp: string }[];
};

export const ORDER_STAGES = ["Ordered", "Confirmed", "In Production", "Shipped", "Delivered"] as const;
export const STAGE_PROGRESS = [0, 25, 50, 75, 100] as const;

/** Current stage index; demo orders without a stage derive it from progress. */
export function orderStageIndex(o: Pick<Order, "currentStage" | "progress" | "status">) {
  const i = o.currentStage ? ORDER_STAGES.indexOf(o.currentStage as (typeof ORDER_STAGES)[number]) : -1;
  if (i >= 0) return i;
  if (o.status === "delivered" || o.progress >= 100) return 4;
  return Math.min(3, Math.floor(o.progress / 25));
}

export const requirements: Requirement[] = [
  { id: "RFQ-8842", title: "100 Ergonomic Office Chairs", category: "Furniture", quantity: 100, budget: 350000, location: "Pune, IN", deadline: "in 10 days", status: "open", quotes: 12, postedAt: "2h ago", description: "High-back mesh chairs with lumbar support, 3-year warranty required." },
  { id: "RFQ-8839", title: "Enterprise Cloud Firewall — 250 seats", category: "IT / Security", quantity: 250, budget: 1250000, location: "Bengaluru, IN", deadline: "in 21 days", status: "open", quotes: 7, postedAt: "5h ago", description: "SOC2 compliant, MSSP-managed, integration with Okta." },
  { id: "RFQ-8831", title: "Bulk Custom Packaging — 50k units", category: "Packaging", quantity: 50000, budget: 850000, location: "Mumbai, IN", deadline: "in 14 days", status: "open", quotes: 18, postedAt: "1d ago", description: "FSC-certified corrugated boxes, 4-color print." },
  { id: "RFQ-8820", title: "CNC Machined Aluminum Parts", category: "Manufacturing", quantity: 2500, budget: 620000, location: "Coimbatore, IN", deadline: "in 30 days", status: "awarded", quotes: 22, postedAt: "3d ago", description: "AL-6061, ±0.02mm tolerance, first article inspection." },
  { id: "RFQ-8815", title: "Marketing Video Production", category: "Services", quantity: 6, budget: 480000, location: "Remote", deadline: "in 25 days", status: "open", quotes: 9, postedAt: "3d ago", description: "6 x 60s brand videos, 4K, motion graphics." },
  { id: "RFQ-8802", title: "Solar Panel Installation — 120 kW", category: "Energy", quantity: 1, budget: 5200000, location: "Ahmedabad, IN", deadline: "in 45 days", status: "closed", quotes: 15, postedAt: "1w ago", description: "Rooftop commercial solar, net metering, 25y warranty." },
];

export const quotes: Quote[] = [
  { id: "Q-001", requirementId: "RFQ-8842", supplier: "ErgoWorks Pvt Ltd", supplierAvatar: "EW", price: 298000, gst: 18, delivery: "8 days", warranty: "5 years", rating: 4.9, experience: "12 yrs", aiScore: 96, risk: "low", recommended: true, bestValue: true, notes: "Includes free assembly and 24/7 support." },
  { id: "Q-002", requirementId: "RFQ-8842", supplier: "Nord Furniture Co", supplierAvatar: "NF", price: 310000, gst: 18, delivery: "10 days", warranty: "3 years", rating: 4.7, experience: "8 yrs", aiScore: 91, risk: "low" },
  { id: "Q-003", requirementId: "RFQ-8842", supplier: "OfficeMax India", supplierAvatar: "OM", price: 285000, gst: 18, delivery: "14 days", warranty: "2 years", rating: 4.3, experience: "15 yrs", aiScore: 82, risk: "medium", bestValue: false, notes: "Lowest price but longer delivery window." },
  { id: "Q-004", requirementId: "RFQ-8842", supplier: "SeatSmart", supplierAvatar: "SS", price: 340000, gst: 18, delivery: "6 days", warranty: "5 years", rating: 4.8, experience: "10 yrs", aiScore: 89, risk: "low" },
  { id: "Q-005", requirementId: "RFQ-8842", supplier: "ValueChairs", supplierAvatar: "VC", price: 260000, gst: 12, delivery: "18 days", warranty: "1 year", rating: 3.9, experience: "3 yrs", aiScore: 61, risk: "high", notes: "AI flagged: incomplete verification docs." },
];

export const orders: Order[] = [
  { id: "ORD-4421", title: "CNC Aluminum Parts (2500 units)", supplier: "PrecisionForge", amount: 598000, status: "shipped", eta: "3 days", progress: 68 },
  { id: "ORD-4419", title: "Marketing Video Bundle", supplier: "StudioNova", amount: 452000, status: "processing", eta: "14 days", progress: 25 },
  { id: "ORD-4402", title: "Corrugated Packaging 50k", supplier: "GreenPack", amount: 812000, status: "delivered", eta: "delivered", progress: 100 },
  { id: "ORD-4398", title: "Office Chairs (100 units)", supplier: "ErgoWorks", amount: 298000, status: "processing", eta: "8 days", progress: 40 },
];

export const spendData = [
  { m: "Jan", spend: 420, saved: 62 },
  { m: "Feb", spend: 380, saved: 71 },
  { m: "Mar", spend: 510, saved: 84 },
  { m: "Apr", spend: 465, saved: 92 },
  { m: "May", spend: 590, saved: 118 },
  { m: "Jun", spend: 640, saved: 142 },
  { m: "Jul", spend: 720, saved: 168 },
  { m: "Aug", spend: 810, saved: 195 },
];

export const categoryData = [
  { name: "IT & Security", value: 34 },
  { name: "Manufacturing", value: 22 },
  { name: "Furniture", value: 14 },
  { name: "Packaging", value: 12 },
  { name: "Services", value: 10 },
  { name: "Energy", value: 8 },
];

export const responseTimeData = [
  { day: "Mon", hours: 4.2 },
  { day: "Tue", hours: 3.8 },
  { day: "Wed", hours: 3.1 },
  { day: "Thu", hours: 2.9 },
  { day: "Fri", hours: 3.4 },
  { day: "Sat", hours: 5.1 },
  { day: "Sun", hours: 5.8 },
];

export const conversations = [
  { id: "c1", name: "ErgoWorks Pvt Ltd", avatar: "EW", last: "We can start production this Monday.", time: "2m", unread: 2, online: true },
  { id: "c2", name: "Nord Furniture Co", avatar: "NF", last: "Revised quote attached with FOB pricing.", time: "1h", unread: 0, online: true },
  { id: "c3", name: "PrecisionForge", avatar: "PF", last: "Shipment left the warehouse 🚚", time: "3h", unread: 0, online: false },
  { id: "c4", name: "StudioNova", avatar: "SN", last: "Storyboard v2 ready for review.", time: "1d", unread: 1, online: false },
  { id: "c5", name: "GreenPack", avatar: "GP", last: "Invoice #INV-8821 has been issued.", time: "2d", unread: 0, online: false },
];

export const activities = [
  { icon: "sparkles", text: "AI ranked 12 new quotes on RFQ-8842", time: "2m ago", tone: "primary" },
  { icon: "check", text: "ErgoWorks accepted your counter-offer", time: "18m ago", tone: "success" },
  { icon: "message", text: "3 new messages from suppliers", time: "1h ago", tone: "info" },
  { icon: "alert", text: "AI flagged ValueChairs as high risk", time: "3h ago", tone: "warning" },
  { icon: "package", text: "Order ORD-4402 was delivered", time: "1d ago", tone: "success" },
];

export const leads = requirements.filter((r) => r.status === "open").map((r) => ({
  ...r,
  match: 70 + Math.floor(Math.random() * 28),
}));

// Mini sparkline data for KPI cards
export const sparkOpen = [3, 6, 4, 8, 7, 10, 9, 14].map((v, i) => ({ i, v }));
export const sparkQuotes = [12, 18, 15, 22, 28, 32, 40, 47].map((v, i) => ({ i, v }));
export const sparkOrders = [2, 3, 4, 3, 5, 4, 6, 6].map((v, i) => ({ i, v }));
export const sparkSaved = [4, 6, 7, 9, 11, 13, 16, 18].map((v, i) => ({ i, v }));

export const notifications = [
  { id: "n1", cat: "Quotes", title: "New quote from ErgoWorks", body: "₹2.98L · 8 day delivery · AI Score 96", time: "2m", priority: "high", unread: true },
  { id: "n2", cat: "AI Insights", title: "Market drop detected", body: "Q3 aluminum prices dropped 8% — renegotiate CNC contract.", time: "24m", priority: "medium", unread: true },
  { id: "n3", cat: "Orders", title: "Shipment out for delivery", body: "ORD-4421 · PrecisionForge · ETA in 3 days", time: "1h", priority: "low", unread: true },
  { id: "n4", cat: "Verification", title: "Supplier verified", body: "Nord Furniture Co passed KYC & GST checks.", time: "3h", priority: "low", unread: false },
  { id: "n5", cat: "Messages", title: "3 new messages", body: "ErgoWorks, StudioNova, GreenPack", time: "5h", priority: "medium", unread: false },
  { id: "n6", cat: "Payments", title: "Invoice #INV-8821", body: "GreenPack has issued an invoice of ₹8.12L", time: "1d", priority: "medium", unread: false },
];

// Radar comparison — normalized 0-100 axis values per top supplier
export const radarCompare = [
  { axis: "Price", ErgoWorks: 78, Nord: 72, OfficeMax: 92, SeatSmart: 58 },
  { axis: "Delivery", ErgoWorks: 88, Nord: 78, OfficeMax: 55, SeatSmart: 95 },
  { axis: "Rating", ErgoWorks: 98, Nord: 94, OfficeMax: 86, SeatSmart: 96 },
  { axis: "Warranty", ErgoWorks: 100, Nord: 60, OfficeMax: 40, SeatSmart: 100 },
  { axis: "Trust", ErgoWorks: 96, Nord: 88, OfficeMax: 74, SeatSmart: 90 },
  { axis: "Experience", ErgoWorks: 92, Nord: 76, OfficeMax: 98, SeatSmart: 84 },
];

// Deadlines widget
export const deadlines = [
  { id: "d1", title: "RFQ-8842 · Office Chairs", when: "in 3 days", urgency: "high" as const },
  { id: "d2", title: "RFQ-8839 · Cloud Firewall", when: "in 8 days", urgency: "medium" as const },
  { id: "d3", title: "RFQ-8831 · Packaging 50k", when: "in 12 days", urgency: "low" as const },
];

// Category donut/heatmap data
export const heatmap = Array.from({ length: 28 }, (_, i) => ({
  i,
  v: Math.round(20 + Math.sin(i * 0.6) * 30 + Math.random() * 40),
}));

// Live RFQ feed
export const liveFeed = [
  { id: "l1", who: "Zenith Corp", what: "posted RFQ for 500 industrial sensors", when: "just now" },
  { id: "l2", who: "ErgoWorks", what: "sent a quote for ₹2.98L", when: "1m" },
  { id: "l3", who: "Nord Furniture", what: "revised delivery to 10 days", when: "4m" },
  { id: "l4", who: "GreenPack", what: "shipped ORD-4402", when: "12m" },
  { id: "l5", who: "PrecisionForge", what: "accepted counter-offer", when: "22m" },
];

// AI procurement insights
export const aiInsights = [
  { icon: "trending", tone: "success", title: "14% below market", body: "ErgoWorks is priced 14% under the category median of ₹3.4k / unit." },
  { icon: "shield", tone: "primary", title: "Low delivery risk", body: "97% on-time rate across last 42 shipments in Furniture." },
  { icon: "target", tone: "accent", title: "Estimated market price", body: "AI predicts fair unit price at ₹2,980 ± ₹120." },
  { icon: "piggy", tone: "success", title: "Budget can shrink 8%", body: "Historical bids suggest ₹3.22L is achievable." },
  { icon: "users", tone: "primary", title: "High supplier interest", body: "89% probability of receiving 12+ quotes in 48h." },
  { icon: "star", tone: "accent", title: "Supplier reliability 97%", body: "Weighted score across fulfillment, comms & disputes." },
];