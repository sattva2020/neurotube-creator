<template>
  <q-page class="neuro-page">
    <!-- === Hero Section === -->
    <section ref="heroRef" class="hero-section">
      <!-- Neural canvas background -->
      <NeuralBackground />

      <!-- Hero content -->
      <div class="hero-content">
        <!-- Niche Toggle -->
        <div class="hero-toggle" ref="nicheToggleRef">
          <NicheToggle />
        </div>

        <!-- Title -->
        <h1 class="hero-title" ref="heroTitleRef">
          <template v-if="nicheStore.active === 'psychology'">
            <span
              v-for="(word, i) in ['Найдите', 'Идею', 'для', 'Вирусного', 'Видео']"
              :key="`psych-${i}`"
              class="hero-word"
            >{{ word }}{{ i < 4 ? '\u00a0' : '' }}</span>
          </template>
          <template v-else>
            <span
              v-for="(word, i) in ['Создайте', 'Эмбиент-Контент', 'с', 'Высоким', 'RPM']"
              :key="`ambient-${i}`"
              class="hero-word"
            >{{ word }}{{ i < 4 ? '\u00a0' : '' }}</span>
          </template>
        </h1>

        <!-- Subtitle -->
        <p class="hero-subtitle" ref="heroSubtitleRef">
          {{ nicheStore.active === 'psychology'
            ? 'Введите тему по психологии или нейробиологии — ИИ сгенерирует идеи, кликабельные названия и полные сценарии.'
            : 'Введите настроение, частоту или окружение — ИИ сгенерирует концепции для 2-8 часовых лупов и визуальные стратегии.' }}
        </p>

        <!-- Search Form -->
        <q-form @submit.prevent="onSubmit" class="search-form" ref="searchFormRef">
          <div class="search-wrapper">
            <q-input
              v-model="topic"
              borderless
              :placeholder="nicheStore.active === 'psychology'
                ? 'напр., Как травма влияет на память...'
                : 'напр., Дождь в Токио ночью для глубокого сна...'"
              :loading="ideasStore.isLoading"
              class="search-input"
              @focus="onSearchFocus"
              @blur="onSearchBlur"
            >
              <template #prepend>
                <q-icon name="search" class="search-icon" />
              </template>
            </q-input>

            <q-btn
              type="submit"
              class="search-btn glow-btn"
              unelevated
              no-caps
              :loading="ideasStore.isLoading"
              :disable="!topic.trim()"
              ref="searchBtnRef"
            >
              <q-icon name="auto_awesome" class="q-mr-xs" />
              Сгенерировать
            </q-btn>
          </div>
        </q-form>

        <!-- Preset Chips -->
        <div class="chips-wrapper" ref="chipsWrapperRef">
          <span class="chips-label">В тренде:</span>
          <q-chip
            v-for="preset in currentPresets"
            :key="preset"
            clickable
            class="neuro-chip"
            @click="onChipClick(preset)"
          >
            {{ preset }}
          </q-chip>
        </div>
      </div>
    </section>

    <!-- === Error Banner === -->
    <q-banner v-if="error" class="error-banner" rounded>
      <template #avatar>
        <q-icon name="error" color="negative" />
      </template>
      {{ error }}
      <template #action>
        <q-btn flat label="Закрыть" color="negative" @click="error = ''" />
      </template>
    </q-banner>

    <!-- === Ideas Section === -->
    <section class="ideas-section">
      <div class="section-inner">
        <!-- Loading state -->
        <template v-if="ideasStore.isLoading">
          <div class="loading-state">
            <div class="loading-spinner">
              <q-spinner-orbit color="cyan" size="56px" />
            </div>
            <p class="loading-text">ИИ анализирует тему и генерирует идеи...</p>
          </div>
        </template>

        <!-- Generated ideas -->
        <template v-else-if="ideasStore.items.length > 0">
          <div class="section-header">
            <span class="section-title gradient-text">Сгенерированные Идеи</span>
            <q-badge class="neuro-badge" rounded>
              {{ ideasStore.items.length }} результатов
            </q-badge>
          </div>

          <div class="cards-list" ref="cardsListRef">
            <IdeaCard
              v-for="idea in ideasStore.items"
              :key="idea.title"
              :idea="idea"
              :is-selected="ideasStore.selected?.title === idea.title"
              @select="onSelectIdea"
              @generate-plan="onGeneratePlan"
            />
          </div>
        </template>

        <!-- History -->
        <template v-else>
          <div class="section-header">
            <span class="section-title gradient-text">Сохранённые Идеи</span>
            <q-spinner-dots v-if="historyLoading" color="primary" size="24px" />
            <q-badge v-else class="neuro-badge" rounded>
              {{ ideasHistory.length }}
            </q-badge>
          </div>

          <div v-if="historyError" class="text-negative q-mb-md">
            {{ historyError }}
          </div>

          <div
            v-if="!historyLoading && ideasHistory.length === 0"
            class="empty-state"
          >
            <q-icon name="lightbulb" size="48px" class="glow-text q-mb-md" />
            <div class="text-muted">Пока нет сохранённых идей. Сгенерируйте свои первые!</div>
          </div>

          <div v-else class="cards-list" ref="historyCardsRef">
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
        </template>
      </div>
    </section>

    <!-- Features Section injected below ideas -->
    <FeaturesSection />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { VideoIdea } from '@neurotube/shared';
