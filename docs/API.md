# Carverse Performance — Backend API Contract

This document is the source of truth for the REST endpoints the frontend calls.
Every shape here is derived from the actual client code (`src/lib/api.ts`, the
contest-join flow in `src/lib/store.ts`, and the ruleset save in
`src/components/SaveBar.tsx` + `src/lib/config-io.ts`). The bundled
`public/sample-data.json` is a live example of the `/v1/sales/bootstrap` body.

## Cross-cutting rules

- **Mount everything under `/v1`.** The client calls `<API>/v1/...`, where
  `<API>` comes from `?api=<url>` (remembered in `localStorage.cv_api`) or the
  same origin.
- **CORS is required** — the app (`:3000`) and API (`:8000`) are different
  origins. Send `Access-Control-Allow-Origin`, allow `GET, POST, PUT, OPTIONS`,
  allow the `Content-Type` header, and answer `OPTIONS` preflight.
- **`Content-Type: application/json`** on requests and responses.
- **Auth (production):** `current_uid` is sent only to *identify the viewer for
  display*. Do **not** trust it — derive the real viewer from the session/token
  and re-enforce every role/scope rule server-side. The frontend `scopeList()`
  is display-only.
- **Latency:** the health ping and bootstrap must answer within ~2.5s or the app
  stays in preview mode. The app polls bootstrap + contests every 20s once
  connected — keep them cheap and cacheable.

---

## 1. `GET /v1/sales/bootstrap?limit=500` — main payload (required)

The primary endpoint. Also called with `?limit=1` as a fast, cheap **health
ping** (used on boot and by the 8s reconnect watcher).

```jsonc
{
  "current_uid": "10161",                    // signed-in employee's uid
  "kras": [                                  // header KRA dictionary: [name, weight, unit, blurb]
    ["Attendance", 30, "U", "days present"], // unit: "U"=units | "%"=percent | "A"=amount
    ["Enquiry Hygiene", 100, "%", "of enquiries clean"]
  ],
  "leaderboard": [
    {
      "uid": "10161",                        // unique, stable string id
      "name": "SHARAN GS",
      "points": 8265,                        // season points (int)
      "deals": 50,                           // cars sold (int)
      "events": 136,                         // scoring events (int)
      "role": "DSE",                         // MUST match a role id (see §6)
      "tl": "AJEYA GOWDA",                   // reporting manager BY NAME ("—" if none)
      "streak": 11,                          // consecutive scoring days (int)
      "department": "Sales",                 // Sales | Finance | Accounts | PDI | EDP …
      "branch": "Whitefield",
      "kras": { "Attendance": 100, "Test Drives": 28 }, // per-parameter score 0–100, keys = KRA names
      "daily": { "2026-09-21": 420, "2026-09-20": 0 }   // OPTIONAL — see §7
    }
  ],
  "recent": [                                // event feed, newest first
    { "uid": "10161", "name": "SHARAN GS", "ac": "BOOKING_CREATED",
      "pts": 120, "enq": "ENQ26002680", "date": "31-07-2026 21:02" } // "DD-MM-YYYY HH:mm"
  ],
  "codes": { "BOOKING_CREATED": 120, "PAYMENT_ADDED": 40 } // point value per action code
}
```

Field notes:

- `role` must be a valid id from §6 (else treated as `DSE`).
- `tl` links a report to a manager **by display name** — this resolves the Team
  view and the `team` scope reporting line.
- `kras` keys must exactly match KRA parameter names (badges and player cards
  read them by name).
- `points`/`deals`/`events`/`streak` are integers; `kras` values are 0–100.

---

## 2. `GET /v1/contests` — contest list (required)

Returns an **array** in the backend's native shape (the client maps it):

```jsonc
[
  {
    "id": "c1",
    "format": "T20",                    // SUPER OVER | T20 | ODI | TEST (unknown → shown as T20)
    "name": "Punctual Pundit",
    "description": "Zero late swipes for a full month.",
    "prize": "Weekend off + ₹3,000",
    "state": "live",                    // "live" | "upcoming" | "ended"
    "participant_count": 47,
    "participant_ids": ["10161", "859"],// viewer marked "joined" if current_uid is present
    "end_date": "2026-10-01T00:00:00Z"  // ISO 8601 — drives the countdown label
  }
]
```

---

## 3. `POST /v1/contests/{id}/participants` — join a contest (required)

Fired on **Join**. Body:

```jsonc
{ "employee_ids": ["10161"] }
```

