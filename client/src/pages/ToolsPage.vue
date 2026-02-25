<template>
  <q-page padding>
    <!-- Back button -->
    <q-btn
      flat
      color="primary"
      icon="arrow_back"
      label="Назад к плану"
      no-caps
      class="q-mb-md"
      @click="router.push({ name: 'plan' })"
    />

    <div class="text-h5 text-weight-bold q-mb-sm">AI-инструменты</div>
    <p class="text-body2 text-grey-7 q-mb-lg">
      10 инструментов для создания контента. Выберите инструмент, чтобы начать.
    </p>

    <!-- Tool cards grid -->
    <div class="row q-col-gutter-md">
      <div
        v-for="tool in tools"
        :key="tool.key"
        class="col-12 col-sm-6 col-md-4"
      >
        <ToolCard
          :title="tool.title"
          :description="tool.description"
          :icon="tool.icon"
          :color="tool.color"
          :loading="toolStore.loading[tool.key]"
          @click="openDialog(tool.key)"
        />
      </div>
    </div>

    <!-- Dialogs -->
    <ThumbnailDialog v-model="dialogs.thumbnail" />
    <TitlesDialog v-model="dialogs.titles" />
    <BrandingDialog v-model="dialogs.branding" />
    <MarkdownToolDialog
      v-for="mdTool in markdownTools"
      :key="mdTool.toolKey"
      v-model="dialogs[mdTool.toolKey]"
      :config="mdTool"
    />
  </q-page>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToolResultsStore } from '@/stores/toolResults';
import type { ToolKey } from '@/stores/toolResults';
import ToolCard from '@/components/ToolCard.vue';
import ThumbnailDialog from '@/components/ThumbnailDialog.vue';
import TitlesDialog from '@/components/TitlesDialog.vue';
import BrandingDialog from '@/components/BrandingDialog.vue';
import MarkdownToolDialog from '@/components/MarkdownToolDialog.vue';
import type { MarkdownToolConfig } from '@/components/MarkdownToolDialog.vue';
import { useGenerateDescription } from '@/composables/useGenerateDescription';
import { useGenerateNotebookLM } from '@/composables/useGenerateNotebookLM';
import { useGenerateShorts } from '@/composables/useGenerateShorts';
import { useAnalyzeNiche } from '@/composables/useAnalyzeNiche';
import { useGenerateMonetization } from '@/composables/useGenerateMonetization';
import { useGenerateRoadmap } from '@/composables/useGenerateRoadmap';
import { useGenerateSuno } from '@/composables/useGenerateSuno';

const router = useRouter();
const toolStore = useToolResultsStore();

// Composable instances for markdown tools
const descriptionComposable = useGenerateDescription();
const notebookLMComposable = useGenerateNotebookLM();
const shortsComposable = useGenerateShorts();
const nicheAnalysisComposable = useAnalyzeNiche();
const monetizationComposable = useGenerateMonetization();
const roadmapComposable = useGenerateRoadmap();
const sunoComposable = useGenerateSuno();

// Tool card definitions
const tools: { key: ToolKey; title: string; description: string; icon: string; color: string }[] = [
  { key: 'thumbnail', title: 'Превью', description: 'AI-генерация обложки для видео', icon: 'image', color: 'deep-purple' },
  { key: 'titles', title: 'Заголовки', description: 'Вирусные заголовки для видео', icon: 'title', color: 'teal' },
  { key: 'description', title: 'Описание', description: 'SEO-оптимизированное описание', icon: 'description', color: 'blue' },
  { key: 'branding', title: 'Брендинг', description: 'Название канала, аватар, баннер', icon: 'palette', color: 'pink' },
  { key: 'notebooklm', title: 'NotebookLM', description: 'Документ для AI-подкаста', icon: 'menu_book', color: 'indigo' },
  { key: 'shorts', title: 'Shorts', description: '3 идеи для коротких видео', icon: 'video_library', color: 'red' },
  { key: 'nicheAnalysis', title: 'Анализ ниши', description: 'Конкурентный анализ с поиском', icon: 'analytics', color: 'orange' },
  { key: 'monetization', title: 'Монетизация', description: 'Тексты для Patreon/Boosty', icon: 'attach_money', color: 'green' },
  { key: 'roadmap', title: 'Контент-план', description: '30-дневный план публикаций', icon: 'calendar_month', color: 'cyan' },
  { key: 'suno', title: 'Suno Промпт', description: 'Промпт для генерации музыки', icon: 'music_note', color: 'amber' },
];

