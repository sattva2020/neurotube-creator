import { ref } from 'vue';
import type { AdminStats, ActivityLogEntry } from '@neurotube/shared/admin';
import { useApi } from './useApi';

export function useAdminDashboard() {
  const { get } = useApi();

  const stats = ref<AdminStats | null>(null);
  const statsLoading = ref(false);
  const statsError = ref('');

  const activityLogs = ref<ActivityLogEntry[]>([]);
  const activityTotal = ref(0);
  const activityLoading = ref(false);
  const activityError = ref('');

  async function fetchStats(): Promise<void> {
    console.debug('[useAdminDashboard] Fetching stats');
    statsLoading.value = true;
    statsError.value = '';
    try {
      const response = await get<{ stats: AdminStats }>('/api/admin/stats');
      stats.value = response.stats;
      console.debug('[useAdminDashboard] Stats loaded', response.stats);
    } catch (err) {
      const error = err as { message?: string };
      console.debug('[useAdminDashboard] Failed to fetch stats:', error.message);
      statsError.value = error.message ?? 'Не удалось загрузить статистику';
    } finally {
      statsLoading.value = false;
    }
  }

  async function fetchActivityLogs(
    limit = 50,
    offset = 0,
    userId?: string,
    action?: string,
  ): Promise<void> {
    console.debug('[useAdminDashboard] Fetching activity logs', { limit, offset, userId, action });
    activityLoading.value = true;
    activityError.value = '';
    try {
      const params = new URLSearchParams();
      params.set('limit', String(limit));
      params.set('offset', String(offset));
      if (userId) params.set('userId', userId);
      if (action) params.set('action', action);

      const response = await get<{ logs: ActivityLogEntry[]; total: number }>(
        `/api/admin/activity-logs?${params.toString()}`,
      );
      activityLogs.value = response.logs;
      activityTotal.value = response.total;
      console.debug('[useAdminDashboard] Activity logs loaded', { count: response.logs.length, total: response.total });
    } catch (err) {
      const error = err as { message?: string };
      console.debug('[useAdminDashboard] Failed to fetch activity logs:', error.message);
      activityError.value = error.message ?? 'Не удалось загрузить журнал активности';
    } finally {
      activityLoading.value = false;
    }
  }

  return {
    stats,
    statsLoading,
    statsError,
    fetchStats,
    activityLogs,
    activityTotal,
    activityLoading,
    activityError,
    fetchActivityLogs,
  };
}
