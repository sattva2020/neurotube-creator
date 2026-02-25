<template>
  <div class="markdown-result">
    <div class="row items-center justify-end q-mb-sm">
      <q-btn
        flat
        round
        dense
        icon="content_copy"
        color="grey-7"
        size="sm"
        @click="copyRaw"
      >
        <q-tooltip>Копировать текст</q-tooltip>
      </q-btn>
    </div>

    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="markdown-result__body text-body1" v-html="rendered" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { copyToClipboard } from 'quasar';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';

const props = defineProps<{
  content: string;
}>();

const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

const rendered = computed(() => {
  if (!props.content) return '';
  return DOMPurify.sanitize(md.render(props.content));
});

function copyRaw() {
  console.debug('[MarkdownResult] Copying raw markdown to clipboard');
  copyToClipboard(props.content)
    .then(() => console.debug('[MarkdownResult] Copied successfully'))
    .catch((err) => console.error('[MarkdownResult] Copy failed:', err));
}

onMounted(() => {
  console.debug('[MarkdownResult] Mounted, content length:', props.content?.length ?? 0);
});
</script>

<style scoped lang="scss">
.markdown-result__body {
  :deep(h1),
  :deep(h2),
  :deep(h3) {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 700;
  }

  :deep(h1) { font-size: 1.75rem; }
  :deep(h2) { font-size: 1.4rem; }
  :deep(h3) { font-size: 1.15rem; }

  :deep(p) {
    margin-bottom: 0.75em;
    line-height: 1.7;
  }

  :deep(ul),
  :deep(ol) {
    margin-bottom: 1em;
    padding-left: 1.5em;
  }

  :deep(li) {
    margin-bottom: 0.25em;
  }

  :deep(blockquote) {
    border-left: 3px solid var(--q-primary);
    padding-left: 1em;
    margin: 1em 0;
    color: #555;
  }

  :deep(code) {
    background: #f5f5f5;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
  }
}
</style>
