export type TournamentStatus = "LIVE" | "UPCOMING" | "REGISTRATION OPEN" | "COMPLETED";

export type TournamentMode = "SOLO" | "DUO" | "SQUAD" | "TDM";

export interface Tournament {
  id: string;
  name: string;
  short: string;
  game: string;
  status: TournamentStatus;
  mode: TournamentMode;
  prizePool: string;
  entryFee: string;
  teams: number;
  teamsJoined: number;
  date: string;
  time: string;
  format: string;
  map: string;
  rules: string[];
  image: string;
  tag?: string;
  winner?: string;
}

export interface Team {
  id: string;
  name: string;
  short: string;
  tag: string;
  points: number;
  matches: number;
  wins: number;
  kills: number;
  placement: number;
  earnings: string;
  captain: string;
  roster: string[];
  image: string;
}

export interface Player {
  id: string;
  name: string;
  igl: string;
  uid: string;
  team: string;
  teamId: string;
  role: string;
  matches: number;
  wins: number;
  kills: number;
  kd: number;
  winRate: number;
  earnings: string;
  image: string;
}

export interface LiveMatch {
  id: string;
  map: string;
  roomId: string;
  password: string;
  startTime: string;
  status: string;
  timer: string;
  teams: Team[];
  killFeed: { killer: string; victim: string; weapon: string }[];
}

