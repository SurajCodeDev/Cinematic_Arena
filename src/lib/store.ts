import {
  tournaments as seedTournaments,
  teams as seedTeams,
  players as seedPlayers,
  matches as seedMatches,
  defaultNotifications,
  type Tournament,
  type Match,
} from "@/data/arena";
import {
  apiGetTournaments,
  apiSaveTournament,
  apiAddTournament,
  apiDeleteTournament,
  apiResetTournaments,
  apiGetRegistrations,
  apiRegisterForTournament,
  apiUnregisterFromTournament,
  apiGetUsers,
  apiGetMatches,
  apiGetNotifications,
  apiMarkNotificationRead,
  apiMarkAllNotificationsRead,
  type ApiUser,
  type ApiRegistration,
  type ApiNotification,
} from "@/lib/api";

export type { Tournament };
export type { ApiUser as User, ApiRegistration as Registration };

export interface LocalUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "player";
  uid: string;
  team: string;
  wallet: number;
  createdAt?: string;
}

// ---------- In-memory cache (hydrated from server API) ----------

let cachedTournaments: Tournament[] | null = null;
let cachedRegistrations: ApiRegistration[] = [];
let cachedUsers: ApiUser[] = [];
let cachedMatches: Match[] | null = null;
let cachedNotifications: ApiNotification[] | null = null;
let hydrated = false;

const listeners = new Set<() => void>();
let version = 0;

export function getStoreVersion() {
  return version;
}

export function subscribeStore(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function emit() {
  version += 1;
  listeners.forEach((fn) => fn());
}

export function isStoreHydrated() {
  return hydrated;
}

let hydratePromise: Promise<void> | null = null;

export function hydrateStore() {
  if (!hydratePromise) {
    hydratePromise = (async () => {
      try {
        const [tours, regs] = await Promise.all([
          apiGetTournaments(),
          apiGetRegistrations(),
        ]);
        if (tours.length) cachedTournaments = tours;
        cachedRegistrations = regs;
        hydrated = true;
        apiGetUsers()
          .then((us) => {
            cachedUsers = us;
            emit();
          })
          .catch(() => {});
        apiGetMatches()
          .then((ms) => {
            if (ms.length) cachedMatches = ms;
            emit();
          })
          .catch(() => {});
        apiGetNotifications()
          .then((res) => {
            cachedNotifications = res.notifications;
            emit();
          })
          .catch(() => {});
      } catch {
        // keep seed fallback on failure
      } finally {
        emit();
      }
    })();
  }
  return hydratePromise;
}

export function refreshStore() {
  hydratePromise = null;
  return hydrateStore();
}

// ---------- Tournaments ----------

export function getTournaments(): Tournament[] {
  return cachedTournaments ?? seedTournaments;
}

export function getTournament(id: string): Tournament | undefined {
  return getTournaments().find((t) => t.id === id);
}

export async function updateTournament(updated: Tournament) {
  await apiSaveTournament(updated);
  cachedTournaments = getTournaments().map((t) => (t.id === updated.id ? updated : t));
  emit();
}

export async function addTournament(t: Tournament) {
  await apiAddTournament(t);
  cachedTournaments = [...getTournaments(), t];
  emit();
}

export async function removeTournament(id: string) {
  await apiDeleteTournament(id);
  cachedTournaments = getTournaments().filter((t) => t.id !== id);
  emit();
}

export async function resetTournaments() {
  const res = await apiResetTournaments();
  cachedTournaments = res.tournaments;
  cachedRegistrations = [];
  emit();
}

// ---------- Users / Auth ----------

export function getUsers(): LocalUser[] {
  const seen = new Set<string>();
  return cachedUsers.filter((u) => {
    if (seen.has(u.id)) return false;
    seen.add(u.id);
    return true;
  });
}

export async function refreshUsers() {
  cachedUsers = await apiGetUsers();
  emit();
}

export function findUserByEmail(email: string): LocalUser | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

// ---------- Registrations ----------

export function getRegistrations(): ApiRegistration[] {
  return cachedRegistrations;
}

export async function refreshRegistrations(userId?: string) {
  cachedRegistrations = await apiGetRegistrations(userId);
  emit();
}

export function getRegistrationsForUser(userId: string): ApiRegistration[] {
  return getRegistrations().filter((r) => r.userId === userId);
}

export function isRegistered(userId: string, tournamentId: string): boolean {
  return getRegistrations().some((r) => r.userId === userId && r.tournamentId === tournamentId);
}

export async function registerForTournament(
  userId: string,
  tournamentId: string,
  details: {
    teamName: string;
    playerName: string;
    playerUid: string;
    playerEmail: string;
    members: { name: string; uid: string }[];
    paymentMethod?: "wallet" | "upi";
    upiTxnRef?: string;
    note?: string;
  }
) {
  if (isRegistered(userId, tournamentId)) return { ok: false, error: "Already registered." };
  const res = await apiRegisterForTournament(userId, tournamentId, details);
  if (res.ok) {
    cachedRegistrations = await apiGetRegistrations(userId);
    const t = getTournament(tournamentId);
    if (t && !res.pending) {
      cachedTournaments = getTournaments().map((x) =>
        x.id === tournamentId ? { ...x, teamsJoined: Math.min(x.teams, x.teamsJoined + 1) } : x
      );
    }
    emit();
  }
  return res;
}

export async function unregisterFromTournament(userId: string, tournamentId: string) {
  await apiUnregisterFromTournament(userId, tournamentId);
  cachedRegistrations = await apiGetRegistrations(userId);
  const t = getTournament(tournamentId);
  if (t) {
    cachedTournaments = getTournaments().map((x) =>
      x.id === tournamentId ? { ...x, teamsJoined: Math.max(0, x.teamsJoined - 1) } : x
    );
  }
  emit();
}

// ---------- Teams / Players (static seed) ----------

export function getTeams() {
  return seedTeams;
}

export function getPlayers() {
  return seedPlayers;
}

export function getTeam(id: string) {
  return seedTeams.find((t) => t.id === id);
}

export function getPlayer(id: string) {
  return seedPlayers.find((p) => p.id === id);
}

export { seedMatches, defaultNotifications };

// ---------- Matches (server-backed with seed fallback) ----------

export function getMatches(): Match[] {
  return cachedMatches ?? seedMatches;
}

export function refreshMatches() {
  return apiGetMatches().then((ms) => {
    if (ms.length) cachedMatches = ms;
    emit();
  });
}

// ---------- Notifications (server-backed with seed fallback) ----------

export function getNotifications(): ApiNotification[] {
  return cachedNotifications ?? defaultNotifications;
}

export function getUnreadCount(): number {
  return getNotifications().filter((n) => !n.read).length;
}

export async function markNotificationRead(id: string) {
  cachedNotifications = cachedNotifications?.map((n) => (n.id === id ? { ...n, read: true } : n)) ?? null;
  emit();
  await apiMarkNotificationRead(id).catch(() => {});
}

export async function markAllNotificationsRead() {
  cachedNotifications = cachedNotifications?.map((n) => ({ ...n, read: true })) ?? null;
  emit();
  await apiMarkAllNotificationsRead().catch(() => {});
}
