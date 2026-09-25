# 🎮 BGMI ESPORTS — CINEMATIC ARENA MASTER PROMPT

## PROJECT VISION

Build a premium, futuristic, cinematic BGMI esports tournament platform called **CINEMATIC ARENA**.

The website must feel like entering a futuristic esports command center rather than visiting a normal tournament website.

Visual references in spirit:

- AAA gaming interfaces
- Futuristic esports broadcasts
- Cyberpunk holographic systems
- Premium Awwwards-style websites
- Cinematic sci-fi interfaces
- High-end 3D game launch experiences

The final result must feel **expensive, immersive, fast, futuristic and professional**.

Do NOT create a generic gaming template.

---

# 01 — CORE DESIGN LANGUAGE

### Visual Direction

Use:

- Deep black background
- Gunmetal surfaces
- Subtle glassmorphism
- Neon cyan accents
- Electric blue highlights
- Controlled red/orange danger accents
- Holographic UI
- Thin technical borders
- Soft volumetric glow
- Subtle grain/noise
- Grid systems
- Scanline effects
- Depth and atmospheric fog

Keep the interface clean.

Avoid:

- Excessive neon
- Random glowing elements
- Cheap gaming-template aesthetics
- Overcrowded layouts
- Excessive particle effects
- Animations that hurt usability

The website should look futuristic without becoming visually noisy.

---

# 02 — CINEMATIC HERO / ARENA ENTRY

Create a full-screen cinematic WebGL hero.

The first experience should feel like:

> ENTERING A DIGITAL BATTLE ARENA

### Scene

Create a futuristic esports arena environment containing:

- Large central holographic tournament core
- Floating tournament trophy
- Giant circular arena ring
- Distant futuristic structures
- Floating particles
- Energy beams
- Atmospheric fog
- Holographic grid floor
- Floating UI panels
- Small animated drones/objects
- Subtle stars/particles

Camera starts far away.

As the page loads:

1. Black screen
2. Tiny particles appear
3. Arena lights activate
4. Central energy core powers up
5. Camera slowly moves toward the arena
6. Logo appears
7. Main headline reveals
8. CTA buttons activate
9. Live tournament information appears

The entire intro should feel like a **game cinematic**.

---

# 03 — HERO CONTENT

Main headline:

## ENTER THE ARENA

Subheading:

### THE NEXT GENERATION OF MOBILE ESPORTS

Secondary information:

- LIVE TOURNAMENTS
- REAL-TIME LEADERBOARDS
- VERIFIED PLAYERS
- COMPETITIVE EVENTS

CTA:

### ENTER TOURNAMENT

Secondary CTA:

### WATCH LIVE

Floating statistics:

```text
128
TEAMS

512
PLAYERS

₹5,00,000
PRIZE POOL

04
LIVE MATCHES
```

Statistics should animate into view.

---

# 04 — CAMERA MOVEMENT

Use cinematic camera choreography.

Initial camera:

```text
Far → Medium → Close
```

During scrolling:

```text
Hero
 ↓
Camera moves forward
 ↓
Arena ring rotates
 ↓
Scene transitions
 ↓
Tournament interface appears
```

Use GSAP ScrollTrigger for scroll-controlled camera movement.

Camera should never move abruptly.

Use:

- Smooth interpolation
- Ease curves
- Damped movement
- Cinematic acceleration/deceleration

---

# 05 — SCROLL STORYTELLING

The website should tell a story while scrolling.

## SCENE 01 — ARRIVAL

Text:

> THE BATTLEFIELD IS READY.

Arena slowly powers up.

---

## SCENE 02 — CHOOSE YOUR BATTLE

Display 3D floating modes:

```text
SOLO
DUO
SQUAD
TDM
CHAMPIONSHIP
SCRIMS
```

Cards rotate slightly in 3D space.

Hover:

- Card tilts
- Border activates
- Background changes
- Small particles react
- Information expands

---

## SCENE 03 — BUILD YOUR SQUAD

Show four futuristic player cards.

Example:

```text
PLAYER 01
PLAYER 02
PLAYER 03
PLAYER 04
```

Cards connect through animated energy lines.

Text:

> FOUR PLAYERS.
> ONE OBJECTIVE.

---

## SCENE 04 — ENTER THE TOURNAMENT

Show a giant holographic tournament bracket.

Teams move through:

```text
QUALIFIERS
    ↓
ROUND 16
    ↓
SEMIFINAL
    ↓
GRAND FINAL
```

