import { RouteRecordRaw } from 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth: string[];
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Index.vue') }],
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'activate/:token',
        component: () => import('pages/Access/WelcomeToken.vue'),
      },
      {
        path: 'recover/:token',
        component: () => import('pages/Access/RecoverPasswordToken.vue'),
      },
      {
        path: 'profile',
        component: () => import('pages/User/Profile.vue'),
      },
    ],
  },
  {
    path: '/idle',
    name: 'idle',
    component: () => import('layouts/LoginLayout.vue'),
    children: [{ path: '', component: () => import('pages/Idle.vue') }],
  },
  {
    path: '/access',
    name: 'access',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Access/Access.vue') },
    ],
  },
  {
    path: '/logout',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/Access/Logout.vue') },
    ],
  },
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: ['SUPERVISOR'] },
    children: [
      {
        path: 'users',
        component: () => import('src/pages/Admin/Users/users.vue'),
        meta: { requiresAuth: ['USERSADMIN'] },
      },
    ],
  },
  {
    path: '/401',
    name: '401',
    component: () => import('src/pages/ErrorNotAuthorized.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
