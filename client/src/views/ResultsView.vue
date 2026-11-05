<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { eras } from '../data/eras'
import { placeholderArticles } from '../data/placeholderArticles'
import { useProgressStore } from '../stores/progress'

const API_URL = 'http://localhost:3000/api'
const progressStore = useProgressStore()

const currentUser = ref(null)
const results = ref([])
const loading = ref(true)
const error = ref(null)
const actionMessage = ref(null)

function checkUser() {
  const saved = localStorage.getItem('user')
  currentUser.value = saved ? JSON.parse(saved) : null
}

function getTitle(item) {
  if (item.articleId) {
    const article = placeholderArticles.find((a) => a.id === item.articleId)
    return article ? `Artikel: ${article.title}` : `Artikel #${item.articleId}`
  }
  if (item.quizId) {
    const era = eras.find((e) => e.id === item.quizId)
    return era ? `Epok-quiz: ${era.name}` : `Quiz #${item.quizId}`
  }
  return 'Allmänt quiz'
}

function formatDate(isoString) {
  if (!isoString) return '-'
  const d = new Date(isoString)
  return d.toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function fetchResults() {
  if (!currentUser.value?.username) {
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    const res = await fetch(`${API_URL}/results?username=${encodeURIComponent(currentUser.value.username)}`)
    if (!res.ok) throw new Error(`Could not fetch results: HTTP ${res.status}`)
    results.value = await res.json()
  } catch (err) {
    console.error(err)
    error.value = 'Could not load results from the server. Please check that the backend is running.'
  } finally {
    loading.value = false
  }
}

async function deleteResult(resultId) {
  if (!confirm('Are you sure you want to delete this result?')) return

  try {
    const res = await fetch(`${API_URL}/results/${resultId}`, {
      method: 'DELETE',
    })
    if (!res.ok && res.status !== 404) {
      throw new Error(`Error deleting result: HTTP ${res.status}`)
    }

    results.value = results.value.filter((r) => r.resultId !== resultId)
    actionMessage.value = 'The result has been deleted from the database.'
    setTimeout(() => {
      actionMessage.value = null
    }, 3000)

    // Sync store
    await progressStore.init()
  } catch (err) {
    console.error(err)
    alert('Could not delete the result.')
  }
}

onMounted(() => {
  checkUser()
  fetchResults()
})
</script>

<template>
  <main class="results-page">
    <div class="container">
      <div class="results-header">
        <h1>My quiz results</h1>
        <p class="subtitle">
          Here you can see all saved results from the MySQL database for your account.
        </p>
      </div>

      <!-- Ej inloggad -->
      <div v-if="!currentUser" class="card empty-card">
        <h2>Login to see your saved results</h2>
        <p>Results are saved in the MySQL database when you are logged in and complete a quiz.</p>
        <RouterLink to="/login" class="btn">Go to login</RouterLink>
      </div>

      <!-- Laddar -->
      <div v-else-if="loading" class="card info-card">
        <p>Loading results from the database...</p>
      </div>

      <!-- Felmeddelande -->
      <div v-else-if="error" class="card error-card">
        <p>{{ error }}</p>
        <button class="btn" @click="fetchResults">Try again</button>
      </div>

      <!-- Resultatlista -->
      <div v-else>
        <div v-if="actionMessage" class="banner success-banner">
          {{ actionMessage }}
        </div>

        <div v-if="results.length === 0" class="card empty-card">
          <h2>No saved results yet</h2>
          <p>You haven't completed any quizzes yet. Choose an era and test your knowledge!</p>
          <RouterLink to="/" class="btn">Explore eras</RouterLink>
        </div>

        <div v-else class="results-table-container">
          <table class="results-table">
            <thead>
              <tr>
                <th>Quiz / Artikel</th>
                <th>Poäng</th>
                <th>Resultat</th>
                <th>Datum</th>
                <th>Åtgärd</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in results" :key="item.resultId">
                <td class="col-title">
                  <strong>{{ getTitle(item) }}</strong>
                </td>
                <td class="col-score">
                  {{ item.score }} / {{ item.total }}
                </td>
                <td class="col-status">
                  <span
                    :class="['status-badge', (item.score / item.total >= 0.5) ? 'badge-pass' : 'badge-fail']"
                  >
                    {{ (item.score / item.total >= 0.5) ? 'Godkänd' : 'Ej godkänd' }}
                    ({{ Math.round((item.score / item.total) * 100) }}%)
                  </span>
                </td>
                <td class="col-date">{{ formatDate(item.completedAt) }}</td>
                <td class="col-actions">
                  <button
                    class="btn-delete"
                    title="Remove this result from the database"
                    @click="deleteResult(item.resultId)"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>
</template>