Bracket lines animate progressively.

---

## SCENE 05 — LIVE BATTLE

Transition into a live match interface.

Display:

```text
LIVE ● MATCH 04

ERANGEL

TEAM NOVA       42
TEAM TITANS     39
TEAM PHOENIX    37
TEAM LEGACY     31
```

Add:

- Live kill feed
- Team rankings
- Match timer
- Placement
- Kill count

---

## SCENE 06 — LEADERBOARD

Create a massive futuristic leaderboard.

Top 3 teams receive special treatment.

Rank animation:

```text
#01
#02
#03
```

When scrolling into view:

- Rows slide upward
- Numbers count
- Rank badges animate
- Team logos reveal
- Points increment visually

---

## SCENE 07 — CHAMPIONS

Create a cinematic trophy reveal.

Camera moves toward a floating 3D trophy.

Environment becomes darker.

Spotlight activates.

Text:

> ONLY ONE TEAM
> WILL CLAIM THE CROWN.

Then reveal:

```text
₹5,00,000
PRIZE POOL
```

---

# 06 — 3D TECHNOLOGY

Use:

- Three.js
- React Three Fiber
- Drei
- GSAP
- ScrollTrigger
- Framer Motion

Create reusable components:

```text
ArenaScene
ArenaCore
ArenaRing
ArenaGrid
EnergyParticles
FloatingPanels
TournamentTrophy
CameraRig
Hologram
ParticleField
```

Keep the 3D scene modular.

---

# 07 — PARTICLE SYSTEM

Create multiple particle layers.

### Background particles

Tiny slow-moving particles.

### Arena particles

Particles orbiting the central energy core.

### Interaction particles

Particles react when the user hovers important UI.

### Scroll particles

Particle intensity changes based on scroll position.

Do not overload mobile devices.

---

# 08 — HOLOGRAPHIC UI

Create floating holographic interfaces around the 3D scene.

Examples:

```text
LIVE
04 MATCHES
```

```text
NEXT MATCH
08:30 PM
```

```text
TEAM NOVA
42 POINTS
```

Panels should have:

- Glass transparency
- Thin border
- Scanline
- Glow
- Depth
- Slight floating animation

---

# 09 — CUSTOM CURSOR

Desktop-only custom cursor.

Default:

```text
+
```

Interactive element:

```text
VIEW
```

Tournament card:

```text
ENTER
```

External link:

```text
OPEN
```

Cursor should smoothly interpolate.

Disable custom cursor on touch devices.

---

# 10 — MICRO INTERACTIONS

Every important interaction should feel responsive.

Buttons:

- Magnetic hover
- Slight scale
- Glow
- Text shift
- Arrow movement

Cards:

- 3D tilt
- Image parallax
- Border animation

Navigation:

- Smooth indicator
- Active section highlight
- Glass blur

Leaderboard:

- Rank movement
- Number counting
- Status indicators

---

# 11 — TOURNAMENT SHOWCASE

Create premium tournament cards.

Each card:

```text
[GAME / TOURNAMENT]

CHAMPIONSHIP SERIES

₹5,00,000
PRIZE POOL

128 TEAMS

21 AUG
08:30 PM

[JOIN TOURNAMENT]
```

Status:

```text
LIVE
UPCOMING
REGISTRATION OPEN
COMPLETED
```

Use different animation states.

---

# 12 — LIVE COMMAND CENTER

Create a dedicated live section.

Layout:

```text
┌─────────────────────────────────────┐
│ LIVE MATCH                          │
│                                     │
│ MATCH 04                            │
│ ERANGEL                             │
│                                     │
│ NOVA       42                       │
│ TITANS     39                       │
│ PHOENIX    37                       │
│                                     │
│ KILL FEED                           │
│ PLAYER eliminated PLAYER            │
└─────────────────────────────────────┘
```

Add:

- Real-time updates
- Live badge
- Timer
- Kill feed
- Current placement
- Team score
- Match status

---

# 13 — PLAYER PROFILE

Premium esports player profile.

Display:

```text
PLAYER NAME

BGMI UID
TEAM NOVA

MATCHES
128

WINS
24

KILLS
643

KD
5.02

WIN RATE
18.7%
```

Add animated charts.

Sections:

- Statistics
- Match history
- Tournament history
- Achievements
- Team
- Earnings

---

# 14 — TEAM PROFILE

