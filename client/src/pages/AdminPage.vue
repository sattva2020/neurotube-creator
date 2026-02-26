<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">Управление пользователями</div>

    <q-table
      :rows="users"
      :columns="columns"
      row-key="id"
      :loading="isLoading"
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

    <q-banner v-if="errorMessage" class="text-negative q-mt-md" rounded>
      {{ errorMessage }}
    </q-banner>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { QTableColumn } from 'quasar';
import type { UserPublic } from '@neurotube/shared';
import { useApi } from '@/composables/useApi';
import { useAuthStore } from '@/stores/auth';

const { get, patch, post } = useApi();
const authStore = useAuthStore();

const users = ref<UserPublic[]>([]);
const isLoading = ref(false);
const errorMessage = ref('');
const deactivatingId = ref<string | null>(null);

const roleOptions = [
  { label: 'Viewer', value: 'viewer' },
  { label: 'Editor', value: 'editor' },
  { label: 'Admin', value: 'admin' },
];

const columns: QTableColumn[] = [
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

function canEditRole(user: UserPublic): boolean {
  // Can't change own role or owner's role
  if (user.id === authStore.user?.id) return false;
  if (user.role === 'owner') return false;
  return true;
}

function canDeactivate(user: UserPublic): boolean {
  // Can't deactivate self, owner, or already inactive users
  if (user.id === authStore.user?.id) return false;
  if (user.role === 'owner') return false;
  if (!user.isActive) return false;
  return true;
}

async function fetchUsers(): Promise<void> {
  console.debug('[AdminPage] Fetching users');
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await get<{ users: UserPublic[]; total: number }>('/api/admin/users');
    users.value = response.users;
    console.debug('[AdminPage] Loaded users:', response.total);
  } catch (err) {
    const error = err as { message?: string };
    console.debug('[AdminPage] Failed to fetch users:', error.message);
    errorMessage.value = error.message ?? 'Не удалось загрузить пользователей';
  } finally {
    isLoading.value = false;
  }
}

async function onRoleChange(userId: string, newRole: string): Promise<void> {
  console.debug('[AdminPage] Changing role:', userId, '→', newRole);
  errorMessage.value = '';
  try {
    await patch(`/api/admin/users/${userId}/role`, { role: newRole });
    console.debug('[AdminPage] Role updated successfully');
  } catch (err) {
    const error = err as { message?: string };
    console.debug('[AdminPage] Failed to update role:', error.message);
    errorMessage.value = error.message ?? 'Не удалось изменить роль';
    await fetchUsers(); // Reload to revert optimistic update
  }
}

async function onDeactivate(userId: string): Promise<void> {
  console.debug('[AdminPage] Deactivating user:', userId);
  errorMessage.value = '';
  deactivatingId.value = userId;
  try {
    await post(`/api/admin/users/${userId}/deactivate`, {});
    console.debug('[AdminPage] User deactivated successfully');
    await fetchUsers();
  } catch (err) {
    const error = err as { message?: string };
    console.debug('[AdminPage] Failed to deactivate user:', error.message);
    errorMessage.value = error.message ?? 'Не удалось деактивировать пользователя';
  } finally {
    deactivatingId.value = null;
  }
}

onMounted(() => {
  console.debug('[AdminPage] Page mounted');
  fetchUsers();
});
</script>
