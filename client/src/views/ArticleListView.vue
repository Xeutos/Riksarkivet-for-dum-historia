<script setup>
import { computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { eras } from '../data/eras'

import articleData from '../data/articles.json'
import { useProgressStore } from '../stores/progress'

const route = useRoute()
const router = useRouter()
const progressStore = useProgressStore()

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

const isCurrentEraPassed = computed(() => {
  if (!era.value) return false
  const ids = filteredArticles.value.map((a) => a.artikelId)
  return progressStore.isEraPassed(era.value.id, ids)
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

    <div v-if="isCurrentEraPassed" class="era-completed-banner">
      <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clip-rule="evenodd"
        />
      </svg>
      <span>Time period completed!</span>
    </div>

    <ul v-if="filteredArticles.length" class="article-list">
      <li v-for="article in filteredArticles" :key="article.artikelId" class="article-card">
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

.era-title {
  margin: 0 0 0.25rem;
}

.select-wrap {
  position: relative;
  display: inline-block;
}

.select-wrap::after {
  content: '▾';
  position: absolute;
  right: 0.25rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 0.7em;
  color: var(--ink);
}

.era-select {
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  font: inherit;
  color: var(--ink);
  padding: 0 1.75rem 0 0;
  cursor: pointer;
  transition: border-color 0.15s;
}

.era-select:hover {
  border-bottom-color: var(--ink);
}

.era-select:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}

.era-select option {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--ink);
  background: var(--card);
}

.period {
  color: var(--ink-muted);
  margin-top: 0;
}

.era-completed-banner {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #e8f5e9;
  border: 1.5px solid #2e7d32;
  color: #1b5e20;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.check-icon {
  width: 18px;
  height: 18px;
  color: #2e7d32;
}

.article-list {
  list-style: none;
  padding: 0;
  margin: 2rem 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .article-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

.article-card {
  display: flex;
  flex-direction: column;
  background: var(--card);
  border: 2px solid var(--ink);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s;
}

.article-card:hover {
  transform: translateY(-4px);
}

.article-link {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.article-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
  border-bottom: 2px solid var(--ink);
}

.article-content {
  padding: 1.25rem 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.35rem;
}

.card-title-row h2 {
  font-size: 1.25rem;
  margin: 0;
  flex: 1;
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
  flex-shrink: 0;
}

.card-check-icon {
  width: 14px;
  height: 14px;
  color: #2e7d32;
}

.article-content p {
  margin: 0 0 0.75rem;
  color: var(--ink-muted);
}

.years {
  font-size: 0.85rem;
  color: var(--ink-muted);
  font-style: italic;
  margin-top: auto;
}

.empty {
  margin-block: 2rem;
  font-style: italic;
  color: var(--ink-muted);
}

.era-nav {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  margin-block: 2rem 3rem;
}

.era-arrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  background: var(--card);
  border: 2px solid var(--ink);
  border-radius: 6px;
  color: var(--ink);
  text-decoration: none;
  font-size: 1.05rem;
  transition: transform 0.15s;
}

.era-arrow.prev {
  justify-self: start;
}

.era-arrow.prev:hover {
  transform: translateX(-3px);
}

.era-arrow.next {
  justify-self: end;
}

.era-arrow.next:hover {
  transform: translateX(3px);
}

.quiz-btn {
  display: inline-block;
  text-decoration: none;
  font-size: 1.1rem;
  padding: 0.75rem 2rem;
}

@media (max-width: 600px) {
  .arrow-label {
    display: none;
  }

  .quiz-btn {
    font-size: 1rem;
    padding: 0.6rem 1.2rem;
  }
}
</style>