Team page:

```text
TEAM NOVA

CAPTAIN
PLAYER 01

ROSTER
PLAYER 01
PLAYER 02
PLAYER 03
PLAYER 04

SUBSTITUTE
PLAYER 05
```

Statistics:

- Matches
- Wins
- Kills
- Average placement
- Total points
- Earnings

---

# 15 — TOURNAMENT DETAIL PAGE

Include:

### Header

Tournament artwork + 3D animation.

### Information

- Prize pool
- Entry fee
- Teams
- Date
- Format
- Game mode
- Map

### Tabs

```text
OVERVIEW
SCHEDULE
TEAMS
MATCHES
LEADERBOARD
RULES
RESULTS
```

CTA:

```text
JOIN TOURNAMENT
```

---

# 16 — PLAYER DASHBOARD

Create a completely different dashboard experience.

Dashboard:

```text
WELCOME BACK, PLAYER

NEXT MATCH
MATCH 04
08:30 PM

TEAM NOVA
READY
```

Cards:

- Upcoming matches
- Tournament registrations
- Team
- Current rank
- Earnings
- Notifications

Navigation:

```text
Overview
Tournaments
Matches
Team
Leaderboard
Wallet
Achievements
Notifications
Settings
```

---

# 17 — ADMIN COMMAND CENTER

Admin UI should look like an esports operations center.

Main dashboard:

```text
TOURNAMENT CONTROL CENTER

LIVE TOURNAMENTS      08
REGISTERED PLAYERS    1,248
ACTIVE TEAMS          312
LIVE MATCHES          04
TOTAL REVENUE         ₹2.48L
```

Charts:

- Registration analytics
- Revenue
- Active users
- Tournament performance
- Match performance

---

# 18 — TOURNAMENT MANAGEMENT

Admin can:

- Create tournament
- Edit tournament
- Publish
- Unpublish
- Pause
- Cancel
- Clone tournament
- Manage registrations
- Manage teams
- Schedule matches
- Assign referees
- Publish room details
- Lock roster
- Enter results
- Approve results

---

# 19 — MATCH MANAGEMENT

Admin:

```text
MATCH 04

MAP
ERANGEL

ROOM ID
********

PASSWORD
********

START TIME
08:30 PM

STATUS
READY
```

Actions:

```text
OPEN ROOM
LOCK ROOM
START MATCH
SUBMIT RESULT
CANCEL MATCH
```

---

# 20 — SCORING ENGINE

Create configurable scoring.

Example:

```text
1st       15
2nd       12
3rd       10
4th        8
5th        6
6th        5
7th        4
8th        3

KILL       +1
```

Admin can modify scoring rules per tournament.

System automatically calculates:

```text
Placement Points
+
Kill Points
+
Bonus
=
TOTAL
```

---

# 21 — ROLE & PERMISSION SYSTEM

Roles:

```text
SUPER ADMIN
ADMIN
ORGANIZER
REFEREE
MODERATOR
FINANCE
PLAYER
TEAM CAPTAIN
```

Implement strict permission checks on frontend AND backend.

Never rely only on frontend permissions.

---

# 22 — PAYMENT SYSTEM

Support:

- Tournament entry fees
- Wallet
- Prize winnings
- Withdrawal requests
- Refunds
- Coupons
- Transaction history

Payment status:

```text
PENDING
SUCCESS
FAILED
REFUNDED
```

---

# 23 — DISPUTE SYSTEM

Player can report:

- Incorrect score
- Cheating
- Wrong result
- Player issue
- Match issue
- Technical issue

Allow:

- Description
- Screenshot
- Video evidence

Statuses:

```text
OPEN
UNDER REVIEW
RESOLVED
REJECTED
```

---

# 24 — NOTIFICATION ENGINE

Notifications:

- Tournament registration
- Match reminder
- Room details
- Result published
- Prize received
- Announcement
- Dispute update

Use real-time notification badges.

---

# 25 — TELEGRAM / COMMUNITY INTEGRATION

Optional integration:

- Tournament announcements
- Match reminders
- Room release
- Result notifications
- Registration confirmation

Create webhook/API architecture so Telegram can be added cleanly.

---

# 26 — MOBILE EXPERIENCE

Mobile must NOT simply be desktop scaled down.

Create dedicated mobile layouts.

Use:

- Bottom navigation
- Swipeable cards
- Touch-friendly controls
- Compact leaderboard
- Reduced 3D complexity
- Optimized particle system
- Mobile-friendly tournament registration

