import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFavoritesStore = defineStore('favorites', () => {
  const currentUser = ref(getCurrentUser())
  const favoriteIds = ref(loadFavorites())

  function getCurrentUser() {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  function loadFavorites() {
    const user = getCurrentUser()
    if (!user?.username) return []
    try {
      const stored = localStorage.getItem(`favorites_${user.username}`)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  function persist() {
    if (!currentUser.value?.username) return
    localStorage.setItem(
      `favorites_${currentUser.value.username}`,
      JSON.stringify(favoriteIds.value)
    )
  }

  function syncUser() {
    currentUser.value = getCurrentUser()
    favoriteIds.value = loadFavorites()
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('auth-changed', syncUser)
    window.addEventListener('storage', syncUser)
  }

  const isLoggedIn = computed(() => !!currentUser.value?.username)

  function isFavorite(articleId) {
    return favoriteIds.value.includes(Number(articleId))
  }

  function toggleFavorite(articleId) {
    if (!isLoggedIn.value) {
      return false
    }

    const id = Number(articleId)
    const index = favoriteIds.value.indexOf(id)

    if (index > -1) {
      favoriteIds.value.splice(index, 1)
    } else {
      favoriteIds.value.push(id)
    }

    persist()
    return true
  }

  return {
    currentUser,
    isLoggedIn,
    favoriteIds,
    isFavorite,
    toggleFavorite,
    syncUser
  }
})
