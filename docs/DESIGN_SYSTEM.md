# Design System Specification (`docs/DESIGN_SYSTEM.md`)

This document defines the visual foundation, design tokens, typography scale, icon conventions, motion standards, and layout architecture for Gym CRM.

---

## 1. Visual Philosophy & Core Principles

- **Minimal & High Contrast**: Built on crisp off-white backgrounds with slate typography for readability in bright gym environments.
- **Single Brand Accent**: **Emerald 600** (`#059669` / `hsl(160 84% 39%)`) representing health, energy, and momentum.
- **Strict Semantic Colors**: Accent colors are reserved strictly for status cues; no decorative gradients or visual clutter.
- **Atomic Simplicity**: Flat cards, subtle borders (`border-slate-200`), minimal shadows (`shadow-sm`), and consistent border radius (`rounded-lg` / `8px`).

---

## 2. Color Palette & Design Tokens

### 2.1 CSS Variables (Light & Dark Mode)

```css
:root {
  /* Surface & Background */
  --background: 210 20% 98%;          /* #f8fafc (slate-50) */
  --foreground: 222 47% 11%;          /* #0f172a (slate-900) */
  --card: 0 0% 100%;                  /* #ffffff */
  --card-foreground: 222 47% 11%;     /* #0f172a */
  --popover: 0 0% 100%;
  --popover-foreground: 222 47% 11%;

  /* Brand Primary Accent (Emerald-600) */
  --primary: 160 84% 39%;             /* #059669 */
  --primary-foreground: 0 0% 100%;    /* #ffffff */

  /* Neutral Controls & Secondary */
  --secondary: 210 40% 96.1%;         /* #f1f5f9 (slate-100) */
  --secondary-foreground: 222 47% 11%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215 16% 47%;    /* #64748b (slate-500) */
  --accent: 210 40% 96.1%;
  --accent-foreground: 222 47% 11%;

  /* Borders & Inputs */
  --border: 214 32% 91%;              /* #e2e8f0 (slate-200) */
  --input: 214 32% 91%;
  --ring: 160 84% 39%;                /* Emerald-600 ring */

  /* Semantic Status Tokens */
  --status-active-bg: 142 76% 95%;    /* Emerald-50 */
  --status-active-fg: 160 84% 28%;    /* Emerald-800 */
  --status-warning-bg: 48 96% 89%;    /* Amber-100 */
  --status-warning-fg: 28 80% 28%;    /* Amber-900 */
  --status-danger-bg: 0 86% 97%;      /* Rose-50 */
  --status-danger-fg: 347 77% 40%;    /* Rose-700 */
  --status-neutral-bg: 210 40% 96%;   /* Slate-100 */
  --status-neutral-fg: 215 16% 47%;   /* Slate-600 */

  --radius: 0.5rem;                   /* 8px */
}

.dark {
  --background: 224 71% 4%;           /* #020617 (slate-950) */
  --foreground: 210 40% 98%;          /* #f8fafc */
  --card: 222 47% 7%;                 /* #090e17 */
  --card-foreground: 210 40% 98%;
  --popover: 222 47% 7%;
  --popover-foreground: 210 40% 98%;

  --primary: 158 64% 52%;             /* Emerald-500 */
  --primary-foreground: 222 47% 11%;

  --secondary: 217 33% 17%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217 33% 17%;
  --muted-foreground: 215 20% 65%;
  --border: 217 33% 17%;
  --input: 217 33% 17%;
  --ring: 158 64% 52%;
}
```

### 2.2 Semantic Status Mapping
Status badges strictly observe the following color system:

| Meaning | Status Values | Tailwind Classes |
| :--- | :--- | :--- |
| **Success / Positive** | `ACTIVE`, `PAID`, `SENT` | `bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300` |
| **Attention / Pending** | `TRIAL`, `PENDING`, `EXPIRING` | `bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300` |
| **Critical / Negative** | `EXPIRED`, `FAILED`, `CANCELLED` | `bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300` |
| **Inactive / Suspended**| `INACTIVE`, `SUSPENDED`, `REVOKED` | `bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300` |

---

## 3. Typography & Spacing Scale

### Typography
- **Font Family**: Inter or Geist via Next.js `next/font/google`.
- **Display Scale**:
  - `text-3xl font-bold tracking-tight`: Dashboard metric headers (`30px / 1.875rem`)
  - `text-xl font-semibold`: Page titles and section headings (`20px / 1.25rem`)
  - `text-base font-medium`: Primary navigation and table headers (`16px / 1rem`)
  - `text-sm font-normal`: Form inputs, table cells, descriptions (`14px / 0.875rem`)
  - `text-xs font-medium`: Metadata pills and status badges (`12px / 0.75rem`)

### Spacing Scale (8px Grid)
- `space-2` (8px): Form input padding, inline icon spacing.
- `space-4` (16px): Card internal padding, button gaps.
- `space-6` (24px): Grid column gaps, widget separation.
- `space-8` (32px): Main section margins.

---

## 4. Iconography Standards

- **Single Family Rule**: All icons are imported **strictly** from `react-icons/lu` (the Lucide family inside `react-icons`).
- **No Direct Lucide or Heroicons**: Any imports of `lucide-react` or `@heroicons/react` are strictly banned.
- **Standard Sizing**:
  - Inline buttons / badges: `h-4 w-4` (16px)
  - Navigation links: `h-5 w-5` (20px)
  - Stat cards: `h-6 w-6` (24px)
  - Empty states / modal headers: `h-10 w-10` (40px)

---

## 5. Micro-Interactions & Motion Tokens (`motion/react`)

Micro-interactions provide responsive tactile feedback without ostentatious page transitions.

### 5.1 Rules & Constraints
- **Library**: `motion` package imported via `motion/react`.
- **Duration**: `150ms` - `250ms`.
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out).
- **Reduced Motion**: All motion components wrap interactions with `useReducedMotion()`. If enabled, transitions snap instantaneously (`duration: 0`).

### 5.2 Micro-Interaction Catalog
1. **Interactive Buttons (`PressableButton`)**:
   `whileTap={{ scale: 0.97 }}` with `transition: { duration: 0.1 }`.
2. **Dashboard Cards**:
   Subtle hover elevation: `whileHover={{ y: -2 }}`.
3. **Modals & Dialogs**:
   `initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}` (150ms).
4. **Lists & Tables (`StaggerList`, `StaggerItem`)**:
   Staggered entrance: `delayChildren: 0.05, staggerChildren: 0.03`.
5. **Metric Numbers (`AnimatedNumber`)**:
   Smooth spring counter interpolating numbers when stats load.
6. **QR Code Countdown (`CountdownRing`)**:
   SVG stroke-dashoffset transition smoothly synchronizing with the 15-second window.
7. **Live Attendance Check-In Row**:
   `initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}` with brief background highlight.

---

## 6. Navigation Architecture

Target: **Any core action reachable in $\le 2$ clicks.**

```
Desktop: Fixed Left Sidebar (256px)
Mobile:
  - Admin: Compact Topbar + Slide-out Sheet Menu
  - Trainer / Customer: Fixed Bottom Tab Navigation (Home, Attendance/QR, History/Settings)
```

- **Top Bar**: Displays active gym name, breadcrumbs, user profile avatar, and sign-out button.
- **Active Route Highlighting**: Active navigation item highlighted with `bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800`.
- **Mobile Bottom Nav**: 4-tab thumb-friendly navigation with active indicator dots.

