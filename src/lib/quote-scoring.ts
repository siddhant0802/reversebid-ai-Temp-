import type { Quote } from "./mock-data";

// Rule-based (not ML) scoring used by the Compare / Received Quotes pages.
function days(s: string) {
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : 14;
}
function years(s: string) {
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : 1;
}

export function quoteTotal(q: Quote) {
  return q.totalAmount ?? q.price;
}

/** Recalculates aiScore, recommended and bestValue across a quote set, sorted best-first. */
export function rankQuotes(rows: Quote[]): Quote[] {
  if (rows.length === 0) return [];
  const totals = rows.map(quoteTotal);
  const min = Math.min(...totals);
  const max = Math.max(...totals);
  const scored = rows.map((q, i) => {
    const priceS = max === min ? 100 : 100 - ((totals[i] - min) / (max - min)) * 60;
    const deliveryS = Math.max(30, Math.min(100, 110 - days(q.delivery) * 4));
    const warrantyS = Math.min(100, 40 + years(q.warranty) * 12);
    const ratingS = q.rating * 20;
    const expS = Math.min(100, 40 + (Number.parseInt(q.experience, 10) || 2) * 5);
    const riskS = q.risk === "low" ? 100 : q.risk === "medium" ? 70 : 35;
    const score = Math.round(
      priceS * 0.3 + deliveryS * 0.2 + warrantyS * 0.1 + ratingS * 0.15 + expS * 0.1 + riskS * 0.15,
    );
    return { ...q, aiScore: Math.max(1, Math.min(99, score)) };
  });
  scored.sort((a, b) => b.aiScore - a.aiScore);
  // best value = lowest total among non-high-risk quotes
  const eligible = scored.filter((q) => q.risk !== "high");
  const bestId = (eligible.length ? eligible : scored).reduce((a, b) => (quoteTotal(b) < quoteTotal(a) ? b : a)).id;
  return scored.map((q, i) => ({ ...q, recommended: i === 0, bestValue: q.id === bestId }));
}
