import { createRouter, createWebHistory } from 'vue-router'

import HomeView from './views/HomeView.vue'

export const router = createRouter({
  routes: [
    { path: '/', component: HomeView },
  ],
  history: createWebHistory(),
})
