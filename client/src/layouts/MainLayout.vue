<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
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

        <q-toolbar-title>
          <q-icon name="smart_display" class="q-mr-sm" />
          NeuroTube Creator
        </q-toolbar-title>

        <q-space />

        <!-- Niche toggle area — populated by pages -->
        <slot name="toolbar-right" />
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
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const drawerOpen = ref(false);

function toggleDrawer() {
  drawerOpen.value = !drawerOpen.value;
  console.debug('[MainLayout] Drawer toggled:', drawerOpen.value);
}

onMounted(() => {
  console.debug('[MainLayout] Layout mounted');
});
</script>
