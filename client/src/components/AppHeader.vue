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
      <RouterLink to="/" class="logo">National Archives of Foolish History</RouterLink>
      <nav>
        <RouterLink to="/" class="nav-link">Home</RouterLink>
        <RouterLink to="/bidra" class="nav-link">Contribute with question</RouterLink>

        <!-- Om INTE inloggad: visa Logga in-knapp -->
        <RouterLink v-if="!currentUser" to="/login" class="btn">Log in</RouterLink>

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
            <RouterLink to="/mina-resultat" class="dropdown-item" @click="isDropdownOpen = false">
              My results
            </RouterLink>
            <RouterLink to="/favorites" class="dropdown-item" @click="isDropdownOpen = false">
              My Favorites
            </RouterLink>
            <RouterLink to="/bidra" class="dropdown-item" @click="isDropdownOpen = false">
              Contribute with question
            </RouterLink>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item logout" @click="handleLogout">
              Log out
            </button>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  background-color: #2c2621;
  border-bottom: 4px solid #8c3b24;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  width: 100%;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: clamp(0.85rem, 2vw, 1.5rem);
  padding-inline: var(--page-margin);
  max-width: 100% !important;
  box-sizing: border-box;
  flex-wrap: wrap;
  gap: 1rem;
}

.logo {
  font-family: var(--font-heading, serif);
  font-size: clamp(1.2rem, 2vw + 0.5rem, 2rem);
  letter-spacing: 0.02em;
  color: #f7f3eb;
  text-decoration: none;
  font-weight: 700;
  line-height: 1.2;
}

.logo:hover {
  color: #e5a982;
}

nav {
  display: flex;
  align-items: center;
  gap: clamp(1rem, 2vw, 2rem);
  flex-wrap: wrap;
}

.nav-link {
  color: #d8cfc4;
  text-decoration: none;
  font-size: clamp(0.95rem, 1.2vw, 1.15rem);
  font-weight: 600;
  display: inline-block;
  transition: color 0.15s ease, transform 0.15s ease;
  white-space: nowrap;
}

.nav-link:hover {
  color: #e5a982;
  transform: translateY(-1px);
}

.btn {
  background-color: transparent;
  color: #f7f3eb;
  border: 2px solid #d8cfc4;
  border-radius: 8px;
  font-size: clamp(0.95rem, 1.2vw, 1.1rem);
  padding: clamp(0.4rem, 0.8vw, 0.6rem) clamp(0.8rem, 1.5vw, 1.3rem);
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  font-weight: 600;
  box-shadow: 2px 2px 0px #8c3b24;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.btn:hover {
  background: var(--accent);
  border-color: var(--accent);
  box-shadow: 2px 2px 0px #fff3e0;
  color: var(--card);
  transform: scale(1.08);
}

.user-menu-container {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #2f251c;
  color: #f7f3eb;
  border: 2px solid #4a3d31;
  border-radius: 8px;
  padding: clamp(0.4rem, 0.8vw, 0.55rem) clamp(0.7rem, 1.2vw, 1rem);
  cursor: pointer;
  font-family: inherit;
  font-size: clamp(0.9rem, 1.1vw, 1.05rem);
  font-weight: 600;
  transition: all 0.15s ease;
}

.user-btn:hover {
  background-color: #3b2f24;
  border-color: #b54930;
}

.user-icon {
  width: clamp(16px, 1.5vw, 20px);
  height: clamp(16px, 1.5vw, 20px);
  stroke: #e5a982;
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
  top: calc(100% + 0.5rem);
  background-color: #241c15;
  border: 1.5px solid #4a3d31;
  border-radius: 8px;
  min-width: 100%;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  z-index: 100;
  overflow: hidden;
}

.dropdown-item {
  background: none;
  border: none;
  text-align: left;
  padding: 0.75rem 1.1rem;
  cursor: pointer;
  font-size: 0.95rem;
  font-family: inherit;
  color: #f7f3eb;
  transition: background-color 0.15s ease;
}

.dropdown-item:hover {
  background-color: #352a20;
}

.dropdown-divider {
  height: 1px;
  background-color: rgba(26, 26, 26, 0.15);
  margin: 0.25rem 0;
}

.dropdown-item.logout {
  color: #f87171;
  font-weight: 600;
  border-top: 1px solid #352a20;
}

.dropdown-item.logout:hover {
  background-color: rgba(248, 113, 113, 0.15);
}

/* Anpassning för mindre skärmar (t.ex. mobiler under 650px) */
@media (max-width: 650px) {
  .header-inner {
    flex-direction: column;
    align-items: flex-start;
  }

  nav {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
