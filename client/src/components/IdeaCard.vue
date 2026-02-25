<template>
  <q-card
    flat
    bordered
    :class="['idea-card cursor-pointer', { 'idea-card--selected': isSelected }]"
    @click="emit('select', idea)"
  >
    <q-card-section>
      <div class="text-h6 q-mb-sm">{{ idea.title }}</div>

      <!-- Badges -->
      <div class="row q-gutter-xs q-mb-sm">
        <q-badge color="green-2" text-color="green-9" rounded>
          <q-icon name="trending_up" size="xs" class="q-mr-xs" />
          {{ idea.searchVolume }}
        </q-badge>
        <q-badge color="amber-2" text-color="amber-9" rounded>
          <q-icon name="people" size="xs" class="q-mr-xs" />
          {{ idea.targetAudience }}
        </q-badge>
      </div>

      <!-- Keywords -->
      <div class="row q-gutter-xs q-mb-md">
        <q-chip
          v-if="idea.primaryKeyword"
          dense
          color="indigo-1"
          text-color="indigo-8"
          icon="sell"
          size="sm"
        >
          {{ idea.primaryKeyword }}
        </q-chip>
        <q-chip
          v-for="(kw, idx) in idea.secondaryKeywords"
          :key="idx"
          dense
          color="grey-3"
          text-color="grey-8"
          size="sm"
        >
          {{ kw }}
        </q-chip>
      </div>

      <!-- Hook -->
      <div class="q-mb-sm">
        <div class="text-weight-bold text-body2 q-mb-xs">
          <q-icon name="play_circle" color="indigo" size="xs" class="q-mr-xs" />
          Хук:
        </div>
        <div class="text-body2 text-italic idea-card__hook q-pl-md">
          "{{ idea.hook }}"
        </div>
      </div>

      <!-- Why it works -->
      <div>
        <div class="text-weight-bold text-body2 q-mb-xs">
          <q-icon name="psychology" color="indigo" size="xs" class="q-mr-xs" />
          Почему сработает:
        </div>
        <div class="text-body2 text-grey-8">{{ idea.whyItWorks }}</div>
      </div>
    </q-card-section>

    <q-separator v-if="!isSelected" />

    <q-card-actions v-if="!isSelected" align="center">
      <q-btn
        flat
        color="primary"
        label="Сгенерировать план"
        icon="auto_awesome"
        no-caps
        class="full-width"
        @click.stop="emit('generate-plan', idea)"
      />
    </q-card-actions>
  </q-card>
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
.idea-card {
  border-radius: 16px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--q-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &--selected {
    border-color: var(--q-primary);
    background: rgba(var(--q-primary-rgb), 0.04);
    box-shadow: 0 0 0 1px var(--q-primary);
  }
}

.idea-card__hook {
  border-left: 2px solid var(--q-primary);
  padding-top: 2px;
  padding-bottom: 2px;
}
</style>
