[← Configuration](configuration.md) · [Back to README](../README.md)

# AI Features

Все AI-функции живут в `src/services/geminiService.ts`. Каждая функция — один вызов к Gemini API с нише-специфичным промптом.

## Models Used

| Model | Purpose | Output |
|-------|---------|--------|
| `gemini-3-flash-preview` | Text generation (all features except thumbnails) | Text / JSON |
| `gemini-3-pro-image-preview` | Image generation (thumbnails, avatars, banners) | Base64 image |

## Feature Reference

### 1. Generate Video Ideas
| | |
|---|---|
| **Function** | `generateVideoIdeas(topic, niche)` |
| **Returns** | `VideoIdea[]` (JSON schema) |
| **Model** | gemini-3-flash-preview |
| **Description** | 5 кликабельных идей для видео с SEO-ключами, хуками и анализом аудитории |

**Output structure:**
```typescript
interface VideoIdea {
  title: string;              // Кликабельное название (EN)
  hook: string;               // Первые 5-10 секунд сценария (EN)
  targetAudience: string;     // Целевая аудитория (RU)
  whyItWorks: string;         // Почему это сработает (RU)
  searchVolume: "High" | "Medium" | "Rising Trend";
  primaryKeyword: string;     // Главный SEO-термин (EN)
  secondaryKeywords: string[];// 3-5 long-tail ключей (EN)
}
```

### 2. Generate Video Plan
| | |
|---|---|
| **Function** | `generateVideoPlan(title, hook, niche)` |
| **Returns** | `string` (Markdown) |
| **Model** | gemini-3-flash-preview |
| **Description** | Полный план: 5 альтернативных названий, 3 концепта обложки, SEO-описание, тайм-коды, сценарий, CTA |

**Niche differences:**
- **Psychology:** Сценарий 0:00-8:00+ с хуком, проблемой, наукой, решением, CTA
- **Ambient:** Аудио-блюпринт для 2-8 часовых лупов, стратегия Suno.ai, визуальные лупы

### 3. Generate Thumbnail
| | |
|---|---|
| **Function** | `generateThumbnail(prompt)` |
| **Returns** | `string \| null` (base64 data URL) |
| **Model** | gemini-3-pro-image-preview |
| **Description** | AI-генерация обложки 16:9 в разрешении 2K |

### 4. Generate Alternative Titles
| | |
|---|---|
| **Function** | `generateAlternativeTitles(titleIdea)` |
| **Returns** | `string[]` (JSON array of 5 strings) |
| **Model** | gemini-3-flash-preview |
| **Description** | 5 вирусных альтернатив для рабочего названия |

### 5. Generate Channel Branding
| | |
|---|---|
| **Function** | `generateChannelBranding(videoTitle, niche)` |
| **Returns** | `ChannelBranding \| null` (JSON schema) |
| **Model** | gemini-3-flash-preview |
| **Description** | Названия канала, SEO-описание, промпты для аватара и баннера |

**Output structure:**
```typescript
interface ChannelBranding {
  channelNames: string[];   // 3 названия канала (EN)
  seoDescription: string;   // "О канале" описание (EN)
  avatarPrompt: string;     // Промпт для генерации аватара (EN)
  bannerPrompt: string;     // Промпт для генерации баннера (EN)
}
```

### 6. Generate Suno.ai Prompt
| | |
|---|---|
| **Function** | `generateSunoPrompt(videoTitle, planMarkdown)` |
| **Returns** | `string \| null` |
| **Model** | gemini-3-flash-preview |
| **Niche** | Ambient only |
| **Description** | Оптимизированный промпт для Suno.ai (max 120 символов) для генерации эмбиент-трека |

### 7. Generate NotebookLM Source
| | |
|---|---|
| **Function** | `generateNotebookLMSource(videoTitle, planMarkdown, niche)` |
| **Returns** | `string \| null` |
| **Model** | gemini-3-flash-preview |
| **Description** | Исходный документ для Google NotebookLM Audio Overview (подкаст с двумя ведущими) |

