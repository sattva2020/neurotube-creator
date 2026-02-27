<template>
  <div class="idea-card-wrapper">
    <div
      :class="['idea-card glass-card', { 'idea-card--selected': isSelected }]"
      @click="emit('select', idea)"
    >
      <!-- Card header -->
      <div class="idea-card__header">
        <h3 class="idea-card__title">{{ idea.title }}</h3>

        <!-- Badges -->
        <div class="idea-card__badges">
          <span class="idea-badge idea-badge--green">
            <q-icon name="trending_up" size="14px" class="q-mr-xs" />
            {{ idea.searchVolume }}
          </span>
          <span class="idea-badge idea-badge--purple">
            <q-icon name="people" size="14px" class="q-mr-xs" />
            {{ idea.targetAudience }}
          </span>
        </div>

        <!-- Keywords -->
        <div class="idea-card__keywords">
          <span v-if="idea.primaryKeyword" class="keyword-chip keyword-chip--primary">
            <q-icon name="sell" size="12px" class="q-mr-xs" />
            {{ idea.primaryKeyword }}
          </span>
          <span
            v-for="(kw, idx) in idea.secondaryKeywords"
            :key="idx"
            class="keyword-chip"
          >
            {{ kw }}
          </span>
        </div>
      </div>

      <!-- Hook -->
      <div class="idea-card__section">
        <div class="idea-card__section-label">
          <q-icon name="play_circle" size="14px" class="q-mr-xs" style="color: var(--neuro-accent)" />
          Хук
        </div>
        <p class="idea-card__hook">"{{ idea.hook }}"</p>
      </div>

      <!-- Why it works -->
      <div class="idea-card__section">
        <div class="idea-card__section-label">
          <q-icon name="psychology" size="14px" class="q-mr-xs" style="color: var(--neuro-accent-purple)" />
          Почему сработает
        </div>
        <p class="idea-card__body">{{ idea.whyItWorks }}</p>
      </div>

      <!-- Actions -->
      <div class="idea-card__actions" @click.stop>
        <slot name="actions" />
        <button
          class="idea-card__plan-btn"
          @click="emit('generate-plan', idea)"
        >
          <q-icon name="auto_awesome" size="16px" class="q-mr-xs" />
          Сгенерировать план
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import type { VideoIdea } from '@neurotube/shared';

const props = defineProps<{
  idea: VideoIdea;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  select: [idea: VideoIdea];
  'generate-plan': [idea: VideoIdea];
}>();

onMounted(() => {
  console.debug('[IdeaCard] Mounted:', props.idea.title);
});
</script>

<style scoped lang="scss">
.idea-card-wrapper {
  will-change: transform, opacity;
}

.idea-card {
  padding: 24px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid var(--neuro-glass-border);
  transition: border-color 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    border-color: rgba(0, 245, 255, 0.3);
    box-shadow: 0 0 20px rgba(0, 245, 255, 0.12);
  }

  &--selected {
    border-color: var(--neuro-accent) !important;
    box-shadow: 0 0 0 1px var(--neuro-accent), 0 0 24px rgba(0, 245, 255, 0.15) !important;
  }
}

// Header
.idea-card__header {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.idea-card__title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--neuro-text);
  margin: 0;
  line-height: 1.4;
}

// Badges
.idea-card__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.idea-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;

  &--green {
    background: rgba(16, 185, 129, 0.1);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.25);
  }

  &--purple {
    background: rgba(139, 92, 246, 0.1);
    color: #a78bfa;
    border: 1px solid rgba(139, 92, 246, 0.25);
  }
}

// Keywords
.idea-card__keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.keyword-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--neuro-border);
  color: var(--neuro-text-muted);

  &--primary {
    background: rgba(0, 245, 255, 0.07);
    border-color: rgba(0, 245, 255, 0.2);
    color: var(--neuro-accent);
    font-weight: 600;
  }
}

// Sections
.idea-card__section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.idea-card__section-label {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--neuro-text-dim);
}

.idea-card__hook {
  font-style: italic;
  color: var(--neuro-text-muted);
  font-size: 0.9rem;
  margin: 0;
  padding-left: 12px;
  border-left: 2px solid var(--neuro-accent);
  line-height: 1.5;
}

.idea-card__body {
  color: var(--neuro-text-muted);
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.6;
}

// Actions
.idea-card__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 4px;
  border-top: 1px solid var(--neuro-border);
}

.idea-card__plan-btn {
  display: inline-flex;
  align-items: center;
  background: transparent;
  border: 1px solid rgba(0, 245, 255, 0.25);
  color: var(--neuro-accent);
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background: rgba(0, 245, 255, 0.08);
    border-color: var(--neuro-accent);
    box-shadow: 0 0 14px rgba(0, 245, 255, 0.2);
  }
}
</style>
