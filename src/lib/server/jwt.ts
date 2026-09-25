import crypto from "crypto";

const SECRET = process.env.NLA_JWT_SECRET || "nla-arena-hmac-secret-2024";

interface JwtPayload {
  sub: string;
  role: string;
  name: string;
  iat: number;
  exp: number;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

export function signJWT(payload: { sub: string; role: string; name: string }, expiresInSec = 60 * 60 * 24 * 7): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body: JwtPayload = { ...payload, iat: now, exp: now + expiresInSec };
  const data = `${b64url(Buffer.from(JSON.stringify(header)))}.${b64url(Buffer.from(JSON.stringify(body)))}`;
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyJWT(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [h, p, s] = parts;
    const data = `${h}.${p}`;
    const expected = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
    if (expected !== s) return null;
    const payload = JSON.parse(Buffer.from(p, "base64url").toString()) as JwtPayload;
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
