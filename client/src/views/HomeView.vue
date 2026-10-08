<script setup>
import { RouterLink } from 'vue-router'
import { eras } from '../data/eras'
</script>

<template>
  <section class="hero">
    <h1>Riksarkivet för dum historia</h1>
    <p class="slogan">För dumhet genom tiden.</p>
  </section>

  <section>
    <h2>Välj en epok</h2>
    <ul class="era-list">
  <li v-for="era in eras" :key="era.id">
    <RouterLink :to="`/epok/${era.id}`" class="era-card">
      <h3>{{ era.name }}</h3>
      <p>{{ era.period }}</p>
    </RouterLink>
  </li>
</ul>
  </section>
</template>

<style scoped>
.hero {
  text-align: center;
  padding-block: 3rem 2rem;
}

.slogan {
  font-style: italic;
  font-size: 1.2rem;
  color: var(--ink-muted);
}

.era-list {
  list-style: none;
  padding: 0 0 1rem;
  margin: 0;
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.era-list li {
  flex: 0 0 240px;
  scroll-snap-align: start;
}

.era-card {
  flex: 0 0 240px;
  scroll-snap-align: start;
  background: var(--card);
  border: 2px solid var(--ink);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: transform 0.15s;
  display: block;
  text-decoration: none;
  color: inherit;
}

.era-card:hover {
  transform: translateY(-4px);
}

.era-card h3 {
  margin: 0 0 0.5rem;
}

.era-card p {
  margin: 0;
  color: var(--ink-muted);
  font-size: 0.9rem;
}
</style>
