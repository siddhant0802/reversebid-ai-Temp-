import { useSyncExternalStore } from "react";
import {
  requirements as seedRequirements,
  notifications as seedNotifications,
  liveFeed as seedFeed,
  quotes as demoQuotes,
  orders as demoOrders,
  ORDER_STAGES,
  STAGE_PROGRESS,
  orderStageIndex,
  type Order,
  type Requirement,
  type Quote,
} from "./mock-data";
import {
  ADMIN_NAME,
  seedSuppliersAndUsers,
  seedFraudAlerts,
  riskBand,
  type AdminUser,
  type Supplier,
  type FraudAlert,
  type AdminLogEntry,
} from "./admin-data";

type Notification = {
  id: string;
  cat: string;
  title: string;
  body: string;
  time: string;
  priority: "high" | "medium" | "low";
  unread: boolean;
  audience: "buyer" | "seller" | "admin" | "all";
};

type FeedItem = { id: string; who: string; what: string; when: string };

type State = {
  requirements: Requirement[];
  notifications: Notification[];
  feed: FeedItem[];
  /** Seller-submitted quotes (demo quotes live in mock-data and are merged on read). */
  quotes: Quote[];
  /** User-created orders (demo orders merged on read). */
  orders: Order[];
  users: AdminUser[];
  suppliers: Supplier[];
  fraudAlerts: FraudAlert[];
  adminLog: AdminLogEntry[];
};

const STORAGE_KEY = "reversehub:store:v1";
const initialState = seed();

function seed(): State {
  return {
    requirements: seedRequirements,
    notifications: (seedNotifications as Notification[]).map((n) => ({
      ...n,
      audience: (n as Notification).audience ?? "buyer",
    })).concat([
      { id: "n-adm-1", cat: "Verification", title: "New supplier verification submitted", body: "QuickBuild Traders submitted GST & KYC documents for review.", time: "7h ago", priority: "medium", unread: true, audience: "admin" },
      { id: "n-adm-2", cat: "Security", title: "New fraud alert", body: "F-441 · Duplicate GSTIN detected across 3 seller accounts.", time: "5h ago", priority: "high", unread: true, audience: "admin" },
    ]),
    feed: seedFeed,
    quotes: [],
    orders: [],
    ...seedSuppliersAndUsers(),
    fraudAlerts: seedFraudAlerts(),
    adminLog: [],
  };
}

function normalize(parsed: Partial<State>): State {
  return {
    ...initialState,
    ...parsed,
    quotes: parsed.quotes ?? [],
    orders: parsed.orders ?? [],
    users: parsed.users ?? initialState.users,
    suppliers: parsed.suppliers ?? initialState.suppliers,
    fraudAlerts: parsed.fraudAlerts ?? initialState.fraudAlerts,
    adminLog: parsed.adminLog ?? [],
  };
}

function load(): State {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    return normalize(JSON.parse(raw) as Partial<State>);
  } catch {
    return initialState;
  }
}

let state: State = initialState;
let hasLoadedClientState = false;
const listeners = new Set<() => void>();

// Cached derived snapshots to keep useSyncExternalStore stable
let buyerNotifCache: { source: Notification[]; value: Notification[] } | null = null;
let sellerNotifCache: { source: Notification[]; value: Notification[] } | null = null;
function getBuyerNotifs() {
  if (!buyerNotifCache || buyerNotifCache.source !== state.notifications) {
    buyerNotifCache = {
      source: state.notifications,
      value: state.notifications.filter((n) => n.audience === "buyer" || n.audience === "all"),
    };
  }
  return buyerNotifCache.value;
}
function getSellerNotifs() {
  if (!sellerNotifCache || sellerNotifCache.source !== state.notifications) {
    sellerNotifCache = {
      source: state.notifications,
      value: state.notifications.filter((n) => n.audience === "seller" || n.audience === "all"),
    };
  }
  return sellerNotifCache.value;
}

let adminNotifCache: { source: Notification[]; value: Notification[] } | null = null;
function getAdminNotifs() {
  if (!adminNotifCache || adminNotifCache.source !== state.notifications) {
    adminNotifCache = {
      source: state.notifications,
      value: state.notifications.filter((n) => n.audience === "admin" || n.audience === "all"),
    };
  }
  return adminNotifCache.value;
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  if (typeof window !== "undefined" && !hasLoadedClientState) {
    hasLoadedClientState = true;
    window.setTimeout(() => {
      state = load();
      listeners.forEach((listener) => listener());
    }, 0);
  }
  return () => listeners.delete(l);
}

