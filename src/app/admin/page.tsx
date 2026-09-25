"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useStoreRefresh } from "@/lib/useStoreRefresh";
import {
  apiGetPayments,
  apiProcessPayment,
  apiGetPaymentConfig,
  apiGetWithdrawals,
  apiProcessWithdrawal,
  apiGetMatches,
  apiSaveMatch,
  apiAddMatch,
  apiDeleteMatch,
  apiDeclareWinner,
  apiSetRoom,
  apiGetUsers,
  type PaymentProof,
  type Withdrawal,
  type Match,
  type ApiUser,
} from "@/lib/api";
import { formatINR } from "@/lib/arena";
import { ProfileEditor } from "@/components/ProfileEditor";
import {
  getTournaments,
  updateTournament,
  addTournament,
  removeTournament,
  resetTournaments,
  getRegistrations,
  refreshStore,
  refreshRegistrations,
  type Tournament,
} from "@/lib/store";

const emptyTournament: Omit<Tournament, "id"> = {
  name: "New BGMI Tournament",
  short: "NEW EVENT",
  game: "BGMI",
  status: "UPCOMING",
  mode: "SQUAD",
  prizePool: "₹2,500",
  entryFee: "₹19",
  teams: 64,
  teamsJoined: 0,
  date: "01 SEP",
  time: "08:00 PM",
  format: "Point-Based League",
  map: "ERANGEL",
  rules: ["Fair play is mandatory.", "Screenshots required for results."],
  image: "/images/bgmi-9.jpg",
};

const inputCls =
  "w-full border border-[#1a2134] bg-[#05060a] px-3 py-2 font-body text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60";

