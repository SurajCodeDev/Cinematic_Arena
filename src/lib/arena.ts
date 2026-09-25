import type { Tournament } from "@/data/arena";

export function parseAmount(str: string): number {
  if (!str) return 0;
  const n = parseInt(str.replace(/[^\d]/g, ""), 10);
  return isNaN(n) ? 0 : n;
}

export function isFreeTournament(t: Pick<Tournament, "entryFee">): boolean {
  const fee = (t.entryFee || "").trim().toUpperCase();
  return fee === "FREE" || fee === "INVITE" || fee === "0" || fee === "₹0" || parseAmount(t.entryFee) === 0;
}

export function isInviteOnly(t: Pick<Tournament, "entryFee">): boolean {
  return (t.entryFee || "").trim().toUpperCase() === "INVITE";
}

export function entryFeeNumber(t: Pick<Tournament, "entryFee">): number {
  return isFreeTournament(t) ? 0 : parseAmount(t.entryFee);
}

export function prizeNumber(t: Pick<Tournament, "prizePool">): number {
  return parseAmount(t.prizePool);
}

export function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

export const MAX_PRIZE_POOL = 2500;

export function clampPrizeLabel(str: string): string {
  const n = parseAmount(str);
  if (!n) return str || formatINR(0);
  return formatINR(Math.min(n, MAX_PRIZE_POOL));
}

export function squadSizeFor(mode: string): number {
  switch ((mode || "").toUpperCase()) {
    case "SOLO":
      return 1;
    case "DUO":
      return 2;
    case "TDM":
      return 4;
    default:
      return 4;
  }
}

export function totalEntryFee(t: Pick<Tournament, "entryFee" | "mode">): number {
  const per = entryFeeNumber(t);
  if (!per) return 0;
  return per * squadSizeFor(t.mode);
}
