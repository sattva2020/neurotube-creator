<template>
  <div class="niche-toggle">
    <button
      v-for="option in options"
      :key="option.value"
      :class="['niche-btn', { 'niche-btn--active': nicheStore.active === option.value }]"
      @click="onToggle(option.value)"
    >
      <q-icon :name="option.icon" size="16px" class="q-mr-xs" />
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import type { Niche } from '@neurotube/shared';
import { useNicheStore } from '@/stores/niche';
import { useIdeasStore } from '@/stores/ideas';
import { useAnalytics } from '@/composables/useAnalytics';

const nicheStore = useNicheStore();
const ideasStore = useIdeasStore();
const { trackEvent } = useAnalytics();

const options: { label: string; value: Niche; icon: string }[] = [
  { label: 'Психология', value: 'psychology', icon: 'psychology' },
  { label: 'Эмбиент', value: 'ambient', icon: 'headphones' },
];

function onToggle(value: Niche) {
  if (nicheStore.active === value) return;
  console.debug('[NicheToggle] Switched to:', value);
  trackEvent('niche_toggled', { niche: value });
  nicheStore.set(value);
  ideasStore.clear();
}

onMounted(() => {
  console.debug('[NicheToggle] Mounted, active niche:', nicheStore.active);
});
</script>

<style scoped lang="scss">
.niche-toggle {
  display: inline-flex;
  align-items: center;
  background: var(--neuro-bg-secondary);
  border: 1px solid var(--neuro-border);
  border-radius: 40px;
  padding: 4px;
  gap: 2px;
}

.niche-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  border-radius: 36px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--neuro-text-muted);
  transition: all 0.25s ease;
  white-space: nowrap;

  &:hover:not(.niche-btn--active) {
    color: var(--neuro-text);
    background: rgba(255, 255, 255, 0.04);
  }

  &--active {
    background: linear-gradient(135deg, rgba(0, 245, 255, 0.15), rgba(139, 92, 246, 0.15));
    color: var(--neuro-accent);
    border: 1px solid rgba(0, 245, 255, 0.25);
    box-shadow: 0 0 12px rgba(0, 245, 255, 0.1);
  }
}
</style>
