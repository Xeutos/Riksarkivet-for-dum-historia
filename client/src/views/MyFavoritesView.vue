<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import articleData from '@/data/articles.json'
import { useFavoritesStore } from '@/stores/favorites'
import { useProgressStore } from '@/stores/progress'

const favoritesStore = useFavoritesStore()
const progressStore = useProgressStore()

const favoriteArticles = computed(() => {
  return articleData.articles
    .filter((a) => favoritesStore.isFavorite(a.artikelId))
    .sort((a, b) => a.årtalSlut - b.årtalSlut)
})
</script>

<template>
  <section>
    <h1 class="era-title">My Favorites</h1>

    <!-- Om inte inloggad -->
    <div v-if="!favoritesStore.isLoggedIn" class="empty-state">
      <p>You need to log in to view your favorite articles.</p>
      <RouterLink to="/login" class="btn">Log In</RouterLink>
    </div>

    <!-- Om inloggad men inga sparade favoriter -->
    <div v-else-if="favoriteArticles.length === 0" class="empty-state">
      <p>You haven't saved any articles yet.</p>
      <RouterLink to="/" class="btn">Explore Articles</RouterLink>
    </div>

    <!-- Lista över sparade artiklar -->
    <ul v-else class="article-list">
      <li v-for="article in favoriteArticles" :key="article.artikelId" class="article-card">
        <RouterLink :to="`/article/${article.artikelId}`" class="article-link">
          <img
            v-if="article.bild && article.bild.bildUrl"
            :src="article.bild.bildUrl"
            :alt="article.bild.bildText || article.titel"
            class="article-image"
          />

          <div class="article-content">
            <div class="card-title-row">
              <h2>{{ article.titel }}</h2>

              <div class="card-actions">
                <span
                  v-if="progressStore.isArticlePassed(article.artikelId)"
                  class="article-card-checkmark"
                  title="Article completed!"
                >
                  <svg class="card-check-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span class="check-label">Completed</span>
                </span>

                <button
                  type="button"
                  class="remove-btn"
                  title="Remove from favorites"
                  aria-label="Remove from favorites"
                  @click.prevent="favoritesStore.toggleFavorite(article.artikelId)"
                >
                  ✕
                </button>
              </div>
            </div>

            <p>{{ article.beskrivning }}</p>
            <span class="years">
              ({{
                article.årtalStart === article.årtalSlut
                  ? article.årtalStart
                  : `${article.årtalStart} - ${article.årtalSlut}`
              }})
            </span>
          </div>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
section {
  padding-top: 2.5rem;
  width: 100%;
  margin: 0;
  box-sizing: border-box;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.card-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.35rem;
}

.card-title-row h2 {
  margin: 0;
  flex: 1;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.article-card-checkmark {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: #e8f5e9;
  border: 1px solid #2e7d32;
  color: #1b5e20;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.card-check-icon {
  width: 14px;
  height: 14px;
  color: #2e7d32;
}

.remove-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  color: #888;
  padding: 0.2rem 0.4rem;
}

.remove-btn:hover {
  color: #9b1c1c;
}
</style>
