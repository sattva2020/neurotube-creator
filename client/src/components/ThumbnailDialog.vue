<template>
  <q-dialog v-model="dialogOpen" persistent maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="column no-wrap">
      <q-card-section class="row items-center q-pb-none">
        <q-icon name="image" color="deep-purple" size="sm" class="q-mr-sm" />
        <span class="text-h6">Генератор превью</span>
        <q-space />
        <q-btn flat round dense icon="close" @click="dialogOpen = false" />
      </q-card-section>

      <q-card-section class="col q-pt-md" style="overflow-y: auto">
        <!-- Input -->
        <q-input
          v-model="prompt"
          outlined
          autogrow
          label="Описание превью"
          placeholder="Опишите желаемое превью для видео..."
          class="q-mb-md"
          :disable="toolStore.loading.thumbnail"
        />

        <q-btn
          color="deep-purple"
          icon="auto_awesome"
          label="Сгенерировать"
          no-caps
          :loading="toolStore.loading.thumbnail"
          :disable="!prompt.trim()"
          class="q-mb-lg"
          @click="onGenerate"
        />

        <!-- Error -->
        <q-banner v-if="toolStore.errors.thumbnail" class="bg-negative text-white q-mb-md" rounded>
          <template #avatar><q-icon name="error" /></template>
          {{ toolStore.errors.thumbnail }}
        </q-banner>

        <!-- Result: base64 image -->
        <div v-if="thumbnailSrc" class="column items-center">
          <q-img
            :src="thumbnailSrc"
            fit="contain"
            style="max-width: 100%; max-height: 400px; border-radius: 12px"
            class="q-mb-md"
          />
          <div class="row q-gutter-sm">
            <q-btn
              flat
              color="primary"
              icon="download"
              label="Скачать"
              no-caps
              @click="downloadImage"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToolResultsStore } from '@/stores/toolResults';
import { useGenerateThumbnail } from '@/composables/useGenerateThumbnail';

const dialogOpen = defineModel<boolean>({ required: true });

const toolStore = useToolResultsStore();
const { generate } = useGenerateThumbnail();

const prompt = ref('');

const thumbnailSrc = computed(() => {
  const result = toolStore.results.thumbnail;
  if (typeof result === 'string' && result) {
    return result.startsWith('data:') ? result : `data:image/png;base64,${result}`;
  }
  return null;
});

async function onGenerate() {
  console.debug('[ThumbnailDialog] Generate clicked', { prompt: prompt.value });
  try {
    await generate(prompt.value);
  } catch {
    // error is stored in toolStore.errors.thumbnail
  }
}

function downloadImage() {
  if (!thumbnailSrc.value) return;
  console.debug('[ThumbnailDialog] Downloading image');
  const link = document.createElement('a');
  link.href = thumbnailSrc.value;
  link.download = 'thumbnail.png';
  link.click();
}

onMounted(() => {
  console.debug('[ThumbnailDialog] Mounted');
});
</script>
