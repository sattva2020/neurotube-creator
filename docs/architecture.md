[← Getting Started](getting-started.md) · [Back to README](../README.md) · [Configuration →](configuration.md)

# Architecture

## Overview

NeuroTube Creator — клиентское SPA (Single Page Application) на React 19 без бэкенда. Все AI-вызовы идут напрямую к Gemini API из браузера. Приложение собирается Vite и деплоится как статика.

```
┌──────────────────────────────────────────┐
│             Browser (Client)              │
│                                           │
│  React App ──→ Gemini API (text/images)  │
│       ↑                                   │
│  Tailwind CSS + Lucide Icons              │
└──────────────────────────────────────────┘
```

## Architecture Pattern: Feature-Sliced Design (FSD)

Проект следует методологии FSD с 6 слоями:

```
app       → инициализация, провайдеры, глобальные стили
pages     → страницы (единственная: HomePage)
widgets   → составные UI-блоки (Header, IdeaList, VideoPlanner)
features  → пользовательские фичи (generate-ideas, generate-plan, ...)
entities  → бизнес-сущности (VideoIdea, Niche, ChannelBranding)
shared    → переиспользуемый код (Button, cn(), gemini client)
```

### Dependency Rules

| Импортирует из → | shared | entities | features | widgets | pages | app |
|------------------|--------|----------|----------|---------|-------|-----|
| **shared**       | -      | ❌       | ❌       | ❌      | ❌    | ❌  |
| **entities**     | ✅     | -        | ❌       | ❌      | ❌    | ❌  |
| **features**     | ✅     | ✅       | ❌       | ❌      | ❌    | ❌  |
| **widgets**      | ✅     | ✅       | ✅       | ❌      | ❌    | ❌  |
| **pages**        | ✅     | ✅       | ✅       | ✅      | -     | ❌  |
| **app**          | ✅     | ✅       | ✅       | ✅      | ✅    | -   |

> Подробные примеры кода и стратегия миграции — в `.ai-factory/ARCHITECTURE.md`

## Current Project Structure

```
src/
├── App.tsx                    # Root component (state + layout)
├── main.tsx                   # ReactDOM entry
├── index.css                  # Tailwind import
├── components/
│   ├── Button.tsx             # Reusable button (4 variants)
│   ├── IdeaCard.tsx           # Video idea card
│   └── VideoPlanner.tsx       # Plan viewer + 10 AI tools
├── services/
│   └── geminiService.ts       # All 12 Gemini API functions
└── utils/
    └── cn.ts                  # clsx + twMerge
```

## Data Flow

```
User Input → App.tsx (useState)
                │
                ├─→ geminiService.generateVideoIdeas()
                │       │
                │       └─→ Gemini API (JSON response)
                │               │
                │               └─→ setIdeas(parsed JSON)
                │                       │
                │                       └─→ IdeaCard[] render
                │
                └─→ User selects idea
                        │
                        └─→ geminiService.generateVideoPlan()
                                │
                                └─→ setPlanMarkdown(response.text)
                                        │
                                        └─→ VideoPlanner render (Markdown + tools)
```

1. Пользователь вводит тему и выбирает нишу
2. `App.tsx` вызывает `generateVideoIdeas()` → Gemini возвращает JSON с 5 идеями
3. Пользователь кликает на идею → вызов `generateVideoPlan()` → Gemini возвращает Markdown
4. `VideoPlanner` рендерит план и предлагает 10+ дополнительных AI-инструментов

## Key Patterns

### Gemini Structured Output
Все функции, возвращающие типизированные данные, используют `responseSchema`:

```typescript
config: {
  responseMimeType: "application/json",
  responseSchema: { type: Type.ARRAY, items: { ... } }
}
```

### Dual Niche System
Тип `Niche = 'psychology' | 'ambient'` переключает:
- Системные промпты для Gemini
- UI (иконки, цвета, текст)
- Пресеты тем

### Bilingual Content Strategy
- UI текст: **русский** (targetAudience, whyItWorks, инструкции)
- AI-generated контент: **английский** (title, hook, keywords — для Tier-1 аудитории)

## See Also

- [AI Features](ai-features.md) — подробное описание всех 12 AI-функций
- [Configuration](configuration.md) — переменные окружения и настройки
