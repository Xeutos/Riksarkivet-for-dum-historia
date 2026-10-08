<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { eras } from '../data/eras'
import { placeholderArticles } from '../data/placeholderarticles'

const route = useRoute()

const era = computed(() => eras.find((e) => e.id === Number(route.params.id)))

const articles = computed(() =>
  placeholderArticles.filter((a) => a.eraId === Number(route.params.id))
)
</script>

<template>
  <RouterLink to="/" class="back-link">← Alla epoker</RouterLink>

  <section v-if="era">
    <h1>{{ era.name }}</h1>
    <p class="period">{{ era.period }}</p>

    <ul v-if="articles.length" class="article-list">
      <li v-for="article in articles" :key="article.id" class="article-card">
        <h2>{{ article.title }}</h2>
        <p>{{ article.excerpt }}</p>
      </li>
    </ul>

    <p v-else class="empty">Inga historier här ännu. Dumheterna är på väg!</p>
  </section>

  <section v-else>
    <h1>Epoken hittades inte</h1>
    <p>Den här epoken verkar ha försvunnit ur arkivet.</p>
  </section>
</template>

<style scoped>
.back-link {
  display: inline-block;
  margin-block: 1.5rem 1rem;
  color: var(--ink-muted);
  text-decoration: none;
}

.back-link:hover {
  color: var(--ink);
}

.period {
  color: var(--ink-muted);
  margin-top: 0;
}

.article-list {
  list-style: none;
  padding: 0;
  margin: 2rem 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

}
@media (max-width: 768px) {
  .article-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

.article-card {
  background: var(--card);
  border: 2px solid var(--ink);
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  transition: transform 0.15s;
}

.article-card:hover {
  transform: translateX(4px);
}

.article-card h2 {
  font-size: 1.25rem;
  margin: 0 0 0.5rem;
}

.article-card p {
  margin: 0;
  color: var(--ink-muted);
}

.empty {
  margin-block: 2rem;
  font-style: italic;
  color: var(--ink-muted);
}
</style>
