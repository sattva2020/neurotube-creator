# Plan: Modern Homepage — Neuro-Futurism Design with GSAP

**Branch:** `feature/modern-homepage-gsap`
**Created:** 2026-02-27
**Style:** Neuro-Futurism (dark theme, neural network particles, glow effects, gradient text)

## Settings

| Setting | Value |
|---------|-------|
| Testing | Yes — E2E (Playwright) |
| Logging | Verbose (DEBUG) |
| Docs | Yes — update DESCRIPTION.md + ARCHITECTURE.md |

## Overview

Полный редизайн главной страницы NeuroTube Creator в стиле «нейро-футуризм»:
- Тёмная тема с градиентами и glow-эффектами
- Анимированный Canvas-фон с нейронными связями
- GSAP анимации: text reveal, stagger, ScrollTrigger
- Glass-morphism карточки с неоновыми акцентами
- Секция «Возможности» с scroll-анимациями

## Current State

- `IndexPage.vue` — plain text hero + search + chips, zero animations
- No animation libraries installed
- Styling: Quasar utility classes + scoped SCSS, no global CSS
- Default Quasar blue theme, no dark mode

## Tech Decisions

- **GSAP 3.x** — core library + ScrollTrigger plugin
- **Canvas API** — for neural network background (not SVG, better performance)
- **CSS Variables** — for theme tokens (`--neuro-bg`, `--neuro-accent`, etc.)
- **gsap.context()** — for Vue component lifecycle cleanup
- **No SplitText plugin** — manual span splitting (SplitText is premium)

## Tasks

### Phase 1: Foundation (GSAP + Theme)

#### ~~Task 1: Install GSAP & create useGsap composable~~ [x]
- `npm install gsap` in `client/`
- Create `client/src/composables/useGsap.ts` — wrapper over `gsap.context()`
- Register ScrollTrigger in `main.ts`
- **Files:** CREATE `useGsap.ts`, EDIT `package.json`, EDIT `main.ts`

#### ~~Task 2: Create global «Neuro-Futurism» theme~~ [x]
- Create `client/src/css/neuro-theme.scss` — dark backgrounds, glow effects, gradient text
- CSS variables: `--neuro-bg` (#0a0a1a), `--neuro-accent` (#00f5ff), `--neuro-glow`, `--neuro-text`
- Utility classes: `.glow-text`, `.glass-card`, `.gradient-text`
- Apply dark theme to MainLayout
- **Files:** CREATE `neuro-theme.scss`, EDIT `main.ts`, EDIT `MainLayout.vue`
- **Blocked by:** Task 1

### Phase 2: Background & Hero

#### Task 3: Create animated NeuralBackground component
- Canvas-based neural network visualization (particles + connections)
- GSAP for smooth particle movement
- Responsive, performance-optimized (requestAnimationFrame)
- **Files:** CREATE `NeuralBackground.vue`
- **Blocked by:** Task 1

#### Task 4: Redesign hero section with GSAP text animations
- Gradient text headlines, GSAP timeline: slide-up + fade-in sequence
- Text split into spans for per-word/per-char animation
- Niche switch transition animation
- **Files:** EDIT `IndexPage.vue`
- **Blocked by:** Tasks 1, 2

### Phase 3: Interactive Elements

#### Task 5: Animate search form & preset chips
- Glow focus effect on search input
- Pulsing submit button
- Stagger chip entrance (0.08s delay per chip)
- Niche switch re-animates chips
- **Files:** EDIT `IndexPage.vue`
- **Blocked by:** Tasks 2, 4

#### Task 6: Animate idea cards with ScrollTrigger
- ScrollTrigger fade-in + slide-up for each card
- Neuro-styled IdeaCard (glass-card, neon borders)
- NicheToggle restyled for dark theme
- **Files:** EDIT `IdeaCard.vue`, EDIT `NicheToggle.vue`, EDIT `IndexPage.vue`
- **Blocked by:** Tasks 1, 2

#### Task 7: Add «Features» section with scroll animations
- 3-4 feature cards: AI ideas, SEO, scripts, niche analysis
- Glass-card style, icon glow, stagger entrance
- ScrollTrigger: appear on scroll
- **Files:** CREATE `FeaturesSection.vue`, EDIT `IndexPage.vue`
- **Blocked by:** Tasks 1, 2

### Phase 4: Quality & Docs

#### Task 8: E2E tests for new homepage
- Playwright tests: hero visible, canvas exists, niche switch works
- Search form functional, chips clickable
- Dark theme applied, features section scrolls in
- **Files:** CREATE e2e test file
- **Blocked by:** Tasks 4, 5, 6, 7

#### Task 9: Update project documentation
- Add GSAP to tech stack in DESCRIPTION.md
- Add new components/composables to ARCHITECTURE.md
- **Files:** EDIT `DESCRIPTION.md`, EDIT `ARCHITECTURE.md`
- **Blocked by:** Tasks 1, 2, 3, 7

## Commit Plan

| Checkpoint | Tasks | Commit Message |
|------------|-------|----------------|
| Commit 1 | Tasks 1-2 | `feat(ui): add GSAP foundation and neuro-futurism theme` |
| Commit 2 | Tasks 3-4 | `feat(ui): add neural background and animated hero section` |
| Commit 3 | Tasks 5-6-7 | `feat(ui): animate search, cards, and features section with GSAP` |
| Commit 4 | Tasks 8-9 | `test+docs: add homepage e2e tests and update documentation` |

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--neuro-bg` | `#0a0a1a` | Page background |
| `--neuro-bg-secondary` | `#0d1117` | Card backgrounds |
| `--neuro-accent` | `#00f5ff` | Primary cyan accent |
| `--neuro-accent-purple` | `#8b5cf6` | Secondary purple accent |
| `--neuro-accent-pink` | `#ec4899` | Tertiary pink accent |
| `--neuro-glow` | `0 0 20px rgba(0, 245, 255, 0.3)` | Glow effect |
| `--neuro-text` | `#e2e8f0` | Primary text |
| `--neuro-text-muted` | `#94a3b8` | Secondary text |

## GSAP Animation Specs

| Element | Animation | Duration | Ease | Trigger |
|---------|-----------|----------|------|---------|
| Hero title | fromTo y:50→0, opacity:0→1 | 0.8s | power3.out | onMounted |
| Hero subtitle | from opacity:0 | 0.6s | power2.out | timeline +0.3s |
| Search form | from y:30, opacity:0 | 0.5s | power2.out | timeline +0.2s |
| Preset chips | from y:20, opacity:0 | 0.4s | power2.out | stagger 0.08s |
| Idea cards | from y:60, opacity:0 | 0.6s | power2.out | ScrollTrigger |
| Feature cards | from y:40, opacity:0, scale:0.95 | 0.5s | power2.out | ScrollTrigger stagger 0.15s |
| Neural particles | to random x,y | 3-8s | sine.inOut | repeat -1, yoyo |
