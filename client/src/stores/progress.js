import { defineStore } from 'pinia'
import { ref } from 'vue'

const API_URL = 'http://localhost:3000/api'

export const useProgressStore = defineStore('progress', () => {
  const articleResults = ref({})
  const eraResults = ref({})
  const isLoaded = ref(false)

  // Load from localStorage and optionally sync with backend if logged in
  async function init() {
    try {
      const localArticles = localStorage.getItem('quiz_article_results')
      if (localArticles) {
        articleResults.value = JSON.parse(localArticles)
      }

      const localEras = localStorage.getItem('quiz_era_results')
      if (localEras) {
        eraResults.value = JSON.parse(localEras)
      }

      // Check legacy era quiz scores (do not assume passed without verified total)
      for (let eraId = 1; eraId <= 10; eraId++) {
        const legacy = localStorage.getItem(`quiz-best-${eraId}`)
        if (legacy !== null && !eraResults.value[eraId]) {
          const score = Number(legacy)
          eraResults.value[eraId] = {
            bestScore: score,
            passed: false,
          }
        }
      }
    } catch (err) {
      console.error('Failed to load local progress:', err)
    }

    // Sync with backend if user is logged in
    await syncWithServer()
    isLoaded.value = true
  }

  async function syncWithServer() {
    const userStr = localStorage.getItem('user')
    if (!userStr) return

    try {
      const user = JSON.parse(userStr)
      if (!user?.username) return

      const res = await fetch(`${API_URL}/results?username=${encodeURIComponent(user.username)}`)
      if (!res.ok) return

      const serverResults = await res.json()
      if (!Array.isArray(serverResults)) return

      serverResults.forEach((item) => {
        const passed = item.total > 0 && item.score / item.total >= 0.5

        if (item.articleId) {
          const artId = Number(item.articleId)
          const current = articleResults.value[artId]
          const best = current?.bestScore ? Math.max(current.bestScore, item.score) : item.score
          articleResults.value[artId] = {
            score: item.score,
            total: item.total,
            passed: current?.passed || passed,
            bestScore: best,
            completedAt: item.completedAt,
          }
        } else if (item.quizId) {
          // Endast om det är ett rent era-quiz (utan articleId)
          const qId = Number(item.quizId)
          const current = eraResults.value[qId]
          const best = current?.bestScore ? Math.max(current.bestScore, item.score) : item.score
          eraResults.value[qId] = {
            score: item.score,
            total: item.total,
            passed: current?.passed || passed,
            bestScore: best,
            completedAt: item.completedAt,
          }
        }
      })

      // Persist merged data to localStorage
      localStorage.setItem('quiz_article_results', JSON.stringify(articleResults.value))
      localStorage.setItem('quiz_era_results', JSON.stringify(eraResults.value))
    } catch (err) {
      console.warn('Could not sync progress with server:', err)
    }
  }

  async function recordResult({ articleId = null, quizId = null, score, total }) {
    const passed = total > 0 && score / total >= 0.5

    if (articleId) {
      // Artikel-quiz: registrera enbart på artikeln
      const artId = Number(articleId)
      const current = articleResults.value[artId]
      const best = current?.bestScore ? Math.max(current.bestScore, score) : score
      articleResults.value[artId] = {
        score,
        total,
        passed: current?.passed || passed,
        bestScore: best,
        completedAt: new Date().toISOString(),
      }
      localStorage.setItem('quiz_article_results', JSON.stringify(articleResults.value))
    } else if (quizId) {
      // Epok-quiz: registrera enbart när det INTE är ett artikelquiz
      const qId = Number(quizId)
      const current = eraResults.value[qId]
      const best = current?.bestScore ? Math.max(current.bestScore, score) : score
      eraResults.value[qId] = {
        score,
        total,
        passed: current?.passed || passed,
        bestScore: best,
        completedAt: new Date().toISOString(),
      }
      localStorage.setItem('quiz_era_results', JSON.stringify(eraResults.value))
      localStorage.setItem(`quiz-best-${qId}`, String(best))
    }

    // Backend save if logged in
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        await fetch(`${API_URL}/results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: user.username,
            userId: user.id,
            articleId: articleId ? Number(articleId) : null,
            quizId: quizId ? Number(quizId) : null,
            score,
            total,
          }),
        })
      } catch (err) {
        console.error('Failed to post result to server:', err)
      }
    }
  }

  function isArticlePassed(articleId) {
    return Boolean(articleResults.value[Number(articleId)]?.passed)
  }

  function getArticleResult(articleId) {
    return articleResults.value[Number(articleId)] || null
  }

  function isEraPassed(eraId, eraArticleIds = []) {
    const numEraId = Number(eraId)

    // 1. Godkänd på själva era-quizet
    const isEraQuizPassed = Boolean(eraResults.value[numEraId]?.passed)

    // 2. ELLER godkänd på ALLA artiklar i epoken (kräver att artikellistan inte är tom)
    const hasArticles = Array.isArray(eraArticleIds) && eraArticleIds.length > 0
    const allArticlesPassed = hasArticles && eraArticleIds.every((id) => isArticlePassed(id))

    return isEraQuizPassed || allArticlesPassed
  }

  function getEraResult(eraId) {
    return eraResults.value[Number(eraId)] || null
  }

  return {
    articleResults,
    eraResults,
    isLoaded,
    init,
    syncWithServer,
    recordResult,
    isArticlePassed,
    getArticleResult,
    isEraPassed,
    getEraResult,
  }
})

