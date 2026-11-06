<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import metaData from '@/data/articles.json';
import sectionData from '@/data/article-details.json';
import ArticleQuiz from '@/components/ArticleQuiz.vue';
import { useProgressStore } from '@/stores/progress';
import { useFavoritesStore } from '@/stores/favorites';

const progressStore = useProgressStore();
const favoritesStore = useFavoritesStore();
const router = useRouter();
const emit = defineEmits(['back']);

const props = defineProps({
  id: {
    type: [Number, String],
    default: 1
  }
});

const floatedImages = ref({});

const isFav = computed(() => favoritesStore.isFavorite(props.id));

function handleFavoriteToggle() {
  if (!favoritesStore.isLoggedIn) {
    router.push('/login');
    return;
  }
  favoritesStore.toggleFavorite(props.id);
}

const articleMeta = computed(() => {
  const id = Number(props.id);
  return metaData.articles.find(a => a.artikelId === id) || null;
});

const isPassed = computed(() => progressStore.isArticlePassed(props.id));

const eraId = computed(() => {
  if (!articleMeta.value?.epok) return 1;
  const epokLower = articleMeta.value.epok.toLowerCase();
  if (epokLower.includes('ancient')) return 1;
  if (epokLower.includes('medieval')) return 2;
  return 3;
});

// Find the detailed section entry matching the ID
const articleSections = computed(() => {
  const idStr = String(props.id);
  return sectionData[idStr]?.sektioner || [];
});

// Format the era and year span
const formattedTimeline = computed(() => {
  if (!articleMeta.value) return '';
  const { epok, årtalStart, årtalSlut } = articleMeta.value;

  const formatYear = (y) => (y < 0 ? `${Math.abs(y)} BC` : `${y}`);

  if (årtalStart === årtalSlut) {
    return `${epok} · ${formatYear(årtalStart)}`;
  }
  return `${epok} · ${formatYear(årtalStart)} – ${formatYear(årtalSlut)}`;
});

// Approximate reading time based on total word count
const readingTime = computed(() => {
  let wordCount = (articleMeta.value?.beskrivning || '').split(/\s+/).length;
  articleSections.value.forEach(s => {
    wordCount += (s.beskrivning || '').split(/\s+/).length;
  });
  return Math.max(1, Math.ceil(wordCount / 200));
});

function getParagraphs(text) {
  if (!text) return [];
  return text.split('\n\n').filter(p => p.trim().length > 0);
}

function handleBack() {
  if (router) {
    router.back();
  } else {
    emit('back');
  }
}

function handleImageLoad(event, url) {
  if (!url) return;
  const img = event.target;

  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;
  const parentWidth = img.closest('.section-block')?.clientWidth || window.innerWidth;

  const isNarrowEnough = naturalWidth < (parentWidth * 0.65);
  const isPortraitOrSquare = naturalWidth <= (naturalHeight * 1.3);

  if (isNarrowEnough || isPortraitOrSquare) {
    floatedImages.value = {
      ...floatedImages.value,
      [url]: true
    };
  }
}

function isSmallImage(url) {
  return !!floatedImages.value[url];
}
</script>

<template>
  <div class="article-page">
    <article v-if="articleMeta">

      <!-- Optional Hero Image (from metadata if exists) -->
      <figure v-if="articleMeta.bild?.bildUrl" class="hero-figure">
        <div class="hero-image-frame">
          <img :src="articleMeta.bild.bildUrl" :alt="articleMeta.bild.bildText || articleMeta.titel" />
        </div>
        <figcaption v-if="articleMeta.bild.bildText" class="image-caption">
          {{ articleMeta.bild.bildText }}
        </figcaption>
      </figure>

      <header class="article-header">
        <div class="era-tag-row">
          <div class="era-tag-group">
            <p class="era-tag">{{ formattedTimeline }}</p>
            <span v-if="isPassed" class="article-passed-badge">
              <svg class="badge-icon" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              Completed
            </span>
          </div>

          <!-- Favorit-stjärna -->
          <button
            type="button"
            class="favorite-btn"
            :class="{ 'is-active': isFav }"
            @click="handleFavoriteToggle"
            :title="favoritesStore.isLoggedIn ? (isFav ? 'Remove from favorites' : 'Save to favorites') : 'Log in to save favorites'"
            :aria-label="isFav ? 'Remove from favorites' : 'Save to favorites'"
          >
            <svg
              class="star-icon"
              viewBox="0 0 24 24"
              :fill="isFav ? '#eab308' : 'none'"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        </div>

        <h1 class="article-title">{{ articleMeta.titel }}</h1>
        <p class="article-lead">{{ articleMeta.beskrivning }}</p>

        <div class="article-meta">
          <span class="catalog-ref">By {{ articleMeta.författare }}</span>
          <span class="reading-estimate">{{ readingTime }} min read</span>
        </div>
      </header>

      <!-- Dynamic Sections from Sections JSON -->
      <div v-if="articleSections.length > 0" class="article-body">
        <section
          v-for="(section, index) in articleSections"
          :key="index"
          class="section-block"
          :class="{ 'first-section': index === 0 }"
        >
          <h2 v-if="index !== 0" class="section-heading">{{ section.rubrik }}</h2>

          <!-- Section Image (if URL is populated) -->
          <figure
            v-if="section.bild?.bildUrl"
            class="section-figure"
            :class="{ 'isFloated': isSmallImage(section.bild.bildUrl) }"
          >
            <div class="image-frame">
              <img
                :src="section.bild.bildUrl"
                :alt="section.bild.bildText || section.rubrik"
                @load="handleImageLoad($event, section.bild.bildUrl)"
              />
            </div>
            <figcaption v-if="section.bild.bildText" class="image-caption">
              {{ section.bild.bildText }}
            </figcaption>
          </figure>

          <!-- Handles multi-paragraph text split by newlines -->
          <p
            v-for="(para, pIdx) in getParagraphs(section.beskrivning)"
            :key="pIdx"
            class="section-text"
          >
            {{ para }}
          </p>
        </section>
      </div>

      <!-- Article Quiz Section -->
      <ArticleQuiz :article-id="props.id" :era-id="eraId" />

      <!-- Historical Record Footer -->
      <footer class="article-footer">
        <h3 class="footer-heading">Historical Archive Documentation</h3>
        <p class="footer-text">
          Cataloged under {{ articleMeta.epok }} collection. Preserved for educational and research reference.
        </p>
      </footer>
    </article>

    <!-- Missing Record State -->
    <div v-else class="not-found">
      <h2>Record Not Found</h2>
      <p>The requested archival document could not be located.</p>
      <button class="back-button" type="button" @click="handleBack">
        &larr; Return to collection
      </button>
    </div>
  </div>
