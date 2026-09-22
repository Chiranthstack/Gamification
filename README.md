# Carverse Performance — Next.js

A dealership gamification platform for Carverse Mobility, migrated from a single
self-contained HTML file into an idiomatic **Next.js 14 (App Router)** application
in **TypeScript**. Behaviour is a faithful port of the original — every KRA
parameter, point value, target, grading weight and role level still comes from
the Carverse scoresheet.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (type-checked)
npm start        # serve the production build
```

It opens in **preview mode** against the bundled sample dataset (28 people, 5
departments, 3 branches) and shows a banner saying so. It retries the backend
every 8 seconds and switches to live data the moment one answers.

### Pointing it at a backend

```
http://localhost:3000/?api=https://your-host
```

The value is remembered in `localStorage` (`cv_api`). Served with no `?api=`, it
calls its own origin.

### Backend API contract

The full REST spec the backend/database team needs to implement — request/response
shapes, methods, CORS/auth notes, role ids and the `daily` series — is documented
in **[`docs/API.md`](docs/API.md)**. The four required endpoints are
`GET /v1/sales/bootstrap`, `GET /v1/contests`,
`POST /v1/contests/{id}/participants` and `PUT /v1/engine/parameters`;
`public/sample-data.json` is a live example of the bootstrap body.

## Architecture

The original was one file mixing data, business logic, string-building render
functions and imperative DOM wiring. The migration separates those concerns:

```
src/
├─ app/
│  ├─ layout.tsx          Root layout, metadata, injects the icon sprite
│  ├─ page.tsx            The client SPA shell — boot, hash router, keyboard
│  └─ globals.css         The full design system (ported verbatim, theme-driven)
│
├─ lib/                   Pure, framework-agnostic domain layer
│  ├─ types.ts            All domain & config types
│  ├─ store.ts            Zustand store — the single source of truth
│  ├─ constants.ts        Tiers, badges, KRA templates, roles, nav, codes, …
│  ├─ fallback-data.ts    The inlined sample dataset + contests
│  ├─ selectors.ts        me / roster / division / shownName
│  ├─ progression.ts      Levels + named tiers
│  ├─ badges.ts           Achievement evaluation
│  ├─ kra.ts              Scoresheet totals
│  ├─ roles.ts            roleDef / myRole / can / scopeList / navAllowed
│  ├─ boards.ts           The three configurable leaderboards
│  ├─ series.ts           Seeded week / month activity + streaks
│  ├─ work.ts             Graded follow-up queue
│  ├─ team.ts             Team-health vs role median
│  ├─ coach.ts            Ranked "what to do next" recommendations
│  ├─ notifs.ts           Alert feed
│  ├─ visit.ts            Since-last-visit delta (greeting)
│  ├─ config-io.ts        Ruleset export / import
│  ├─ api.ts              Backend resolution, fetch, retry-watch, poll
│  ├─ hooks.ts            useCountUp + confetti burst
│  └─ format.ts           fmt / ini / seeded / cx
│
└─ components/
   ├─ IconSprite.tsx      The SVG symbol sprite (ported verbatim)
   ├─ Icon.tsx            <Icon name="i-…" />
   ├─ Sidebar / Topbar / NotifRail / BottomNav / Fab / SaveBar / Toast
   ├─ PreviewBanner / Rail / ContestCard / Sheets
   └─ screens/
      ├─ Home / MyWork / Badges / Tasks / Weekly / Earnings
      ├─ Leaderboards / Contests / Branches / Team
      └─ config/           The configuration console
         ├─ Config.tsx     Section shell
         ├─ shared.tsx     CfgHd / Sw / DelBtn
         └─ sections/      Season, Roles, Tiers, Codes, Kras, Depts,
                           Boards, Contests, Quests, Badges, Data
```

### State model

All mutable state that used to live in module-level globals (`DATA`, `CONTESTS`,
`CFG`, `ROLES`, `TIERS`, `CODES`, `KRA_MODEL`, `DAILY`, the `S` UI object,
`NOTIFS`) now lives in one **Zustand store** (`lib/store.ts`). Pure logic modules
take the store state as an explicit argument, so nothing reads a global.

Config edits mutate the model in place through `store.edit(fn)`, which bumps a
`rev` counter and the `cfgDirty` count — mirroring the original's
"changes apply on the next render" model while keeping React inputs from losing
focus mid-edit.

### Routing

Client-side hash routing is preserved (`#/home`, `#/work`, `#/config`, …) inside
the App Router shell, matching the original. The old aliases (`#/kras`,
`#/activity`, `#/follow`) still resolve to the right My Work tab.

### Theming

Light is the default; dark is a `data-theme="dark"` override on `:root`, set by
the store and persisted to `localStorage` (`cv_theme`). Every colour is a custom
property — no component hardcodes one.

## Notes

- `scopeList()` is display-only. Every scope rule here must be enforced again
  server-side before this goes near production data.
- The month activity grid uses a seeded fallback until the backend returns a real
  `daily` per-day series; `curStreak()` derives from that same fallback so no two
  screens contradict each other in preview mode.
