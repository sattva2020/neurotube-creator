import { createRouter, createWebHistory } from 'vue-router';
import { routes } from './routes';

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from) => {
  console.debug(`[Router] Navigating: ${from.fullPath} → ${to.fullPath}`);
});