const labelCls = "mb-1.5 block font-body text-[9px] font-semibold tracking-[0.25em] text-slate-500";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const refresh = useStoreRefresh();
  const [tournaments, setTournaments] = useState<Tournament[]>(() => getTournaments());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Tournament | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createDraft, setCreateDraft] = useState<Omit<Tournament, "id">>(() => ({
    ...emptyTournament,
    rules: [...emptyTournament.rules],
  }));
  const [toast, setToast] = useState("");
  const [tab, setTab] = useState<"tournaments" | "overview" | "users" | "matches" | "registrations" | "payments" | "withdrawals" | "profile">("tournaments");
  const [regFilter, setRegFilter] = useState("");
  const [payments, setPayments] = useState<PaymentProof[]>([]);
  const [payConfig, setPayConfig] = useState<{ upiId: string; whatsappNumber: string; razorpayEnabled?: boolean } | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [userFilter, setUserFilter] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [winnerDraft, setWinnerDraft] = useState<{ tournamentId: string; winner: string } | null>(null);
  const [roomDraft, setRoomDraft] = useState<{ tournamentId: string; roomId: string; password: string } | null>(null);
  const [matchDraft, setMatchDraft] = useState<Match | null>(null);
  const [showMatchCreate, setShowMatchCreate] = useState(false);

  useEffect(() => {
    setTournaments(getTournaments());
  }, [refresh]);

  useEffect(() => {
    if (user?.role === "admin") {
      apiGetUsers()
        .then((us) => setUsers(us))
        .catch(() => {});
      refreshRegistrations().catch(() => {});
    }
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    let cancelled = false;
    const load = () => {
      apiGetPayments()
        .then((res) => {
          if (!cancelled && res.ok) setPayments(res.payments);
        })
        .catch(() => {});
      apiGetWithdrawals()
        .then((res) => {
          if (!cancelled && res.ok) setWithdrawals(res.withdrawals);
        })
        .catch(() => {});
      apiGetMatches()
        .then((ms) => {
          if (!cancelled) setMatches(ms);
        })
        .catch(() => {});
      apiGetUsers()
        .then((us) => {
          if (!cancelled) setUsers(us);
        })
        .catch(() => {});
    };
    apiGetPaymentConfig()
      .then((cfg) => {
        if (!cancelled) setPayConfig(cfg);
      })
      .catch(() => {});
    load();
    const timer = window.setInterval(load, 8000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [refresh, user?.role]);

  if (loading) return null;

  if (!user || user.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="holo-panel clip-corner p-10 text-center">
          <p className="font-display text-xl font-black text-white">RESTRICTED ACCESS</p>
          <p className="mt-2 font-body text-sm text-slate-400">Admin credentials required.</p>
          <a href="/login" className="btn-primary mt-6 inline-block px-8 py-3 font-display text-sm">
            ADMIN LOGIN
          </a>
        </div>
      </main>
    );
  }

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const startEdit = (t: Tournament) => {
    setEditingId(t.id);
    setDraft({ ...t });
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.getElementById(`admin-edit-${t.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    });
  };

  const saveEdit = async () => {
    if (!draft) return;
    await updateTournament(draft);
    setTournaments(getTournaments());
    setEditingId(null);
    setDraft(null);
    showToast("TOURNAMENT UPDATED");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const createTournament = async () => {
    const t: Tournament = {
      ...createDraft,
      rules: [...createDraft.rules],
      id: `t-${Date.now()}`,
    };
    await addTournament(t);
    setTournaments(getTournaments());
    setShowCreate(false);
    setCreateDraft({ ...emptyTournament, rules: [...emptyTournament.rules] });
    showToast("TOURNAMENT CREATED");
  };

  const deleteTournament = async (id: string) => {
    await removeTournament(id);
    setTournaments(getTournaments());
    showToast("TOURNAMENT REMOVED");
  };

  const handleReset = async () => {
    await resetTournaments();
    setTournaments(getTournaments());
    showToast("DATA RESET TO SEED");
  };

  const verifyPayment = async (id: string, action: "verify" | "reject") => {
    const remarks = action === "reject" ? prompt("Rejection reason:") || "Payment could not be verified." : undefined;
    const res = await apiProcessPayment(id, action, remarks);
    if (res.ok) {
      const fresh = await apiGetPayments();
      if (fresh.ok) setPayments(fresh.payments);
      await refreshStore();
      setTournaments(getTournaments());
      showToast(action === "verify" ? "PAYMENT VERIFIED" : "PAYMENT REJECTED");
    } else {
      showToast(res.error || "ACTION FAILED");
    }
  };

  const processWithdrawal = async (w: Withdrawal, action: "approve" | "reject") => {
    let opts: { upiId?: string; remarks?: string } = {};
    if (action === "approve") {
      const upiId = prompt(`Player UPI for ${w.userName} (₹${w.amount.toLocaleString("en-IN")}):`);
      if (!upiId) return;
      opts.upiId = upiId;
    } else {
      const remarks = prompt("Rejection reason:") || "Withdrawal rejected by admin.";
      opts.remarks = remarks;
    }
    const res = await apiProcessWithdrawal(w.id, action, opts);
    if (res.ok) {
      const fresh = await apiGetWithdrawals();
      if (fresh.ok) setWithdrawals(fresh.withdrawals);
      showToast(action === "approve" ? "WITHDRAWAL APPROVED" : "WITHDRAWAL REJECTED");
    } else {
      showToast(res.error || "ACTION FAILED");
    }
  };

  const declareWinner = async () => {
    if (!winnerDraft) return;
    const res = await apiDeclareWinner(winnerDraft.tournamentId, winnerDraft.winner.trim());
    if (res.ok) {
      await refreshStore();
      setTournaments(getTournaments());
      setWinnerDraft(null);
      showToast(res.creditedTo ? `PRIZE ${formatINR(res.amount || 0)} CREDITED TO ${res.creditedTo}` : "WINNER DECLARED");
    } else {
      showToast(res.error || "DECLARE FAILED");
    }
  };

  const setRoom = async () => {
    if (!roomDraft) return;
    const res = await apiSetRoom(roomDraft.tournamentId, roomDraft.roomId, roomDraft.password);
    if (res.ok) {
      setRoomDraft(null);
      showToast("ROOM UPDATED");
    } else {
      showToast(res.error || "ROOM UPDATE FAILED");
    }
  };

  const saveMatch = async () => {
    if (!matchDraft) return;
    const res = await apiSaveMatch(matchDraft);
    if (res.ok) {
      const ms = await apiGetMatches();
      setMatches(ms);
      setMatchDraft(null);
      showToast("MATCH SAVED");
    } else {
      showToast(res.error || "SAVE FAILED");
    }
  };

  const openMatchEditor = (m: Match) => {
    setMatchDraft(m);
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.getElementById("admin-match-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    });
  };

  const createMatch = async () => {
    const m: Match = {
      id: `M${String(Date.now()).slice(-4)}`,
      tournamentId: "",
      tournament: "New Match",
      map: "ERANGEL",
      mode: "SQUAD",
      date: "01 SEP",
      time: "08:00 PM",
      status: "UPCOMING",
      teams: [],
      roomId: "",
      password: "",
    };
    const res = await apiAddMatch(m);
    if (res.ok) {
      const ms = await apiGetMatches();
      setMatches(ms);
      setShowMatchCreate(false);
      showToast("MATCH CREATED");
    } else {
      showToast(res.error || "CREATE FAILED");
    }
  };

  const deleteMatch = async (id: string) => {
    await apiDeleteMatch(id);
    const ms = await apiGetMatches();
    setMatches(ms);
    showToast("MATCH REMOVED");
  };

  const setDraftField = (field: keyof Tournament, value: string | number | string[]) => {
    if (!draft) return;
    setDraft({ ...draft, [field]: value });
  };

  const setCreateField = (field: keyof Omit<Tournament, "id">, value: string | number | string[]) => {
    setCreateDraft((d) => ({ ...d, [field]: value }));
  };

  const registrations = getRegistrations();
  const filteredUsers = users.filter((u) => {
    const q = userFilter.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      (u.username || "").toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      u.uid.includes(q) ||
      u.team.toLowerCase().includes(q)
    );
  });
  const filteredRegistrations = registrations.filter((r) => {
    const q = regFilter.toLowerCase().trim();
    if (!q) return true;
    return (
      r.playerName.toLowerCase().includes(q) ||
      r.playerUid.includes(q) ||
      r.teamName.toLowerCase().includes(q) ||
      r.tournamentName.toLowerCase().includes(q)
    );
  });
  const activePlayers = registrations.length;
  const liveCount = tournaments.filter((t) => t.status === "LIVE").length;
  const totalPrize = tournaments.reduce((sum, t) => {
    const n = parseInt(t.prizePool.replace(/[^\d]/g, ""), 10) || 0;
    return sum + n;
  }, 0);

  const playerCount = users.filter((u) => u.role === "player").length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const walletTotal = users.reduce((sum, u) => sum + (u.wallet || 0), 0);
  const prizeCredited = users.reduce(
    (sum, u) => sum + (u.transactions || []).filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0),
    0
  );

  type Tone = "emerald" | "red" | "cyan" | "amber" | "slate";
  const badgeCls = (tone: Tone) =>
    ({
      emerald: "border-emerald-500/40 text-emerald-400",
      red: "border-red-500/40 text-red-400",
      cyan: "border-cyan-400/40 text-cyan-400",
      amber: "border-amber-400/40 text-amber-400",
      slate: "border-slate-600/50 text-slate-400",
    }[tone]);

  const resolveResult = (tournamentId: string, teamName: string, playerName: string) => {
    const t = tournaments.find((x) => x.id === tournamentId);
    if (!t) return { label: "UNKNOWN", tone: "slate" as Tone, detail: "Tournament removed" };
    const winner = (t.winner || "").toLowerCase();
    const won = !!winner && (winner === teamName.toLowerCase() || winner === playerName.toLowerCase());
    if (t.status === "COMPLETED") {
      if (won) return { label: "WON", tone: "emerald" as Tone, detail: `Prize ${t.prizePool}` };
      return { label: winner ? "LOST" : "COMPLETED", tone: (winner ? "red" : "slate") as Tone, detail: winner ? `Winner: ${t.winner}` : "No result" };
    }
    if (t.status === "LIVE") return { label: "LIVE NOW", tone: "red" as Tone, detail: `${t.map} · ${t.time}` };
    return { label: "UPCOMING", tone: "cyan" as Tone, detail: `${t.date} · ${t.time} · ${t.map}` };
  };

  const resultRank: Record<string, number> = { "LIVE NOW": 0, UPCOMING: 1, WON: 2, COMPLETED: 3, LOST: 4, UNKNOWN: 5 };

  return (
    <main className="relative min-h-screen overflow-x-hidden px-4 py-20 sm:px-6 sm:py-24">
      <div className="grid-bg absolute inset-0 opacity-25" />
      <div className="relative z-10 mx-auto max-w-[1200px]">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="section-label mb-2">TOURNAMENT CONTROL CENTER</span>
              <h1 className="font-display text-2xl font-black tracking-wide text-white sm:text-4xl">
                ADMIN <span className="text-cyan-400">COMMAND</span>
              </h1>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
              <button
                onClick={() => {
                  setCreateDraft({ ...emptyTournament, rules: [...emptyTournament.rules] });
                  setShowCreate(true);
                  requestAnimationFrame(() => setTimeout(() => document.getElementById("admin-create-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80));
                }}
                className="btn-primary min-h-11 px-3 py-2.5 font-display text-[10px] sm:px-5 sm:text-xs"
              >
                + NEW TOURNAMENT
              </button>
              <button onClick={handleReset} className="btn-ghost min-h-11 px-3 py-2.5 font-display text-[10px] sm:px-5 sm:text-xs">
                RESET DATA
              </button>
            </div>
          </div>
        </motion.div>

        <div className="-mx-4 mb-8 overflow-x-auto border-b border-[#1a2134] px-4 sm:mx-0 sm:px-0">
          <div className="flex min-w-max gap-1">
            {(["overview", "profile", "tournaments", "registrations", "payments", "withdrawals", "users", "matches"] as const).map((tb) => (
              <button
                key={tb}
                onClick={() => setTab(tb)}
                className={`whitespace-nowrap px-4 py-3 font-body text-[10px] font-semibold tracking-[0.18em] transition-colors sm:px-5 sm:text-xs sm:tracking-[0.2em] ${
                  tab === tb ? "border-b-2 border-cyan-400 text-cyan-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tb.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {tab === "profile" && (
          <div className="mb-8">
            <ProfileEditor />
          </div>
        )}

        {tab === "overview" && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "LIVE TOURNAMENTS", value: liveCount },
              { label: "REGISTERED PLAYERS", value: activePlayers },
              { label: "TOTAL ACCOUNTS", value: users.length },
              { label: "TOTAL PRIZE POOL", value: `₹${totalPrize.toLocaleString("en-IN")}` },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="holo-panel clip-corner-sm flex flex-col items-center py-6 text-center"
              >
                <span className="font-display text-2xl font-black text-white sm:text-3xl">{s.value}</span>
                <span className="mt-1.5 font-body text-[9px] font-semibold tracking-[0.3em] text-cyan-400">{s.label}</span>
              </motion.div>
            ))}
          </div>
        )}

        {tab === "tournaments" && (
          <div className="space-y-4">
            <AnimatePresence>
              {tournaments.map((t) => (
                <motion.div
                  key={t.id}
                  id={`admin-edit-${t.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden border border-[#1a2134] bg-[#0a0d16]/70"
                >
                  <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:py-4">
                    <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                      <img src={t.image} alt={t.short} className="h-16 w-24 shrink-0 object-cover sm:h-14 sm:w-20" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-display text-sm font-bold text-white">{t.short}</p>
                          <span className="rounded-sm border border-[#1a2134] px-1.5 py-0.5 font-body text-[8px] tracking-[0.15em] text-slate-500">{t.status}</span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 font-body text-[11px] text-slate-400 sm:mt-1 sm:block sm:text-xs">
                          <p>
                            <span className="text-cyan-400">{t.prizePool}</span>
                          </p>
                           <p>Entry {t.entryFee} / player</p>
                          <p>
                            {t.teamsJoined}/{t.teams} teams
                          </p>
                          <p>
                            {t.date} {t.time}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:flex-wrap sm:gap-2">
                      <button onClick={() => startEdit(t)} className="btn-ghost min-h-10 px-3 py-2 font-display text-[10px]">
                        EDIT
                      </button>
                      <button onClick={() => setRoomDraft({ tournamentId: t.id, roomId: "", password: "" })} className="btn-ghost min-h-10 px-3 py-2 font-display text-[10px]">
                        ROOM
                      </button>
                      <button
                        onClick={() => setWinnerDraft({ tournamentId: t.id, winner: t.winner || t.short })}
                        className="min-h-10 border border-amber-400/50 px-3 py-2 font-display text-[10px] text-amber-400 transition-colors hover:bg-amber-400/10"
                      >
                        {t.winner ? "RE-DECLARE" : "DECLARE"}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${t.short}?`)) deleteTournament(t.id);
                        }}
                        className="min-h-10 border border-[#1a2134] px-3 py-2 font-display text-[10px] text-slate-400 transition-colors hover:border-red-500/50 hover:text-red-400"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>

                  {editingId === t.id && draft && (
                    <div className="border-t border-[#1a2134] p-4 sm:p-5">
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <label className={labelCls}>TOURNAMENT NAME</label>
                          <input className={inputCls} value={draft.name} onChange={(e) => setDraftField("name", e.target.value)} />
                        </div>
                        <div>
                          <label className={labelCls}>SHORT NAME</label>
                          <input className={inputCls} value={draft.short} onChange={(e) => setDraftField("short", e.target.value)} />
                        </div>
                        <div>
                          <label className={labelCls}>STATUS</label>
                          <select className={inputCls} value={draft.status} onChange={(e) => setDraftField("status", e.target.value)}>
                            <option>LIVE</option>
                            <option>UPCOMING</option>
                            <option>REGISTRATION OPEN</option>
                            <option>COMPLETED</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>PRIZE POOL (MAX ₹2,500)</label>
                          <input className={inputCls} value={draft.prizePool} onChange={(e) => setDraftField("prizePool", e.target.value)} />
                        </div>
                        <div>
                          <label className={labelCls}>ENTRY FEE / PLAYER</label>
                          <input className={inputCls} value={draft.entryFee} onChange={(e) => setDraftField("entryFee", e.target.value)} />
                        </div>
                        <div>
                          <label className={labelCls}>MODE</label>
                          <select className={inputCls} value={draft.mode} onChange={(e) => setDraftField("mode", e.target.value)}>
                            <option>SOLO</option>
                            <option>DUO</option>
                            <option>SQUAD</option>
                            <option>TDM</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>TOTAL TEAMS</label>
                          <input type="number" className={inputCls} value={draft.teams} onChange={(e) => setDraftField("teams", parseInt(e.target.value, 10) || 0)} />
                        </div>
                        <div>
                          <label className={labelCls}>DATE</label>
                          <input className={inputCls} value={draft.date} onChange={(e) => setDraftField("date", e.target.value)} />
                        </div>
                        <div>
                          <label className={labelCls}>TIME</label>
                          <input className={inputCls} value={draft.time} onChange={(e) => setDraftField("time", e.target.value)} />
                        </div>
                        <div>
                          <label className={labelCls}>MAP</label>
                          <select className={inputCls} value={draft.map} onChange={(e) => setDraftField("map", e.target.value)}>
                            <option>ERANGEL</option>
                            <option>MIRAMAR</option>
                            <option>SANHOK</option>
                            <option>LIVIK</option>
                            <option>WAREHOUSE</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>FORMAT</label>
                          <input className={inputCls} value={draft.format} onChange={(e) => setDraftField("format", e.target.value)} />
                        </div>
                        <div>
                          <label className={labelCls}>TEAMS JOINED</label>
                          <input type="number" className={inputCls} value={draft.teamsJoined} onChange={(e) => setDraftField("teamsJoined", parseInt(e.target.value, 10) || 0)} />
                        </div>
                        <div>
                          <label className={labelCls}>CATEGORY / TAG</label>
                          <select className={inputCls} value={draft.tag || ""} onChange={(e) => setDraftField("tag", e.target.value)}>
                            <option value="">STANDARD</option>
                            <option value="HACKER">HACKER</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>IMAGE URL</label>
                          <input className={inputCls} value={draft.image} onChange={(e) => setDraftField("image", e.target.value)} />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                          <label className={labelCls}>RULES (one per line)</label>
                          <textarea
                            rows={3}
                            className={inputCls}
                            value={draft.rules.join("\n")}
                            onChange={(e) => setDraftField("rules", e.target.value.split("\n").map((r) => r.trim()).filter(Boolean))}
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 border-t border-[#1a2134] pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="grid grid-cols-2 gap-2 sm:flex">
                          <button onClick={saveEdit} className="btn-primary min-h-10 px-6 py-2.5 font-display text-[11px]">
                            SAVE CHANGES
                          </button>
                          <button onClick={cancelEdit} className="btn-ghost min-h-10 px-6 py-2.5 font-display text-[11px]">
                            CANCEL
                          </button>
                        </div>
                        <p className="font-body text-[9px] tracking-[0.2em] text-slate-600">CHANGES SAVE TO SERVER DATABASE</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {showCreate && (
              <motion.div id="admin-create-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border border-cyan-400/40 bg-[#0a0d16]/80 p-5">
                <div className="mb-4">
                  <p className="font-display text-sm font-bold text-white">CREATE NEW TOURNAMENT</p>
                  <p className="mt-1 font-body text-xs text-slate-400">Prize max ₹2,500. Entry fee is per player (FREE or INVITE also allowed).</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className={labelCls}>TOURNAMENT NAME</label>
                    <input className={inputCls} value={createDraft.name} onChange={(e) => setCreateField("name", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>SHORT NAME</label>
                    <input className={inputCls} value={createDraft.short} onChange={(e) => setCreateField("short", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>STATUS</label>
                    <select className={inputCls} value={createDraft.status} onChange={(e) => setCreateField("status", e.target.value)}>
                      <option>UPCOMING</option>
                      <option>REGISTRATION OPEN</option>
                      <option>LIVE</option>
                      <option>COMPLETED</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>PRIZE POOL (MAX ₹2,500)</label>
                    <input className={inputCls} value={createDraft.prizePool} onChange={(e) => setCreateField("prizePool", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>ENTRY FEE / PLAYER</label>
                    <input className={inputCls} value={createDraft.entryFee} onChange={(e) => setCreateField("entryFee", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>MODE</label>
                    <select className={inputCls} value={createDraft.mode} onChange={(e) => setCreateField("mode", e.target.value)}>
                      <option>SOLO</option>
                      <option>DUO</option>
                      <option>SQUAD</option>
                      <option>TDM</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>TOTAL TEAMS</label>
                    <input type="number" className={inputCls} value={createDraft.teams} onChange={(e) => setCreateField("teams", parseInt(e.target.value, 10) || 0)} />
                  </div>
                  <div>
                    <label className={labelCls}>DATE</label>
                    <input className={inputCls} value={createDraft.date} onChange={(e) => setCreateField("date", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>TIME</label>
                    <input className={inputCls} value={createDraft.time} onChange={(e) => setCreateField("time", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>MAP</label>
                    <select className={inputCls} value={createDraft.map} onChange={(e) => setCreateField("map", e.target.value)}>
                      <option>ERANGEL</option>
                      <option>MIRAMAR</option>
                      <option>SANHOK</option>
                      <option>LIVIK</option>
                      <option>WAREHOUSE</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>FORMAT</label>
                    <input className={inputCls} value={createDraft.format} onChange={(e) => setCreateField("format", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>IMAGE URL</label>
                    <input className={inputCls} value={createDraft.image} onChange={(e) => setCreateField("image", e.target.value)} />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className={labelCls}>RULES (one per line)</label>
                    <textarea
                      rows={3}
                      className={inputCls}
                      value={createDraft.rules.join("\n")}
                      onChange={(e) => setCreateField("rules", e.target.value.split("\n").map((r) => r.trim()).filter(Boolean))}
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2 border-t border-[#1a2134] pt-4">
                  <button onClick={createTournament} className="btn-primary px-6 py-2.5 font-display text-[11px]">
                    CREATE
                  </button>
                  <button onClick={() => setShowCreate(false)} className="btn-ghost px-6 py-2.5 font-display text-[11px]">
                    CANCEL
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {tab === "registrations" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-body text-[11px] tracking-[0.2em] text-slate-400">
                TOTAL REGISTRATIONS: <span className="font-bold text-cyan-400">{registrations.length}</span>
              </p>
              <input
                value={regFilter}
                onChange={(e) => setRegFilter(e.target.value)}
                placeholder="SEARCH PLAYER / UID / TEAM..."
                className="w-full border border-[#1a2134] bg-[#05060a] px-3 py-2 font-body text-xs text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60 sm:w-80"
              />
            </div>

            {registrations.length === 0 ? (
              <div className="holo-panel clip-corner flex flex-col items-center py-16 text-center">
                <p className="font-display text-sm font-bold text-white">NO REGISTRATIONS YET</p>
                <p className="mt-2 font-body text-xs text-slate-500">Players who register will appear here with full details.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#1a2134] bg-[#0a0d16]/70">
                <table className="w-full min-w-[720px] text-left">
                  <thead>
                    <tr className="border-b border-[#1a2134] bg-[#05060a]">
                      {["#", "TOURNAMENT", "PLAYER (CAPTAIN)", "BGMI UID", "EMAIL", "TEAM", "ROSTER", "REGISTERED AT"].map((h) => (
                        <th key={h} className="px-4 py-3 font-body text-[9px] font-semibold tracking-[0.25em] text-cyan-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.map((r, i) => (
                      <motion.tr
                        key={`${r.userId}-${r.tournamentId}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-[#12182a] transition-colors hover:bg-[#0a0d16]/40"
                      >
                        <td className="px-4 py-3.5 font-display text-xs font-bold text-slate-500">{i + 1}</td>
                        <td className="px-4 py-3.5">
                          <p className="font-body text-xs font-semibold text-slate-200">{r.tournamentName}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-body text-xs font-semibold text-white">{r.playerName}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="rounded-sm border border-cyan-400/30 bg-cyan-400/5 px-2 py-1 font-body text-[10px] font-semibold tracking-[0.15em] text-cyan-400">
                            {r.playerUid}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-body text-xs text-slate-400">{r.playerEmail}</td>
                        <td className="px-4 py-3.5 font-body text-xs text-slate-300">{r.teamName}</td>
                        <td className="px-4 py-3.5">
                          {r.members && r.members.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {r.members.map((m, mi) => (
                                <span
                                  key={mi}
                                  title={`UID: ${m.uid}`}
                                  className="rounded-sm border border-[#1a2134] bg-[#05060a] px-2 py-0.5 font-body text-[9px] tracking-[0.1em] text-slate-400"
                                >
                                  {m.name} <span className="text-cyan-500">{m.uid}</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="font-body text-[10px] text-slate-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-body text-[10px] tracking-[0.1em] text-slate-500">
                          {new Date(r.registeredAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "payments" && (
          <div className="space-y-4">
            <div className="holo-panel clip-corner flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-body text-[9px] font-semibold tracking-[0.25em] text-slate-500">
                  {payConfig?.razorpayEnabled ? "RAZORPAY + UPI COLLECT" : "YOUR UPI DETAILS"}
                </p>
                {payConfig?.razorpayEnabled && (
                  <p className="mt-1 font-display text-sm font-black text-emerald-400">RAZORPAY LIVE · BANK SETTLEMENT ON</p>
                )}
                <p className="mt-1 break-all font-display text-sm font-black text-cyan-400">{payConfig?.upiId || "ksuraj138@ybl"}</p>
                <p className="mt-1 font-body text-[9px] tracking-[0.2em] text-slate-500">PAYMENT PROOF WHATSAPP: +{payConfig?.whatsappNumber || "917015742792"}</p>
              </div>
              <p className="font-body text-[11px] tracking-[0.2em] text-slate-400">
                TOTAL PAYMENTS: <span className="font-bold text-cyan-400">{payments.length}</span>
              </p>
            </div>

            {payments.length === 0 ? (
              <div className="holo-panel clip-corner flex flex-col items-center py-16 text-center">
                <p className="font-display text-sm font-bold text-white">NO PAYMENTS YET</p>
                <p className="mt-2 font-body text-xs text-slate-500">Player top-ups will appear here with payment proof details.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((p, i) => {
                  const waMsg = [
                    "NEXT LEVEL ARENA - PAYMENT PROOF",
                    "--------------------------------",
                    `Player: ${p.userName}`,
                    `Amount: ${formatINR(p.amount)}`,
                    `UPI ID: ${p.upiId}`,
                    `Txn Ref: ${p.upiTxnRef}`,
                    p.note ? `Note: ${p.note}` : "",
                    `Status: ${p.status}`,
                    `Time: ${new Date(p.createdAt).toLocaleString("en-IN")}`,
                  ].filter(Boolean).join("\n");
                  const waLink = `https://wa.me/${payConfig?.whatsappNumber || "917015742792"}?text=${encodeURIComponent(waMsg)}`;
                  return (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="border border-[#1a2134] bg-[#0a0d16]/70 p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/40 bg-[#0e1220] font-display text-base font-black text-cyan-400">
                            {p.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-body text-sm font-semibold text-slate-200">{p.userName}</p>
                            <p className="font-body text-[10px] tracking-[0.15em] text-slate-500">
                              {formatINR(p.amount)} · {p.method === "RAZORPAY" ? "RAZORPAY" : "UPI"} · {p.razorpayPaymentId || p.upiTxnRef} · {new Date(p.createdAt).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                        <span className={`rounded-sm border px-2 py-0.5 font-body text-[9px] font-semibold tracking-[0.2em] ${
                          p.status === "VERIFIED"
                            ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-400"
                            : p.status === "REJECTED"
                              ? "border-red-500/40 bg-red-500/5 text-red-400"
                              : "border-amber-400/40 bg-amber-400/5 text-amber-400"
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      {p.note && (
                        <p className="mt-3 border-t border-[#1a2134] pt-3 font-body text-xs italic text-slate-400">
                          NOTE: {p.note}
                        </p>
                      )}
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-primary min-h-10 px-4 py-2 text-center font-display text-[10px]">
                          VIEW / FORWARD ON WHATSAPP
                        </a>
                        <span className="break-all font-body text-[9px] tracking-[0.15em] text-slate-600">
                          {p.method === "RAZORPAY" ? "RAZORPAY ORDER" : `PAID TO ${p.upiId}`}
                        </span>
                        {p.status === "PENDING VERIFICATION" && p.method !== "RAZORPAY" && (
                          <div className="grid grid-cols-2 gap-2 sm:ml-auto sm:flex">
                            <button onClick={() => verifyPayment(p.id, "verify")} className="min-h-10 border border-emerald-500/50 px-4 py-2 font-display text-[10px] text-emerald-400 transition-colors hover:bg-emerald-500/10">
                              VERIFY
                            </button>
                            <button onClick={() => verifyPayment(p.id, "reject")} className="min-h-10 border border-red-500/50 px-4 py-2 font-display text-[10px] text-red-400 transition-colors hover:bg-red-500/10">
                              REJECT
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: "TOTAL ACCOUNTS", value: users.length },
                { label: "PLAYER ACCOUNTS", value: playerCount },
                { label: "ADMIN ACCOUNTS", value: adminCount },
                { label: "WALLET HELD", value: formatINR(walletTotal) },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="holo-panel clip-corner-sm flex flex-col items-center py-5 text-center"
                >
                  <span className="font-display text-xl font-black text-white sm:text-2xl">{s.value}</span>
                  <span className="mt-1.5 font-body text-[9px] font-semibold tracking-[0.25em] text-cyan-400">{s.label}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-body text-[11px] tracking-[0.2em] text-slate-400">
                TOTAL PRIZE CREDITED: <span className="font-bold text-emerald-400">{formatINR(prizeCredited)}</span>
                <span className="mx-2 text-slate-700">|</span>
                SHOWING: <span className="font-bold text-cyan-400">{filteredUsers.length}</span>
              </p>
              <input
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                placeholder="SEARCH PLAYER / USERNAME / EMAIL / UID..."
                className="w-full border border-[#1a2134] bg-[#05060a] px-3 py-2 font-body text-xs text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60 sm:w-96"
              />
            </div>

            {filteredUsers.length === 0 ? (
              <div className="holo-panel clip-corner flex flex-col items-center py-16 text-center">
                <p className="font-display text-sm font-bold text-white">NO ACCOUNTS FOUND</p>
                <p className="mt-2 font-body text-xs text-slate-500">Player accounts will appear here once they register.</p>
              </div>
            ) : (
              filteredUsers.map((u, i) => {
                const userRegs = registrations
                  .filter((r) => r.userId === u.id)
                  .map((r) => ({ reg: r, result: resolveResult(r.tournamentId, r.teamName, r.playerName) }))
                  .sort((a, b) => (resultRank[a.result.label] ?? 9) - (resultRank[b.result.label] ?? 9));
                const wins = userRegs.filter((x) => x.result.label === "WON").length;
                const upcoming = userRegs.filter((x) => x.result.label === "UPCOMING").length;
                const live = userRegs.filter((x) => x.result.label === "LIVE NOW").length;
                const userTx = u.transactions || [];
                const prizeWon = userTx.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
                const spent = Math.abs(userTx.filter((t) => t.amount < 0).reduce((a, t) => a + t.amount, 0));
                const isOpen = expandedUser === u.id;

                return (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border border-[#1a2134] bg-[#0a0d16]/70"
                  >
                    <button
                      onClick={() => setExpandedUser(isOpen ? null : u.id)}
                      className="flex w-full flex-col gap-3 p-4 text-left transition-colors hover:bg-[#0e1220]/40 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-cyan-400/40 bg-[#0e1220] font-display text-lg font-black text-cyan-400">
                          {u.avatar ? <img src={u.avatar} alt="" className="h-full w-full object-cover" /> : u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-body text-sm font-semibold text-slate-200">{u.name}</p>
                            <span className={`rounded-sm border px-1.5 py-0.5 font-body text-[8px] tracking-[0.15em] ${u.role === "admin" ? "border-red-500/50 text-red-400" : "border-cyan-400/40 text-cyan-400"}`}>
                              {u.role.toUpperCase()}
                            </span>
                            <span className="rounded-sm border border-[#1a2134] px-1.5 py-0.5 font-body text-[8px] tracking-[0.15em] text-slate-500">
                              @{u.username || "no-username"}
                            </span>
                          </div>
                          <p className="mt-0.5 break-all font-body text-[10px] tracking-[0.1em] text-slate-500">
                            {u.email || "no email"} · {u.phone || "no mobile"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="rounded-sm border border-[#1a2134] bg-[#05060a] px-3 py-1.5 font-body text-[10px] tracking-[0.15em] text-slate-400">
                          {userRegs.length} REGISTRATIONS
                        </span>
                        <span className="rounded-sm border border-cyan-400/30 bg-cyan-400/5 px-3 py-1.5 font-body text-[10px] tracking-[0.1em] text-cyan-400">
                          {formatINR(u.wallet || 0)}
                        </span>
                        <span className={`ml-auto font-display text-xs text-cyan-400 transition-transform sm:ml-0 ${isOpen ? "rotate-180" : ""}`}>▾</span>
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden border-t border-[#1a2134]"
                        >
                          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-6">
                            {[
                              { label: "REGISTERED", value: String(userRegs.length), tone: "text-white" },
                              { label: "WINS", value: String(wins), tone: "text-emerald-400" },
                              { label: "LIVE", value: String(live), tone: "text-red-400" },
                              { label: "UPCOMING", value: String(upcoming), tone: "text-cyan-400" },
                              { label: "PRIZE WON", value: formatINR(prizeWon), tone: "text-emerald-400" },
                              { label: "WALLET", value: formatINR(u.wallet || 0), tone: "text-cyan-400" },
                            ].map((s) => (
                              <div key={s.label} className="border border-[#12182a] bg-[#05060a] px-3 py-3 text-center">
                                <p className={`font-display text-sm font-black ${s.tone}`}>{s.value}</p>
                                <p className="mt-1 font-body text-[8px] font-semibold tracking-[0.25em] text-slate-500">{s.label}</p>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-[#1a2134] p-4">
                            <p className="mb-3 font-body text-[9px] font-semibold tracking-[0.3em] text-cyan-400">ACCOUNT DETAILS</p>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                              {[
                                { k: "EMAIL", v: u.email || "—" },
                                { k: "MOBILE", v: u.phone || "—" },
                                { k: "BGMI UID", v: u.uid || "—" },
                                { k: "TEAM", v: u.team || "—" },
                                { k: "USERNAME", v: u.username ? `@${u.username}` : "—" },
                                { k: "JOINED", v: u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
                                { k: "EMAIL VERIFIED", v: u.emailVerified ? "YES" : "NO" },
                                { k: "PHONE VERIFIED", v: u.phoneVerified ? "YES" : "NO" },
                                { k: "TOTAL SPENT", v: formatINR(spent) },
                              ].map((row) => (
                                <div key={row.k} className="border-l-2 border-[#1a2134] pl-3">
                                  <p className="font-body text-[8px] font-semibold tracking-[0.25em] text-slate-500">{row.k}</p>
                                  <p className="mt-0.5 break-all font-body text-xs text-slate-200">{row.v}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="border-t border-[#1a2134] p-4">
                            <p className="mb-3 font-body text-[9px] font-semibold tracking-[0.3em] text-cyan-400">
                              TOURNAMENT DASHBOARD ({userRegs.length})
                            </p>
                            {userRegs.length === 0 ? (
                              <p className="py-4 text-center font-body text-xs text-slate-600">NO TOURNAMENT REGISTRATIONS YET</p>
                            ) : (
                              <div className="space-y-2">
                                {userRegs.map(({ reg, result }) => (
                                  <div key={`${reg.userId}-${reg.tournamentId}`} className="flex flex-col gap-2 border border-[#12182a] bg-[#05060a] px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                      <p className="font-body text-xs font-semibold text-slate-200">{reg.tournamentName}</p>
                                      <p className="mt-0.5 font-body text-[9px] tracking-[0.1em] text-slate-500">
                                        {reg.teamName} · CAPT {reg.playerName} · UID {reg.playerUid} · {result.detail}
                                      </p>
                                      {reg.members && reg.members.length > 0 && (
                                        <div className="mt-1.5 flex flex-wrap gap-1">
                                          {reg.members.map((m, mi) => (
                                            <span key={mi} className="rounded-sm border border-[#1a2134] px-1.5 py-0.5 font-body text-[8px] tracking-[0.1em] text-slate-500">
                                              {m.name}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                      <span className={`rounded-sm border px-2 py-0.5 font-body text-[9px] font-semibold tracking-[0.15em] ${badgeCls(result.tone)}`}>
                                        {result.label}
                                      </span>
                                      <span className="rounded-sm border border-[#1a2134] px-2 py-0.5 font-body text-[9px] tracking-[0.1em] text-slate-500">
                                        {reg.status}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {userTx.length > 0 && (
                            <div className="border-t border-[#1a2134] p-4">
                              <p className="mb-3 font-body text-[9px] font-semibold tracking-[0.3em] text-cyan-400">
                                WALLET TRANSACTIONS ({userTx.length})
                              </p>
                              <div className="space-y-1.5">
                                {userTx.slice(0, 8).map((tx) => (
                                  <div key={tx.id} className="flex items-center justify-between gap-3 border border-[#12182a] bg-[#05060a] px-3 py-2">
                                    <div className="min-w-0">
                                      <p className="truncate font-body text-xs text-slate-300">{tx.label}</p>
                                      <p className="font-body text-[9px] tracking-[0.1em] text-slate-600">
                                        {tx.status} · {tx.createdAt ? String(tx.createdAt).slice(0, 10) : "—"}
                                      </p>
                                    </div>
                                    <span className={`shrink-0 font-display text-xs font-black ${tx.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                      {tx.amount >= 0 ? "+" : ""}{formatINR(tx.amount)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        )}


        {tab === "matches" && (
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-body text-[11px] tracking-[0.2em] text-slate-400">
                TOTAL MATCHES: <span className="font-bold text-cyan-400">{matches.length}</span>
              </p>
              <button
                onClick={() => {
                  setShowMatchCreate(true);
                  requestAnimationFrame(() => setTimeout(() => document.getElementById("admin-match-create-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80));
                }}
                className="btn-primary min-h-11 w-full px-5 py-2.5 font-display text-[10px] sm:w-auto"
              >
                + NEW MATCH
              </button>
            </div>

            {matches.length === 0 ? (
              <div className="holo-panel clip-corner flex flex-col items-center py-16 text-center">
                <p className="font-display text-sm font-bold text-white">NO MATCHES YET</p>
                <p className="mt-2 font-body text-xs text-slate-500">Create a match to start tracking results.</p>
              </div>
            ) : (
              matches.map((m, i) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border border-[#1a2134] bg-[#0a0d16]/70 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-sm font-black text-white">{m.id}</span>
                      <div>
                        <p className="font-body text-sm font-semibold text-slate-200">{m.tournament}</p>
                        <p className="font-body text-[9px] tracking-[0.15em] text-slate-500">MAP {m.map} · {m.mode} · {m.time}</p>
                      </div>
                    </div>
                    <span className={`rounded-sm border px-2 py-0.5 font-body text-[9px] font-semibold tracking-[0.2em] ${
                      m.status === "LIVE" ? "border-red-500/50 text-red-400" : m.status === "UPCOMING" ? "border-cyan-400/50 text-cyan-400" : "border-slate-600/50 text-slate-400"
                    }`}>
                      {m.status}
                    </span>
                  </div>

                  {m.teams && m.teams.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                      {m.teams.map((t) => (
                        <div key={t.tag} className="flex items-center justify-between border border-[#12182a] bg-[#05060a] px-3 py-1.5">
                          <span className="font-body text-[10px] text-slate-400">{t.name}</span>
                          <span className="font-display text-xs font-black text-cyan-400">{t.points}{typeof t.kills === "number" ? ` · ${t.kills}K` : ""}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex flex-col gap-3 border-t border-[#1a2134] pt-3 font-body text-[10px] tracking-[0.15em] text-slate-500 sm:flex-row sm:flex-wrap sm:items-center">
                    <span>ROOM <span className="text-slate-300">{m.roomId || "TBD"}</span></span>
                    <span>PASS <span className="text-slate-300">{m.password || "TBD"}</span></span>
                    <div className="grid grid-cols-2 gap-2 sm:ml-auto sm:flex">
                      <button onClick={() => openMatchEditor(m)} className="btn-primary min-h-10 px-4 py-1.5 font-display text-[9px]">EDIT / SCORES</button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove match ${m.id}?`)) deleteMatch(m.id);
                        }}
                        className="border border-[#1a2134] px-4 py-1.5 font-display text-[9px] text-slate-400 transition-colors hover:border-red-500/50 hover:text-red-400"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}

            {showMatchCreate && (
              <motion.div id="admin-match-create-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border border-cyan-400/40 bg-[#0a0d16]/80 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-display text-sm font-bold text-white">CREATE NEW MATCH</p>
                    <p className="mt-1 font-body text-xs text-slate-400">Defaults applied — edit scores after creation.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={createMatch} className="btn-primary px-6 py-2.5 font-display text-[11px]">CREATE</button>
                    <button onClick={() => setShowMatchCreate(false)} className="btn-ghost px-6 py-2.5 font-display text-[11px]">CANCEL</button>
                  </div>
                </div>
              </motion.div>
            )}

            {matchDraft && (
              <div id="admin-match-editor" className="border border-cyan-400/40 bg-[#0a0d16]/90 p-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-display text-sm font-bold text-white">EDIT MATCH {matchDraft.id}</p>
                  <button onClick={() => setMatchDraft(null)} className="btn-ghost min-h-10 px-4 py-2 font-display text-[10px]">CLOSE</button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className={labelCls}>TOURNAMENT</label>
                    <input className={inputCls} value={matchDraft.tournament} onChange={(e) => setMatchDraft({ ...matchDraft, tournament: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>TOURNAMENT ID</label>
                    <input className={inputCls} value={matchDraft.tournamentId} onChange={(e) => setMatchDraft({ ...matchDraft, tournamentId: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>STATUS</label>
                    <select className={inputCls} value={matchDraft.status} onChange={(e) => setMatchDraft({ ...matchDraft, status: e.target.value as Match["status"] })}>
                      <option>LIVE</option>
                      <option>UPCOMING</option>
                      <option>COMPLETED</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>MAP</label>
                    <select className={inputCls} value={matchDraft.map} onChange={(e) => setMatchDraft({ ...matchDraft, map: e.target.value })}>
                      <option>ERANGEL</option>
                      <option>MIRAMAR</option>
                      <option>SANHOK</option>
                      <option>LIVIK</option>
                      <option>WAREHOUSE</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>TIME</label>
                    <input className={inputCls} value={matchDraft.time} onChange={(e) => setMatchDraft({ ...matchDraft, time: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>DATE</label>
                    <input className={inputCls} value={matchDraft.date} onChange={(e) => setMatchDraft({ ...matchDraft, date: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>ROOM ID</label>
                    <input className={inputCls} value={matchDraft.roomId || ""} onChange={(e) => setMatchDraft({ ...matchDraft, roomId: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>PASSWORD</label>
                    <input className={inputCls} value={matchDraft.password || ""} onChange={(e) => setMatchDraft({ ...matchDraft, password: e.target.value })} />
                  </div>
                </div>

                <div className="mt-4 border-t border-[#1a2134] pt-4">
                  <label className={labelCls}>SCORES (JSON: [{"{\"name\":\"Team Nova\",\"tag\":\"NV\",\"points\":42,\"kills\":18}"}])</label>
                  <textarea
                    className={inputCls}
                    rows={4}
                    value={JSON.stringify(matchDraft.teams || [], null, 1)}
                    onChange={(e) => {
                      try {
                        const teams = JSON.parse(e.target.value);
                        if (Array.isArray(teams)) setMatchDraft({ ...matchDraft, teams });
                      } catch {
                        // invalid JSON while typing — ignore
                      }
                    }}
                  />
                </div>

                <div className="mt-4 flex gap-2">
                  <button onClick={saveMatch} className="btn-primary px-6 py-2.5 font-display text-[11px]">SAVE MATCH</button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "withdrawals" && (
          <div className="space-y-3">
            <p className="font-body text-[11px] tracking-[0.2em] text-slate-400">
              TOTAL REQUESTS: <span className="font-bold text-cyan-400">{withdrawals.length}</span> · PENDING:{" "}
              <span className="font-bold text-amber-400">{withdrawals.filter((w) => w.status === "PENDING").length}</span>
            </p>
            {withdrawals.length === 0 ? (
              <div className="holo-panel clip-corner flex flex-col items-center py-16 text-center">
                <p className="font-display text-sm font-bold text-white">NO WITHDRAWAL REQUESTS</p>
                <p className="mt-2 font-body text-xs text-slate-500">Player withdrawal requests will appear here.</p>
              </div>
            ) : (
              withdrawals.map((w, i) => (
                <motion.div key={w.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="border border-[#1a2134] bg-[#0a0d16]/70 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/40 bg-[#0e1220] font-display text-base font-black text-cyan-400">
                        {w.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-body text-sm font-semibold text-slate-200">{w.userName}</p>
                        <p className="font-body text-[10px] tracking-[0.15em] text-slate-500">
                          {formatINR(w.amount)} · {new Date(w.createdAt).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                     <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                      <span className={`w-fit rounded-sm border px-2 py-0.5 font-body text-[9px] font-semibold tracking-[0.2em] ${
                        w.status === "APPROVED" ? "border-emerald-500/40 text-emerald-400" : w.status === "REJECTED" ? "border-red-500/40 text-red-400" : "border-amber-400/40 text-amber-400"
                      }`}>
                        {w.status}
                      </span>
                      {w.status === "PENDING" && (
                        <div className="grid grid-cols-2 gap-2 sm:flex">
                          <button onClick={() => processWithdrawal(w, "approve")} className="min-h-10 border border-emerald-500/50 px-4 py-2 font-display text-[10px] text-emerald-400 transition-colors hover:bg-emerald-500/10">
                            APPROVE
                          </button>
                          <button onClick={() => processWithdrawal(w, "reject")} className="min-h-10 border border-red-500/50 px-4 py-2 font-display text-[10px] text-red-400 transition-colors hover:bg-red-500/10">
                            REJECT
                          </button>
                        </div>
                      )}
                      {w.upiId && <span className="break-all font-body text-[9px] tracking-[0.1em] text-slate-500">{w.upiId}</span>}
                    </div>
                  </div>
                  {w.remarks && <p className="mt-3 border-t border-[#1a2134] pt-3 font-body text-xs italic text-slate-400">{w.remarks}</p>}
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-8 left-1/2 z-[999] -translate-x-1/2 border border-cyan-400/50 bg-[#05060a] px-6 py-3 font-body text-xs font-semibold tracking-[0.2em] text-cyan-400 shadow-glow"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {winnerDraft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[900] flex items-center justify-center bg-black/80 px-6"
            onClick={() => setWinnerDraft(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="holo-panel scanline clip-corner w-full max-w-sm p-6"
            >
              <p className="mb-1 font-display text-sm font-bold tracking-[0.3em] text-white">DECLARE WINNER</p>
              <p className="mb-4 font-body text-[10px] tracking-[0.2em] text-slate-500">
                AUTO-CREDITS 50% PRIZE TO THE WINNING TEAM CAPTAIN
              </p>
              <label className={labelCls}>WINNING TEAM / PLAYER NAME</label>
              <input
                className={inputCls}
                value={winnerDraft.winner}
                onChange={(e) => setWinnerDraft({ ...winnerDraft, winner: e.target.value })}
                placeholder="e.g. Team Nova"
              />
              <p className="mt-3 font-body text-[9px] leading-relaxed tracking-[0.1em] text-slate-500">
                Tournament will be marked COMPLETED. Prize is credited to the registered captain matching this team name.
              </p>
              <div className="mt-5 flex gap-2">
                <button onClick={declareWinner} className="btn-primary flex-1 px-4 py-3 font-display text-xs">
                  DECLARE & PAY
                </button>
                <button onClick={() => setWinnerDraft(null)} className="btn-ghost flex-1 px-4 py-3 font-display text-xs">
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {roomDraft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[900] flex items-center justify-center bg-black/80 px-6"
            onClick={() => setRoomDraft(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="holo-panel scanline clip-corner w-full max-w-sm p-6"
            >
              <p className="mb-1 font-display text-sm font-bold tracking-[0.3em] text-white">SET LIVE ROOM</p>
              <p className="mb-4 font-body text-[10px] tracking-[0.2em] text-slate-500">
                REGISTERED PLAYERS WILL SEE THIS ON THE TOURNAMENT PAGE
              </p>
              <div className="flex flex-col gap-3">
                <div>
                  <label className={labelCls}>ROOM ID</label>
                  <input className={inputCls} value={roomDraft.roomId} onChange={(e) => setRoomDraft({ ...roomDraft, roomId: e.target.value })} placeholder="12345678" />
                </div>
                <div>
                  <label className={labelCls}>PASSWORD</label>
                  <input className={inputCls} value={roomDraft.password} onChange={(e) => setRoomDraft({ ...roomDraft, password: e.target.value })} placeholder="ARENA2024" />
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <button onClick={setRoom} className="btn-primary flex-1 px-4 py-3 font-display text-xs">
                  SAVE ROOM
                </button>
                <button onClick={() => setRoomDraft(null)} className="btn-ghost flex-1 px-4 py-3 font-display text-xs">
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