export const tournaments: Tournament[] = [
  {
    id: "t-001",
    name: "BGMI Championship Series",
    short: "CHAMPIONSHIP SERIES",
    game: "BGMI",
    status: "REGISTRATION OPEN",
    mode: "SQUAD",
    prizePool: "₹2,500",
    entryFee: "₹19",
    teams: 128,
    teamsJoined: 36,
    date: "12 OCT",
    time: "08:30 PM",
    format: "League + Grand Final",
    map: "ERANGEL",
    image: "/images/bgmi-1.jpg",
    rules: [
      "Each team must have 4 players + 1 substitute.",
      "Custom room to be provided by organizer.",
      "Screenshots required for every match result.",
      "Any form of cheating leads to instant ban.",
      "No refund after tournament starts.",
    ],
  },
  {
    id: "t-002",
    name: "BGMI Rising Stars Cup",
    short: "RISING STARS CUP",
    game: "BGMI",
    status: "REGISTRATION OPEN",
    mode: "SQUAD",
    prizePool: "₹1,200",
    entryFee: "₹19",
    teams: 64,
    teamsJoined: 22,
    date: "18 OCT",
    time: "07:00 PM",
    format: "Point-Based League",
    map: "MIRAMAR",
    image: "/images/bgmi-2.jpg",
    rules: [
      "Amateur teams only, max rank Ace.",
      "3 matches guaranteed.",
      "Room details shared 30 min before start.",
    ],
  },
  {
    id: "t-003",
    name: "BGMI Pro League S4",
    short: "PRO LEAGUE S4",
    game: "BGMI",
    status: "UPCOMING",
    mode: "SQUAD",
    prizePool: "₹2,500",
    entryFee: "₹15",
    teams: 256,
    teamsJoined: 48,
    date: "02 NOV",
    time: "08:00 PM",
    format: "Group Stage + Playoffs",
    map: "ERANGEL",
    image: "/images/bgmi-3.jpg",
    rules: [
      "Open qualifiers for all teams.",
      "Top 16 teams reach playoffs.",
      "Online finals for top 8.",
    ],
  },
  {
    id: "t-004",
    name: "BGMI TDM Showdown",
    short: "TDM SHOWDOWN",
    game: "BGMI",
    status: "REGISTRATION OPEN",
    mode: "TDM",
    prizePool: "₹500",
    entryFee: "₹15",
    teams: 32,
    teamsJoined: 9,
    date: "25 OCT",
    time: "06:30 PM",
    format: "Knockout",
    map: "WAREHOUSE",
    image: "/images/bgmi-4.jpg",
    rules: [
      "1v1 TDM format.",
      "Best of 3 rounds.",
      "M416 + AKM only.",
    ],
  },
  {
    id: "t-005",
    name: "BGMI Solo Survivor",
    short: "SOLO SURVIVOR",
    game: "BGMI",
    status: "REGISTRATION OPEN",
    mode: "SOLO",
    prizePool: "₹500",
    entryFee: "₹29",
    teams: 96,
    teamsJoined: 18,
    date: "28 OCT",
    time: "09:00 PM",
    format: "Solo Point Battle",
    map: "SANHOK",
    image: "/images/bgmi-5.jpg",
    rules: [
      "Solo entry only.",
      "2 matches, combined points.",
      "Kill points +1, placement points as per scoring.",
    ],
  },
  {
    id: "t-006",
    name: "BGMI Community Clash",
    short: "COMMUNITY CLASH",
    game: "BGMI",
    status: "UPCOMING",
    mode: "SQUAD",
    prizePool: "₹500",
    entryFee: "FREE",
    teams: 48,
    teamsJoined: 11,
    date: "08 NOV",
    time: "05:00 PM",
    format: "Single League",
    map: "ERANGEL",
    image: "/images/bgmi-6.jpg",
    rules: ["Free community event. 3 matches, combined points."],
  },
  {
    id: "t-007",
    name: "BGMI Scrim Showcase",
    short: "SCRIM SHOWCASE",
    game: "BGMI",
    status: "UPCOMING",
    mode: "SQUAD",
    prizePool: "₹500",
    entryFee: "FREE",
    teams: 24,
    teamsJoined: 6,
    date: "15 NOV",
    time: "10:00 PM",
    format: "Practice Scrims",
    map: "LIVIK",
    image: "/images/bgmi-7.jpg",
    rules: ["Practice scrims, no entry fee."],
  },
  {
    id: "t-008",
    name: "BGMI Champions Invite",
    short: "CHAMPIONS INVITE",
    game: "BGMI",
    status: "UPCOMING",
    mode: "SQUAD",
    prizePool: "₹2,500",
    entryFee: "INVITE",
    teams: 24,
    teamsJoined: 0,
    date: "22 NOV",
    time: "07:30 PM",
    format: "Invitational Final",
    map: "ERANGEL",
    image: "/images/bgmi-8.jpg",
    rules: ["Invite-only top teams.", "Online invitational grand final."],
  },
  {
    id: "t-009",
    name: "HACKER vs HACKER — Shadow Strike",
    short: "SHADOW STRIKE",
    game: "BGMI",
    status: "REGISTRATION OPEN",
    mode: "SQUAD",
    tag: "HACKER",
    prizePool: "₹1,000",
    entryFee: "₹19",
    teams: 64,
    teamsJoined: 14,
    date: "31 OCT",
    time: "11:00 PM",
    format: "Hacker Point Battle",
    map: "SANHOK",
    image: "/images/bgmi-5.jpg",
    rules: [
      "Hacker vs Hacker — no bans, full chaos.",
      "Squad vs squad, kill-based scoring.",
      "Aimbot & ESP allowed. Nothing is off-limits.",
    ],
  },
  {
    id: "t-010",
    name: "HACKER vs HACKER — Ghost Protocol",
    short: "GHOST PROTOCOL",
    game: "BGMI",
    status: "UPCOMING",
    mode: "SOLO",
    tag: "HACKER",
    prizePool: "₹1,000",
    entryFee: "FREE",
    teams: 100,
    teamsJoined: 8,
    date: "09 NOV",
    time: "12:00 AM",
    format: "Solo Hack-Off",
    map: "MIRAMAR",
    image: "/images/bgmi-6.jpg",
    rules: [
      "Solo hack-off, last hacker standing.",
      "Speed hacks, teleport, wall-bang — all allowed.",
      "Winners verified via screen-record replay.",
    ],
  },
];

