<template>
  <q-page padding>
    <!-- Niche Toggle -->
    <div class="flex flex-center q-mb-lg">
      <NicheToggle />
    </div>

    <!-- Hero Section -->
    <div class="text-center q-mb-xl" style="max-width: 720px; margin: 0 auto">
      <h1 class="text-h3 text-weight-bold q-mb-sm">
        {{ nicheStore.active === 'psychology'
          ? 'Найдите Идею для Вирусного Видео'
          : 'Создайте Эмбиент-Контент с Высоким RPM' }}
      </h1>
      <p class="text-body1 text-grey-7 q-mb-lg">
        {{ nicheStore.active === 'psychology'
          ? 'Введите тему по психологии или нейробиологии, и наш ИИ сгенерирует идеи для видео, кликабельные названия и полные сценарии.'
          : 'Введите настроение, частоту или окружение. Наш ИИ сгенерирует концепции для 2-8 часовых лупов, советы по звуку и визуальные стратегии.' }}
      </p>

      <!-- Search Form -->
      <q-form @submit.prevent="onSubmit" class="q-mb-md">
        <q-input
          v-model="topic"
          outlined
          rounded
          :placeholder="nicheStore.active === 'psychology'
            ? 'напр., Как травма влияет на память...'
            : 'напр., Дождь в Токио ночью для глубокого сна...'"
          :loading="ideasStore.isLoading"
          class="search-input"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
          <template #append>
            <q-btn
              type="submit"
              color="primary"
              rounded
              unelevated
              no-caps
              :loading="ideasStore.isLoading"
              :disable="!topic.trim()"
              label="Сгенерировать"
              icon="auto_awesome"
            />
          </template>
        </q-input>
      </q-form>

      <!-- Preset Chips -->
      <div class="row justify-center q-gutter-xs">
        <span class="text-caption text-grey-6 self-center q-mr-sm">В тренде:</span>
        <q-chip
          v-for="preset in currentPresets"
          :key="preset"
          clickable
          outline
          :color="nicheStore.active === 'psychology' ? 'indigo' : 'green'"
          size="sm"
          @click="topic = preset"
        >
          {{ preset }}
        </q-chip>
      </div>
    </div>

    <!-- Error Banner -->
    <q-banner v-if="error" class="bg-negative text-white q-mb-md" rounded>
      <template #avatar>
        <q-icon name="error" />
      </template>
      {{ error }}
      <template #action>
        <q-btn flat label="Закрыть" @click="error = ''" />
      </template>
    </q-banner>

    <!-- Ideas List -->
    <div v-if="ideasStore.items.length > 0" style="max-width: 640px; margin: 0 auto">
      <div class="row items-center justify-between q-mb-md">
        <span class="text-h6">Сгенерированные Идеи</span>
        <q-badge color="grey-3" text-color="grey-8" rounded>
          {{ ideasStore.items.length }} результатов
        </q-badge>
      </div>

      <div class="column q-gutter-md">
        <IdeaCard
          v-for="(idea, idx) in ideasStore.items"
          :key="idx"
          :idea="idea"
          :is-selected="ideasStore.selected?.title === idea.title"
          @select="onSelectIdea"
          @generate-plan="onGeneratePlan"
        />
      </div>
    </div>

    <!-- Saved Ideas History -->
    <div v-if="!ideasStore.items.length" style="max-width: 640px; margin: 0 auto">
      <div class="row items-center justify-between q-mb-md">
        <span class="text-h6">Сохранённые Идеи</span>
        <q-spinner-dots v-if="historyLoading" color="primary" size="24px" />
        <q-badge v-else color="grey-3" text-color="grey-8" rounded>
          {{ ideasHistory.length }}
        </q-badge>
      </div>

      <div v-if="historyError" class="text-negative q-mb-md">
        {{ historyError }}
      </div>

      <div v-if="!historyLoading && ideasHistory.length === 0" class="text-center text-grey-5 q-pa-xl">
        <q-icon name="lightbulb" size="48px" class="q-mb-sm" />
        <div>Пока нет сохранённых идей. Сгенерируйте свои первые!</div>
      </div>

      <div v-else class="column q-gutter-md">
        <IdeaCard
          v-for="idea in ideasHistory"
          :key="idea.id"
          :idea="idea"
          :is-selected="ideasStore.selected?.title === idea.title"
          @select="onSelectIdea"
          @generate-plan="onGeneratePlan"
        >
          <template #actions>
            <q-btn
              flat
              round
              dense
              icon="delete"
              color="negative"
              size="sm"
              @click.stop="onDeleteIdea(idea.id!)"
            >
              <q-tooltip>Удалить</q-tooltip>
            </q-btn>
          </template>
        </IdeaCard>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { VideoIdea } from '@neurotube/shared';