import { useNicheStore } from '@/stores/niche';
import { useIdeasStore } from '@/stores/ideas';
import { useGenerateIdeas } from '@/composables/useGenerateIdeas';
import { useIdeasHistory } from '@/composables/useIdeasHistory';
import { useAnalytics } from '@/composables/useAnalytics';
import NicheToggle from '@/components/NicheToggle.vue';
import IdeaCard from '@/components/IdeaCard.vue';
import NeuralBackground from '@/components/NeuralBackground.vue';
import FeaturesSection from '@/components/FeaturesSection.vue';

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

// --- Template refs ---
const heroRef = ref<HTMLElement | null>(null);
const heroTitleRef = ref<HTMLElement | null>(null);
const heroSubtitleRef = ref<HTMLElement | null>(null);
const searchFormRef = ref<HTMLElement | null>(null);
const chipsWrapperRef = ref<HTMLElement | null>(null);
const nicheToggleRef = ref<HTMLElement | null>(null);
const cardsListRef = ref<HTMLElement | null>(null);
const historyCardsRef = ref<HTMLElement | null>(null);

// --- State ---
const topic = ref('');
const error = ref('');

let gsapCtx: gsap.Context | null = null;
let heroTimeline: gsap.core.Timeline | null = null;
let cardsScrollTrigger: ScrollTrigger | null = null;

const currentPresets = computed(() => PRESETS[nicheStore.active] ?? []);

