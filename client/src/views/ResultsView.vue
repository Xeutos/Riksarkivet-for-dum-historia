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
    return article ? `Article: ${article.title}` : `Article #${item.articleId}`
  }
  if (item.quizId) {
    const era = eras.find((e) => e.id === item.quizId)
    return era ? `Era-quiz: ${era.name}` : `Quiz #${item.quizId}`
  }
  return 'General quiz'
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
                <th>Quiz / Article</th>
                <th>Score</th>
                <th>Result</th>
                <th>Date</th>
                <th>Action</th>
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
                    {{ (item.score / item.total >= 0.5) ? 'Completed' : 'Failed' }}
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

<style scoped>
.results-page {
  padding-block: 2.5rem;
}

.results-header {
  margin-bottom: 2rem;
  text-align: center;
}

.subtitle {
  color: var(--ink-muted);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0.5rem auto 0;
}

.card {
  background: var(--card);
  border: 1px solid rgba(43, 33, 24, 0.15);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.empty-card h2 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.empty-card p {
  color: var(--ink-muted);
  margin-bottom: 1.5rem;
}

.banner {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 600;
}

.success-banner {
  background: #e6f4ea;
  color: #137333;
  border: 1px solid #ceead6;
}

.error-card {
  background: #fce8e6;
  border-color: #fad2cf;
  color: #c5221f;
}

.results-table-container {
  background: var(--card);
  border: 1px solid rgba(43, 33, 24, 0.15);
  border-radius: 8px;
  overflow-x: auto;
  box-shadow: 0 4px 12px rgba(43, 33, 24, 0.05);
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.results-table th {
  background: rgba(43, 33, 24, 0.04);
  padding: 1rem;
  font-family: var(--font-heading);
  font-size: 1.05rem;
  border-bottom: 2px solid rgba(43, 33, 24, 0.1);
  color: var(--ink);
}

.results-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(43, 33, 24, 0.08);
  font-size: 0.95rem;
}

.results-table tr:last-child td {
  border-bottom: none;
}

.col-score {
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.badge-pass {
  background: #e6f4ea;
  color: #137333;
}

.badge-fail {
  background: #fce8e6;
  color: #c5221f;
}

.col-date {
  color: var(--ink-muted);
}

.btn-delete {
  background: transparent;
  border: 1px solid #d93025;
  color: #d93025;
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-delete:hover {
  background: #d93025;
  color: #fff;
}

@media (max-width: 650px) {
  .results-table th,
  .results-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.85rem;
  }
}
</style>