- Return **200** on success. Make it an **idempotent add**.
- If you want true leave semantics, expose `DELETE` with the same body and ask
  the frontend team to wire the un-join call.

---

## 4. `PUT /v1/engine/parameters` — save the ruleset (required for the console)

Fired by **Save ruleset** in the Configuration console. Body:

```jsonc
{
  "parameters": [
    { "key": "action:BOOKING_CREATED", "enabled": true, "weight": 120 }
  ],
  "ruleset": {
    "season": { "name": "...", "start": "YYYY-MM-DD", "end": "YYYY-MM-DD",
                "levelStep": 2500, "resetDay": "Mon", "currency": "₹",
                "pointsLabel": "pointers" },
    "rules": { "crossDept": true, "showEarnings": true, "idempotent": true,
               "vesting": true, "clawback": true, "streakGrace": false,
               "publicBoards": true },
    "clawbackPct": 50,
    "tiers": [{ "name": "Debutant", "min": 0 }],
    "actions": [{ "code": "BOOKING_CREATED", "label": "Booking created",
                  "kind": "m", "points": 120, "enabled": true }], // kind: m|v|f|a|p
    "kras": [{ "name": "New Car Sales", "group": "Sales", "target": 2, "points": 1000 }],
    "departmentMultipliers": { "Sales": 1, "EDP": 0.6 },
    "boards": [{ "key": "division", "t": "My Division", "scope": "role",
                 "on": true, "top": 10, "tie": "deals" }],
    "contests": [{ "id": "c1", "name": "...", "format": "T20", "description": "...",
                   "prize": "...", "window": "...", "state": "live" }],
    "dailyQuests": [{ "title": "Log 5 enquiry follow-ups", "goal": 5, "points": 250 }],
    "badges": [{ "id": "first", "enabled": true }],
    "roles": [{ "id": "DSE", "label": "Direct Sales Executive", "scope": "self",
                "kraTemplate": "sales", "permissions": ["self.view"] }],
    "kraTemplates": { "sales": { "label": "Sales floor",
                       "rows": [{ "name": "New Car Sales", "group": "Sales",
                                  "target": 2, "points": 1000 }] } }
  }
}
```

- `actions[].kind`: `m` milestone, `v` value-add, `f` finisher, `a` assist,
  `p` penalty (negative points).
- Return **200** on accept, non-2xx on reject.
- Persist `ruleset` as the season's config; use `parameters[]` to rebuild the
  engine's scoring weights.

---

## 5. Recommended next (not yet wired in the client)

- **`GET /v1/engine/parameters`** — return the same `ruleset` shape so the console
  hydrates from the server on load (today it starts from front-end defaults).
  Highest-value addition: makes config actually round-trip.
- **`GET /v1/contests/{id}/participants`** — list a contest's participants.
- **`daily` on each leaderboard row** — see §7.

Ask the frontend team to connect these once available.

---

## 6. Role ids

`DSE`, `TL`, `SM`, `GM`, `CH`, `AD`, `FIN`, `Accounts`, `EDP`, `PDI`.

| Role | Level | Scope | Extra |
|---|---|---|---|
| DSE | L1 | self | |
| TL | L2 | team (reporting line via `tl`) | manage contests |
| SM | L3 | branch | |
| GM | L4 | branch | **config console** |
| CH | L5 | org | config console |
| AD | L6 | org | config + edit roles |
| FIN / Accounts / EDP / PDI | — | self | own KRA template |

Scope is display-only in the client and **must be re-enforced server-side**.

---

## 7. The `daily` field

Until each leaderboard row carries `daily: { "YYYY-MM-DD": points }`, the month
activity grid and streaks use a deterministic seeded fallback. Add `daily`
(produced from the points ledger grouped by day) and `streak` becomes
authoritative — both go live with no frontend change.

---

## Endpoint summary

| Method | Path | Purpose | Status |
|---|---|---|---|
| GET | `/v1/sales/bootstrap?limit=N` | Main payload + health ping (`limit=1`) | **required** |
| GET | `/v1/contests` | Contest list | **required** |
| POST | `/v1/contests/{id}/participants` | Join a contest | **required** |
| PUT | `/v1/engine/parameters` | Save the ruleset | **required** |
| GET | `/v1/engine/parameters` | Hydrate console config | recommended |
| GET | `/v1/contests/{id}/participants` | List participants | recommended |

The frontend is **read-only** against scoring data — it never writes points,
KRAs or events. The only writes are joining a contest (§3) and saving the
ruleset (§4).
