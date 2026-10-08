# Gombe State Ministry of Environment & Forest Resources — Admin Console

A complete, responsive back-office for the public website in the repository root, built with
**plain HTML, CSS and JavaScript only** — no frameworks, no libraries, no build step, no server.

Everything is persisted in the browser's `localStorage`, so the console behaves like a real CMS
while remaining a static demo you can open from any web server or GitHub Pages.

---

## 1. Running it

`localStorage` is blocked on `file://` URLs in modern browsers, so serve the folder over HTTP:

```bash
# from the repository root
python3 -m http.server 8000
# then open http://localhost:8000/admin/login.html
```

Any static host works (GitHub Pages, Netlify, nginx, IIS…). Because `.github/workflows/static.yml`
already publishes the repository root, this console is live at `…/admin/` as soon as it is pushed.

The public pages link to it from the footer (**Staff Login**).

> The console falls back to an in-memory store when `localStorage` is unavailable, so it never
> white-screens — it just won't persist that session.

## 2. Signing in

Open `admin/login.html`. It is a **demo console**: pick any role and use any password of at least
6 characters (the picker's "Use this credential" button fills both fields for you).

| Account | Role | Access |
| --- | --- | --- |
| `amina.bello@environment.gombestate.gov.ng` | Super Admin | everything |
| `ibrahim.sule@environment.gombestate.gov.ng` | Editor | content, media, enquiries, analytics |
| `hauwa.mohammed@environment.gombestate.gov.ng` | Officer | day-to-day operations |
| `daniel.yakubu@environment.gombestate.gov.ng` | Officer | day-to-day operations |
| `fatima.ahmed@environment.gombestate.gov.ng` | Contributor (invited) | drafts only, cannot publish |
| `emeka.nwosu@environment.gombestate.gov.ng` | Partner (suspended) | sign-in is refused |

Navigation and routes are filtered by the signed-in role's permissions; opening a restricted URL
directly shows an explicit "no permission" screen rather than leaking the module.

## 3. What it manages

**Overview** — Dashboard (8 KPIs with sparklines, traffic chart with 7d/30d/90d ranges, enquiry
donut, top subjects, permit pipeline, "needs your attention", tasks, upcoming events, programme
delivery, quick actions, activity feed, content inventory) · Analytics (traffic, top pages,
sources, devices, LGA breakdown, monthly comparison) · Tasks & approvals.

**Content** — Newsroom (drafts → review → scheduled → published, categories, rich-text editor,
SEO, featured image picker, preview) · Pages & SEO (per-page metadata, hero slides, milestones,
quick links, counters, partners) · Projects & programmes (progress, budget, partners) ·
Departments (directorates, staff/management team, agencies) · Services (catalogue, fees schedule,
FAQs, application steps) · Events (month calendar, sanitation days, planting drives) ·
Newsletter (subscribers, segmentation, campaigns).

**Operations** — Enquiries inbox (read/star/assign/reply/archive, drawer view) · Environmental
incident reports (severity, status workflow, LGA) · Permits & applications (register plus a
drag-and-drop kanban across the approval flow) · Media library (folders, upload with automatic
canvas downscaling to ≤1280 px JPEG, quota-safe) · Gallery · Documents & downloads.

**Administration** — Users & roles (accounts plus a per-role permission matrix) · Audit log
(every create/update/delete/publish/login/settings change is recorded) · Settings
(general & SEO, contact details and office hours, socials, feature flags, maintenance mode,
appearance/theme/density, data backup & restore, security).

## 4. Keyboard shortcuts

| Keys | Action |
| --- | --- |
| `Ctrl`/`⌘` + `K` | Global search / command palette |
| `Ctrl`/`⌘` + `B` | Collapse the sidebar |
| `Esc` | Close the topmost modal, drawer or palette |
| `Alt` + `D` `E` `N` `P` `S` `A` `M` | Jump to Dashboard, Enquiries, News, Permits, Services, Analytics, Media |
| `?` | Show the shortcuts dialog |

## 5. Data & backups

| Key | Contents |
| --- | --- |
| `gmbeAdminConsole.v1` | all content and settings |
| `gmbeAdminSession.v1` | signed-in user |
| `gmbeAdminPrefs.v1` | theme, density, sidebar state |

**Settings → Data** exports the whole store as a downloadable JSON backup and restores it from a
file, which is how you move demo content between browsers. There is also a "reset demo data"
action that reseeds everything.

## 6. Files

```
admin/
├── login.html                sign-in page (roles, credential filler, help panel)
├── index.html                app shell + boot overlay + noscript fallback
├── README.md                 this file
└── assets/
    ├── css/admin.css         design system: tokens, light/dark themes, components, charts,
    │                         kanban, calendar, media grid, 5 breakpoints, print styles
    └── js/
        ├── store.js          seed data, persistence, storage shim, audit logging
        ├── ui.js             icons, formatters, toasts, modals/drawers, form builder,
        │                     data tables, CSV export, SVG chart engine
        ├── crud.js           generic editor / collection manager / detail drawer helpers
        ├── views.js          the 15 content & operations modules
        └── app.js            navigation, hash router, permissions, dashboard, pages/CMS,
                              analytics, settings, global search, notifications, shortcuts
```

Scripts must load in that order: `store → ui → crud → views → app`.

## 7. Notes

* Brand tokens (greens, gold, typography, easing) are inherited from `assets/css/style.css` so the
  console looks like the same product as the public site.
* Uploaded images become data URLs; the 5 MB `localStorage` quota is monitored and warned about.
  Seed media point at the existing `../assets/img/` files instead.
* The layout is responsive down to ~360 px: the sidebar becomes an off-canvas drawer, tables gain
  a card layout, KPI grids collapse, and the kanban scrolls horizontally.
* Accessibility: skip link, `aria-*` on menus/dialogs/tabs, focus trapping in modals and drawers,
  visible focus rings, and labelled controls throughout.
