<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import { useProgressStore } from './stores/progress'

const progressStore = useProgressStore()

onMounted(() => {
  progressStore.init()
  window.addEventListener('auth-changed', () => {
    progressStore.syncWithServer()
  })
})
</script>

<template>
  <AppHeader />
  <main class="container">
    <RouterView />
  </main>
</template>
