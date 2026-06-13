# UniMind Complete Visual Redesign — Premium Dark-Mode Experience

Transform UniMind from a basic warm-clay student tool into a **cinematic, immersive, million-dollar-quality web application** — inspired by BMW's digital essentialism, Claude.ai's clean sophistication, and modern premium SaaS aesthetics.

## Design Philosophy

> **"Amplification through reduction"** — BMW's Neue Klasse philosophy applied to a student platform. Every pixel earns its place. Dark backgrounds make content glow. Motion creates life. Typography commands attention.

### Reference Benchmarks
- **BMW.com** — Dark-mode hero sections, dramatic typography, ambient light effects, cinematic scrolling
- **Claude.ai** — Clean glassmorphism, warm accent tones on dark backgrounds, sophisticated spacing, smooth page transitions
- **Linear.app** — Best-in-class dark sidebar, animated gradients, premium card system
- **Vercel.com** — Glowing borders, grain textures, theatrical reveals

---

## User Review Required

> [!IMPORTANT]
> **Dark Mode Conversion**: The current app is entirely light/warm-themed. This plan converts to a **dark-mode-first** design. All pages will use deep charcoal/near-black backgrounds with luminous accent colors. Are you okay with this direction, or do you want a dark/light toggle?

> [!IMPORTANT]
> **Color Palette Shift**: Moving from warm clay indigo (`#6366f1`) to a richer dual-accent system:
> - **Primary**: Electric violet-indigo gradient (`#7c3aed` → `#6366f1`) 
> - **Accent**: Warm amber-gold (`#f59e0b` → `#fbbf24`) for energy/highlights
> - **Surface**: Deep charcoal (`#0a0a0f` → `#121218` → `#1a1a24`) for depth layers
> 
> This creates a premium, high-contrast aesthetic. Approve?

> [!IMPORTANT]
> **Emoji → Animated Icons**: The current basic emoji (`📚`, `🤖`, `📊`, etc.) will be replaced with **animated SVG/Lottie-style icon components** using Framer Motion — each with hover effects, entrance animations, and subtle continuous motion (floating, pulsing, rotating). The landing page feature icons will become living, breathing visual elements.

---

## Open Questions

> [!NOTE]
> **Font Choice**: Plan uses **Inter** for body + **Space Grotesk** for display headings (geometric, modern, technical feel). Alternative: **Outfit** (friendlier) or **Sora** (futuristic). Which vibe do you prefer?

> [!NOTE]
> **Background Effects**: Plan includes subtle animated gradient meshes / aurora effects behind key sections (landing hero, dashboard header). These are performant CSS-only effects. Want full-page grain texture overlay too (Vercel-style)?

---

## Proposed Changes

### Phase 1: Design System Foundation

The new design system replaces the current warm-clay system with a dark, premium, layered aesthetic.

---

#### [MODIFY] [globals.css](file:///d:/unimind/src/app/globals.css)

**Complete rewrite** of the design system:

- **New color tokens**: Dark surface layers (`--surface-0` through `--surface-400`), luminous primary gradient, amber accent, semantic colors adjusted for dark backgrounds
- **New typography system**: `Space Grotesk` for headings (bold, geometric), `Inter` for body (clean, readable), `JetBrains Mono` for code
- **New shadow system**: Glow-based shadows instead of drop shadows — cards emit soft colored light (`box-shadow: 0 0 40px rgba(99, 102, 241, 0.15)`)
- **New animation keyframes**: 
  - `float` — gentle Y-axis oscillation for icons
  - `glow-pulse` — ambient border glow cycle  
  - `gradient-shift` — moving gradient backgrounds
  - `reveal-up` / `reveal-left` — scroll-triggered entrance animations
  - `shimmer` — loading skeleton with luminous sweep
  - `aurora` — ambient background gradient mesh
- **New component classes**:
  - `.glass-card` — frosted glass with `backdrop-filter: blur(20px)`, semi-transparent backgrounds, glowing borders
  - `.glow-border` — animated gradient border using `conic-gradient`
  - `.btn-glow` — primary button with hover glow halo
  - `.btn-ghost` — secondary transparent button with border animation
  - `.input-dark` — dark input with focus glow ring
  - `.nav-item` — sidebar items with animated active indicator
  - `.badge-glow` — badges with subtle pulsing glow
  - `.text-gradient` — gradient text effect for headings
