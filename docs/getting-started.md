[Back to README](../README.md) · [Architecture →](architecture.md)

# Getting Started

## Prerequisites

- **Node.js** 18+ (рекомендуется LTS)
- **npm** (поставляется с Node.js)
- **Gemini API Key** — получить на [Google AI Studio](https://aistudio.google.com/apikey)

## Installation

```bash
git clone <repository-url>
cd neurotube-creator
npm install
```

## API Key Setup

### Вариант 1: Локальная разработка

Создайте файл `.env.local` в корне проекта:

```bash
GEMINI_API_KEY="your-gemini-api-key-here"
```

> `.env.local` уже в `.gitignore` — ваш ключ не попадёт в репозиторий.

### Вариант 2: Google AI Studio

При запуске в Google AI Studio ключ инжектируется автоматически через панель Secrets. Ручная настройка не требуется.

## Running Locally

```bash
npm run dev
```

Приложение запустится на `http://localhost:3000`.

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Dev-сервер с HMR на порту 3000 |
| `build` | `npm run build` | Продакшн-сборка в `dist/` |
| `preview` | `npm run preview` | Превью продакшн-сборки |
| `lint` | `npm run lint` | TypeScript type-check (без эмита) |
| `clean` | `npm run clean` | Удалить `dist/` |

## Verify It Works

1. Откройте `http://localhost:3000` в браузере
2. Выберите нишу: "Психология и Наука" или "Эмбиент и Медитация"
3. Введите тему (например, "Dopamine Detox")
4. Нажмите "Сгенерировать" — должны появиться 5 идей для видео

> Если видите ошибку API — проверьте, что `GEMINI_API_KEY` в `.env.local` корректен и имеет доступ к Gemini API.

## Next Steps

- [Architecture](architecture.md) — как устроен проект
- [Configuration](configuration.md) — все переменные окружения
- [AI Features](ai-features.md) — описание всех AI-функций

## See Also

- [Configuration](configuration.md) — подробнее о переменных окружения
- [Architecture](architecture.md) — структура проекта и FSD
