<script setup>
import { RouterLink } from 'vue-router'
import { eras } from '../data/eras'
import articleData from '../data/articles.json'
import { useProgressStore } from '../stores/progress'

const progressStore = useProgressStore()

function getEraArticleIds(eraId) {
  return articleData.articles
    .filter((a) => {
      const epokLower = a.epok.toLowerCase()
      if (eraId === 1) return epokLower.includes('ancient')
      if (eraId === 2) return epokLower.includes('medieval')
      if (eraId === 3) return epokLower.includes('modern')
      return false
    })
    .map((a) => a.artikelId)
}

function isEraPassed(eraId) {
  return progressStore.isEraPassed(eraId, getEraArticleIds(eraId))
}
</script>

<template>
  <section class="hero">
    <h1>Riksarkivet för dum historia</h1>
    <p class="slogan">För dumhet genom tiden.</p>
  </section>

  <section>
    <h2>Choose a time period</h2>
    <ul class="era-list">
      <li v-for="era in eras" :key="era.id">
        <RouterLink
          :to="`/epok/${era.id}`"
          class="era-card"
          :class="{ 'era-passed': isEraPassed(era.id) }"
        >
          <div class="era-card-header">
            <h3>{{ era.name }}</h3>
            <span v-if="isEraPassed(era.id)" class="era-check-badge" title="Time period completed!">
              <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>Completed</span>
            </span>
          </div>
          <p>{{ era.period }}</p>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.era-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.era-card-header h3 {
  margin: 0;
}

.era-check-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: #e8f5e9;
  border: 1px solid #2e7d32;
  color: #1b5e20;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.check-icon {
  width: 13px;
  height: 13px;
  color: #2e7d32;
}

.era-card.era-passed {
  border-left: 4px solid #2e7d32;
}
</style>


