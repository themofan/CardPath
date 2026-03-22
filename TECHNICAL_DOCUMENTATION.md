# CardPath — Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Card Recommendation Algorithm](#card-recommendation-algorithm)
4. [Upgrade Path Tree Algorithm](#upgrade-path-tree-algorithm)
5. [Optimal Path Computation](#optimal-path-computation)
6. [AI Implementation](#ai-implementation)
7. [Authentication & Data Persistence](#authentication--data-persistence)
8. [Frontend Architecture](#frontend-architecture)
9. [Deployment & Security](#deployment--security)
10. [Demo Quick Reference](#demo-quick-reference)

---

## Overview

CardPath is an AI-powered credit card advisor that helps users discover, compare, and plan their credit card journey. It analyzes a user's financial profile (credit score, income, spending habits, priorities) and provides personalized card recommendations, an interactive upgrade path graph, and an AI chat advisor.

---

## Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Frontend** | React 19 | UI framework |
| **Build Tool** | Vite 6.4 | Development server, HMR, production builds |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS with custom dark theme |
| **Icons** | Lucide React | Icon library |
| **AI Model** | Groq (Llama 3.3 70B Versatile) | Natural language card recommendations and chat |
| **Authentication** | Supabase Auth | Email/password sign-up, sign-in, session management |
| **Database** | Supabase PostgreSQL | User profile storage (JSONB), Row Level Security |
| **Hosting** | Vercel | Static site hosting + serverless API functions |
| **Language** | JavaScript (ES Modules) | Frontend and serverless functions |

### Key Dependencies
- `@supabase/supabase-js` — Supabase client for auth and database
- `lucide-react` — Icon components
- `react` / `react-dom` — UI rendering
- No additional AI SDK — raw HTTP fetch to Groq's OpenAI-compatible REST API

---

## Card Recommendation Algorithm

### Data Source
The app uses a curated JSON database (`src/data/cards.json`) of ~60+ credit cards with structured data:
- Card name, issuer, network, tier (starter/mid-tier/premium/ultra-premium)
- Annual fee, credit score minimum, income requirement, credit history requirement
- Reward categories with rates (e.g., "4x points on dining")
- Sign-up bonus, pros, cons, special requirements (5/24 rule, invitation-only)

### Eligibility Scoring (`src/utils/eligibility.js`)

Each card receives a 0-100 eligibility score for a given user profile:

```
Starting score: 100

Credit Score Check:
  - If user's score < card's minimum → BLOCKER
  - Penalty: min(gap / 2, 40) points deducted
  - If user doesn't know exact score, estimates from range (poor=500, fair=625, good=700, excellent=790)

Income Check:
  - If user's income < card's estimated requirement → BLOCKER
  - Penalty: 25 points deducted

Credit History Check:
  - If user's history months < card's minimum → BLOCKER
  - Penalty: 20 points deducted

Special Requirements:
  - 5/24 rule, invitation-only → informational (not blocking)

Output: { eligible: bool, score: 0-100, reasons: [], blockers: [], met: N, total: N }
```

### Card Ranking (`rankCards()`)
All active cards are scored against the user's profile and sorted by eligibility score descending. The top 3 are shown on the dashboard as recommendations.

### Spending-Weighted Value
The AI prompt system instructs the model to calculate actual dollar value based on the user's spending breakdown. For example:
- User spends $2000/mo on dining
- Amex Gold gives 4x on dining → $2000 × 4 × 12 = 96,000 points/year
- This makes the Gold better value than the Platinum (1x dining) even though Platinum is "higher tier"

---

## Upgrade Path Tree Algorithm

### Tree Construction (`src/utils/treeBuilder.js`)

The `buildUpgradeTree(profile, dreamCardId)` function builds a directed acyclic graph:

**Phase 1: Root Selection**
```
IF user has cards:
  Each owned card becomes a root node (isOwned: true)
ELSE:
  Pick best starter card per default issuer (Chase, Amex, Discover, Capital One)
  "Best" = highest eligibility score
```

**Phase 2: Recursive Expansion**
```
For each root card:
  Find same-issuer cards in the NEXT tier up
  Rank by eligibility score, take top 3
  Add as child nodes with edges
  Recursively expand each child up the tier ladder

Tier order: starter → mid-tier → premium → ultra-premium
```

**Phase 3: Dream Card Integration**
```
IF dreamCardId is set:
  Add dream card node (isDream: true)

  IF user owns a card from same issuer:
    Build stepping stones through intermediate tiers to dream card
  ELSE:
    Find/add a starter from dream card's issuer
    Connect from user's best owned card to that starter (cross-issuer bridge)
    Chain through tiers to dream card

  Pick best intermediate card per tier gap (by eligibility)
  Add edges connecting the path
```

**Phase 4: Post-Processing**
```
1. Attach eligibility data to every node
2. Cap at 4 nodes per tier (keep owned + dream first, then highest score)
3. Soft-cap edges at 12 (remove weakest, don't orphan nodes)
4. Remove isolated nodes (no edges, not owned, not dream)
5. Compute optimal path (see below)
6. Mark recommended nodes on optimal path (isRecommended: true)
```

### Visual Layout
- Nodes are arranged in horizontal rows by tier
- Rows are vertically stacked: starter at top, ultra-premium at bottom
- SVG bezier curves connect parent → child nodes between tier rows
- Multiple arrows to the same card are spread horizontally across the card width to prevent overlap

---

## Optimal Path Computation

The algorithm finds the single best path from an owned card to the dream card (or highest-tier target):

```
1. Identify target: dream card if set, else highest-tier card with best eligibility
2. Build reverse adjacency map (child → parent edges)
3. BFS backwards from target:
   - At each step, sort parent candidates by eligibility score (best first)
   - Stop when an owned card is reached
4. Reconstruct path from owned card → target
5. Store as Set of "fromId::toId" edge keys
```

**Visual differentiation:**
- Optimal path: bright green (#10B981), 3px stroke, full opacity
- Selected edge: gold (#D4A017), 2.25px stroke
- Other edges: gray (#8A8078), 1.5px stroke, 70% opacity

---

## AI Implementation

### Architecture

```
User → Frontend (React) → Serverless Proxy (/api/gemini) → Groq API → Llama 3.3 70B
                                    ↑
                          API key stays server-side
```

### Model: Llama 3.3 70B Versatile (via Groq)
- Hosted on Groq's inference infrastructure for fast response times
- OpenAI-compatible REST API
- Used for: dashboard recommendations, chat advisor, spending projections

### System Prompt
The AI receives a comprehensive system prompt (`buildSystemPrompt()`) containing:
- Personality: "friendly credit card advisor for young adults, like a financially savvy older sibling"
- Rules: include specific numbers, mention pros AND cons, reference user's profile data, format with bold headers (no numbered lists), calculate rewards based on actual spending, consider total value proposition (fee vs rewards vs perks)
- Complete card catalog (ID → name mapping) for accurate card references
- Tool definitions for profile modifications (add/remove card, set dream card, update spending)

### User Context
Every AI request includes the full user profile:
- Name, age, income, employment status
- Credit score, history length, number of cards
- Current cards owned (by name)
- Monthly spending breakdown (8 categories with dollar amounts)
- Ranked priorities
- Dream card
- Preferred credit limit
- Spending data source (manual vs estimated, active vs disabled)

### Chat Flow
1. User sends message
2. Frontend prepends user context to the message
3. Request goes to Groq via serverless proxy
4. Response rendered with custom Markdown parser (bold, italic, headers, lists, code)
5. Conversation history maintained in parent component (persists across tab switches)

### Dashboard Recommendation
- Auto-fetches on dashboard load
- Short format: 3-4 sentences with one card pick, estimated reward value, and a quick tip
- "Ask a follow-up question..." links to the AI Advisor tab

### Tool Calling
The AI can propose profile modifications:
- `add_card` / `remove_card` — immediate execution
- `set_dream_card` — immediate execution
- `update_spending` / `update_credit_limit` — requires user confirmation before applying

---

## Authentication & Data Persistence

### Supabase Auth
- Email/password authentication (no OAuth)
- Email confirmation disabled for frictionless sign-up
- Session managed via Supabase JS client (JWT tokens)
- Auth state listener for real-time session changes

### Database Schema
```sql
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
)
```
- Entire user profile stored as a single JSONB document
- Row Level Security: users can only read/write their own row
- Profile syncs on every change (localStorage for speed + Supabase for persistence)

### Data Flow
```
Sign Up → Create auth user → Navigate to quiz
Quiz Complete → Profile saved to localStorage + Supabase
Sign In → Load profile from Supabase → Cache in localStorage
Tab Switch → Profile stays in React state (no re-fetch needed)
Sign Out → Clear localStorage, reset React state
```

---

## Frontend Architecture

### Component Structure
```
App.jsx — Auth routing (login / quiz / app)
├── CPLogin.jsx — Sign-in/sign-up credit card UI
├── Quiz.jsx — 4-step onboarding (info, credit, spending, priorities)
└── CardPathApp.jsx — Main app shell
    ├── CPSidebar.jsx — Navigation sidebar
    ├── DashboardScreen.jsx — Overview with AI recommendation
    │   ├── AIRecommendation.jsx — AI card pick
    │   ├── StatsCards.jsx — Credit score, spending, cards owned
    │   ├── RecommendedCards.jsx — Top 3 card matches
    │   └── PathPreview.jsx — Mini upgrade path
    ├── CardExplorerScreen.jsx — Browse/filter all cards
    │   └── CardTile.jsx — Individual card display
    ├── PathPlannerScreen.jsx — Interactive upgrade graph
    │   ├── PathTree.jsx — SVG tree with bezier connectors
    │   └── PathInfoPanel.jsx — Card/edge detail sidebar
    ├── AIAdvisorScreen.jsx — Chat interface
    └── SettingsScreen.jsx — Profile editing, sign out
```

### State Management
- React Context + useReducer (no Redux)
- Profile state lifted to UserProvider
- Chat state lifted to CardPathApp (persists across tab switches)
- No global state library needed

### Design System
- Dark warm brown theme (#2C2420 background, #3A322C surfaces)
- Emerald green primary (#10B981) with full shade palette
- Custom Tailwind tokens for semantic colors (surface, border, accent)
- Sidebar: dark taupe with green accent states

---

## Deployment & Security

### Vercel Deployment
- Frontend: Vite static build → Vercel CDN
- Backend: Serverless function at `/api/gemini` proxies Groq requests
- Environment variables set in Vercel dashboard (not in code)

### API Key Protection
| Key | Location | Exposure |
|-----|----------|----------|
| `GROQ_API_KEY` | Vercel env vars only | Server-side only, never in browser |
| `VITE_SUPABASE_URL` | Vercel env vars | Public (by design, protected by RLS) |
| `VITE_SUPABASE_ANON_KEY` | Vercel env vars | Public (by design, protected by RLS) |
| `VITE_GROQ_API_KEY` | Local .env only | Dev only, not deployed |

### Row Level Security (Supabase)
```sql
-- Users can only access their own profile
SELECT: auth.uid() = id
UPDATE: auth.uid() = id
INSERT: auth.uid() = id
```

---

## Demo Quick Reference

### Key Flows to Show
1. **Sign Up** → Credit card UI flips to sign-up mode with name/email/password
2. **Onboarding Quiz** → 4 steps: basic info, credit profile, spending (with sliders), priorities (drag to reorder)
3. **Dashboard** → AI recommendation auto-loads, personalized greeting by name, spending-aware card pick
4. **Card Explorer** → Filter by tier/issuer, search, click for details with rewards/pros/cons
5. **My Path** → Interactive upgrade graph with green optimal path, click cards for details, click arrows for requirements/tips
6. **AI Advisor** → Chat about cards, spending analysis, the AI can modify your profile (add cards, update spending)
7. **Settings** → Edit credit score/income, adjust spending, sign out

### Talking Points
- "The recommendation engine scores every card 0-100 based on your credit score, income, and history"
- "The path graph builds same-issuer upgrade chains and finds the optimal route to your dream card using BFS"
- "AI recommendations are spending-weighted — a 4x dining card beats a premium travel card if you spend more on food"
- "All API keys are protected by a serverless proxy — the Groq key never reaches the browser"
- "User data syncs to Supabase in real-time with Row Level Security"
- "The entire app is client-rendered React with Tailwind, no backend framework needed"

### Potential Questions & Answers
- **Q: Why Groq instead of OpenAI?** → Free tier, fast inference, Llama 3.3 70B is comparable quality for this use case
- **Q: How is the card data sourced?** → Curated JSON database of 60+ cards with structured reward/eligibility data
- **Q: Can it handle real applications?** → No, it's an advisor — it recommends and plans but doesn't submit applications
- **Q: How does the optimal path work?** → BFS from dream card backwards through the tree, picking highest-eligibility parents at each step
- **Q: Is user data secure?** → Supabase RLS ensures users can only access their own profile, API keys are server-side only