// Cross-tab sync
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY || !e.newValue) return;
    try {
      state = normalize(JSON.parse(e.newValue) as Partial<State>);
      listeners.forEach((l) => l());
    } catch {
      /* ignore */
    }
  });
}

export function useRequirements() {
  return useSyncExternalStore(
    subscribe,
    () => state.requirements,
    () => state.requirements,
  );
}

export function useNotifications(audience: "buyer" | "seller" | "admin") {
  const getter = audience === "seller" ? getSellerNotifs : audience === "admin" ? getAdminNotifs : getBuyerNotifs;
  return useSyncExternalStore(
    subscribe,
    getter,
    getter,
  );
}

let allQuotesCache: { source: Quote[]; value: Quote[] } | null = null;
function getAllQuotes() {
  if (!allQuotesCache || allQuotesCache.source !== state.quotes) {
    const demo = demoQuotes.map((q) => ({ ...q, source: "demo" as const }));
    const ids = new Set(state.quotes.map((q) => q.id));
    allQuotesCache = { source: state.quotes, value: [...demo.filter((q) => !ids.has(q.id)), ...state.quotes] };
  }
  return allQuotesCache.value;
}

/** Single source of truth: demo quotes + seller-submitted quotes. */
export function useAllQuotes() {
  return useSyncExternalStore(subscribe, getAllQuotes, getAllQuotes);
}

export function useSubmittedQuotes() {
  return useSyncExternalStore(subscribe, () => state.quotes, () => state.quotes);
}

export const CURRENT_SELLER = { name: "ApexSupply Traders", avatar: "AT", rating: 4.6, experience: "6 yrs" };

export type SubmitQuoteInput = {
  requirementId: string;
  unitPrice: number;
  gst: number;
  delivery: string;
  warranty: string;
  notes?: string;
};

export function submitQuote(input: SubmitQuoteInput): { quote: Quote; revised: boolean } {
  const req = state.requirements.find((r) => r.id === input.requirementId);
  const quantity = Math.max(1, req?.quantity ?? 1);
  const subtotal = Math.round(input.unitPrice * quantity);
  const gstAmount = Math.round((subtotal * input.gst) / 100);
  const totalAmount = subtotal + gstAmount;
  const existing = state.quotes.find(
    (q) => q.requirementId === input.requirementId && q.supplier === CURRENT_SELLER.name,
  );
  const now = Date.now();
  const quote: Quote = {
    id: existing?.id ?? `Q-${input.requirementId}-${now.toString(36)}`,
    requirementId: input.requirementId,
    supplier: CURRENT_SELLER.name,
    supplierAvatar: CURRENT_SELLER.avatar,
    price: totalAmount,
    gst: input.gst,
    delivery: input.delivery,
    warranty: input.warranty,
    rating: CURRENT_SELLER.rating,
    experience: CURRENT_SELLER.experience,
    aiScore: 0,
    risk: "low",
    notes: input.notes || undefined,
    unitPrice: input.unitPrice,
    quantity,
    subtotal,
    gstAmount,
    totalAmount,
    submittedAt: new Date(now).toISOString(),
    status: "submitted",
    source: "seller",
  };
  const revised = Boolean(existing);
  const fmt = `₹${totalAmount.toLocaleString("en-IN")}`;
  const buyerNotif: Notification = {
    id: `n-${now}-q`,
    cat: "Quotes",
    title: `${revised ? "Revised quote" : "New quote"} received for ${input.requirementId}`,
    body: `${CURRENT_SELLER.name} submitted a quotation of ${fmt} including GST.`,
    time: "just now",
    priority: "high",
    unread: true,
    audience: "buyer",
  };
  state = {
    ...state,
    quotes: existing ? state.quotes.map((q) => (q.id === existing.id ? quote : q)) : [...state.quotes, quote],
    requirements: revised
      ? state.requirements
      : state.requirements.map((r) => (r.id === input.requirementId ? { ...r, quotes: r.quotes + 1 } : r)),
    notifications: [buyerNotif, ...state.notifications],
    feed: [
      { id: `l-${now}`, who: CURRENT_SELLER.name, what: `sent a quote for ${fmt} on ${input.requirementId}`, when: "just now" },
      ...state.feed,
    ].slice(0, 20),
  };
  emit();
  return { quote, revised };
}

