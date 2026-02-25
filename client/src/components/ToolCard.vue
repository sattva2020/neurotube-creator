<template>
  <q-card
    flat
    bordered
    class="tool-card cursor-pointer"
    @click="emit('click')"
  >
    <q-card-section class="column items-center text-center q-pa-lg">
      <q-icon :name="icon" :color="color" size="40px" class="q-mb-sm" />
      <div class="text-subtitle1 text-weight-bold">{{ title }}</div>
      <div class="text-body2 text-grey-7 q-mt-xs">{{ description }}</div>
    </q-card-section>

    <!-- Loading overlay -->
    <q-inner-loading :showing="loading">
      <q-spinner-dots size="32px" color="primary" />
    </q-inner-loading>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

const props = defineProps<{
  title: string;
  description: string;
  icon: string;
  color: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  click: [];
}>();

onMounted(() => {
  console.debug('[ToolCard] Mounted:', props.title);
});
</script>

<style scoped lang="scss">
.tool-card {
  border-radius: 16px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--q-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}
</style>