- **Responsive dark scrollbar**: Thin, glowing scrollbar matching the theme
- **Selection colors**: Custom `::selection` with primary color

---

#### [MODIFY] [layout.tsx](file:///d:/unimind/src/app/layout.tsx)

- Add `Space Grotesk` Google Font import alongside Inter
- Set `<html className="dark">` for dark mode
- Update Toaster styles to match dark theme (dark background, light text, glowing borders)
- Add subtle animated grain texture overlay (CSS-only, performant)

---

### Phase 2: Landing Page — Cinematic First Impression

The current landing page is a basic centered layout with static emoji chips. The redesign makes it an **immersive, scroll-driven cinematic experience**.

---

#### [MODIFY] [page.tsx](file:///d:/unimind/src/app/page.tsx) (Landing Page)

Convert from a simple server component to a `"use client"` page with Framer Motion:

**Hero Section**:
- Full-viewport dark background with animated aurora gradient mesh (CSS `radial-gradient` animations)
- Logo: Animated entrance — the "U" icon scales up with a glow ring burst, "UNIMIND" types in letter by letter
- Headline: `"Your University Life,"` → dramatic pause → `"Organized."` slides in with spring physics. Uses `Space Grotesk` at `clamp(3rem, 8vw, 5rem)`, `font-weight: 700`, with `text-gradient` effect (violet→ indigo → cyan)
- Subtitle: Fades up with 0.3s delay, cool neutral text on dark
- CTAs: 
  - **"Get Started Free"** — glowing gradient button with hover halo expansion, subtle scale(1.02) on hover
  - **"Sign In"** — ghost button with animated border, glow on hover
- **Floating animated icons**: The 6 feature icons (replacing emojis) float in orbital/scattered positions around the hero text, each with:
  - Unique continuous animation (gentle float, subtle rotation, scale pulse)
  - Glassmorphism background pill
  - Staggered Framer Motion entrance (spring, staggerChildren: 0.08)
  - Hover: scale up + glow intensify + tooltip with feature name

**Feature Grid Section** (below fold):
- Bento grid layout (2×3 on desktop, stacked on mobile)
- Each card: glass-card with icon, title, and one-line description
- Cards animate in on scroll (Framer Motion `whileInView`)
- Hover: card lifts, border glows, icon animates

**Footer**:
- Subtle separator with gradient line
- "Free forever for students · No credit card" with amber accent

---

### Phase 3: Authentication Pages — Premium Onboarding

---

#### [MODIFY] [layout.tsx](file:///d:/unimind/src/app/%28auth%29/layout.tsx) (Auth Layout)

- Full dark background with ambient gradient mesh (different angle than landing)
- Floating glassmorphism card for auth content
- Logo in top-left with subtle glow ring
- Remove commented-out code (cleanup)

#### [MODIFY] [login/page.tsx](file:///d:/unimind/src/app/%28auth%29/login/page.tsx)

- Glass card with frosted dark background
- Animated entrance: card slides up with spring physics
- Input fields: dark backgrounds, subtle border, glowing focus ring (violet)
- Password toggle: smooth icon rotation animation
- Submit button: glowing gradient with loading state shimmer
- "Forgot password" / "Register" links: gradient text on hover
- Error messages: animated entrance with red glow

#### [MODIFY] [register/page.tsx](file:///d:/unimind/src/app/%28auth%29/register/page.tsx)