let allOrdersCache: { source: Order[]; value: Order[] } | null = null;
function getAllOrders() {
  if (!allOrdersCache || allOrdersCache.source !== state.orders) {
    allOrdersCache = {
      source: state.orders,
      value: [
        ...state.orders.filter((o) => o.source !== "demo"),
        ...demoOrders.map((d) => state.orders.find((o) => o.id === d.id) ?? { ...d, source: "demo" as const }),
      ],
    };
  }
  return allOrdersCache.value;
}

/** Single source of truth for orders: user orders (newest first) + demo orders. */
export function useAllOrders() {
  return useSyncExternalStore(subscribe, getAllOrders, getAllOrders);
}

export function findOrderForQuote(quoteId: string) {
  return state.orders.find((o) => o.quoteId === quoteId);
}

export function acceptQuote(quote: Quote): { order: Order; existed: boolean } {
  const existing = state.orders.find(
    (o) => o.quoteId === quote.id || (quote.requirementId && o.requirementId === quote.requirementId && o.supplier === quote.supplier),
  );
  if (existing) return { order: existing, existed: true };

  const req = state.requirements.find((r) => r.id === quote.requirementId);
  const quantity = quote.quantity ?? req?.quantity ?? 1;
  // quote.price / totalAmount is already GST-inclusive — never add GST again.
  const amount = quote.totalAmount ?? quote.price;
  const subtotal = quote.subtotal ?? Math.round(amount / (1 + quote.gst / 100));
  const gstAmount = quote.gstAmount ?? amount - subtotal;
  const unitPrice = quote.unitPrice ?? Math.round(subtotal / Math.max(1, quantity));
  const now = Date.now();
  const taken = new Set(getAllOrders().map((o) => o.id));
  let id = "";
  do id = `ORD-${now.toString(36).slice(-4).toUpperCase()}${Math.floor(Math.random() * 1296).toString(36).toUpperCase().padStart(2, "0")}`;
  while (taken.has(id));

  const title = req
    ? req.title.toLowerCase().startsWith(`${req.quantity} `) ? req.title : `${quantity} units ${req.title}`
    : `Order from ${quote.supplier}`;
  const order: Order = {
    id,
    title,
    supplier: quote.supplier,
    amount,
    status: "processing",
    eta: quote.delivery,
    progress: 0,
    requirementId: quote.requirementId,
    quoteId: quote.id,
    currentStage: "Ordered",
    stageHistory: [{ stage: "Ordered", timestamp: new Date(now).toISOString() }],
    createdAt: new Date(now).toISOString(),
    delivery: quote.delivery,
    warranty: quote.warranty,
    unitPrice,
    quantity,
    gst: quote.gst,
    subtotal,
    gstAmount,
    source: "user",
  };
  const stored = state.quotes.some((q) => q.id === quote.id);
  state = {
    ...state,
    orders: [order, ...state.orders],
    quotes: stored
      ? state.quotes.map((q) => (q.id === quote.id ? { ...q, status: "accepted" as const, orderId: id } : q))
      : [...state.quotes, { ...quote, status: "accepted" as const, orderId: id, source: quote.source ?? "demo" }],
    requirements: state.requirements.map((r) =>
      r.id === quote.requirementId ? { ...r, status: "awarded" as const, acceptedQuoteId: quote.id, orderId: id } : r,
    ),
    notifications: [
      {
        id: `n-${now}-o`,
        cat: "Orders",
        title: "Order created successfully",
        body: `Your order ${id} with ${quote.supplier} for ${title} has been created.`,
        time: "just now",
        priority: "high",
        unread: true,
        audience: "buyer",
      },
      {
        id: `n-${now}-w`,
        cat: "Orders",
        title: `Quote accepted on ${quote.requirementId}`,
        body: `Buyer accepted ${quote.supplier}'s quote · order ${id} created.`,
        time: "just now",
        priority: "high",
        unread: true,
        audience: "seller",
      },
      ...state.notifications,
    ],
    feed: [{ id: `l-${now}-o`, who: "You", what: `accepted ${quote.supplier} · ${id}`, when: "just now" }, ...state.feed].slice(0, 20),
  };
  if (quote.risk === "high") {
    const alert: FraudAlert = {
      id: `F-${now.toString(36).slice(-5).toUpperCase()}`,
      target: quote.supplier,
      targetType: "supplier",
      targetId: state.suppliers.find((s) => s.name === quote.supplier)?.id,
      type: "High-risk supplier awarded",
      severity: "high",
      description: `Order ${id} was awarded to ${quote.supplier}, which is flagged as high risk.`,
      createdAt: new Date(now).toISOString(),
      status: "open",
      riskScore: 72,
    };
    state = {
      ...state,
      fraudAlerts: [alert, ...state.fraudAlerts],
      notifications: [adminNotif("Security", "High-risk supplier detected", alert.description, "high"), ...state.notifications],
    };
  }
  emit();
  return { order, existed: false };
}

