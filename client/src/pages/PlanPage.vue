<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">План видео</div>

    <q-banner v-if="planId" class="bg-grey-2 q-mb-md" rounded>
      ID плана: <strong>{{ planId }}</strong>
    </q-banner>

    <p class="text-body1 text-grey-7">
      Здесь будет просмотр сгенерированного плана видео с AI-инструментами.
    </p>

    <q-btn flat color="primary" icon="arrow_back" label="Назад к идеям" to="/" />
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const planId = computed(() => route.params.id as string | undefined);

onMounted(() => {
  console.debug('[PlanPage] Mounted, planId:', planId.value ?? 'none');
});
</script>
