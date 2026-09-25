import fs from "fs";
import path from "path";
import { head as blobHead, put as blobPut } from "@vercel/blob";
import { tournaments as seedTournaments, teams as seedTeams, players as seedPlayers, matches as seedMatches, defaultNotifications, type Tournament, type Notification } from "@/data/arena";
import { clampPrizeLabel } from "@/lib/arena";

export interface ServerUser {
  id: string;
  name: string;
  username?: string;
  email: string;
  phone: string;
  password: string;
  role: "admin" | "player";
  uid: string;
  team: string;
  wallet: number;
  emailVerified: boolean;
  phoneVerified: boolean;
  avatar?: string;
  createdAt: string;
}

export type RegistrationStatus = "PAID" | "PENDING" | "WALLET" | "FREE";

export interface ServerRegistration {
  userId: string;
  tournamentId: string;
  tournamentName: string;
  playerName: string;
  playerUid: string;
  playerEmail: string;
  teamName: string;
  members: { name: string; uid: string }[];
  claimed: boolean;
  status: RegistrationStatus;
  paymentId?: string;
  registeredAt: string;
}

export interface ServerPayment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  upiId: string;
  upiTxnRef: string;
  note: string;
  status: string;
  createdAt: string;
  type?: "TOPUP" | "ENTRY";
  method?: "UPI" | "RAZORPAY" | "WALLET";
  tournamentId?: string;
  tournamentName?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  verifyRemarks?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface ServerWithdrawal {
  id: string;
  userId: string;
  userName: string;
  upiId: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  processedAt?: string;
  remarks?: string;
}

export interface ServerRoom {
  tournamentId: string;
  roomId: string;
  password: string;
  updatedAt: string;
}