/** Moves an order forward exactly one stage. Never backwards; no-op once Delivered. */
export function advanceOrder(orderId: string): Order | null {
  const current = getAllOrders().find((o) => o.id === orderId);
  if (!current) return null;
  const idx = orderStageIndex(current);
  if (idx >= ORDER_STAGES.length - 1) return null;
  const next = idx + 1;
  const stage = ORDER_STAGES[next];
  const ts = new Date().toISOString();
  const updated: Order = {
    ...current,
    currentStage: stage,
    progress: STAGE_PROGRESS[next],
    status: next === 4 ? "delivered" : next === 3 ? "shipped" : "processing",
    eta: next === 4 ? "delivered" : current.eta === "delivered" ? "—" : current.eta,
    stageHistory: [...(current.stageHistory ?? [{ stage: ORDER_STAGES[idx], timestamp: current.createdAt ?? ts }]), { stage, timestamp: ts }],
  };
  const msg =
    next === 1 ? `Order ${orderId} confirmed by ${current.supplier}.`
    : next === 2 ? `Order ${orderId} is now in production.`
    : next === 3 ? `Order ${orderId} has been shipped.`
    : `Order ${orderId} has been delivered.`;
  const exists = state.orders.some((o) => o.id === orderId);
  state = {
    ...state,
    orders: exists ? state.orders.map((o) => (o.id === orderId ? updated : o)) : [...state.orders, updated],
    notifications: [
      { id: `n-${Date.now()}-st`, cat: "Orders", title: `Order ${stage.toLowerCase()}`, body: msg, time: "just now", priority: next === 4 ? "high" : "medium", unread: true, audience: "all" },
      ...state.notifications,
    ],
    feed: [{ id: `l-${Date.now()}-st`, who: current.supplier, what: msg, when: "just now" }, ...state.feed].slice(0, 20),
  };
  emit();
  return updated;
}

export function useFeed() {
  return useSyncExternalStore(
    subscribe,
    () => state.feed,
    () => state.feed,
  );
}

export function markAllRead(audience: "buyer" | "seller" | "admin") {
  state = {
    ...state,
    notifications: state.notifications.map((n) =>
      n.audience === audience || n.audience === "all" ? { ...n, unread: false } : n,
    ),
  };
  emit();
}

export function dismissNotification(id: string) {
  state = { ...state, notifications: state.notifications.filter((n) => n.id !== id) };
  emit();
}

export type NewRequirementInput = {
  title: string;
  description?: string;
  category?: string;
  quantity?: number;
  budget?: number;
  location?: string;
  deadline?: string;
};

export function addRequirement(input: NewRequirementInput): Requirement {
  const id = `RFQ-${9000 + Math.floor(Math.random() * 900)}`;
  const req: Requirement = {
    id,
    title: input.title || "Untitled RFQ",
    category: input.category || "General",
    quantity: input.quantity || 1,
    budget: input.budget || 0,
    location: input.location || "—",
    deadline: input.deadline ? formatDeadline(input.deadline) : "in 14 days",
    status: "open",
    quotes: 4,
    postedAt: "just now",
    description: input.description || "",
  };

  const now = Date.now();
  const buyerNotif: Notification = {
    id: `n-${now}-b`,
    cat: "Quotes",
    title: `${req.id} posted`,
    body: `4 verified suppliers matched — compare AI-ranked quotes now.`,
    time: "just now",
    priority: "medium",
    unread: true,
    audience: "buyer",
  };
  const sellerNotif: Notification = {
    id: `n-${now}-s`,
    cat: "AI Insights",
    title: `New lead matched: ${req.title}`,
    body: `${req.category} · ${req.location} · Budget ₹${(req.budget / 100000).toFixed(1)}L`,
    time: "just now",
    priority: "high",
    unread: true,
    audience: "seller",
  };
  const feed: FeedItem = {
    id: `l-${now}`,
    who: "You",
    what: `posted ${req.id} — ${req.title}`,
    when: "just now",
  };

  state = {
    ...state,
    requirements: [req, ...state.requirements],
    notifications: [sellerNotif, buyerNotif, ...state.notifications],
    feed: [feed, ...state.feed].slice(0, 20),
  };
  emit();
  return req;
}

