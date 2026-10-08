<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="site-header">
    <div class="container header-inner">
      <RouterLink to="/" class="logo">Riksarkivet</RouterLink>
      <nav>
        <RouterLink to="/" class="nav-link">Hem</RouterLink>
        <button class="btn">Logga in</button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  border-bottom: 2px solid var(--ink);
  background-color: #c30000;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: 1rem;
}

.logo {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  color: var(--ink);
  text-decoration: none;
}

nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  color: var(--ink);
  text-decoration: none;
  background-color: #fefbe5;
}

.nav-link:hover {
  text-decoration: underline;
}
.btn {
  background-color: #fefbe5;
  color: var(--ink);
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
.btn:hover {
  background-color: #e0d8b0;
} 
</style>
