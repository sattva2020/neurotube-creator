<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">Панель администратора</div>

    <q-tabs v-model="activeTab" dense align="left" class="q-mb-md" active-color="primary" indicator-color="primary">
      <q-tab name="dashboard" label="Дашборд" icon="dashboard" />
      <q-tab name="users" label="Пользователи" icon="people" />
      <q-tab name="activity" label="Журнал активности" icon="history" />
    </q-tabs>

    <q-separator class="q-mb-md" />

    <q-tab-panels v-model="activeTab" animated>
      <!-- Dashboard Tab -->
      <q-tab-panel name="dashboard">
        <div v-if="statsLoading" class="flex flex-center q-pa-lg">
          <q-spinner size="40px" />
        </div>

        <div v-else-if="stats" class="row q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-caption text-grey">Всего пользователей</div>
                <div class="text-h4">{{ stats.totalUsers }}</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-caption text-grey">Активные</div>
                <div class="text-h4 text-positive">{{ stats.activeUsers }}</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-caption text-grey">Всего идей</div>
                <div class="text-h4">{{ stats.totalIdeas }}</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-caption text-grey">Всего планов</div>
                <div class="text-h4">{{ stats.totalPlans }}</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-caption text-grey">Регистрации (7 дней)</div>
                <div class="text-h4 text-info">{{ stats.recentRegistrations }}</div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Role Distribution -->
          <div class="col-12 col-md-6">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle1 q-mb-sm">Распределение ролей</div>
                <div v-for="(count, role) in stats.roleDistribution" :key="role" class="q-mb-sm">
                  <div class="row items-center q-mb-xs">
                    <div class="col-3 text-caption">{{ roleLabel(String(role)) }}</div>
                    <div class="col">
                      <q-linear-progress
                        :value="stats.totalUsers > 0 ? count / stats.totalUsers : 0"
                        :color="roleColor(String(role))"
                        rounded
                        size="20px"
                      >
                        <div class="absolute-full flex flex-center">
                          <q-badge :label="count" color="white" text-color="dark" />
                        </div>
                      </q-linear-progress>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <q-banner v-if="statsError" class="text-negative q-mt-md" rounded>
          {{ statsError }}
        </q-banner>
      </q-tab-panel>

      <!-- Users Tab -->
      <q-tab-panel name="users">
        <q-table
          :rows="users"
          :columns="userColumns"
          row-key="id"
          :loading="isUsersLoading"
          flat
          bordered
        >
          <template #body-cell-role="props">
            <q-td :props="props">
              <q-select
                v-if="canEditRole(props.row)"
                v-model="props.row.role"
                :options="roleOptions"
                dense
                outlined
                emit-value
                map-options
                style="min-width: 120px"
                @update:model-value="(val: string) => onRoleChange(props.row.id, val)"
              />
              <q-badge v-else :label="props.row.role" color="grey" />
            </q-td>
          </template>

          <template #body-cell-isActive="props">
            <q-td :props="props">
              <q-badge
                :label="props.row.isActive ? 'Активен' : 'Деактивирован'"
                :color="props.row.isActive ? 'positive' : 'negative'"
              />
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                v-if="canDeactivate(props.row)"
                flat
                dense
                color="negative"
                icon="person_off"
                :loading="deactivatingId === props.row.id"
                @click="onDeactivate(props.row.id)"
              >
                <q-tooltip>Деактивировать</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>

        <q-banner v-if="usersError" class="text-negative q-mt-md" rounded>
          {{ usersError }}
        </q-banner>
      </q-tab-panel>

      <!-- Activity Log Tab -->
      <q-tab-panel name="activity">
        <div class="row q-col-gutter-sm q-mb-md">
          <div class="col-12 col-sm-4">
            <q-select
              v-model="activityActionFilter"
              :options="actionOptions"
              label="Фильтр по действию"
              dense
              outlined
              emit-value
              map-options
              clearable
              @update:model-value="onActivityFilterChange"
            />
          </div>
        </div>

        <q-table
          :rows="activityLogs"
          :columns="activityColumns"
          row-key="id"
          :loading="activityLoading"
          flat
          bordered
          :pagination="activityPagination"
          @request="onActivityRequest"
        >
          <template #body-cell-action="props">
            <q-td :props="props">
              <q-badge :label="actionLabel(props.row.action)" :color="actionColor(props.row.action)" />
            </q-td>
          </template>
        </q-table>

        <q-banner v-if="activityError" class="text-negative q-mt-md" rounded>
          {{ activityError }}
        </q-banner>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { QTableColumn } from 'quasar';
import type { UserPublic } from '@neurotube/shared';
import { useApi } from '@/composables/useApi';
import { useAuthStore } from '@/stores/auth';
import { useAdminDashboard } from '@/composables/useAdminDashboard';

const { get, patch, post } = useApi();
const authStore = useAuthStore();
const {
  stats, statsLoading, statsError, fetchStats,
  activityLogs, activityTotal, activityLoading, activityError, fetchActivityLogs,
} = useAdminDashboard();

const activeTab = ref('dashboard');

// --- Users tab state ---
const users = ref<UserPublic[]>([]);
const isUsersLoading = ref(false);
const usersError = ref('');
const deactivatingId = ref<string | null>(null);

const roleOptions = [
  { label: 'Viewer', value: 'viewer' },
  { label: 'Editor', value: 'editor' },
  { label: 'Admin', value: 'admin' },
];

