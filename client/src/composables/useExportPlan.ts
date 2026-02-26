import { ref } from 'vue';
import type { ExportFormat } from '@neurotube/shared';
import { useApi } from './useApi';

export function useExportPlan() {
  const isExporting = ref(false);
  const exportError = ref('');
  const { download } = useApi();

  async function exportPlan(planId: string, format: ExportFormat) {
    console.debug('[useExportPlan] Starting export', { planId, format });
    isExporting.value = true;
    exportError.value = '';

    try {
      await download(`/api/plans/${planId}/export?format=${format}`);
      console.debug('[useExportPlan] Export completed', { planId, format });
    } catch (error) {
      exportError.value = 'Не удалось скачать файл. Попробуйте ещё раз.';
      console.error('[useExportPlan] Export failed:', error);
    } finally {
      isExporting.value = false;
    }
  }

  return { isExporting, exportError, exportPlan };
}
