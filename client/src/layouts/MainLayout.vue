<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Меню"
          class="lt-md"
          @click="toggleDrawer"
        />

        <q-toolbar-title class="gradient-text" style="font-weight: 700;">
          <q-icon name="smart_display" class="q-mr-sm glow-text" />
          NeuroTube Creator
        </q-toolbar-title>

        <q-space />

        <!-- Niche toggle area — populated by pages -->
        <slot name="toolbar-right" />

        <!-- User info -->
        <template v-if="authStore.isAuthenticated && authStore.user">
          <q-chip
            color="white"
            text-color="primary"
            dense
            class="q-ml-sm"
          >
            {{ authStore.user.displayName }}
            <q-badge
              :label="authStore.user.role"
              color="secondary"
              class="q-ml-xs"
            />
          </q-chip>

          <q-btn
            flat
            dense
            round
            icon="logout"
            aria-label="Выйти"
            class="q-ml-xs"
            @click="onLogout"
          >
            <q-tooltip>Выйти</q-tooltip>
          </q-btn>
        </template>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawerOpen"
      show-if-above
      bordered
      :width="240"
      :breakpoint="1024"
    >
      <q-list>
        <q-item-label header>Навигация</q-item-label>

        <q-item clickable to="/" exact>
          <q-item-section avatar>
            <q-icon name="lightbulb" />
          </q-item-section>
          <q-item-section>Генератор идей</q-item-section>
        </q-item>

        <q-item clickable to="/tools">
          <q-item-section avatar>
            <q-icon name="build" />
          </q-item-section>
          <q-item-section>AI-инструменты</q-item-section>
        </q-item>

        <q-item v-if="authStore.isAdmin" clickable to="/admin">
          <q-item-section avatar>
            <q-icon name="admin_panel_settings" />
          </q-item-section>
          <q-item-section>Управление</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const drawerOpen = ref(false);

function toggleDrawer() {
  drawerOpen.value = !drawerOpen.value;
  console.debug('[MainLayout] Drawer toggled:', drawerOpen.value);
}

async function onLogout(): Promise<void> {
  console.debug('[MainLayout] Logout clicked');
  await authStore.logout();
  await router.push('/login');
  console.debug('[MainLayout] Logged out, redirected to /login');
}

onMounted(() => {
  document.body.classList.add('neuro-theme');
  console.debug('[MainLayout] Applied neuro-theme to body');
  console.debug('[MainLayout] Layout mounted, user:', authStore.user?.email ?? 'none');
});

onUnmounted(() => {
  document.body.classList.remove('neuro-theme');
  console.debug('[MainLayout] Removed neuro-theme from body');
});
</script>
