<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { eras } from '../data/eras'

import articleData from '../../../server/articles.json'

const route = useRoute()

const era = computed(() => eras.find((e) => e.id === Number(route.params.id)))

function matchesEra(articleEpok, eraId) {
  const epokLower = articleEpok.toLowerCase()

  if (eraId === 1) {
    return epokLower.includes('ancient')
  } else if (eraId === 2) {
    return epokLower.includes('medieval')
  } else if (eraId === 3) {
    return epokLower.includes('modern')
  }
  return false
}
const filteredArticles = computed(() => {
  if (!era.value) return []

  return articleData.articles
    .filter((a) => matchesEra(a.epok, era.value.id))
    .sort((a, b) => a.årtalSlut - b.årtalSlut)
})
</script>

<template>
  <RouterLink to="/" class="back-link">← Back to all time periods</RouterLink>

  <section v-if="era">
    <h1>{{ era.name }}</h1>
    <p class="period">{{ era.period }}</p>

    <ul v-if="filteredArticles.length" class="article-list">
      <li v-for="article in filteredArticles" :key="article.artikelId" class="article-card">
        <h2>{{ article.titel }}</h2>
        <p>{{ article.beskrivning }}</p>
        <span class="years">
          ({{ article.årtalStart === article.årtalSlut ? article.årtalStart : `${article.årtalStart} - ${article.årtalSlut}` }})
        </span>
      </li>
    </ul>

    <p v-else class="empty">No stories here yet. The absurdities are on their way!</p>
  </section>

  <section v-else>
    <h1>Time period not found</h1>
    <p>This time period seems to have vanished from the archive.</p>
  </section>
</template>