</template>

<style scoped>
.article-page {
  background-color: #F4EFEA;
  min-height: 100vh;
  color: #1a1a1a;
  padding: 28px 0 96px 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  box-sizing: border-box;
}

/* Header & Metadata */
.article-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding-bottom: 28px;
  margin-bottom: 40px;
  width: 100%;
}

.era-tag {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #7F2819;
  margin-bottom: 14px;
}

.article-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.25;
  color: #111111;
  letter-spacing: -0.01em;
  margin: 0 0 16px 0;
}

.article-lead {
  font-family: inherit;
  font-size: 1.05rem;
  line-height: 1.6;
  color: #4a4a4a;
  font-style: italic;
  margin: 0 0 20px 0;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #666;
}

.reading-estimate {
  letter-spacing: 0.02em;
}

/* Main Lead Image */
.hero-figure {
  margin: 0 0 44px 0;
}

.hero-image-frame {
  width: 100%;
  height: 500px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-image-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-frame {
  width: auto;
  max-width: 100%;
  overflow: hidden;
  display: block;
}

.image-frame img {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
  border-radius: 4px;
  border: 1px solid #1a1a1a;
}

.image-caption {
  font-size: 0.85rem;
  color: #555;
  margin-top: 10px;
  font-style: italic;
  border-left: 2px solid #7F2819;
  padding-left: 10px;
  display: block;
}

/* Main Body & Sections */
.article-body {
  width: 100%;
  margin: 0;
}

.section-block {
  display: block;
  margin-bottom: 48px;
  clear: both;
}

.section-block::after {
  content: "";
  display: table;
  clear: both;
}

.section-heading {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.35rem;
  font-weight: 700;
  color: #111111;
  margin-top: 32px;
  margin-bottom: 12px;
  line-height: 1.3;
}

.section-figure {
  margin: 28px 0;
}

.section-figure.isFloated {
  float: left;
  display: table;
  width: fit-content;
  max-width: 45%;
  margin: 6px 20px 14px 0;
  clear: left;
}

.section-figure.isFloated .image-frame {
  width: 100%;
  height: auto;
  display: block;
}

.section-figure.isFloated .image-frame img {
  width: 100%;
  height: auto;
  max-height: 380px;
  display: block;
  object-fit: contain;
}

.section-figure.isFloated .image-caption {
  display: table-caption;
  caption-side: bottom;
  box-sizing: border-box;
  width: 100%;
}

@media (max-width: 600px) {
  .section-figure.isFloated {
    float: none;
    max-width: 100%;
    margin: 24px 0;
  }
}

.section-text {
  font-size: 1rem;
  line-height: 1.7;
  color: #2b2b2b;
  margin-bottom: 18px;
}

/* Editorial Dropcap */
.first-section .section-text:first-of-type::first-letter {
  font-family: Georgia, 'Times New Roman', serif;
  float: left;
  font-size: 2.8rem;
  line-height: 0.85;
  padding-top: 2px;
  padding-right: 8px;
  padding-bottom: 0;
  color: #7F2819;
  font-weight: 700;
}

/* Footer / Sources */
.article-footer {
  width: 100%;
  margin: 64px auto 0 auto;
  padding-top: 28px;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.footer-heading {
  font-family: "Georgia", "Times New Roman", serif;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 10px 0;
  color: #111;
}

.footer-text {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #666;
  margin: 0;
}

/* Not Found View */
.not-found {
  text-align: center;
  padding: 80px 20px;
}

.not-found h2 {
  font-family: "Georgia", "Times New Roman", serif;
  font-size: 2rem;
  margin-bottom: 12px;
}

.not-found p {
  color: #666;
  margin-bottom: 24px;
}

.era-tag-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.era-tag-row .era-tag {
  margin: 0;
}

.era-tag-group {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.favorite-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #8c857b;
  border-radius: 4px;
  transition: transform 0.15s ease, color 0.15s ease;
}

.favorite-btn:hover {
  transform: scale(1.15);
  color: #eab308;
}

.star-icon {
  width: 24px;
  height: 24px;
}

.favorite-btn.is-active {
  color: #eab308;
}

.article-passed-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #e8f5e9;
  color: #1b5e20;
  border: 1px solid #2e7d32;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-icon {
  width: 14px;
  height: 14px;
  color: #2e7d32;
}
</style>