export const teams: Team[] = [
  {
    id: "team-nova",
    name: "Team Nova",
    short: "NOVA",
    tag: "NV",
    points: 42,
    matches: 6,
    wins: 3,
    kills: 64,
    placement: 1.8,
      earnings: "₹2,500",
    captain: "Viper",
    image: "/images/bgmi-1.jpg",
    roster: ["Viper", "Blitz", "Cipher", "Frost", "Rogue"],
  },
  {
    id: "team-titans",
    name: "Team Titans",
    short: "TITANS",
    tag: "TT",
    points: 39,
    matches: 6,
    wins: 2,
    kills: 58,
    placement: 2.3,
      earnings: "₹1,800",
    captain: "Apex",
    image: "/images/bgmi-2.jpg",
    roster: ["Apex", "Shadow", "Kraken", "Echo", "Volt"],
  },
  {
    id: "team-phoenix",
    name: "Team Phoenix",
    short: "PHOENIX",
    tag: "PX",
    points: 37,
    matches: 6,
    wins: 2,
    kills: 61,
    placement: 2.7,
      earnings: "₹1,200",
    captain: "Blaze",
    image: "/images/bgmi-3.jpg",
    roster: ["Blaze", "Nitro", "Ghost", "Vortex", "Sage"],
  },
  {
    id: "team-legacy",
    name: "Team Legacy",
    short: "LEGACY",
    tag: "LG",
    points: 31,
    matches: 6,
    wins: 1,
    kills: 49,
    placement: 3.4,
      earnings: "₹800",
    captain: "Reaper",
    image: "/images/bgmi-4.jpg",
    roster: ["Reaper", "Falcon", "Drift", "Onyx", "Titan"],
  },
  {
    id: "team-viper",
    name: "Team Vipers",
    short: "VIPERS",
    tag: "VP",
    points: 28,
    matches: 6,
    wins: 1,
    kills: 45,
    placement: 3.9,
      earnings: "₹600",
    captain: "Fang",
    image: "/images/bgmi-6.jpg",
    roster: ["Fang", "Venom", "Strike", "Hawk", "Cyclone"],
  },
  {
    id: "team-renegade",
    name: "Team Renegade",
    short: "RENEGADE",
    tag: "RG",
    points: 25,
    matches: 6,
    wins: 1,
    kills: 42,
    placement: 4.2,
      earnings: "₹400",
    captain: "Outlaw",
    image: "/images/bgmi-7.jpg",
    roster: ["Outlaw", "Maestro", "Zenith", "Comet", "Rider"],
  },
  {
    id: "team-rogue",
    name: "Team Rogue",
    short: "ROGUE",
    tag: "RQ",
    points: 22,
    matches: 6,
    wins: 0,
    kills: 39,
    placement: 4.8,
      earnings: "₹300",
    captain: "Maverick",
    image: "/images/bgmi-9.jpg",
    roster: ["Maverick", "Pulse", "Orion", "Dusk", "Flare"],
  },
  {
    id: "team-cyclone",
    name: "Team Cyclone",
    short: "CYCLONE",
    tag: "CY",
    points: 19,
    matches: 6,
    wins: 0,
    kills: 35,
    placement: 5.1,
      earnings: "₹200",
    captain: "Storm",
    image: "/images/bgmi-10.jpg",
    roster: ["Storm", "Raze", "Bolt", "Phantom", "Kilo"],
  },
];

export const players: Player[] = [
  { id: "p-001", name: "Viper", igl: "Nova", uid: "5401234567", team: "Team Nova", teamId: "team-nova", role: "IGL / Assault", matches: 128, wins: 24, kills: 643, kd: 5.02, winRate: 18.7, earnings: "₹2,500", image: "/images/bgmi-5.jpg" },
  { id: "p-002", name: "Apex", igl: "Titans", uid: "5407654321", team: "Team Titans", teamId: "team-titans", role: "IGL / Sniper", matches: 141, wins: 22, kills: 598, kd: 4.24, winRate: 15.6, earnings: "₹1,800", image: "/images/bgmi-6.jpg" },
  { id: "p-003", name: "Blaze", igl: "Phoenix", uid: "5402345678", team: "Team Phoenix", teamId: "team-phoenix", role: "Assault", matches: 110, wins: 19, kills: 571, kd: 5.19, winRate: 17.2, earnings: "₹1,200", image: "/images/bgmi-7.jpg" },
  { id: "p-004", name: "Reaper", igl: "Legacy", uid: "5408765432", team: "Team Legacy", teamId: "team-legacy", role: "Support", matches: 135, wins: 18, kills: 512, kd: 3.79, winRate: 13.3, earnings: "₹800", image: "/images/bgmi-8.jpg" },
  { id: "p-005", name: "Fang", igl: "Vipers", uid: "5403456789", team: "Team Vipers", teamId: "team-viper", role: "Assault", matches: 98, wins: 15, kills: 463, kd: 4.72, winRate: 15.3, earnings: "₹600", image: "/images/bgmi-9.jpg" },
  { id: "p-006", name: "Outlaw", igl: "Renegade", uid: "5409876543", team: "Team Renegade", teamId: "team-renegade", role: "IGL", matches: 120, wins: 14, kills: 428, kd: 3.56, winRate: 11.6, earnings: "₹400", image: "/images/bgmi-10.jpg" },
  { id: "p-007", name: "Maverick", igl: "Rogue", uid: "5404567890", team: "Team Rogue", teamId: "team-rogue", role: "Sniper", matches: 87, wins: 11, kills: 391, kd: 4.49, winRate: 12.6, earnings: "₹300", image: "/images/bgmi-11.jpg" },
  { id: "p-008", name: "Storm", igl: "Cyclone", uid: "5401098765", team: "Team Cyclone", teamId: "team-cyclone", role: "Assault", matches: 76, wins: 9, kills: 344, kd: 4.52, winRate: 11.8, earnings: "₹200", image: "/images/bgmi-12.jpg" },
];

