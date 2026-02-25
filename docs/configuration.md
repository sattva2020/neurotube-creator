[← Architecture](architecture.md) · [Back to README](../README.md) · [AI Features →](ai-features.md)

# Configuration

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | Yes | — | API-ключ Google Gemini для AI-генерации |
| `APP_URL` | No | — | URL приложения (инжектируется AI Studio при деплое) |
| `DISABLE_HMR` | No | `false` | Отключить Hot Module Replacement (используется в AI Studio) |

### GEMINI_API_KEY

Главный ключ для доступа к Gemini API. Используется для:
- Генерации текста (gemini-3-flash-preview)
- Генерации изображений (gemini-3-pro-image-preview)
- Google Search grounding (анализ ниши)

**Получить ключ:** [Google AI Studio](https://aistudio.google.com/apikey)

**Локальная настройка:**
```bash
# .env.local (не коммитится)
GEMINI_API_KEY="AIza..."
```

**AI Studio:** Ключ инжектируется автоматически через панель Secrets. Код получает его через `process.env.GEMINI_API_KEY` или `process.env.API_KEY`.

### Как ключ попадает в приложение

Vite инжектирует ключ на этапе сборки через `define` в `vite.config.ts`:

```typescript
define: {
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
}
```

> Ключ вшивается в бандл на этапе build. Для production-приложений рекомендуется использовать серверный прокси.

## Vite Configuration

Файл: `vite.config.ts`

| Настройка | Значение | Описание |
|-----------|----------|----------|
| React plugin | `@vitejs/plugin-react` | JSX transform, Fast Refresh |
| Tailwind plugin | `@tailwindcss/vite` | Tailwind CSS v4 integration |
| Path alias `@/` | `./` (project root) | Import alias для чистых путей |
| Dev server port | 3000 | `--port=3000 --host=0.0.0.0` |
| HMR | Conditional | Отключается при `DISABLE_HMR=true` |

## TypeScript Configuration

Файл: `tsconfig.json`

| Настройка | Значение | Описание |
|-----------|----------|----------|
| Target | ES2022 | Современный JS |
| Module | ESNext | ES modules |
| JSX | react-jsx | Automatic JSX runtime |
| Module Resolution | bundler | Vite-оптимизированное разрешение |
| Path alias | `@/*` → `./*` | Совпадает с Vite alias |

## AI Studio Integration

Приложение поддерживает глобальный объект `window.aistudio`:

```typescript
window.aistudio?.hasSelectedApiKey()  // Проверить наличие ключа
window.aistudio?.openSelectKey()      // Открыть диалог выбора ключа
```

Если `window.aistudio` не существует (локальная разработка), приложение считает, что ключ доступен через env vars.

## See Also

- [Getting Started](getting-started.md) — установка и первый запуск
- [AI Features](ai-features.md) — какие модели и API используются
