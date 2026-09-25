import crypto from "crypto";
import { readDB, writeDB } from "./db";

// Mock OTP must never be exposed in production: it lets anyone read an
// account's OTP from the API response and sign in as that user.
export const OTP_MOCK =
  process.env.OTP_DEV_MODE !== undefined
    ? process.env.OTP_DEV_MODE !== "false"
    : process.env.NODE_ENV !== "production";
export const OTP_EXPIRY_MS = 10 * 60 * 1000;

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}

export function isValidUid(uid: string): boolean {
  return /^\d{9,10}$/.test(uid);
}

function randomOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function findByIdentifier(identifier: string) {
  const db = await readDB();
  const id = String(identifier || "").trim().toLowerCase();
  const user = db.users.find(
    (u) =>
      u.email.toLowerCase() === id ||
      u.phone === id ||
      (u.username ? u.username.toLowerCase() === id : false)
  );
  return { db, user };
}

export async function issueOtp(userId: string, identifier: string, purpose: string) {
  const db = await readDB();
  const now = Date.now();
  for (const record of db.otps) {
    if (record.userId === userId && record.purpose === purpose && !record.consumed) {
      record.consumed = true;
    }
  }
  const otp = randomOtp();
  db.otps.push({
    id: `otp-${now}`,
    userId,
    identifier: String(identifier || "").trim().toLowerCase(),
    otp,
    purpose,
    expiresAt: now + OTP_EXPIRY_MS,
    consumed: false,
  });
  await writeDB(db);
  return otp;
}

export async function verifyOtp(userId: string, identifier: string, otp: string, purpose: string): Promise<boolean> {
  const db = await readDB();
  const now = Date.now();
  const record = db.otps.find(
    (o) =>
      o.userId === userId &&
      o.identifier.toLowerCase() === String(identifier).toLowerCase() &&
      o.otp === otp &&
      o.purpose === purpose &&
      !o.consumed &&
      o.expiresAt > now
  );
  if (!record) return false;
  record.consumed = true;
  await writeDB(db);
  return true;
}