// Markdown tool configs (7 tools that return markdown)
const markdownTools: MarkdownToolConfig[] = [
  {
    title: 'Генератор описания',
    icon: 'description',
    color: 'blue',
    toolKey: 'description',
    fields: [
      { key: 'videoTitle', label: 'Заголовок видео', placeholder: 'Введите заголовок...' },
      { key: 'planMarkdown', label: 'План видео', placeholder: 'Вставьте план видео (markdown)...', autogrow: true },
      { key: 'niche', label: 'Ниша', placeholder: 'psychology или ambient' },
    ],
    generateFn: (...args) => descriptionComposable.generate(args[0], args[1], args[2]),
  },
  {
    title: 'NotebookLM документ',
    icon: 'menu_book',
    color: 'indigo',
    toolKey: 'notebooklm',
    fields: [
      { key: 'videoTitle', label: 'Заголовок видео', placeholder: 'Введите заголовок...' },
      { key: 'planMarkdown', label: 'План видео', placeholder: 'Вставьте план видео (markdown)...', autogrow: true },
      { key: 'niche', label: 'Ниша', placeholder: 'psychology или ambient' },
    ],
    generateFn: (...args) => notebookLMComposable.generate(args[0], args[1], args[2]),
  },
  {
    title: 'Идеи для Shorts',
    icon: 'video_library',
    color: 'red',
    toolKey: 'shorts',
    fields: [
      { key: 'videoTitle', label: 'Заголовок видео', placeholder: 'Введите заголовок...' },
      { key: 'planMarkdown', label: 'План видео', placeholder: 'Вставьте план видео (markdown)...', autogrow: true },
    ],
    generateFn: (...args) => shortsComposable.generate(args[0], args[1]),
  },
  {
    title: 'Анализ ниши',
    icon: 'analytics',
    color: 'orange',
    toolKey: 'nicheAnalysis',
    fields: [
      { key: 'videoTitle', label: 'Тема видео', placeholder: 'Введите тему...' },
      { key: 'niche', label: 'Ниша', placeholder: 'psychology или ambient' },
    ],
    generateFn: (...args) => nicheAnalysisComposable.generate(args[0], args[1]),
  },
  {
    title: 'Монетизация',
    icon: 'attach_money',
    color: 'green',
    toolKey: 'monetization',
    fields: [
      { key: 'videoTitle', label: 'Заголовок видео', placeholder: 'Введите заголовок...' },
      { key: 'niche', label: 'Ниша', placeholder: 'psychology или ambient' },
    ],
    generateFn: (...args) => monetizationComposable.generate(args[0], args[1]),
  },
  {
    title: 'Контент-план на 30 дней',
    icon: 'calendar_month',
    color: 'cyan',
    toolKey: 'roadmap',
    fields: [
      { key: 'videoTitle', label: 'Тема канала', placeholder: 'Введите тему...' },
      { key: 'niche', label: 'Ниша', placeholder: 'psychology или ambient' },
    ],
    generateFn: (...args) => roadmapComposable.generate(args[0], args[1]),
  },
  {
    title: 'Промпт для Suno.ai',
    icon: 'music_note',
    color: 'amber',
    toolKey: 'suno',
    fields: [
      { key: 'videoTitle', label: 'Заголовок видео', placeholder: 'Введите заголовок...' },
      { key: 'planMarkdown', label: 'План видео', placeholder: 'Вставьте план видео (markdown)...', autogrow: true },
    ],
    generateFn: (...args) => sunoComposable.generate(args[0], args[1]),
  },
];

// Dialog visibility state
const dialogs = reactive<Record<ToolKey, boolean>>({
  thumbnail: false,
  titles: false,
  description: false,
  branding: false,
  notebooklm: false,
  shorts: false,
  nicheAnalysis: false,
  monetization: false,
  roadmap: false,
  suno: false,
});

function openDialog(key: ToolKey) {
  console.debug('[ToolsPage] Opening dialog:', key);
  dialogs[key] = true;
}

onMounted(() => {
  console.debug('[ToolsPage] Mounted');
});
</script>
