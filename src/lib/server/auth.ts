import { cookies } from "next/headers";
import { signJWT, verifyJWT } from "./jwt";
import type { ServerUser } from "./db";

export const SESSION_COOKIE = "nla_session";

export async function createSession(user: ServerUser) {
  const token = signJWT({ sub: user.id, role: user.role, name: user.name });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function getSessionUser(db: { users: ServerUser[] }): Promise<ServerUser | null> {
  const token = await getSessionToken();
  if (!token) return null;
  const payload = verifyJWT(token);
  if (!payload) return null;
  const user = db.users.find((u) => u.id === payload.sub);
  return user && user.role === payload.role ? user : null;
}

export function safeUser(u: ServerUser) {
  return {
    id: u.id,
    name: u.name,
    username: u.username || "",
    email: u.email,
    phone: u.phone,
    role: u.role,
    uid: u.uid,
    team: u.team,
    wallet: u.wallet,
    emailVerified: u.emailVerified,
    phoneVerified: u.phoneVerified,
    avatar: u.avatar || "",
  };
}
