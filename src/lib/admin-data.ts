// Shared admin entities: users, suppliers (with verification records), fraud alerts, admin activity log.
// Seller users link to suppliers via supplierId; supplier names match quote/order `supplier` fields.

export type UserRole = "buyer" | "seller" | "admin";
export type UserStatus = "active" | "suspended" | "pending";
export type UserVerification = "verified" | "pending" | "rejected";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  verificationStatus: UserVerification;
  company?: string;
  supplierId?: string;
};

export type SupplierVerification = "pending" | "verified" | "rejected" | "information_required";
export type RiskLevel = "low" | "medium" | "high";

export type Supplier = {
  id: string;
  userId: string;
  name: string;
  contact: string;
  gstin: string;
  gstStatus: "verified" | "pending" | "mismatch";
  kycStatus: "verified" | "pending" | "failed";
  documents: { name: string; status: "verified" | "pending" | "missing" }[];
  submittedAt: string;
  risk: RiskLevel;
  riskScore: number;
  verificationStatus: SupplierVerification;
  status: "active" | "pending" | "suspended" | "rejected";
  rejectionReason?: string;
  infoRequest?: string;
  reviewedAt?: string;
};

export type FraudStatus = "open" | "investigating" | "resolved" | "dismissed";
export type FraudSeverity = "low" | "medium" | "high" | "critical";

export type FraudAlert = {
  id: string;
  target: string;
  targetType: "user" | "supplier" | "order" | "rfq";
  targetId?: string;
  type: string;
  severity: FraudSeverity;
  description: string;
  createdAt: string;
  status: FraudStatus;
  riskScore: number;
  updatedAt?: string;
};

export type AdminLogEntry = { id: string; action: string; target: string; admin: string; timestamp: string };

export const ADMIN_NAME = "Aarav R.";

/** Rule-based risk bands (not an ML model). */
export function riskBand(score: number): FraudSeverity {
  if (score > 80) return "critical";
  if (score > 60) return "high";
  if (score > 30) return "medium";
  return "low";
}

const DAY = 86_400_000;
const ago = (d: number) => new Date(Date.now() - d * DAY).toISOString();

type SupplierSeed = Omit<Supplier, "id" | "userId"> & { email: string; joined: number };

const supplierSeeds: SupplierSeed[] = [
  { name: "PrecisionForge Pvt Ltd", contact: "Rohan Iyer", email: "rohan@precisionforge.in", joined: 3, gstin: "27AAPCP1234F1Z5", gstStatus: "verified", kycStatus: "verified", documents: [{ name: "GST Certificate", status: "verified" }, { name: "PAN Card", status: "verified" }, { name: "ISO 9001", status: "pending" }], submittedAt: ago(1), risk: "low", riskScore: 18, verificationStatus: "pending", status: "pending" },
  { name: "Nord Furniture Co", contact: "Anika Shah", email: "anika@nordfurniture.co", joined: 6, gstin: "29AAFCN5678K1Z2", gstStatus: "verified", kycStatus: "pending", documents: [{ name: "GST Certificate", status: "verified" }, { name: "PAN Card", status: "pending" }], submittedAt: ago(2), risk: "low", riskScore: 26, verificationStatus: "pending", status: "pending" },
  { name: "ValueChairs", contact: "Vikram Das", email: "vikram@valuechairs.in", joined: 9, gstin: "07AABCV9012L1Z8", gstStatus: "mismatch", kycStatus: "failed", documents: [{ name: "GST Certificate", status: "pending" }, { name: "PAN Card", status: "missing" }, { name: "Bank Proof", status: "missing" }], submittedAt: ago(4), risk: "high", riskScore: 78, verificationStatus: "pending", status: "pending" },
  { name: "QuickBuild Traders", contact: "Farhan Ali", email: "farhan@quickbuild.in", joined: 1, gstin: "24AAECQ3456M1Z1", gstStatus: "pending", kycStatus: "pending", documents: [{ name: "GST Certificate", status: "pending" }], submittedAt: ago(0.3), risk: "medium", riskScore: 44, verificationStatus: "pending", status: "pending" },
  { name: "ErgoWorks Pvt Ltd", contact: "Neha Kulkarni", email: "neha@ergoworks.in", joined: 120, gstin: "27AAECE1111A1Z9", gstStatus: "verified", kycStatus: "verified", documents: [{ name: "GST Certificate", status: "verified" }, { name: "PAN Card", status: "verified" }], submittedAt: ago(110), risk: "low", riskScore: 8, verificationStatus: "verified", status: "active", reviewedAt: ago(108) },
  { name: "OfficeMax India", contact: "Sameer Joshi", email: "sameer@officemax.in", joined: 200, gstin: "27AAECO2222B1Z4", gstStatus: "verified", kycStatus: "verified", documents: [{ name: "GST Certificate", status: "verified" }], submittedAt: ago(190), risk: "medium", riskScore: 35, verificationStatus: "verified", status: "active", reviewedAt: ago(188) },
  { name: "SeatSmart", contact: "Pooja Nair", email: "pooja@seatsmart.in", joined: 45, gstin: "32AAECS3333C1Z7", gstStatus: "verified", kycStatus: "verified", documents: [{ name: "GST Certificate", status: "verified" }], submittedAt: ago(40), risk: "low", riskScore: 14, verificationStatus: "verified", status: "active", reviewedAt: ago(38) },
  { name: "PrimeSource", contact: "Dev Malhotra", email: "dev@primesource.in", joined: 25, gstin: "06AAECP4444D1Z3", gstStatus: "verified", kycStatus: "verified", documents: [{ name: "GST Certificate", status: "verified" }], submittedAt: ago(22), risk: "low", riskScore: 12, verificationStatus: "verified", status: "active", reviewedAt: ago(20) },
  { name: "StudioNova", contact: "Tara Menon", email: "tara@studionova.in", joined: 60, gstin: "29AAECS5555E1Z6", gstStatus: "verified", kycStatus: "verified", documents: [{ name: "GST Certificate", status: "verified" }], submittedAt: ago(55), risk: "low", riskScore: 10, verificationStatus: "verified", status: "active", reviewedAt: ago(54) },
  { name: "GreenPack", contact: "Arjun Reddy", email: "arjun@greenpack.in", joined: 80, gstin: "36AAECG6666F1Z2", gstStatus: "verified", kycStatus: "verified", documents: [{ name: "GST Certificate", status: "verified" }], submittedAt: ago(75), risk: "low", riskScore: 16, verificationStatus: "verified", status: "active", reviewedAt: ago(74) },
  { name: "ApexSupply Traders", contact: "Karan Bose", email: "karan@apexsupply.in", joined: 15, gstin: "27AAECA7777G1Z0", gstStatus: "verified", kycStatus: "verified", documents: [{ name: "GST Certificate", status: "verified" }, { name: "PAN Card", status: "verified" }], submittedAt: ago(14), risk: "low", riskScore: 20, verificationStatus: "verified", status: "active", reviewedAt: ago(13) },
  { name: "ShadowSource Ltd", contact: "Unknown", email: "admin@shadowsource.biz", joined: 20, gstin: "07AAECS8888H1Z5", gstStatus: "mismatch", kycStatus: "failed", documents: [{ name: "GST Certificate", status: "missing" }], submittedAt: ago(19), risk: "high", riskScore: 91, verificationStatus: "rejected", status: "rejected", rejectionReason: "GSTIN belongs to a different legal entity.", reviewedAt: ago(18) },
];

