<script setup>
import { computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { eras } from '../data/eras'

import articleData from '../../../server/articles.json'

const route = useRoute()
const router = useRouter()

const era = computed(() => eras.find((e) => e.id === Number(route.params.id)))

const currentIndex = computed(() => eras.findIndex((e) => e.id === Number(route.params.id)))

const prevEra = computed(() => (currentIndex.value > 0 ? eras[currentIndex.value - 1] : null))

const nextEra = computed(() =>
  currentIndex.value >= 0 && currentIndex.value < eras.length - 1
    ? eras[currentIndex.value + 1]
    : null
)

const selectedEraId = computed({
  get: () => era.value?.id,
  set: (id) => router.push(`/epok/${id}`),
})

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
    <label for="era-select" class="sr-only">Choose time period</label>
    <h1 class="era-title">
      <span class="select-wrap">
        <select id="era-select" v-model="selectedEraId" class="era-select">
          <option v-for="e in eras" :key="e.id" :value="e.id">{{ e.name }}</option>
        </select>
      </span>
    </h1>
    <p class="period">{{ era.period }}</p>

    <ul v-if="filteredArticles.length" class="article-list">
      <li v-for="article in filteredArticles" :key="article.artikelId" class="article-card">
        <img
          v-if="article.bild && article.bild.bildUrl"
          :src="article.bild.bildUrl"
          :alt="article.bild.bildText || article.titel"
          class="article-image"
        />

        <div class="article-content">
          <h2>{{ article.titel }}</h2>
          <p>{{ article.beskrivning }}</p>
          <span class="years">
            ({{
              article.årtalStart === article.årtalSlut
                ? article.årtalStart
                : `${article.årtalStart} - ${article.årtalSlut}`
            }})
          </span>
        </div>
      </li>
    </ul>

    <p v-else class="empty">No stories here yet. The absurdities are on their way!</p>

    <nav class="era-nav" aria-label="Time periods">
      <RouterLink
        v-if="prevEra"
        :to="`/epok/${prevEra.id}`"
        class="era-arrow prev"
        :aria-label="`Previous time period: ${prevEra.name}`"
      >
        <span aria-hidden="true">←</span>
        <span class="arrow-label">{{ prevEra.name }}</span>
      </RouterLink>
      <span v-else></span>

      <RouterLink :to="`/epok/${era.id}/quiz`" class="btn quiz-btn">
        Ready for the quiz?
      </RouterLink>

      <RouterLink
        v-if="nextEra"
        :to="`/epok/${nextEra.id}`"
        class="era-arrow next"
        :aria-label="`Next time period: ${nextEra.name}`"
      >
        <span class="arrow-label">{{ nextEra.name }}</span>
        <span aria-hidden="true">→</span>
      </RouterLink>
      <span v-else></span>
    </nav>
  </section>

  <section v-else>
    <h1>Time period not found</h1>
    <p>This time period seems to have vanished from the archive.</p>
  </section>
</template>