// --- GSAP: Hero entrance animation ---
function playHeroEntrance(): void {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    console.debug('[IndexPage] Reduced motion — skipping hero entrance');
    return;
  }

  if (heroTimeline) {
    heroTimeline.kill();
    heroTimeline = null;
  }

  const words = heroTitleRef.value?.querySelectorAll('.hero-word') ?? [];
  const subtitle = heroSubtitleRef.value;
  const form = searchFormRef.value;
  const chips = chipsWrapperRef.value?.querySelectorAll('.neuro-chip') ?? [];

  console.debug('[IndexPage] Playing hero entrance, words:', words.length, 'chips:', chips.length);

  heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Title words stagger in
  if (words.length) {
    heroTimeline.fromTo(
      words,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.08 },
    );
  }

  // Subtitle
  if (subtitle) {
    heroTimeline.from(
      subtitle,
      { opacity: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.4',
    );
  }

  // Search form
  if (form) {
    heroTimeline.from(
      form,
      { y: 30, opacity: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.3',
    );
  }

  // Chips stagger
  if (chips.length) {
    heroTimeline.from(
      chips,
      { y: 20, opacity: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' },
      '-=0.2',
    );
  }
}

// --- GSAP: Niche switch title flash ---
async function animateNicheSwitch(): Promise<void> {
  const words = heroTitleRef.value?.querySelectorAll('.hero-word') ?? [];
  if (!words.length) return;

  console.debug('[IndexPage] Animating niche switch transition');

  await gsap.to(words, { opacity: 0, y: -20, duration: 0.2, stagger: 0.04 });
  await nextTick();
  await gsap.fromTo(
    heroTitleRef.value?.querySelectorAll('.hero-word') ?? [],
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out' },
  );
}

// --- Search focus glow ---
function onSearchFocus(): void {
  console.debug('[IndexPage] Search focused');
  const wrapper = document.querySelector('.search-wrapper');
  if (wrapper) {
    gsap.to(wrapper, {
      boxShadow: '0 0 30px rgba(0, 245, 255, 0.4)',
      duration: 0.3,
    });
  }
}

function onSearchBlur(): void {
  const wrapper = document.querySelector('.search-wrapper');
  if (wrapper) {
    gsap.to(wrapper, {
      boxShadow: '0 0 0px rgba(0, 245, 255, 0)',
      duration: 0.3,
    });
  }
}

// --- Chip click: set topic + re-animate chip ---
function onChipClick(preset: string): void {
  topic.value = preset;
  console.debug('[IndexPage] Chip clicked:', preset);
}

// --- Cards ScrollTrigger ---
function initCardsScrollTrigger(container: HTMLElement | null): void {
  if (!container) return;
  const cards = container.querySelectorAll('.idea-card-wrapper');
  if (!cards.length) return;

  console.debug('[IndexPage] Registering ScrollTrigger for', cards.length, 'cards');

  if (cardsScrollTrigger) {
    cardsScrollTrigger.kill();
  }

  gsap.from(cards, {
    scrollTrigger: {
      trigger: container,
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
    y: 60,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power2.out',
  });
}

// --- Event handlers ---
async function onSubmit() {
  console.debug('[IndexPage] Submit topic:', topic.value);
  trackEvent('search_submitted', { topic: topic.value, niche: nicheStore.active });
  error.value = '';
  try {
    await generate(topic.value);
    await nextTick();
    initCardsScrollTrigger(cardsListRef.value);
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

// --- Lifecycle ---
onMounted(() => {
  console.debug('[IndexPage] Mounted, niche:', nicheStore.active);
  fetchHistory(nicheStore.active);

  gsapCtx = gsap.context(() => {
    playHeroEntrance();
  }, heroRef.value ?? undefined);
});

onUnmounted(() => {
  console.debug('[IndexPage] Unmounting, cleaning up GSAP');
  if (gsapCtx) gsapCtx.revert();
  if (heroTimeline) heroTimeline.kill();
  ScrollTrigger.getAll().forEach((t) => t.kill());
});

watch(() => nicheStore.active, async (niche) => {
  console.debug('[IndexPage] Niche changed:', niche);
  fetchHistory(niche);
  await nextTick();
  animateNicheSwitch();
});

watch(cardsListRef, (el) => {
  if (el) {
    nextTick(() => initCardsScrollTrigger(el));
  }
});

watch(historyCardsRef, (el) => {
  if (el) {
    nextTick(() => initCardsScrollTrigger(el));
  }
});
</script>

<style scoped lang="scss">
// Page base
.neuro-page {
  background: var(--neuro-bg);
  color: var(--neuro-text);
  min-height: 100vh;
}

// ========================
// Hero Section
// ========================
.hero-section {
  position: relative;
  min-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  // Gradient overlay above canvas
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 50% 0%, rgba(0, 245, 255, 0.06) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.04) 0%, transparent 50%),
      linear-gradient(to bottom, transparent 70%, var(--neuro-bg) 100%);
    pointer-events: none;
    z-index: 1;
  }
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 80px 24px 40px;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
}

.hero-toggle {
  margin-bottom: 40px;
}

// ========================
// Hero Title
// ========================
.hero-title {
  font-size: clamp(2.2rem, 6vw, 4rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin: 0 0 24px;
  background: linear-gradient(135deg, #e2e8f0 0%, #00f5ff 50%, #8b5cf6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-word {
  display: inline-block;
  will-change: transform, opacity;
}

// ========================
// Hero Subtitle
// ========================
.hero-subtitle {
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  color: var(--neuro-text-muted);
  max-width: 580px;
  margin: 0 auto 36px;
  line-height: 1.6;
  will-change: opacity;
}

// ========================
// Search Form
// ========================
.search-form {
  max-width: 620px;
  margin: 0 auto 28px;
  will-change: transform, opacity;
}

.search-wrapper {
  display: flex;
  align-items: center;
  background: var(--neuro-bg-secondary);
  border: 1px solid var(--neuro-border);
  border-radius: 16px;
  padding: 6px 6px 6px 16px;
  transition: border-color 0.3s ease;

  &:focus-within {
    border-color: var(--neuro-accent);
  }

  .search-input {
    flex: 1;
    color: var(--neuro-text);

    :deep(.q-field__control) {
      background: transparent;
      height: 48px;

      &::before,
      &::after {
        display: none;
      }
    }

    :deep(.q-field__native) {
      color: var(--neuro-text);
      font-size: 1rem;

      &::placeholder {
        color: var(--neuro-text-dim);
      }
    }

    :deep(.q-field__prepend) {
      padding-right: 8px;
    }
  }

  .search-icon {
    color: var(--neuro-text-muted);
    font-size: 20px;
  }

  .search-btn {
    background: linear-gradient(135deg, var(--neuro-accent), var(--neuro-accent-purple)) !important;
    color: var(--neuro-bg) !important;
    font-weight: 600;
    border-radius: 12px;
    padding: 10px 20px;
    white-space: nowrap;
    transition: box-shadow 0.3s ease, transform 0.2s ease;

    &:hover:not(:disabled) {
      box-shadow: 0 0 24px rgba(0, 245, 255, 0.4);
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.4;
    }
  }
}

// ========================
// Chips
// ========================
.chips-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}

.chips-label {
  font-size: 0.75rem;
  color: var(--neuro-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.neuro-chip {
  background: rgba(0, 245, 255, 0.05) !important;
  color: var(--neuro-text-muted) !important;
  border: 1px solid rgba(0, 245, 255, 0.15) !important;
  border-radius: 20px !important;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.25s ease;
  will-change: transform, opacity;

  &:hover {
    background: rgba(0, 245, 255, 0.1) !important;
    color: var(--neuro-accent) !important;
    border-color: rgba(0, 245, 255, 0.4) !important;
    box-shadow: 0 0 12px rgba(0, 245, 255, 0.15);
  }
}

// ========================
// Error Banner
// ========================
.error-banner {
  max-width: 720px;
  margin: 0 auto 24px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  color: #fca5a5;
}

// ========================
// Ideas / History Section
// ========================
.ideas-section {
  padding: 40px 24px 60px;
}

.section-inner {
  max-width: 680px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 700;
}

.neuro-badge {
  background: rgba(0, 245, 255, 0.1) !important;
  color: var(--neuro-accent) !important;
  border: 1px solid rgba(0, 245, 255, 0.2);
  padding: 4px 10px;
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px 24px;
  color: var(--neuro-text-muted);

  .text-muted {
    font-size: 1rem;
    color: var(--neuro-text-dim);
  }
}

// ========================
// Loading State
// ========================
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 48px 24px;
  background: rgba(0, 245, 255, 0.03);
  border: 1px solid rgba(0, 245, 255, 0.1);
  border-radius: 16px;
}

.loading-spinner {
  margin-bottom: 20px;
}

.loading-text {
  font-size: 1rem;
  color: var(--neuro-text-muted);
  animation: pulse-text 2s ease-in-out infinite;
}

@keyframes pulse-text {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

// ========================
// Responsive
// ========================
@media (max-width: 600px) {
  .hero-section {
    min-height: 70vh;
  }

  .hero-content {
    padding: 60px 16px 32px;
  }

  .search-wrapper {
    flex-direction: column;
    padding: 12px;
    gap: 10px;
    border-radius: 16px;

    .search-btn {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>