function formatDeadline(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "in 14 days";
  const days = Math.max(1, Math.round((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  return `in ${days} days`;
}
// ============================================================
// Admin: users, supplier verification, fraud alerts, activity log
// ============================================================

export type ActionResult = { ok: true; message: string } | { ok: false; error: string };

function adminNotif(cat: string, title: string, body: string, priority: Notification["priority"] = "medium"): Notification {
  return { id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, cat, title, body, time: "just now", priority, unread: true, audience: "admin" };
}

function logEntry(action: string, target: string): AdminLogEntry {
  return { id: `A-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, action, target, admin: ADMIN_NAME, timestamp: new Date().toISOString() };
}

function commitAdmin(patch: Partial<State>, action: string, target: string, notif?: Notification) {
  state = {
    ...state,
    ...patch,
    adminLog: [logEntry(action, target), ...state.adminLog].slice(0, 200),
    notifications: notif ? [notif, ...state.notifications] : state.notifications,
  };
  emit();
}

export function useAdminUsers() {
  return useSyncExternalStore(subscribe, () => state.users, () => state.users);
}
export function useSuppliers() {
  return useSyncExternalStore(subscribe, () => state.suppliers, () => state.suppliers);
}
export function useFraudAlerts() {
  return useSyncExternalStore(subscribe, () => state.fraudAlerts, () => state.fraudAlerts);
}
export function useAdminLog() {
  return useSyncExternalStore(subscribe, () => state.adminLog, () => state.adminLog);
}

export function setUserStatus(userId: string, status: "active" | "suspended"): ActionResult {
  const u = state.users.find((x) => x.id === userId);
  if (!u) return { ok: false, error: "User not found." };
  if (u.role === "admin" && status === "suspended") return { ok: false, error: "Administrators cannot be suspended." };
  if (u.status === status) return { ok: false, error: `${u.name} is already ${status}.` };
  const suppliers = u.supplierId
    ? state.suppliers.map((s) =>
        s.id === u.supplierId
          ? { ...s, status: status === "suspended" ? ("suspended" as const) : s.verificationStatus === "verified" ? ("active" as const) : ("pending" as const) }
          : s,
      )
    : state.suppliers;
  const verb = status === "suspended" ? "suspended" : "activated";
  commitAdmin(
    { users: state.users.map((x) => (x.id === userId ? { ...x, status } : x)), suppliers },
    `User ${verb}`,
    u.name,
    adminNotif("Security", `User ${verb}`, `User ${u.name} has been ${verb} by an administrator.`, status === "suspended" ? "high" : "low"),
  );
  return { ok: true, message: `${u.name} has been ${verb}.` };
}

export function setUserVerification(userId: string, v: "verified" | "rejected", reason?: string): ActionResult {
  const u = state.users.find((x) => x.id === userId);
  if (!u) return { ok: false, error: "User not found." };
  if (u.supplierId) return v === "verified" ? approveSupplier(u.supplierId) : rejectSupplier(u.supplierId, reason || "Rejected from user management.");
  if (u.verificationStatus === v) return { ok: false, error: `${u.name} is already ${v}.` };
  commitAdmin(
    {
      users: state.users.map((x) =>
        x.id === userId ? { ...x, verificationStatus: v, status: v === "verified" && x.status === "pending" ? "active" : x.status } : x,
      ),
    },
    v === "verified" ? "User verified" : "User rejected",
    u.name,
    adminNotif("Verification", v === "verified" ? "User verified" : "User rejected", `${u.name} has been ${v}.`),
  );
  return { ok: true, message: `${u.name} has been ${v}.` };
}

export function approveSupplier(supplierId: string): ActionResult {
  const s = state.suppliers.find((x) => x.id === supplierId);
  if (!s) return { ok: false, error: "Supplier not found." };
  if (s.verificationStatus === "verified") return { ok: false, error: `${s.name} is already approved.` };
  const ts = new Date().toISOString();
  commitAdmin(
    {
      suppliers: state.suppliers.map((x) =>
        x.id === supplierId ? { ...x, verificationStatus: "verified", status: "active", reviewedAt: ts, rejectionReason: undefined, infoRequest: undefined } : x,
      ),
      users: state.users.map((u) => (u.id === s.userId ? { ...u, verificationStatus: "verified", status: "active" } : u)),
    },
    "Supplier approved",
    s.name,
    adminNotif("Verification", "Supplier verified", `${s.name} has been verified.`, "medium"),
  );
  return { ok: true, message: `${s.name} has been verified.` };
}

export function rejectSupplier(supplierId: string, reason: string): ActionResult {
  const s = state.suppliers.find((x) => x.id === supplierId);
  if (!s) return { ok: false, error: "Supplier not found." };
  if (s.verificationStatus === "rejected") return { ok: false, error: `${s.name} is already rejected.` };
  if (!reason.trim()) return { ok: false, error: "Please enter a rejection reason." };
  const ts = new Date().toISOString();
  commitAdmin(
    {
      suppliers: state.suppliers.map((x) =>
        x.id === supplierId ? { ...x, verificationStatus: "rejected", status: "rejected", rejectionReason: reason.trim(), reviewedAt: ts } : x,
      ),
      users: state.users.map((u) => (u.id === s.userId ? { ...u, verificationStatus: "rejected" } : u)),
    },
    "Supplier rejected",
    s.name,
    adminNotif("Verification", "Supplier rejected", `${s.name} was rejected: ${reason.trim()}`, "high"),
  );
  return { ok: true, message: `${s.name} has been rejected.` };
}

export function requestSupplierInfo(supplierId: string, message: string): ActionResult {
  const s = state.suppliers.find((x) => x.id === supplierId);
  if (!s) return { ok: false, error: "Supplier not found." };
  if (s.verificationStatus === "verified" || s.verificationStatus === "rejected")
    return { ok: false, error: `${s.name} has already been ${s.verificationStatus === "verified" ? "approved" : "rejected"}.` };
  if (!message.trim()) return { ok: false, error: "Please describe what information is needed." };
  commitAdmin(
    {
      suppliers: state.suppliers.map((x) =>
        x.id === supplierId ? { ...x, verificationStatus: "information_required", infoRequest: message.trim(), reviewedAt: new Date().toISOString() } : x,
      ),
    },
    "More information requested",
    s.name,
    adminNotif("Verification", "More information requested", `${s.name}: ${message.trim()}`, "low"),
  );
  return { ok: true, message: `Information request sent to ${s.name}.` };
}

export function updateFraudAlert(alertId: string, action: "investigate" | "resolve" | "dismiss"): ActionResult {
  const a = state.fraudAlerts.find((x) => x.id === alertId);
  if (!a) return { ok: false, error: "Alert not found." };
  if (a.status === "resolved" || a.status === "dismissed") return { ok: false, error: `${a.id} is already ${a.status}.` };
  if (action === "investigate" && a.status !== "open") return { ok: false, error: `${a.id} is already under investigation.` };
  if (action === "resolve" && a.status !== "investigating") return { ok: false, error: `Start investigating ${a.id} before resolving it.` };
  const status = action === "investigate" ? "investigating" : action === "resolve" ? "resolved" : "dismissed";
  const label = action === "investigate" ? "Fraud alert investigated" : action === "resolve" ? "Fraud alert resolved" : "Fraud alert dismissed";
  commitAdmin(
    { fraudAlerts: state.fraudAlerts.map((x) => (x.id === alertId ? { ...x, status, updatedAt: new Date().toISOString() } : x)) },
    label,
    `${a.id} · ${a.target}`,
  );
  return { ok: true, message: `${a.id} marked as ${status}.` };
}

export function recordReportExport(range: string) {
  commitAdmin({}, "Report exported", `Marketplace report (${range})`);
}

export { riskBand };