export const leaderboard: Team[] = [...teams].sort((a, b) => b.points - a.points);

export const liveMatch: LiveMatch = {
  id: "MATCH 01",
  map: "ERANGEL",
  roomId: "TBD",
  password: "TBD",
  startTime: "08:30 PM",
  status: "UPCOMING",
  timer: "--:--",
  teams: [
    teams[0],
    teams[1],
    teams[2],
    teams[3],
  ],
  killFeed: [
    { killer: "Viper", victim: "Shadow", weapon: "M416" },
    { killer: "Blaze", victim: "Falcon", weapon: "AKM" },
    { killer: "Apex", victim: "Kraken", weapon: "DP-28" },
    { killer: "Reaper", victim: "Ghost", weapon: "M762" },
    { killer: "Fang", victim: "Echo", weapon: "UMP45" },
    { killer: "Outlaw", victim: "Nitro", weapon: "M416" },
  ],
};

export const heroStats = [
  { value: 128, label: "TEAMS" },
  { value: 512, label: "PLAYERS" },
  { value: 2500, label: "PRIZE POOL", currency: true },
  { value: 0, label: "LIVE MATCHES", pad: true },
];

export const modes = ["SOLO", "DUO", "SQUAD", "TDM", "CHAMPIONSHIP", "SCRIMS"];

export const bracketStages = ["QUALIFIERS", "ROUND 16", "SEMIFINAL", "GRAND FINAL"];

export const scoringRules = [
  { placement: 1, points: 15 },
  { placement: 2, points: 12 },
  { placement: 3, points: 10 },
  { placement: 4, points: 8 },
  { placement: 5, points: 6 },
  { placement: 6, points: 5 },
  { placement: 7, points: 4 },
  { placement: 8, points: 3 },
];

export const navLinks = [
  { label: "ARENA", href: "#arena" },
  { label: "TOURNAMENTS", href: "#tournaments" },
  { label: "HACKERS", href: "#hacker" },
  { label: "LIVE", href: "#live" },
  { label: "LEADERBOARD", href: "#leaderboard" },
  { label: "CHAMPIONS", href: "#champions" },
];

export type MatchStatus = "LIVE" | "UPCOMING" | "COMPLETED";

export interface Match {
  id: string;
  tournamentId: string;
  tournament: string;
  map: string;
  mode: string;
  date: string;
  time: string;
  status: MatchStatus;
  teams: { name: string; tag: string; points: number; kills?: number; placements?: number }[];
  roomId?: string;
  password?: string;
  stream?: string;
}

