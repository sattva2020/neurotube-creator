import { createRouter, createWebHistory } from 'vue-router';
import type { Role } from '@neurotube/shared';
import { routes } from './routes';
import { useAuthStore } from '@/stores/auth';

const ROLE_LEVEL: Record<Role, number> = {
  viewer: 0,
  editor: 1,
  admin: 2,
  owner: 3,
};

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

let initialized = false;

router.beforeEach(async (to, from) => {
  console.debug(`[Router] Navigating: ${from.fullPath} → ${to.fullPath}`);

  const authStore = useAuthStore();

  // Initialize auth from localStorage on first navigation
  if (!initialized) {
    console.debug('[Router] First navigation, initializing auth from storage');
    authStore.initFromStorage();
    if (authStore.accessToken) {
      console.debug('[Router] Access token found, fetching current user');
      await authStore.fetchMe();
    }
    initialized = true;
    console.debug('[Router] Auth initialized, isAuthenticated:', authStore.isAuthenticated);
  }

  // Check if route requires auth (match on route or any parent)
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isGuestRoute = to.matched.some(record => record.meta.guest);
  const requiredRole = to.meta.requiresRole as Role | undefined;

  // Guest-only routes: redirect authenticated users to home
  if (isGuestRoute && authStore.isAuthenticated) {
    console.debug('[Router] Guest route, user authenticated → redirect to /');
    return { name: 'index' };
  }

  // Protected routes: redirect unauthenticated users to login
  if (requiresAuth && !authStore.isAuthenticated) {
    console.debug('[Router] Auth required, user not authenticated → redirect to /login');
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  // Role check: ensure user has sufficient privileges
  if (requiredRole && authStore.user) {
    const userLevel = ROLE_LEVEL[authStore.user.role] ?? 0;
    const requiredLevel = ROLE_LEVEL[requiredRole] ?? 0;

    if (userLevel < requiredLevel) {
      console.debug(`[Router] Insufficient role: ${authStore.user.role} < ${requiredRole} → redirect to /`);
      return { name: 'index' };
    }
    console.debug(`[Router] Role check passed: ${authStore.user.role} >= ${requiredRole}`);
  }
});
