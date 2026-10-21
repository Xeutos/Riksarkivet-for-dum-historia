import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ArticleListView from '../views/ArticleListView.vue'
import QuizView from '../views/QuizView.vue'
import ArticleDetailsView from '../views/ArticleDetailsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/epok/:id', name: 'era', component: ArticleListView },
    { path: '/epok/:id/quiz', name: 'quiz', component: QuizView },
    { path: '/article/:id', name: 'article', component: ArticleDetailsView, props: true },
  ],
})

export default router