export interface DBShape {
  tournaments: Tournament[];
  users: ServerUser[];
  registrations: ServerRegistration[];
  matches: typeof seedMatches;
  notifications: Notification[];
  disputes: {
    id: string;
    userId: string;
    userName: string;
    tournamentId: string;
    type: string;
    description: string;
    status: string;
    createdAt: string;
  }[];
  transactions: {
    id: string;
    userId: string;
    label: string;
    amount: number;
    status: string;
    createdAt: string;
  }[];
  payments: ServerPayment[];
  withdrawals: ServerWithdrawal[];
  rooms: ServerRoom[];
  telegram: { enabled: boolean; botToken: string; channelId: string; announcements: string[] };
  payment: { upiId: string; whatsappNumber: string; payeeName: string };
  otps: {
    id: string;
    userId: string;
    identifier: string;
    otp: string;
    purpose: string;
    expiresAt: number;
    consumed: boolean;
  }[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "db.json");
const BLOB_KEY = "nla-db/db.json";
const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;

let memDB: DBShape | null = null;
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueueWrite<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(fn, fn);
  writeQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

function unionByKey<T>(base: T[] | undefined, overlay: T[] | undefined, keyFn: (item: T) => string): T[] {
  const map = new Map<string, T>();
  for (const item of base || []) map.set(keyFn(item), item);
  for (const item of overlay || []) map.set(keyFn(item), item);
  return [...map.values()];
}

function mergeLiveState(latest: DBShape, incoming: DBShape): DBShape {
  return {
    ...incoming,
    users: unionByKey(latest.users, incoming.users, (u) => u.id),
    payments: unionByKey(latest.payments, incoming.payments, (p) => p.id),
    withdrawals: unionByKey(latest.withdrawals, incoming.withdrawals, (w) => w.id),
    transactions: unionByKey(latest.transactions, incoming.transactions, (t) => t.id),
    notifications: unionByKey(latest.notifications, incoming.notifications, (n) => n.id),
    otps: unionByKey(latest.otps, incoming.otps, (o) => o.id),
  };
}

// --- Secret owner/admin account (only credentials to be used for admin access) ---
export const ADMIN_USERNAME = "adminsk";
export const ADMIN_PASSWORD = "skadmin123";

const seedUsers: ServerUser[] = [
  {
    id: "u-admin",
    name: "SK Admin",
    username: ADMIN_USERNAME,
    email: "ksuraj138@gmail.com",
    phone: "7015742792",
    password: ADMIN_PASSWORD,
    role: "admin",
    uid: "5400000001",
    team: "NEXT LEVEL ARENA",
    wallet: 0,
    emailVerified: true,
    phoneVerified: true,
    createdAt: "2024-08-01",
  },
];

const LEGACY_DEMO_EMAILS = new Set(["admin@arena.in", "player@arena.in"]);
const LEGACY_DEMO_IDS = new Set(["u-demo"]);

const seedDB: DBShape = {
  tournaments: seedTournaments,
  users: seedUsers,
  registrations: [],
  matches: seedMatches,
  notifications: defaultNotifications,
  disputes: [],
  transactions: [],
  telegram: { enabled: false, botToken: "", channelId: "", announcements: [] },
  payments: [],
  withdrawals: [],
  rooms: [],
  payment: {
    upiId: "ksuraj138@ybl",
    whatsappNumber: "917015742792",
    payeeName: "NEXT LEVEL ARENA",
  },
  otps: [],
};

function defaultDB(): DBShape {
  return JSON.parse(JSON.stringify(seedDB));
}

function mergeById<T extends { id: string }>(stored: T[] | undefined, seed: T[]): T[] {
  const current = Array.isArray(stored) ? stored : [];
  if (!current.length) return seed.map((item) => ({ ...item }));
  const seen = new Set(current.map((item) => item.id));
  const extras = seed.filter((item) => !seen.has(item.id)).map((item) => ({ ...item }));
  return extras.length ? [...current, ...extras] : current;
}

function normalizeShape(parsed: unknown): DBShape {
  const base = defaultDB();
  const data = (parsed || {}) as Partial<DBShape>;
  const merged: DBShape = {
    ...base,
    ...data,
    telegram: { ...base.telegram, ...(data.telegram || {}) },
    payment: { ...base.payment, ...(data.payment || {}) },
  };
  merged.users = (merged.users || [])
    .filter((u) => !LEGACY_DEMO_IDS.has(u.id) && !LEGACY_DEMO_EMAILS.has((u.email || "").toLowerCase()))
    .map((u) => ({
      ...u,
      username: u.username || undefined,
      wallet: typeof u.wallet === "number" ? u.wallet : 0,
      phone: u.phone || "",
      emailVerified: !!u.emailVerified,
      phoneVerified: !!u.phoneVerified,
      avatar: typeof u.avatar === "string" ? u.avatar : "",
    }));
  const adminSeed = seedUsers[0];
  const adminIndex = merged.users.findIndex(
    (u) => u.role === "admin" && (u.id === adminSeed.id || u.username === ADMIN_USERNAME)
  );
  if (adminIndex >= 0) {
    const existing = merged.users[adminIndex];
    const fakeEmail = !existing.email || existing.email === "adminsk@nextlevelarena.in";
    const fakePhone = !existing.phone || existing.phone === "7000000001";
    merged.users[adminIndex] = {
      ...existing,
      id: adminSeed.id,
      username: ADMIN_USERNAME,
      password: existing.password || ADMIN_PASSWORD,
      role: "admin",
      email: fakeEmail ? adminSeed.email : existing.email,
      phone: fakePhone ? adminSeed.phone : existing.phone,
    };
  } else {
    merged.users.unshift({ ...adminSeed });
  }
  merged.registrations = (merged.registrations || [])
    .filter((r) => !LEGACY_DEMO_IDS.has(r.userId) && !LEGACY_DEMO_EMAILS.has((r.playerEmail || "").toLowerCase()))
    .map((r) => ({
      ...r,
      members: Array.isArray(r.members) ? r.members : [],
      claimed: !!r.claimed,
      status: (r.status as RegistrationStatus) || (r.claimed ? "PAID" : "PAID"),
    }));
  merged.tournaments = mergeById(data.tournaments, seedTournaments).map((t) => {
    const seed = seedTournaments.find((s) => s.id === t.id);
    return {
      ...t,
      tag: t.tag || undefined,
      prizePool: seed ? seed.prizePool : clampPrizeLabel(t.prizePool),
      entryFee: seed ? seed.entryFee : t.entryFee,
    };
  });
  merged.payments = (Array.isArray(merged.payments) ? merged.payments : []).filter((p) => !LEGACY_DEMO_IDS.has(p.userId));
  merged.otps = (Array.isArray(merged.otps) ? merged.otps : []).filter((o) => !LEGACY_DEMO_IDS.has(o.userId));
  merged.withdrawals = (Array.isArray(merged.withdrawals) ? merged.withdrawals : []).filter((w) => !LEGACY_DEMO_IDS.has(w.userId));
  merged.rooms = Array.isArray(data.rooms) ? data.rooms : [];
  merged.notifications = Array.isArray(data.notifications) && data.notifications.length
    ? data.notifications
    : defaultNotifications.map((n) => ({ ...n }));
  merged.matches = mergeById(
    (data.matches || []).map((m) => ({ ...m, teams: (m.teams || []).map((t) => ({ ...t })) })),
    seedMatches.map((m) => ({ ...m, teams: (m.teams || []).map((t) => ({ ...t })) }))
  );
  merged.transactions = (Array.isArray(merged.transactions) ? merged.transactions : []).filter((t) => !LEGACY_DEMO_IDS.has(t.userId));
  merged.disputes = Array.isArray(merged.disputes) ? merged.disputes : [];
  return merged;
}

async function readBlobText(): Promise<string | null> {
  try {
    const meta = await blobHead(BLOB_KEY);
    if (!meta || !meta.url) return null;
    const res = await fetch(`${meta.url}?download=1&_=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    const msg = String((err as Error)?.message || "").toLowerCase();
    if (msg.includes("not found") || msg.includes("404")) return null;
    throw err;
  }
}

async function writeBlobText(text: string) {
  await blobPut(BLOB_KEY, text, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function readDB(): Promise<DBShape> {
  if (USE_BLOB) {
    const raw = await readBlobText();
    if (raw) {
      memDB = normalizeShape(JSON.parse(raw) as unknown);
      return memDB;
    }
    const fresh = defaultDB();
    await writeDB(fresh);
    return fresh;
  }
  if (memDB) return memDB;
  let raw: string | null = null;
  if (fs.existsSync(DB_PATH)) {
    raw = fs.readFileSync(DB_PATH, "utf-8");
  }
  if (raw) {
    memDB = normalizeShape(JSON.parse(raw) as unknown);
    return memDB;
  }
  const fresh = defaultDB();
  await writeDB(fresh);
  return fresh;
}

export async function writeDB(db: DBShape) {
  return enqueueWrite(async () => {
    let outgoing = db;
    if (USE_BLOB) {
      const raw = await readBlobText();
      if (raw) {
        const latest = normalizeShape(JSON.parse(raw) as unknown);
        outgoing = mergeLiveState(latest, db);
      }
    }
    memDB = outgoing;
    const text = JSON.stringify(outgoing);
    if (USE_BLOB) {
      await writeBlobText(text);
    } else {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, text, "utf-8");
    }
  });
}

export async function resetDB() {
  const fresh = defaultDB();
  await writeDB(fresh);
  return fresh;
}

// Session helpers (token = userId, kept in an httpOnly cookie handled by routes)

export { seedTeams, seedPlayers };