---

# 27 — PERFORMANCE

Target:

### Desktop
60 FPS cinematic experience.

### Mobile
Stable smooth interaction.

Implement:

- Lazy loading
- Code splitting
- Dynamic imports
- Compressed 3D assets
- Draco
- WebP/AVIF
- GPU-friendly animation
- Reduced particle count
- Mobile 3D fallback
- Prefetch critical routes

Use `prefers-reduced-motion`.

---

# 28 — ACCESSIBILITY

Maintain:

- Keyboard navigation
- Focus states
- Proper contrast
- Semantic HTML
- Screen-reader-friendly controls
- Reduced-motion mode

Cinematic animation must never block usability.

---

# 29 — PAGE TRANSITIONS

Create cinematic page transitions.

Route change:

```text
Current page
↓
UI dissolves
↓
Arena particles appear
↓
Camera transition
↓
New page loads
↓
Content reveals
```

Keep transitions short and smooth.

---

# 30 — LOADING EXPERIENCE

Create an esports boot sequence.

Example:

```text
INITIALIZING ARENA...

LOADING PLAYER DATABASE
████████████████ 100%

LOADING TOURNAMENT ENGINE
████████████████ 100%

SYSTEM READY

ENTER ARENA →
```

Do not make loading unnecessarily long.

---

# 31 — TECH STACK

Frontend:

```text
React
Vite
TypeScript
Tailwind CSS
shadcn/ui
GSAP
Framer Motion
Three.js
React Three Fiber
Drei
```

Backend:

```text
Node.js
NestJS / Express
REST API
WebSocket
```

Database:

```text
PostgreSQL / MySQL
```

Authentication:

```text
JWT / Secure Session
Role Based Access Control
```

Deployment:

```text
Frontend → Vercel
Backend → Railway / Render
Database → Managed PostgreSQL/MySQL
```

---

# 32 — FOLDER ARCHITECTURE

Use scalable architecture:

```text
src/
├── components/
│   ├── ui/
│   ├── navigation/
│   ├── tournament/
│   ├── player/
│   ├── team/
│   ├── leaderboard/
│   └── dashboard/
│
├── three/
│   ├── ArenaScene/
│   ├── ArenaCore/
│   ├── ArenaRing/
│   ├── ParticleField/
│   ├── FloatingPanels/
│   ├── Trophy/
│   └── CameraRig/
│
├── pages/
│   ├── Home/
│   ├── Tournaments/
│   ├── TournamentDetails/
│   ├── Player/
│   ├── Team/
│   ├── Dashboard/
│   └── Admin/
│
├── animations/
├── hooks/
├── services/
├── api/
├── store/
├── utils/
├── types/
└── data/
```

---

# 33 — IMPORTANT DEVELOPMENT RULE

Do NOT build everything inside one huge component.

Create reusable components.

Keep:

- UI
- animation
- 3D
- API
- state
- business logic

separate.

Every major animation should be reusable and controllable.

---

# 34 — FINAL EXPERIENCE

When a user opens the website, the feeling should be:

> “This isn't a tournament website.
> This is an esports arena.”

The experience should progress like:

```text
BLACK SCREEN
      ↓
SYSTEM BOOT
      ↓
ARENA ACTIVATION
      ↓
3D ENVIRONMENT
      ↓
ENTER THE ARENA
      ↓
TOURNAMENTS
      ↓
SQUAD
      ↓
LIVE MATCH
      ↓
LEADERBOARD
      ↓
CHAMPIONS
      ↓
PRIZE
      ↓
JOIN THE BATTLE
```

Every section should feel connected to the same cinematic world.

---

# 35 — QUALITY BAR

The final website must be:

- Futuristic
- Cinematic
- Responsive
- Production-ready
- Scalable
- Accessible
- Fast
- SEO-friendly
- Mobile optimized
- API-ready
- Realtime-ready
- Tournament-operation-ready

Do not use fake functionality where real functionality is expected.

If backend functionality is not implemented yet, create clean API interfaces and realistic mock data so the frontend can later connect without restructuring the UI.

The final product should feel like a **premium next-generation esports tournament operating system**, not a template.

## PRIMARY EXPERIENCE

### ENTER THE ARENA.

### BUILD YOUR SQUAD.

### COMPETE.

### DOMINATE.

### CLAIM THE CROWN.