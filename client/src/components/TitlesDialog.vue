<template>
  <q-dialog v-model="dialogOpen" persistent maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="column no-wrap">
      <q-card-section class="row items-center q-pb-none">
        <q-icon name="title" color="teal" size="sm" class="q-mr-sm" />
        <span class="text-h6">Генератор заголовков</span>
        <q-space />
        <q-btn flat round dense icon="close" @click="dialogOpen = false" />
      </q-card-section>

      <q-card-section class="col q-pt-md" style="overflow-y: auto">
        <!-- Input -->
        <q-input
          v-model="titleIdea"
          outlined
          label="Идея заголовка"
          placeholder="Введите рабочий заголовок видео..."
          class="q-mb-md"
          :disable="toolStore.loading.titles"
        />

        <q-btn
          color="teal"
          icon="auto_awesome"
          label="Сгенерировать"
          no-caps
          :loading="toolStore.loading.titles"
          :disable="!titleIdea.trim()"
          class="q-mb-lg"
          @click="onGenerate"
        />

        <!-- Error -->
        <q-banner v-if="toolStore.errors.titles" class="bg-negative text-white q-mb-md" rounded>
          <template #avatar><q-icon name="error" /></template>
          {{ toolStore.errors.titles }}
        </q-banner>

        <!-- Result: list of titles -->
        <q-list v-if="titles.length" bordered separator class="rounded-borders">
          <q-item v-for="(title, idx) in titles" :key="idx">
            <q-item-section>
              <q-item-label class="text-body1">{{ title }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                flat
                round
                dense
                icon="content_copy"
                color="grey-7"
                size="sm"
                @click="copyTitle(title)"
              >
                <q-tooltip>Копировать</q-tooltip>
              </q-btn>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { copyToClipboard } from 'quasar';
import { useToolResultsStore } from '@/stores/toolResults';
import { useGenerateTitles } from '@/composables/useGenerateTitles';

const dialogOpen = defineModel<boolean>({ required: true });

const toolStore = useToolResultsStore();
const { generate } = useGenerateTitles();

const titleIdea = ref('');

const titles = computed(() => {
  const result = toolStore.results.titles;
  return Array.isArray(result) ? result : [];
});

async function onGenerate() {
  console.debug('[TitlesDialog] Generate clicked', { titleIdea: titleIdea.value });
  try {
    await generate(titleIdea.value);
  } catch {
    // error is stored in toolStore.errors.titles
  }
}

function copyTitle(title: string) {
  console.debug('[TitlesDialog] Copying title:', title);
  copyToClipboard(title)
    .then(() => console.debug('[TitlesDialog] Copied successfully'))
    .catch((err) => console.error('[TitlesDialog] Copy failed:', err));
}

onMounted(() => {
  console.debug('[TitlesDialog] Mounted');
});
</script>