const userColumns: QTableColumn[] = [
  { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
  { name: 'displayName', label: 'Имя', field: 'displayName', align: 'left', sortable: true },
  { name: 'role', label: 'Роль', field: 'role', align: 'left', sortable: true },
  { name: 'isActive', label: 'Статус', field: 'isActive', align: 'center' },
  {
    name: 'createdAt',
    label: 'Создан',
    field: 'createdAt',
    align: 'left',
    sortable: true,
    format: (val: string) => val ? new Date(val).toLocaleDateString('ru-RU') : '—',
  },
  { name: 'actions', label: '', field: 'id', align: 'center' },
];

// --- Activity log state ---
const activityActionFilter = ref<string | null>(null);
const activityPagination = ref({
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0,
});

const actionOptions = [
  { label: 'Регистрация', value: 'user.registered' },
  { label: 'Вход', value: 'user.login' },
  { label: 'Смена роли', value: 'user.role_updated' },
  { label: 'Деактивация', value: 'user.deactivated' },
];

const activityColumns: QTableColumn[] = [
  {
    name: 'createdAt',
    label: 'Дата',
    field: 'createdAt',
    align: 'left',
    sortable: true,
    format: (val: string) => val ? new Date(val).toLocaleString('ru-RU') : '—',
  },
  { name: 'action', label: 'Действие', field: 'action', align: 'left' },
  { name: 'userId', label: 'User ID', field: 'userId', align: 'left' },
  { name: 'resourceType', label: 'Ресурс', field: 'resourceType', align: 'left' },
  { name: 'ipAddress', label: 'IP', field: 'ipAddress', align: 'left' },
];

// --- Action labels and colors ---
const ACTION_LABELS: Record<string, string> = {
  'user.registered': 'Регистрация',
  'user.login': 'Вход',
  'user.role_updated': 'Смена роли',
  'user.deactivated': 'Деактивация',
};

const ACTION_COLORS: Record<string, string> = {
  'user.registered': 'positive',
  'user.login': 'info',
  'user.role_updated': 'warning',
  'user.deactivated': 'negative',
};

function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

function actionColor(action: string): string {
  return ACTION_COLORS[action] ?? 'grey';
}

function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    owner: 'Владелец',
    admin: 'Админ',
    editor: 'Редактор',
    viewer: 'Зритель',
  };
  return labels[role] ?? role;
}

function roleColor(role: string): string {
  const colors: Record<string, string> = {
    owner: 'deep-purple',
    admin: 'primary',
    editor: 'teal',
    viewer: 'grey',
  };
  return colors[role] ?? 'grey';
}

// --- Users functions ---
function canEditRole(user: UserPublic): boolean {
  if (user.id === authStore.user?.id) return false;
  if (user.role === 'owner') return false;
  return true;
}

function canDeactivate(user: UserPublic): boolean {
  if (user.id === authStore.user?.id) return false;
  if (user.role === 'owner') return false;
  if (!user.isActive) return false;
  return true;
}

async function fetchUsers(): Promise<void> {
  console.debug('[AdminPage] Fetching users');
  isUsersLoading.value = true;
  usersError.value = '';
  try {
    const response = await get<{ users: UserPublic[]; total: number }>('/api/admin/users');
    users.value = response.users;
    console.debug('[AdminPage] Loaded users:', response.total);
  } catch (err) {
    const error = err as { message?: string };
    console.debug('[AdminPage] Failed to fetch users:', error.message);
    usersError.value = error.message ?? 'Не удалось загрузить пользователей';
  } finally {
    isUsersLoading.value = false;
  }
}

async function onRoleChange(userId: string, newRole: string): Promise<void> {
  console.debug('[AdminPage] Changing role:', userId, '→', newRole);
  usersError.value = '';
  try {
    await patch(`/api/admin/users/${userId}/role`, { role: newRole });
    console.debug('[AdminPage] Role updated successfully');
  } catch (err) {
    const error = err as { message?: string };
    console.debug('[AdminPage] Failed to update role:', error.message);
    usersError.value = error.message ?? 'Не удалось изменить роль';
    await fetchUsers();
  }
}

async function onDeactivate(userId: string): Promise<void> {
  console.debug('[AdminPage] Deactivating user:', userId);
  usersError.value = '';
  deactivatingId.value = userId;
  try {
    await post(`/api/admin/users/${userId}/deactivate`, {});
    console.debug('[AdminPage] User deactivated successfully');
    await fetchUsers();
  } catch (err) {
    const error = err as { message?: string };
    console.debug('[AdminPage] Failed to deactivate user:', error.message);
    usersError.value = error.message ?? 'Не удалось деактивировать пользователя';
  } finally {
    deactivatingId.value = null;
  }
}

// --- Activity log functions ---
async function loadActivityLogs(): Promise<void> {
  const { page, rowsPerPage } = activityPagination.value;
  const offset = (page - 1) * rowsPerPage;
  await fetchActivityLogs(
    rowsPerPage,
    offset,
    undefined,
    activityActionFilter.value ?? undefined,
  );
  activityPagination.value.rowsNumber = activityTotal.value;
}

function onActivityRequest(props: { pagination: { page: number; rowsPerPage: number } }): void {
  activityPagination.value.page = props.pagination.page;
  activityPagination.value.rowsPerPage = props.pagination.rowsPerPage;
  loadActivityLogs();
}

function onActivityFilterChange(): void {
  activityPagination.value.page = 1;
  loadActivityLogs();
}

// --- Tab change: lazy load data ---
watch(activeTab, (tab) => {
  console.debug('[AdminPage] Tab changed to:', tab);
  if (tab === 'dashboard' && !stats.value) {
    fetchStats();
  } else if (tab === 'users' && users.value.length === 0) {
    fetchUsers();
  } else if (tab === 'activity' && activityLogs.value.length === 0) {
    loadActivityLogs();
  }
});

onMounted(() => {
  console.debug('[AdminPage] Page mounted');
  fetchStats();
});
</script>