### 8. Generate YouTube Description
| | |
|---|---|
| **Function** | `generateYouTubeDescription(videoTitle, planMarkdown, niche)` |
| **Returns** | `string \| null` |
| **Model** | gemini-3-flash-preview |
| **Description** | SEO-описание для YouTube: хук, тайм-коды без спойлеров, хэштеги |

### 9. Generate Shorts Spinoffs
| | |
|---|---|
| **Function** | `generateShortsSpinoffs(videoTitle, planMarkdown)` |
| **Returns** | `string \| null` (Markdown) |
| **Model** | gemini-3-flash-preview |
| **Description** | 3 идеи для YouTube Shorts как воронка к основному видео |

### 10. Analyze Niche
| | |
|---|---|
| **Function** | `analyzeNiche(videoTitle, niche)` |
| **Returns** | `string \| null` (Markdown) |
| **Model** | gemini-3-flash-preview |
| **Special** | Uses `tools: [{ googleSearch: {} }]` for web grounding |
| **Description** | Анализ конкурентов, контент-гэпы, уникальные углы подачи |

### 11. Generate Monetization Copy
| | |
|---|---|
| **Function** | `generateMonetizationCopy(videoTitle, niche)` |
| **Returns** | `string \| null` (Markdown) |
| **Model** | gemini-3-flash-preview |
| **Description** | Промо-текст для Patreon/Boosty — продажа FLAC/WAV или ad-free версий |

### 12. Generate Content Roadmap
| | |
|---|---|
| **Function** | `generateContentRoadmap(videoTitle, niche)` |
| **Returns** | `string \| null` (Markdown) |
| **Model** | gemini-3-flash-preview |
| **Description** | 30-дневный контент-план: 4 длинных видео + 12 Shorts + Community Tab |

## AI Tools UI

Все 10 AI-инструментов (кроме генерации идей и плана) доступны на отдельной странице `/tools`.

### Architecture

```
ToolsPage.vue → 10 ToolCard → click → open Dialog
  Dialog → composable.generate() → useApi.post('/api/...') → backend
  Backend → response → composable → toolResultsStore → dialog renders result
```

### Dialog Types

| Dialog | Tools | Output Rendering |
|--------|-------|-----------------|
| **ThumbnailDialog** | Thumbnail | base64 → `<q-img>` + download |
| **TitlesDialog** | Titles | `string[]` → `<q-list>` with per-item copy |
| **BrandingDialog** | Branding | `ChannelBranding` → structured cards/chips |
| **MarkdownToolDialog** | Description, NotebookLM, Shorts, Niche Analysis, Monetization, Roadmap, Suno | `string` → `MarkdownResult.vue` (markdown-it) |

### State Management

Единый Pinia store `toolResults` для всех 10 инструментов:
- `results[toolKey]` — результат генерации
- `loading[toolKey]` — состояние загрузки
- `errors[toolKey]` — ошибки

Каждый composable (useGenerateThumbnail, useGenerateTitles, etc.) оборачивает вызов API и обновляет store.

### Navigation Flow

```
IndexPage → generate ideas → select idea
  → PlanPage → generate plan → "AI Tools" button
    → ToolsPage → 10 tool cards → click → dialog → generate → result
```

## Bilingual Prompt Strategy

Все промпты содержат инструкцию:

```
ВАЖНО: Канал для Tier-1! Сами идеи (title, hook, primaryKeyword, secondaryKeywords)
пиши на АНГЛИЙСКОМ ЯЗЫКЕ. Объяснения (whyItWorks, targetAudience) пиши на РУССКОМ
ЯЗЫКЕ для автора.
```

Это обеспечивает:
- Контент оптимизирован для англоязычной аудитории (высокий CPM)
- Пояснения для автора на русском (удобство работы)

## See Also

- [Architecture](architecture.md) — data flow и структура сервисов
- [Configuration](configuration.md) — настройка API-ключа Gemini
