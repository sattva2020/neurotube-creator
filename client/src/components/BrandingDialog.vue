<template>
  <q-dialog v-model="dialogOpen" persistent maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="column no-wrap">
      <q-card-section class="row items-center q-pb-none">
        <q-icon name="palette" color="pink" size="sm" class="q-mr-sm" />
        <span class="text-h6">Генератор брендинга</span>
        <q-space />
        <q-btn flat round dense icon="close" @click="dialogOpen = false" />
      </q-card-section>

      <q-card-section class="col q-pt-md" style="overflow-y: auto">
        <!-- Inputs -->
        <q-input
          v-model="videoTitle"
          outlined
          label="Тема канала"
          placeholder="Введите тему или название видео..."
          class="q-mb-md"
          :disable="toolStore.loading.branding"
        />

        <q-select
          v-model="niche"
          outlined
          :options="nicheOptions"
          emit-value
          map-options
          label="Ниша"
          class="q-mb-md"
          :disable="toolStore.loading.branding"
        />

        <q-btn
          color="pink"
          icon="auto_awesome"
          label="Сгенерировать"
          no-caps
          :loading="toolStore.loading.branding"
          :disable="!videoTitle.trim()"
          class="q-mb-lg"
          @click="onGenerate"
        />

        <!-- Error -->
        <q-banner v-if="toolStore.errors.branding" class="bg-negative text-white q-mb-md" rounded>
          <template #avatar><q-icon name="error" /></template>
          {{ toolStore.errors.branding }}
        </q-banner>

        <!-- Result: structured branding -->
        <div v-if="branding" class="column q-gutter-md">
          <!-- Channel names -->
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle2 text-weight-bold q-mb-sm">
                <q-icon name="badge" color="primary" size="xs" class="q-mr-xs" />
                Названия канала
              </div>
              <div class="row q-gutter-sm">
                <q-chip
                  v-for="(name, idx) in branding.channelNames"
                  :key="idx"
                  color="primary"
                  text-color="white"
                  clickable
                  @click="copyText(name)"
                >
                  {{ name }}
                  <q-tooltip>Нажмите, чтобы скопировать</q-tooltip>
                </q-chip>
              </div>
            </q-card-section>
          </q-card>

          <!-- SEO Description -->
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle2 text-weight-bold q-mb-sm">
                <q-icon name="description" color="green" size="xs" class="q-mr-xs" />
                SEO-описание канала
              </div>
              <div class="text-body2">{{ branding.seoDescription }}</div>
              <q-btn
                flat
                dense
                size="sm"
                icon="content_copy"
                color="grey-7"
                class="q-mt-sm"
                @click="copyText(branding!.seoDescription)"
              />
            </q-card-section>
          </q-card>

          <!-- Avatar prompt -->
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle2 text-weight-bold q-mb-sm">
                <q-icon name="face" color="deep-purple" size="xs" class="q-mr-xs" />
                Промпт для аватара
              </div>
              <div class="text-body2 text-italic">{{ branding.avatarPrompt }}</div>
              <q-btn
                flat
                dense
                size="sm"
                icon="content_copy"
                color="grey-7"
                class="q-mt-sm"
                @click="copyText(branding!.avatarPrompt)"
              />
            </q-card-section>
          </q-card>

          <!-- Banner prompt -->
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle2 text-weight-bold q-mb-sm">
                <q-icon name="panorama" color="orange" size="xs" class="q-mr-xs" />
                Промпт для баннера
              </div>
              <div class="text-body2 text-italic">{{ branding.bannerPrompt }}</div>
              <q-btn
                flat
                dense
                size="sm"
                icon="content_copy"
                color="grey-7"
                class="q-mt-sm"
                @click="copyText(branding!.bannerPrompt)"
              />
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { copyToClipboard } from 'quasar';
import type { ChannelBranding } from '@neurotube/shared';
import { useToolResultsStore } from '@/stores/toolResults';
import { useGenerateBranding } from '@/composables/useGenerateBranding';
import { useAnalytics } from '@/composables/useAnalytics';

const dialogOpen = defineModel<boolean>({ required: true });

const toolStore = useToolResultsStore();
const { generate } = useGenerateBranding();
const { trackEvent } = useAnalytics();

const videoTitle = ref('');
const niche = ref('psychology');

const nicheOptions = [
  { label: 'Психология', value: 'psychology' },
  { label: 'Эмбиент', value: 'ambient' },
];

const branding = computed<ChannelBranding | null>(() => {
  const result = toolStore.results.branding;
  if (result && typeof result === 'object' && !Array.isArray(result)) {
    return result as ChannelBranding;
  }
  return null;
});

async function onGenerate() {
  console.debug('[BrandingDialog] Generate clicked', { videoTitle: videoTitle.value, niche: niche.value });
  try {
    await generate(videoTitle.value, niche.value);
    trackEvent('tool_completed', { tool: 'branding' });
  } catch {
    // error is stored in toolStore.errors.branding
  }
}

function copyText(text: string) {
  console.debug('[BrandingDialog] Copying text');
  copyToClipboard(text)
    .then(() => console.debug('[BrandingDialog] Copied successfully'))
    .catch((err) => console.error('[BrandingDialog] Copy failed:', err));
}

onMounted(() => {
  console.debug('[BrandingDialog] Mounted');
});
</script>
