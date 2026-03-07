# 华文自习宝 — Chinese Self-Study Companion

> 从"要我学"变成"我要学，我爱学"  
> *Turn "I have to study" into "I want to study, I love studying"*

---

## Project Overview

| Field | Value |
|---|---|
| **App Name** | 华文自习宝 (Huá Wén Zì Xí Bǎo) |
| **Target Users** | Singapore primary school students K1–P6 |
| **Curriculum** | MOE-aligned (2024 new curriculum ready) |
| **Platform** | Cloudflare Pages (edge-deployed) |
| **Tech Stack** | React 19 + Vite 6 + Hono + TypeScript |
| **Status** | 🚧 App Shell — v0.1.0 |

---

## Features (App Shell v0.1.0)

### ✅ Completed
- **Home Screen** — App branding, tagline, quick-access grid, freemium promo banner
- **Level Selector** — Horizontal scrollable chips: K1, K2, P1–P6, P1new!, P2new! (new 2024 curriculum)
- **Bottom Navigation** — 6 tabs: 生字表 · 游戏 · 作文 · 口试 · 工具 · 我的
- **6 Placeholder Pages** — Each module shows "Coming Soon" with feature teasers
- **Global State (React Context)** — selectedLevel, studentName, favourites[], errorBank[]
- **localStorage Persistence** — State saved across sessions
- **Bilingual UI** — All labels in Chinese (简体) + English
- **Noto Sans SC Font** — Chinese characters rendered in proper stroke-style font (as per reference image)
- **Mobile-first design** — 375px base width, child-friendly rounded corners
- **Freemium-ready architecture** — Subscription/trial banner in place

### 🔜 Planned Modules
| Tab | Module | Description |
|---|---|---|
| 生字表 | Vocab List | MOE character list with pinyin, stroke order animation, audio |
| 游戏 | Learning Games | Flashcards, matching, dictation challenges |
| 作文 | Composition | AI Sentence Magic, essay prompts, phrase bank |
| 口试 | Oral Practice | Read-aloud, AI pronunciation scoring, picture description |
| 工具 | Tools | Sentence Magic, Idiom Bank, Radical Dictionary |
| 我的 | My Profile | Progress tracking, subscription, error bank review, settings |

---

## Global State Architecture

```typescript
// src/context/AppContext.tsx
AppState {
  selectedLevel: Level     // 'K1'|'K2'|'P1'–'P6'|'P1new'|'P2new'  (default: 'P1')
  studentName: string      // default: '同学'
  favourites: string[]     // character IDs saved by student
  errorBank: string[]      // character IDs answered incorrectly
  activeTab: Tab           // current navigation tab
}
```

All state is persisted to **localStorage** under key `huawen_app_state`.

---

## Project Structure

```
webapp/
├── src/
│   ├── main.tsx               # React entry point
│   ├── App.tsx                # Root shell + tab router
│   ├── styles/
│   │   └── global.css         # CSS variables + all component styles
│   ├── context/
│   │   └── AppContext.tsx      # React Context + localStorage persistence
│   ├── data/
│   │   ├── levels.ts           # Level definitions (K1–P6, new curriculum)
│   │   └── tabs.ts             # Navigation tab definitions
│   ├── components/
│   │   ├── BottomNav.tsx       # 6-tab bottom navigation bar
│   │   ├── LevelChips.tsx      # Horizontal scrollable level selector
│   │   └── ComingSoon.tsx      # Reusable placeholder page component
│   └── pages/
│       ├── HomeScreen.tsx      # Home screen (hero + chips + quick grid)
│       ├── VocabPage.tsx       # 生字表 placeholder
│       ├── GamesPage.tsx       # 游戏 placeholder
│       ├── CompositionPage.tsx # 作文 placeholder
│       ├── OralPage.tsx        # 口试 placeholder
│       ├── ToolsPage.tsx       # 工具 placeholder
│       └── ProfilePage.tsx     # 我的 placeholder
├── index.html                 # SPA entry HTML
├── vite.config.ts             # Vite + React plugin config
├── wrangler.jsonc             # Cloudflare Pages config
├── package.json
├── tsconfig.json
└── ecosystem.config.cjs       # PM2 config (sandbox dev)
```

---

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Start (sandbox — uses PM2 + wrangler pages dev)
pm2 start ecosystem.config.cjs

# Deploy to Cloudflare Pages
npm run deploy
```

---

## Monetisation Architecture (Planned)

| Tier | Features | Price |
|---|---|---|
| **Free** | Vocab list (K1–P2 only), 3 games/day | Free |
| **Trial** | All features, 7 days | Free |
| **Student** | Full access, 1 level | S$4.90/mo |
| **Family** | Full access, all levels | S$9.90/mo |
| **School** | Bulk licensing | Custom |

State hooks for subscription tier are reserved in `AppContext` (`subscriptionTier`, `trialDaysLeft`) — to be wired up in v0.2.

---

## Design System

| Token | Value |
|---|---|
| Primary | `#E53935` (MOE red) |
| Background | `#FAFAFA` (warm white) |
| Font (CN) | `Noto Sans SC` (Google Fonts) |
| Font (EN) | `Nunito` |
| Border radius | `8px` / `14px` / `20px` / `28px` |
| Mobile base | `375px` |

---

*Built for Singapore 🇸🇬 · MOE Curriculum Aligned · v0.1.0*