- Same glass card treatment
- Step indicator: connected dots with glowing animated progress line (like Linear's progress bars)
- Each step transition: Framer Motion `AnimatePresence` with slide direction
- Degree dropdown: dark glass panel with smooth height animation
- GPA input: dark styled with amber accent for the live CGPA preview card
- Clean up commented-out code

---

### Phase 4: Dashboard Shell — The Cockpit

---

#### [MODIFY] [Sidebar.tsx](file:///d:/unimind/src/components/layout/Sidebar.tsx)

Complete visual overhaul:
- **Background**: Deep charcoal (`#0d0d12`) with subtle noise texture
- **Logo**: Glowing icon + gradient text
- **Nav items**: 
  - Active: glowing left border indicator (animated `width: 3px`, violet glow) + subtle glass background
  - Hover: background slides in from left with spring physics
  - Icons: Lucide icons with active=filled-style glow
- **Collapse animation**: Smooth width transition with content fade
- **User card at bottom**: Glass card with gradient avatar ring (animated border)
- **Sign out**: Red glow on hover
- **Mobile drawer**: Slides in with backdrop blur overlay, spring animation
- Clean up all commented-out legacy code (lines 1-183)

#### [MODIFY] [TopBar.tsx](file:///d:/unimind/src/components/layout/TopBar.tsx)

- Background: transparent with blur backdrop (glass header)
- Bottom border: subtle gradient line instead of solid border
- Notification bell: glass background, glow on hover, animated badge pulse
- Avatar: gradient ring border with hover glow expansion
- Clean up commented-out code

#### [MODIFY] [layout.tsx](file:///d:/unimind/src/app/%28dashboard%29/layout.tsx)

- Dark background for the dashboard shell
- Main content area: subtle ambient gradient behind content
- Clean up commented-out code

---

### Phase 5: Dashboard Home — Command Center

---

#### [MODIFY] [DashboardCards.tsx](file:///d:/unimind/src/components/dashboard/DashboardCards.tsx)

- Glass cards with colored glow borders (each card has its own accent color reflected in the glow)
- Icon backgrounds: gradient pill with soft glow
- Values: large, bold, gradient text for key numbers
- Hover: card elevates with intensified glow, icon scales up
- Staggered entrance animation
- Clean up commented-out code

#### [MODIFY] [dashboard/page.tsx](file:///d:/unimind/src/app/%28dashboard%29/dashboard/page.tsx)

- Greeting: `Space Grotesk`, gradient text for the name, with animated wave emoji (CSS animation)
- Cards grid: Framer Motion staggered reveal
- Two-column layout for tasks: glass card containers
- AI Chatbox section: glass card with gradient border

#### [MODIFY] [UpcomingTasks.tsx](file:///d:/unimind/src/components/dashboard/UpcomingTasks.tsx)

- Glass card container
- Task items: dark row with hover glow, colored priority indicators (glowing dots)
- Overdue section: subtle red glow border
- Empty state: animated icon with message

#### [MODIFY] [DashboardChat.tsx](file:///d:/unimind/src/components/dashboard/DashboardChat.tsx)

- Chat container: glass card with gradient top border
- Messages: dark bubbles for user, glass bubbles for AI with subtle gradient
- Input: dark with glow focus ring
- Send button: animated gradient with hover effects

---

### Phase 6: Feature Pages — Each with Character

---

#### [MODIFY] [courses/page.tsx](file:///d:/unimind/src/app/%28dashboard%29/courses/page.tsx)

- Course cards: glass cards with colored left border (course color) and matching glow
- Add button: glowing gradient button
- Empty state: animated illustration with CTA

#### [MODIFY] [CourseCard.tsx](file:///d:/unimind/src/components/courses/CourseCard.tsx)

- Glass card with the course's color as accent glow
- Hover: elevate + glow intensify
- Course code badge: glass badge with glow

#### [MODIFY] [AddCourseModal.tsx](file:///d:/unimind/src/components/courses/AddCourseModal.tsx)

- Dark glass modal with backdrop blur
- Smooth entrance/exit animation (scale + fade)
- Dark inputs with glow focus

#### [MODIFY] [GradesOverview.tsx](file:///d:/unimind/src/components/grades/GradesOverview.tsx)

- Glass card CGPA display with animated gradient number
- Progress bars: glowing, animated fill

#### [MODIFY] [SemesterGPAChart.tsx](file:///d:/unimind/src/components/grades/SemesterGPAChart.tsx)

- Dark themed chart with glowing data points
- Gradient line fills
- Animated drawing on mount

#### [MODIFY] [TaskCard.tsx](file:///d:/unimind/src/components/tasks/TaskCard.tsx)

- Glass card with priority glow (green/amber/red)
- Status indicator: animated glowing dot
- Hover effects with lift + glow

#### [MODIFY] [TasksClient.tsx](file:///d:/unimind/src/components/tasks/TasksClient.tsx)

- Dark-themed filter tabs with active glow indicator
- Animated task list with `AnimatePresence` for add/remove

#### [MODIFY] [AIAssistantClient.tsx](file:///d:/unimind/src/components/ai/AIAssistantClient.tsx)

- Premium chat interface with dark glass bubbles
- AI messages: gradient glass background
- Typing indicator: glowing pulse dots
- Input area: glass card at bottom with gradient send button

#### [MODIFY] [DrawingBoardClient.tsx](file:///d:/unimind/src/components/drawing/DrawingBoardClient.tsx)

- Dark canvas with glass toolbar
- Tool buttons: glow on active
- Color picker: dark styled

#### [MODIFY] [MotivationClient.tsx](file:///d:/unimind/src/components/motivation/MotivationClient.tsx)

- Tab bar: animated underline with glow
- Health score circle: glowing animated ring with gradient
- Mood emoji buttons: glass cards with bounce animation on hover, glow on select
- TED talk cards: glass cards with colored accent glow
- Success stories: glass cards with animated emoji avatars
- Focus techniques: glass cards with numbered glowing step indicators
- Clean up massive commented-out code block (lines 1-800+)

---

### Phase 7: Supporting Pages

---

#### [MODIFY] [not-found.tsx](file:///d:/unimind/src/app/not-found.tsx)

- Dark background with ambient gradient
- Animated floating emoji/icon
- Glowing CTA button
- Animated text entrance

#### [MODIFY] [Skeleton.tsx](file:///d:/unimind/src/components/ui/Skeleton.tsx)

- Dark skeleton with gradient shimmer animation (matching the dark theme)

#### [MODIFY] [MarkdownRenderer.tsx](file:///d:/unimind/src/components/ui/MarkdownRenderer.tsx)

- Dark code blocks with syntax highlighting colors
- Dark blockquotes with accent border glow
- Link styling with gradient hover

---

### Phase 8: Animated Icon System (Replacing Emojis)

---

#### [NEW] [AnimatedIcon.tsx](file:///d:/unimind/src/components/ui/AnimatedIcon.tsx)

A reusable animated icon wrapper component:
- Wraps Lucide icons or custom SVGs
- Props: `animation` (float, pulse, spin, bounce), `glowColor`, `size`
- Uses Framer Motion for smooth animations
- Glassmorphism background container option
- Used across: landing page features, dashboard cards, motivation page, sidebar

#### [NEW] [FeatureIcon.tsx](file:///d:/unimind/src/components/ui/FeatureIcon.tsx)

Landing page animated feature icons:
- 6 unique animated icon compositions (one per feature)
- Each has a unique continuous micro-animation
- Glassmorphism pill background
- Hover interaction: scale + glow + tooltip

---

## Verification Plan

### Automated Tests
```bash
# Build verification — ensures no TypeScript/JSX errors
npm run build

# Dev server visual verification
npm run dev
```

### Manual Verification
- **Landing page**: Verify cinematic hero, animated icons, smooth scroll, CTA buttons
- **Auth pages**: Verify glass card, input focus effects, step transitions
- **Dashboard**: Verify sidebar glow states, glass cards, animated greetings
- **All pages**: Verify dark theme consistency, no light-mode remnants
- **Mobile**: Verify responsive design, mobile drawer, stacked layouts
- **Performance**: Verify 60fps animations, no jank, reasonable bundle size
- **Browser**: Test Chrome, Firefox, Edge, Safari

### Key Visual Checkpoints
1. Landing hero with floating animated icons — ✨ wow factor on first load
2. Auth card glass effect — premium feel
3. Sidebar active state glow — satisfying navigation
4. Dashboard cards stagger animation — professional data display
5. Motivation mood emojis bounce — engaging interactivity
6. Every page transition — smooth, no layout shifts