export const matches: Match[] = [
  {
    id: "M01",
    tournamentId: "t-001",
    tournament: "BGMI Championship Series",
    map: "ERANGEL",
    mode: "SQUAD",
    date: "12 OCT",
    time: "08:30 PM",
    status: "UPCOMING",
    teams: [
      { name: "Team Nova", tag: "NV", points: 0 },
      { name: "Team Titans", tag: "TT", points: 0 },
      { name: "Team Phoenix", tag: "PX", points: 0 },
      { name: "Team Legacy", tag: "LG", points: 0 },
    ],
  },
  {
    id: "M02",
    tournamentId: "t-001",
    tournament: "BGMI Championship Series",
    map: "MIRAMAR",
    mode: "SQUAD",
    date: "12 OCT",
    time: "09:30 PM",
    status: "UPCOMING",
    teams: [
      { name: "Team Nova", tag: "NV", points: 0 },
      { name: "Team Titans", tag: "TT", points: 0 },
      { name: "Team Phoenix", tag: "PX", points: 0 },
      { name: "Team Legacy", tag: "LG", points: 0 },
    ],
  },
  {
    id: "M03",
    tournamentId: "t-002",
    tournament: "BGMI Rising Stars Cup",
    map: "MIRAMAR",
    mode: "SQUAD",
    date: "18 OCT",
    time: "07:00 PM",
    status: "UPCOMING",
    teams: [
      { name: "Team Renegade", tag: "RG", points: 0 },
      { name: "Team Rogue", tag: "RQ", points: 0 },
      { name: "Team Vipers", tag: "VP", points: 0 },
      { name: "Team Cyclone", tag: "CY", points: 0 },
    ],
  },
  {
    id: "M04",
    tournamentId: "t-004",
    tournament: "BGMI TDM Showdown",
    map: "WAREHOUSE",
    mode: "TDM",
    date: "25 OCT",
    time: "06:30 PM",
    status: "UPCOMING",
    teams: [
      { name: "Team Nova", tag: "NV", points: 0 },
      { name: "Team Titans", tag: "TT", points: 0 },
    ],
  },
  {
    id: "M05",
    tournamentId: "t-005",
    tournament: "BGMI Solo Survivor",
    map: "SANHOK",
    mode: "SOLO",
    date: "28 OCT",
    time: "09:00 PM",
    status: "UPCOMING",
    teams: [],
  },
  {
    id: "M06",
    tournamentId: "t-009",
    tournament: "HACKER vs HACKER — Shadow Strike",
    map: "SANHOK",
    mode: "SQUAD",
    date: "31 OCT",
    time: "11:00 PM",
    status: "UPCOMING",
    teams: [
      { name: "Team Vipers", tag: "VP", points: 0 },
      { name: "Team Rogue", tag: "RQ", points: 0 },
      { name: "Team Cyclone", tag: "CY", points: 0 },
      { name: "Team Renegade", tag: "RG", points: 0 },
    ],
  },
  {
    id: "M07",
    tournamentId: "t-003",
    tournament: "BGMI Pro League S4",
    map: "ERANGEL",
    mode: "SQUAD",
    date: "02 NOV",
    time: "08:00 PM",
    status: "UPCOMING",
    teams: [
      { name: "Team Nova", tag: "NV", points: 0 },
      { name: "Team Titans", tag: "TT", points: 0 },
      { name: "Team Phoenix", tag: "PX", points: 0 },
      { name: "Team Legacy", tag: "LG", points: 0 },
    ],
  },
  {
    id: "M08",
    tournamentId: "t-006",
    tournament: "BGMI Community Clash",
    map: "ERANGEL",
    mode: "SQUAD",
    date: "08 NOV",
    time: "05:00 PM",
    status: "UPCOMING",
    teams: [
      { name: "Team Phoenix", tag: "PX", points: 0 },
      { name: "Team Legacy", tag: "LG", points: 0 },
      { name: "Team Vipers", tag: "VP", points: 0 },
    ],
  },
  {
    id: "M09",
    tournamentId: "t-010",
    tournament: "HACKER vs HACKER — Ghost Protocol",
    map: "MIRAMAR",
    mode: "SOLO",
    date: "09 NOV",
    time: "12:00 AM",
    status: "UPCOMING",
    teams: [],
  },
  {
    id: "M10",
    tournamentId: "t-007",
    tournament: "BGMI Scrim Showcase",
    map: "LIVIK",
    mode: "SQUAD",
    date: "15 NOV",
    time: "10:00 PM",
    status: "UPCOMING",
    teams: [
      { name: "Team Nova", tag: "NV", points: 0 },
      { name: "Team Titans", tag: "TT", points: 0 },
    ],
  },
  {
    id: "M11",
    tournamentId: "t-008",
    tournament: "BGMI Champions Invite",
    map: "ERANGEL",
    mode: "SQUAD",
    date: "22 NOV",
    time: "07:30 PM",
    status: "UPCOMING",
    teams: [
      { name: "Team Nova", tag: "NV", points: 0 },
      { name: "Team Titans", tag: "TT", points: 0 },
      { name: "Team Phoenix", tag: "PX", points: 0 },
      { name: "Team Legacy", tag: "LG", points: 0 },
    ],
  },
];

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  image: string;
}

