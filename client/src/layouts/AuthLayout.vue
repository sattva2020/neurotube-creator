<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="flex flex-center">
        <div class="auth-container">
          <div class="text-center q-mb-lg">
            <q-icon name="smart_display" size="48px" color="primary" />
            <div class="text-h5 text-weight-bold q-mt-sm">NeuroTube Creator</div>
          </div>
          <router-view />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  console.debug('[AuthLayout] Layout mounted');
});
</script>

<style scoped>
.auth-container {
  width: 100%;
  max-width: 400px;
  padding: 16px;
}
</style>
