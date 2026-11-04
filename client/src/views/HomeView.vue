<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
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
import { quotes } from '../data/quotes'

const carouselRef = ref(null)
const currentQuoteIndex = ref(0)
let quoteInterval = null

onMounted(() => {
  currentQuoteIndex.value = Math.floor(Math.random() * quotes.length)

  // Byt citat var 15:e sekund
  quoteInterval = setInterval(() => {
    currentQuoteIndex.value = (currentQuoteIndex.value + 1) % quotes.length
  }, 15000)
})

onUnmounted(() => {
  if (quoteInterval) clearInterval(quoteInterval)
})

const scroll = (direction) => {
  if (!carouselRef.value) return
  const offset = direction === 'left' ? -340 : 340
  carouselRef.value.scrollBy({ left: offset, behavior: 'smooth' })
}
</script>

<template>
  <div class="home-container">
    <section class="hero">
      <h1>For stupidity throughout time</h1>

      <transition name="quote-fade" mode="out-in">
        <p :key="currentQuoteIndex" class="hero-quote">
          <span class="quote-text">“{{ quotes[currentQuoteIndex].text }}”</span>
          <span class="quote-meta">— {{ quotes[currentQuoteIndex].author }} ({{ quotes[currentQuoteIndex].year }})</span>
        </p>
      </transition>
    </section>

    <div class="carousel-wrapper">
      <button
        class="side-arrow prev"
        @click="scroll('left')"
        aria-label="Föregående period"
      >
        ‹
      </button>

      <ul class="era-carousel" ref="carouselRef">
        <li v-for="era in eras" :key="era.id" class="carousel-item">
          <RouterLink :to="`/epok/${era.id}`" class="era-card-featured">
            <div class="image-wrapper">
              <img
                :src="era.image"
                :alt="era.name"
                class="era-img"
              />
              <span class="period-pill">{{ era.period }}</span>
            </div>

            <div class="card-body">
              <h3>{{ era.name }}</h3>
              <p class="description">{{ era.description || 'Utforska de mest halsbrytande misstagen och besluten från eran.' }}</p>

              <div class="card-footer">
                <span class="explore-link">Öppna epok →</span>
              </div>
            </div>
          </RouterLink>
        </li>
      </ul>

      <button
        class="side-arrow next"
        @click="scroll('right')"
        aria-label="Nästa period"
      >
        ›
      </button>
    </div>
  </div>
</template>

<style>
.home-container {
  max-width: 1200px;
  margin-inline: auto;
  padding: 0 1rem 4rem;
}

.hero {
  text-align: center;
  padding-block: 2.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}


.hero h1 {
  font-size: 2.5rem;
  margin: 0 0 0.5rem;
}


/* Stilmall för Citat-rutan */
.hero-quote {
  margin: 0.75rem auto 0;
  max-width: 750px;
  line-height: 1.5;
  font-size: 1rem;
}

.quote-text {
  font-style: italic;
  font-weight: 500;
  color: #8c3b24;
  display: block;
  margin-bottom: 0.25rem;
}

.quote-meta {
  display: block;
  font-size: 0.85rem;
  color: var(--ink-muted);
  font-style: normal;
}

/* Mjuk fade vid byte var 15:e sekund */
.quote-fade-enter-active,
.quote-fade-leave-active {
  transition: opacity 0.5s ease;
}

.quote-fade-enter-from,
.quote-fade-leave-to {
  opacity: 0;
}

/* Carousel & Cards */
.carousel-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  width: 100%;
}

.side-arrow {
  position: static;
  transform: none;
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 2px solid var(--ink);
  background: var(--card);
  color: var(--ink);
  font-size: 2rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 2px 3px 0px var(--ink);
  transition: all 0.15s ease;
  padding: 0 0 4px 0;
}

.side-arrow:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--card);
  transform: scale(1.08);
}

.era-carousel {
  flex: 1;
  min-width: 0;
  list-style: none;
  padding: 0.5rem 0.25rem 1.5rem;
  margin: 0;
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.era-carousel::-webkit-scrollbar {
  display: none;
}

.carousel-item {
  flex: 0 0 280px;
  scroll-snap-align: center;
}

@media (min-width: 768px) {
  .carousel-item {
    flex: 0 0 340px;
  }
}

.era-card-featured {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--card);
  border: 2px solid var(--ink);
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.era-card-featured:hover {
  transform: translateY(-6px);
  box-shadow: 4px 6px 0px var(--ink);
}

.image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-bottom: 2px solid var(--ink);
  background: var(--paper);
}

.era-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.era-card-featured:hover .era-img {
  transform: scale(1.05);
}

.period-pill {
  position: absolute;
  bottom: 0.75rem;
  left: 0.75rem;
  background: var(--card);
  border: 1.5px solid var(--ink);
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.2rem 0.75rem;
  color: var(--ink);
  box-shadow: 1px 2px 0 var(--ink);
}

.card-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.card-body h3 {
  font-size: 1.35rem;
  margin: 0 0 0.5rem;
  color: var(--ink);
}

.description {
  color: var(--ink-muted);
  font-size: 0.9rem;
  margin: 0 0 1.25rem;
  line-height: 1.45;
  flex-grow: 1;
}

.card-footer {
  border-top: 1px dashed rgba(43, 33, 24, 0.2);
  padding-top: 0.75rem;
}

.explore-link {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--accent);
  display: inline-flex;
  align-items: center;
}

.era-card-featured:hover .explore-link {
  text-decoration: underline;
}
</style>
