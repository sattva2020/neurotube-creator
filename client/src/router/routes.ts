import type { RouteRecordRaw } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
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
    ],
  },
  {
    path: '/:catchAll(.*)*',
    redirect: '/',
  },
];
