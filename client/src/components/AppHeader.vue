<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()
const currentUser = ref(null)
const isDropdownOpen = ref(false)

function checkAuth() {
  const saved = localStorage.getItem('user')
  currentUser.value = saved ? JSON.parse(saved) : null
}

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

function handleLogout() {
  localStorage.removeItem('user')
  currentUser.value = null
  isDropdownOpen.value = false
  window.dispatchEvent(new Event('auth-changed'))
  router.push('/')
}

function handleClickOutside(event) {
  if (!event.target.closest('.user-menu-container')) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  checkAuth()
  window.addEventListener('auth-changed', checkAuth)
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('auth-changed', checkAuth)
  window.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header class="site-header">
    <div class="container header-inner">
      <RouterLink to="/" class="logo">Riksarkivet</RouterLink>
      <nav>
        <RouterLink to="/" class="nav-link">Hem</RouterLink>

        <!-- Om INTE inloggad: visa Logga in-knapp -->
        <RouterLink v-if="!currentUser" to="/login" class="btn">
          Logga in
        </RouterLink>

        <!-- Om INLOGGAD: visa användarikon + dropdown -->
        <div v-else class="user-menu-container">
          <button class="user-btn" @click.stop="toggleDropdown">
            <!-- Användarikon (SVG) -->
            <svg class="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span class="username">{{ currentUser.username }}</span>
            <span class="arrow" :class="{ open: isDropdownOpen }">▾</span>
          </button>

          <!-- Dropdown-meny -->
          <div v-if="isDropdownOpen" class="dropdown-menu">
            <button class="dropdown-item logout" @click="handleLogout">
              Logga ut
            </button>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  border-bottom: 2px solid var(--ink, #1a1a1a);
  background-color: var(--paper, #fdfbf7);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: 1rem;
}

.logo {
  font-family: var(--font-heading, serif);
  font-size: 1.5rem;
  color: var(--ink, #1a1a1a);
  text-decoration: none;
}

nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: var(--ink, #1a1a1a);
  text-decoration: none;
  font-weight: 500;
}

.nav-link:hover {
  text-decoration: underline;
}

.btn {
  background-color: #fefbe5;
  color: var(--ink, #1a1a1a);
  border: 1px solid var(--ink, #1a1a1a);
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.btn:hover {
  background-color: #f5eed3;
}

/* User Menu & Dropdown */
.user-menu-container {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #fefbe5;
  color: var(--ink, #1a1a1a);
  border: 1px solid var(--ink, #1a1a1a);
  border-radius: 4px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.user-btn:hover {
  background-color: #f5eed3;
}

.user-icon {
  width: 18px;
  height: 18px;
}

.arrow {
  font-size: 0.75rem;
  transition: transform 0.2s ease;
}

.arrow.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 0.4rem);
  background-color: #fefbe5;
  border: 1px solid var(--ink, #1a1a1a);
  border-radius: 4px;
  min-width: 130px;
  box-shadow: 2px 4px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  z-index: 100;
  overflow: hidden;
}

.dropdown-item {
  background: none;
  border: none;
  text-align: left;
  padding: 0.6rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--ink, #1a1a1a);
  transition: background-color 0.15s ease;
}

.dropdown-item:hover {
  background-color: #f0e6c2;
}

.dropdown-item.logout {
  color: #a82323;
  font-weight: 600;
}
</style>
