<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# NeuroTube Creator

> AI-powered YouTube idea generator and script outliner for psychology/neuroscience and ambient/meditation channels.

Generate viral video ideas, full production plans, thumbnails, channel branding, and monetization strategies — all powered by Google Gemini API and optimized for Tier-1 (US/Europe) audiences.

## Quick Start

```bash
npm install                                    # install all workspace dependencies
echo 'GEMINI_API_KEY="your-key-here"' > .env.local
npm run dev                                    # start client (port 9000) + server (port 3000)
```

Open `http://localhost:9000` and start generating.

## Key Features

- **Dual Niche** — Psychology/Neuroscience and Ambient/Meditation modes with niche-specific prompts
- **Video Ideas** — 5 clickable ideas with SEO keywords, hooks, and audience analysis
- **Full Video Plan** — Script outline, chapters, thumbnail concepts, SEO description
- **Thumbnail Generation** — AI image generation via Gemini Pro Image (16:9, 2K)
- **Channel Branding** — Channel names, SEO descriptions, avatar and banner prompts
- **YouTube Description** — SEO-optimized with spoiler-free timestamps
- **NotebookLM Integration** — Source document for AI podcast creation
- **Shorts Spinoffs** — 3 YouTube Shorts ideas as traffic funnels
- **Niche Analysis** — Competitive analysis with Google Search grounding
- **Suno.ai Prompt** — Optimized music prompts for ambient tracks
- **Monetization Copy** — Patreon/Boosty promotional text
- **30-Day Roadmap** — Strategic content plan with long-form and Shorts

## Tech Stack

**Monorepo** (npm workspaces) · Vue 3 + Quasar (client) · Hono (server) · PostgreSQL + Drizzle ORM · Google Gemini API · TypeScript

---

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](docs/getting-started.md) | Installation, API key setup, running locally |
| [Architecture](docs/architecture.md) | Project structure, FSD, data flow |
| [Configuration](docs/configuration.md) | Environment variables, Vite & TS config |
| [AI Features](docs/ai-features.md) | All 12 AI functions: prompts, models, outputs |

## Deploy

Deployed via Dokploy (self-hosted PaaS, Docker). Single container serves both Hono API and Vue 3 static build.

## License

Private
