<template>
  <q-dialog v-model="dialogOpen" persistent maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="column no-wrap">
      <q-card-section class="row items-center q-pb-none">
        <q-icon :name="config.icon" :color="config.color" size="sm" class="q-mr-sm" />
        <span class="text-h6">{{ config.title }}</span>
        <q-space />
        <q-btn flat round dense icon="close" @click="dialogOpen = false" />
      </q-card-section>

      <q-card-section class="col q-pt-md" style="overflow-y: auto">
        <!-- Dynamic inputs -->
        <q-input
          v-for="field in config.fields"
          :key="field.key"
          v-model="inputs[field.key]"
          outlined
          :autogrow="field.autogrow"
          :label="field.label"
          :placeholder="field.placeholder"
          class="q-mb-md"
          :disable="isLoading"
        />

        <q-btn
          :color="config.color"
          icon="auto_awesome"
          label="Сгенерировать"
          no-caps
          :loading="isLoading"
          :disable="!canGenerate"
          class="q-mb-lg"
          @click="onGenerate"
        />

        <!-- Error -->
        <q-banner v-if="errorMessage" class="bg-negative text-white q-mb-md" rounded>
          <template #avatar><q-icon name="error" /></template>
          {{ errorMessage }}
        </q-banner>

        <!-- Result: markdown -->
        <MarkdownResult v-if="resultContent" :content="resultContent" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue';
import { useToolResultsStore } from '@/stores/toolResults';
import type { ToolKey } from '@/stores/toolResults';
import MarkdownResult from './MarkdownResult.vue';

export interface MarkdownToolField {
  key: string;
  label: string;
  placeholder?: string;
  autogrow?: boolean;
}

export interface MarkdownToolConfig {
  title: string;
  icon: string;
  color: string;
  toolKey: ToolKey;
  fields: MarkdownToolField[];
  generateFn: (...args: string[]) => Promise<void>;
}

const props = defineProps<{
  config: MarkdownToolConfig;
}>();

const dialogOpen = defineModel<boolean>({ required: true });

const toolStore = useToolResultsStore();

const inputs = reactive<Record<string, string>>({});

const isLoading = computed(() => toolStore.loading[props.config.toolKey]);
const errorMessage = computed(() => toolStore.errors[props.config.toolKey]);

const resultContent = computed(() => {
  const result = toolStore.results[props.config.toolKey];
  return typeof result === 'string' ? result : null;
});

const canGenerate = computed(() => {
  if (!props.config.fields.length) return false;
  const firstField = props.config.fields[0];
  return !!(inputs[firstField.key]?.trim());
});

async function onGenerate() {
  const args = props.config.fields.map((f) => inputs[f.key] || '');
  console.debug(`[MarkdownToolDialog:${props.config.toolKey}] Generate clicked`, args);
  try {
    await props.config.generateFn(...args);
  } catch {
    // error is stored in toolStore.errors[toolKey]
  }
}

onMounted(() => {
  console.debug(`[MarkdownToolDialog:${props.config.toolKey}] Mounted`);
  for (const field of props.config.fields) {
    if (!(field.key in inputs)) {
      inputs[field.key] = '';
    }
  }
});
</script>
