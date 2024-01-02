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
        path: 'wallet',
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
        path: 'all-reports',
        component: () => import('@/views/reports/AllReports.vue')
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
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