export const newsItems: NewsItem[] = [
  {
    id: "n-005",
    title: "Championship Series Opens 12 October",
    category: "ANNOUNCEMENT",
    date: "18 SEP 2026",
    excerpt: "NEXT LEVEL ARENA winter circuit starts 12 OCT. Championship Series, Rising Stars and Pro League S4 slots are live.",
    image: "/images/bgmi-1.jpg",
  },
  {
    id: "n-001",
    title: "Pro League S4 Prize Pool Locked at ₹2,500",
    category: "ANNOUNCEMENT",
    date: "16 SEP 2026",
    excerpt: "Group stage begins 02 NOV. Open qualifiers, top 16 playoffs and online finals for the top 8.",
    image: "/images/bgmi-3.jpg",
  },
  {
    id: "n-002",
    title: "Free Community Clash Returns 08 November",
    category: "COMMUNITY",
    date: "15 SEP 2026",
    excerpt: "Zero entry fee, 48 squads, 3 maps. Register early — slots fill fast.",
    image: "/images/bgmi-6.jpg",
  },
  {
    id: "n-003",
    title: "Anti-Cheat Update: Fair Play Enforcement",
    category: "UPDATE",
    date: "12 SEP 2026",
    excerpt: "Enhanced anti-cheat monitoring now active across all winter tournaments. Cheaters face permanent bans.",
    image: "/images/bgmi-4.jpg",
  },
  {
    id: "n-004",
    title: "Champions Invite Set for 22 November",
    category: "ANNOUNCEMENT",
    date: "10 SEP 2026",
    excerpt: "Invite-only top 24 squads battle for ₹2,500 in the online invitational.",
    image: "/images/bgmi-8.jpg",
  },
];

export interface Notification {
  id: string;
  type: "MATCH" | "RESULT" | "PAYMENT" | "ANNOUNCEMENT" | "DISPUTE";
  message: string;
  date: string;
  read: boolean;
  userId?: string;
}

export const defaultNotifications: Notification[] = [
  { id: "nt-1", type: "ANNOUNCEMENT", message: "Championship Series registration is open. First match 12 OCT 08:30 PM.", date: "18 SEP", read: false },
  { id: "nt-2", type: "MATCH", message: "Rising Stars Cup match M03 scheduled 18 OCT 07:00 PM on MIRAMAR.", date: "18 SEP", read: false },
  { id: "nt-3", type: "ANNOUNCEMENT", message: "Pro League S4 group stage begins 02 NOV. Register now.", date: "16 SEP", read: false },
  { id: "nt-4", type: "ANNOUNCEMENT", message: "Free Community Clash slots open for 08 NOV.", date: "15 SEP", read: true },
];

export interface BracketRound {
  name: string;
  matches: { teamA: string; teamB: string; scoreA: number; scoreB: number; winner?: string }[];
}

export const bracket: BracketRound[] = [
  {
    name: "QUALIFIERS",
    matches: [
      { teamA: "Team Nova", teamB: "Team Cyclone", scoreA: 0, scoreB: 0 },
      { teamA: "Team Titans", teamB: "Team Rogue", scoreA: 0, scoreB: 0 },
      { teamA: "Team Phoenix", teamB: "Team Renegade", scoreA: 0, scoreB: 0 },
      { teamA: "Team Legacy", teamB: "Team Vipers", scoreA: 0, scoreB: 0 },
    ],
  },
  {
    name: "ROUND 16",
    matches: [
      { teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0 },
      { teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0 },
    ],
  },
  {
    name: "SEMIFINAL",
    matches: [{ teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0 }],
  },
  {
    name: "GRAND FINAL",
    matches: [{ teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0 }],
  },
];

export const faqs = [
  {
    q: "How do I register for a tournament?",
    a: "Create a free account, open any tournament page and click JOIN TOURNAMENT. Entry fee is charged per player (squad of 4 = 4 × fee). Pay via Razorpay (UPI/cards/netbanking to organizer bank), wallet, or manual UPI.",
  },
  {
    q: "What is the scoring system?",
    a: "Placement points (1st=15, 2nd=12 ... 8th=3) plus +1 point per kill. Total = placement + kills + bonus.",
  },
  {
    q: "How do I receive my prize money?",
    a: "Winnings are credited to your NEXT LEVEL ARENA wallet within 24 hours of results approval. Withdraw via UPI/bank.",
  },
  {
    q: "Is there any anti-cheat protection?",
    a: "Yes. Every match is monitored and room access is verified. Cheaters are permanently banned and reported.",
  },
  {
    q: "Can I join with my existing squad?",
    a: "Absolutely. Register as a team captain and invite your 4-man squad. Substitute players are also supported.",
  },
];
