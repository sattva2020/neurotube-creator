<template>
  <q-page padding>
    <!-- Back button -->
    <q-btn
      flat
      color="primary"
      icon="arrow_back"
      label="Назад к идеям"
      no-caps
      class="q-mb-md"
      @click="router.push({ name: 'index' })"
    />

    <!-- No idea selected and no plan loaded -->
    <q-banner v-if="!ideasStore.selected && !planStore.plan && !planStore.isLoading && !loadingById" class="bg-warning text-white q-mb-md" rounded>
      <template #avatar>
        <q-icon name="warning" />
      </template>
      Идея не выбрана. Вернитесь и выберите идею.
    </q-banner>

    <!-- Loading -->
    <div v-if="planStore.isLoading || loadingById" class="column items-center q-pa-xl">
      <q-spinner-dots size="48px" color="primary" />
      <p class="text-body1 text-grey-7 q-mt-md">
        {{ loadingById ? 'Загружаем план...' : 'Генерируем план видео...' }}
      </p>
    </div>

    <!-- Error -->
    <q-banner v-if="error" class="bg-negative text-white q-mb-md" rounded>
      <template #avatar>
        <q-icon name="error" />
      </template>
      {{ error }}
      <template #action>
        <q-btn v-if="ideasStore.selected" flat label="Повторить" @click="generatePlan" />
      </template>
    </q-banner>

    <!-- Plan content -->
    <div v-if="planStore.markdown && !planStore.isLoading && !loadingById" class="plan-content">
      <div class="row items-center justify-between q-mb-md">
        <span class="text-h5 text-weight-bold">{{ planTitle }}</span>
        <q-btn
          flat
          round
          icon="content_copy"
          color="grey-7"
          @click="copyToClipboard"
        >
          <q-tooltip>Копировать в буфер</q-tooltip>
        </q-btn>
      </div>

      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="plan-markdown text-body1" v-html="renderedMarkdown" />

      <!-- AI Tools button -->
      <q-separator class="q-my-lg" />
      <q-btn
        color="primary"
        icon="build"
        label="AI-инструменты"
        no-caps
        @click="router.push({ name: 'tools' })"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { copyToClipboard as quasarCopy } from 'quasar';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import { usePlanStore } from '@/stores/plan';
import { useIdeasStore } from '@/stores/ideas';
import { useGeneratePlan } from '@/composables/useGeneratePlan';
import { usePlansHistory } from '@/composables/usePlansHistory';

const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

const router = useRouter();
const route = useRoute();
const planStore = usePlanStore();
const ideasStore = useIdeasStore();
const { generate } = useGeneratePlan();
const { fetchById } = usePlansHistory();

const error = ref('');
const loadingById = ref(false);

const planTitle = computed(() =>
  ideasStore.selected?.title ?? planStore.plan?.title ?? 'План видео',
);

const renderedMarkdown = computed(() => {
  if (!planStore.markdown) return '';
  return DOMPurify.sanitize(md.render(planStore.markdown));
});

async function loadPlanById(id: string) {
  console.debug('[PlanPage] Loading plan by id:', id);
  loadingById.value = true;
  error.value = '';

  try {
    const plan = await fetchById(id);
    if (plan) {
      planStore.setPlan(plan);
      console.debug('[PlanPage] Plan loaded from DB:', plan.title);
    } else {
      error.value = 'План не найден.';
      console.debug('[PlanPage] Plan not found:', id);
    }
  } catch (e) {
    error.value = 'Не удалось загрузить план.';
    console.error('[PlanPage] Failed to load plan:', e);
  } finally {
    loadingById.value = false;
  }
}

async function generatePlan() {
  if (!ideasStore.selected) return;
  console.debug('[PlanPage] Generating plan for:', ideasStore.selected.title);
  error.value = '';
  try {
    await generate();
  } catch (e) {
    error.value = 'Не удалось сгенерировать план. Попробуйте ещё раз.';
    console.error('[PlanPage] Generate plan failed:', e);
  }
}

function copyToClipboard() {
  console.debug('[PlanPage] Copying plan to clipboard');
  quasarCopy(planStore.markdown)
    .then(() => console.debug('[PlanPage] Copied successfully'))
    .catch((err: unknown) => console.error('[PlanPage] Copy failed:', err));
}

onMounted(() => {
  const id = route.params.id as string | undefined;
  console.debug('[PlanPage] Mounted', { id, selectedIdea: ideasStore.selected?.title ?? 'none' });

  if (id) {
    // Deep-link: load plan by ID from DB
    loadPlanById(id);
  } else if (ideasStore.selected && !planStore.markdown) {
    // Generate from selected idea
    generatePlan();
  }
});

watch(() => ideasStore.selected, (newIdea) => {
  if (newIdea && !planStore.markdown && !route.params.id) {
    console.debug('[PlanPage] Selected idea changed, generating plan');
    generatePlan();
  }
});
</script>

<style scoped lang="scss">
.plan-markdown {
  :deep(h1),
  :deep(h2),
  :deep(h3) {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 700;
  }

  :deep(h1) { font-size: 1.75rem; }
  :deep(h2) { font-size: 1.4rem; }
  :deep(h3) { font-size: 1.15rem; }

  :deep(p) {
    margin-bottom: 0.75em;
    line-height: 1.7;
  }

  :deep(ul),
  :deep(ol) {
    margin-bottom: 1em;
    padding-left: 1.5em;
  }

  :deep(li) {
    margin-bottom: 0.25em;
  }

  :deep(blockquote) {
    border-left: 3px solid var(--q-primary);
    padding-left: 1em;
    margin: 1em 0;
    color: #555;
  }

  :deep(code) {
    background: #f5f5f5;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
  }
}
</style>