export function seedSuppliersAndUsers(): { users: AdminUser[]; suppliers: Supplier[] } {
  const suppliers: Supplier[] = [];
  const users: AdminUser[] = [
    { id: "U-1001", name: "Aarav R.", email: "aarav@reversehub.ai", role: "admin", status: "active", createdAt: ago(400), verificationStatus: "verified" },
    { id: "U-1002", name: "Aarav R. (Buyer)", email: "aarav.buyer@acmeinfra.in", role: "buyer", status: "active", createdAt: ago(300), verificationStatus: "verified", company: "Acme Infra" },
    { id: "U-1003", name: "Meera S.", email: "meera@acmeprocurement.in", role: "buyer", status: "pending", createdAt: ago(2), verificationStatus: "pending", company: "Acme Procurement" },
    { id: "U-1004", name: "Kabir Mehta", email: "kabir@brightlabs.io", role: "buyer", status: "active", createdAt: ago(28), verificationStatus: "verified", company: "BrightLabs" },
    { id: "U-1005", name: "Ishita Rao", email: "ishita@helixhealth.in", role: "buyer", status: "active", createdAt: ago(6), verificationStatus: "verified", company: "Helix Health" },
    { id: "U-1006", name: "Northwind X", email: "ops@northwind-x.com", role: "buyer", status: "suspended", createdAt: ago(50), verificationStatus: "rejected", company: "Northwind X" },
  ];
  supplierSeeds.forEach((s, i) => {
    const sid = `S-${2001 + i}`;
    const uid = `U-${1101 + i}`;
    const { email, joined, ...rest } = s;
    suppliers.push({ ...rest, id: sid, userId: uid });
    users.push({
      id: uid,
      name: s.contact === "Unknown" ? s.name : s.contact,
      email,
      role: "seller",
      status: s.status === "active" ? "active" : s.status === "rejected" ? "suspended" : "pending",
      createdAt: ago(joined),
      verificationStatus: s.verificationStatus === "verified" ? "verified" : s.verificationStatus === "rejected" ? "rejected" : "pending",
      company: s.name,
      supplierId: sid,
    });
  });
  return { users, suppliers };
}

export function seedFraudAlerts(): FraudAlert[] {
  return [
    { id: "F-441", target: "ValueChairs", targetType: "supplier", targetId: "S-2003", type: "Duplicate GSTIN", severity: "high", description: "Duplicate GSTIN detected across 3 seller accounts.", createdAt: ago(0.2), status: "open", riskScore: 76 },
    { id: "F-440", target: "RFQ-8831", targetType: "rfq", targetId: "RFQ-8831", type: "Bid pattern anomaly", severity: "medium", description: "7 identical prices submitted within 4 minutes on RFQ-8831.", createdAt: ago(1), status: "open", riskScore: 52 },
    { id: "F-439", target: "ShadowSource Ltd", targetType: "supplier", targetId: "S-2012", type: "Identity mismatch", severity: "critical", description: "KYC documents reused from a previously banned account.", createdAt: ago(3), status: "open", riskScore: 92 },
    { id: "F-437", target: "Northwind X", targetType: "user", targetId: "U-1006", type: "Chargeback flag", severity: "low", description: "Buyer raised 2 chargebacks in 30 days.", createdAt: ago(5), status: "investigating", riskScore: 28 },
    { id: "F-432", target: "OfficeMax India", targetType: "supplier", targetId: "S-2006", type: "Price manipulation", severity: "medium", description: "Quote revised 6 times within one hour.", createdAt: ago(12), status: "resolved", riskScore: 40 },
    { id: "F-428", target: "ORD-4419", targetType: "order", targetId: "ORD-4419", type: "Address mismatch", severity: "low", description: "Delivery address differs from billing state.", createdAt: ago(20), status: "dismissed", riskScore: 18 },
  ];
}