import { useNicheStore } from '@/stores/niche';
import { useIdeasStore } from '@/stores/ideas';
import { useGenerateIdeas } from '@/composables/useGenerateIdeas';
import { useIdeasHistory } from '@/composables/useIdeasHistory';
import { useAnalytics } from '@/composables/useAnalytics';
import NicheToggle from '@/components/NicheToggle.vue';
import IdeaCard from '@/components/IdeaCard.vue';

const PRESETS: Record<string, string[]> = {
  psychology: [
    'Dopamine Detox',
    'Procrastination',
    'Anxiety & Overthinking',
    'Neuroplasticity',
    'Burnout Recovery',
    'Habit Formation',
  ],
  ambient: [
    'Urban Rain Focus',
    '432Hz Deep Healing',
    'Tokyo Night Walk',
    'Morning Forest Loop',
    '528Hz DNA Repair',
    'Binaural Beats Study',
  ],
};

const router = useRouter();
const nicheStore = useNicheStore();
const ideasStore = useIdeasStore();
const { generate } = useGenerateIdeas();
const {
  history: ideasHistory,
  isLoading: historyLoading,
  error: historyError,
  fetchAll: fetchHistory,
  remove: removeIdea,
} = useIdeasHistory();

const { trackEvent } = useAnalytics();

const topic = ref('');
const error = ref('');

const currentPresets = computed(() => PRESETS[nicheStore.active] ?? []);

async function onSubmit() {
  console.debug('[IndexPage] Submit topic:', topic.value);
  trackEvent('search_submitted', { topic: topic.value, niche: nicheStore.active });
  error.value = '';
  try {
    await generate(topic.value);
  } catch (e) {
    error.value = 'Не удалось сгенерировать идеи. Попробуйте ещё раз.';
    console.error('[IndexPage] Generate ideas failed:', e);
  }
}

function onSelectIdea(idea: VideoIdea) {
  console.debug('[IndexPage] Idea selected:', idea.title);
  trackEvent('idea_selected', { title: idea.title, niche: idea.niche });
  ideasStore.selectIdea(idea);
}

function onGeneratePlan(idea: VideoIdea) {
  console.debug('[IndexPage] Generate plan for:', idea.title);
  ideasStore.selectIdea(idea);
  router.push({ name: 'plan' });
}

async function onDeleteIdea(id: string) {
  console.debug('[IndexPage] Delete idea:', id);
  trackEvent('idea_deleted', { id });
  try {
    await removeIdea(id);
  } catch {
    console.error('[IndexPage] Failed to delete idea:', id);
  }
}

// Load history on mount and when niche changes
onMounted(() => {
  console.debug('[IndexPage] Mounted, niche:', nicheStore.active);
  fetchHistory(nicheStore.active);
});

watch(() => nicheStore.active, (niche) => {
  console.debug('[IndexPage] Niche changed, reloading history:', niche);
  fetchHistory(niche);
});
</script>

<style scoped lang="scss">
.search-input :deep(.q-field__control) {
  padding-right: 4px;
}
</style>
