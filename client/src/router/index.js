import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ArticleListView from '../views/ArticleListView.vue'
import ArticleDetailsView from "@/views/ArticleDetailsView.vue";
import LoginView from "@/views/LoginView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/epok/:id', name: 'era', component: ArticleListView },
    { path: '/article/:id', name: 'article', component: ArticleDetailsView, props: true }
  ],
})

export default router
