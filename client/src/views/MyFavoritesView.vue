<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import articleData from '@/data/articles.json'
import { useFavoritesStore } from '@/stores/favorites'

const favoritesStore = useFavoritesStore()

const favoriteArticles = computed(() => {
  return articleData.articles.filter(a => favoritesStore.isFavorite(a.artikelId))
})
</script>

<template>
  <div class="favorites-page">
    <header class="favorites-header">
      <h1>My Favorites</h1>
      <p v-if="favoritesStore.isLoggedIn">
        Articles saved by <strong>{{ favoritesStore.currentUser?.username }}</strong>
      </p>
    </header>

    <!-- Om inte inloggad -->
    <div v-if="!favoritesStore.isLoggedIn" class="empty-state">
      <p>You need to log in to view your favorite articles.</p>
      <RouterLink to="/login" class="action-btn">Log In</RouterLink>
    </div>

    <!-- Om inloggad men inga sparade favoriter -->
    <div v-else-if="favoriteArticles.length === 0" class="empty-state">
      <p>You haven't saved any articles yet.</p>
      <RouterLink to="/" class="action-btn">Explore Articles</RouterLink>
    </div>

    <!-- Lista över sparade artiklar -->
    <ul v-else class="favorites-list">
      <li v-for="article in favoriteArticles" :key="article.artikelId">
        <RouterLink :to="`/article/${article.artikelId}`" class="favorite-card">
          <div class="card-content">
            <span class="era-badge">{{ article.epok }}</span>
            <h3>{{ article.titel }}</h3>
            <p>{{ article.beskrivning }}</p>
          </div>
          <button
            type="button"
            class="remove-btn"
            @click.prevent="favoritesStore.toggleFavorite(article.artikelId)"
            title="Remove from favorites"
          >
            ✕
          </button>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.favorites-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.favorites-header {
  margin-bottom: 2rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background-color: #fefbe5;
  border: 1px dashed var(--ink, #1a1a1a);
  border-radius: 6px;
}

.action-btn {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--ink, #1a1a1a);
  color: #fefbe5;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
}

.favorites-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.favorite-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.25rem;
  background-color: #fefbe5;
  border: 1.5px solid var(--ink, #1a1a1a);
  border-radius: 6px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.favorite-card:hover {
  transform: translateY(-2px);
  box-shadow: 3px 3px 0px rgba(0, 0, 0, 0.08);
}

.era-badge {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #666;
  font-weight: bold;
}

.card-content h3 {
  margin: 0.35rem 0;
}

.remove-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #888;
  padding: 0.2rem 0.5rem;
}

.remove-btn:hover {
  color: #9b1c1c;
}
</style>
