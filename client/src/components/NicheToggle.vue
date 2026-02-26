<template>
  <q-btn-toggle
    v-model="nicheStore.active"
    toggle-color="primary"
    rounded
    unelevated
    :options="options"
    class="niche-toggle"
    @update:model-value="onToggle"
  />
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

const options = [
  { label: 'Психология', value: 'psychology' as Niche, icon: 'psychology' },
  { label: 'Эмбиент', value: 'ambient' as Niche, icon: 'headphones' },
];

function onToggle(value: Niche) {
  console.debug('[NicheToggle] Switched to:', value);
  trackEvent('niche_toggled', { niche: value });
  ideasStore.clear();
}

onMounted(() => {
  console.debug('[NicheToggle] Mounted, active niche:', nicheStore.active);
});
</script>

<style scoped lang="scss">
.niche-toggle {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 28px;
}
</style>
