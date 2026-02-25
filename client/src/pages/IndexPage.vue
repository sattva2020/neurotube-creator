<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Генератор идей для YouTube</div>

    <div class="q-mb-lg">
      <q-btn-toggle
        v-model="nicheStore.active"
        toggle-color="primary"
        :options="[
          { label: 'Психология', value: 'psychology' },
          { label: 'Эмбиент', value: 'ambient' },
        ]"
      />
    </div>

    <q-banner class="bg-grey-2 q-mb-md" rounded>
      Текущая ниша: <strong>{{ nicheStore.active === 'psychology' ? 'Психология / Нейронаука' : 'Эмбиент / Медитация' }}</strong>
    </q-banner>

    <p class="text-body1 text-grey-7">
      Здесь будет форма поиска и список сгенерированных идей.
    </p>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useNicheStore } from '@/stores/niche';

const nicheStore = useNicheStore();

onMounted(() => {
  console.debug('[IndexPage] Mounted, niche:', nicheStore.active);
});
</script>
