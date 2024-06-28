import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/login'
      },
      {
        path: 'my-wallet',
        component: () => import('@/views/wallet/Wallet.vue')
      },
      {
        path: 'my-reports',
        component: () => import('@/views/reports/Reports.vue')
      },
      {
        path: 'my-attendances',
        component: () => import('@/views/attendances/Attendances.vue')
      },
      {
        path: 'management',
        component: () => import('@/views/management/Home.vue')
      },
      {
        path: 'management/:catchAll(.*)',
        component: () => import('@/views/management/Home.vue')
      },
      {
        path: 'account',
        component: () => import('@/views/account/Account.vue')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/Login.vue')
  },
  {
    path: '/accounts',
    component: () => import('@/views/accounts/Accounts.vue')
  },
  {
    path: '/reports/:id',
    component: () => import('@/views/reports/Report.vue')
  },
  {
    path: '/attendances/:id',
    component: () => import('@/views/attendances/Attendance.vue')
  },
  {
    path: '/users',
    component: () => import('@/views/users/Users.vue')
  },
  {
    path: '/jobs',
    component: () => import('@/views/jobs/Jobs.vue')
  },
  {
    path: '/expenses',
    component: () => import('@/views/expenses/Expenses.vue')
  },
  {
    path: '/wallets/users/:id',
    component: () => import('@/views/wallet/Wallet.vue')
  },
  {
    path: '/inventory/warehouses',
    component: () => import('@/views/inventory/warehouses/Warehouses.vue')
  },
  {
    path: '/inventory/warehouses/:id',
    component: () => import('@/views/inventory/warehouses/Warehouse.vue')
  },
  {
    path: '/inventory/products',
    component: () => import('@/views/inventory/products/Products.vue')
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
