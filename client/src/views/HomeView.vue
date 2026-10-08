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
    <h2>Choose a time period</h2>
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


