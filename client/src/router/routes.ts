import type { RouteRecordRaw } from 'vue-router';
import type { Role } from '@neurotube/shared';
import MainLayout from '@/layouts/MainLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    requiresRole?: Role;
    guest?: boolean;
  }
}

export const routes: RouteRecordRaw[] = [
  // Auth routes (no sidebar, guest-only)
  {
    path: '/',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/pages/LoginPage.vue'),
        meta: { guest: true },
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/pages/RegisterPage.vue'),
        meta: { guest: true },
      },
    ],
  },
  // Main app routes (requires auth)
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'index',
        component: () => import('@/pages/IndexPage.vue'),
      },
      {
        path: 'plan/:id?',
        name: 'plan',
        component: () => import('@/pages/PlanPage.vue'),
      },
      {
        path: 'tools',
        name: 'tools',
        component: () => import('@/pages/ToolsPage.vue'),
      },
      {
        path: 'admin',
        name: 'admin',
        component: () => import('@/pages/AdminPage.vue'),
        meta: { requiresRole: 'admin' },
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    redirect: '/',
  },
];
