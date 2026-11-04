<template>
  <div class="article-page">
    <article v-if="articleMeta" >

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
          <figure v-if="section.bild?.bildUrl"
                  class="section-figure"
                  :class="{'isFloated': isSmallImage(section.bild.bildUrl)}">
            <div class="image-frame">
              <img :src="section.bild.bildUrl"
                   :alt="section.bild.bildText || section.rubrik"
                   @load="handleImageLoad($event, section.bild.bildUrl)"/>
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

<script setup>
import { computed } from 'vue';
import { ref } from "vue";
import { useRouter } from 'vue-router';

import metaData from '@/data/articles.json';
import sectionData from '@/data/article-details.json';
import ArticleQuiz from '@/components/ArticleQuiz.vue';
import { useProgressStore } from '@/stores/progress';

const progressStore = useProgressStore();

const props = defineProps({
  id: {
    type: [Number, String],
    default: 1
  }
});

const floatedImages= ref({});
const emit = defineEmits(['back']);
const router = useRouter();

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
    return `${epok} • ${formatYear(årtalStart)}`;
  }
  return `${epok} • ${formatYear(årtalStart)} – ${formatYear(årtalSlut)}`;
});

// Approximate reading time based on total word count
const readingTime = computed(() => {
  let wordCount = (articleMeta.value?.beskrivning || '').split(/\s+/).length;
  articleSections.value.forEach(s => {
    wordCount += (s.beskrivning || '').split(/\s+/).length;
  });
  return Math.max(1, Math.ceil(wordCount / 200));
});

// Splits long text blocks with double-newlines (\n\n) into separate paragraphs
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
  const isPortraitOrSquare = naturalWidth <= naturalHeight * 1.3; // Tillåt även lätt rektangulära

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

<style scoped>
  @import '@/assets/article.css';

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
