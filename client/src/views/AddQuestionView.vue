<script setup>
import { ref, onMounted, watch } from 'vue'
import { eras } from '../data/eras'

const API_URL = 'http://localhost:3000/api'

const selectedQuizId = ref(eras[0]?.id || 1)
const questionText = ref('')
const rightAnswer = ref('')
const wrongAnswer1 = ref('')
const wrongAnswer2 = ref('')
const wrongAnswer3 = ref('')

const questionsList = ref([])
const loadingList = ref(false)
const submitting = ref(false)
const feedbackMessage = ref(null)
const errorMessage = ref(null)

async function fetchQuestions() {
  loadingList.value = true
  try {
    const res = await fetch(`${API_URL}/quiz/${selectedQuizId.value}/questions`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    questionsList.value = await res.json()
  } catch (err) {
    console.error(err)
    questionsList.value = []
  } finally {
    loadingList.value = false
  }
}

watch(selectedQuizId, () => {
  fetchQuestions()
})

async function submitQuestion() {
  if (!questionText.value.trim() || !rightAnswer.value.trim() || !wrongAnswer1.value.trim()) {
    errorMessage.value = 'Please fill in the question, the correct answer, and at least one incorrect answer.'
    return
  }

  submitting.value = true
  errorMessage.value = null
  feedbackMessage.value = null

  try {
    const payload = {
      quizId: selectedQuizId.value,
      type: 'multiple_choice',
      question: questionText.value.trim(),
      rightAnswer: rightAnswer.value.trim(),
      wrongAnswer1: wrongAnswer1.value.trim(),
      wrongAnswer2: wrongAnswer2.value.trim() || null,
      wrongAnswer3: wrongAnswer3.value.trim() || null,
    }

    const res = await fetch(`${API_URL}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || `HTTP ${res.status}`)
    }

    feedbackMessage.value = 'The question has been saved to the database!'
    // Reset form
    questionText.value = ''
    rightAnswer.value = ''
    wrongAnswer1.value = ''
    wrongAnswer2.value = ''
    wrongAnswer3.value = ''

    // Refresh list
    await fetchQuestions()
  } catch (err) {
    console.error(err)
    errorMessage.value = `Could not save the question: ${err.message}`
  } finally {
    submitting.value = false
  }
}

async function deleteQuestion(questionId) {
  if (!confirm('Are you sure you want to delete this question from the database?')) return

  try {
    const res = await fetch(`${API_URL}/questions/${questionId}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    feedbackMessage.value = 'The question has been deleted from the database.'
    await fetchQuestions()
  } catch (err) {
    console.error(err)
    alert('Could not delete the question.')
  }
}

onMounted(() => {
  fetchQuestions()
})
</script>

<template>
  <main class="add-question-page">
    <div class="container">
      <div class="page-header">
        <h1>Contribute a historical question</h1>
        <p class="subtitle">
          Add and manage quiz questions directly in the backend's MySQL database.
        </p>
      </div>

      <div class="grid-layout">
        <!-- FORMULÄR -->
        <section class="card form-card">
          <h2>Create new question</h2>

          <div v-if="feedbackMessage" class="banner success-banner">
            {{ feedbackMessage }}
          </div>
          <div v-if="errorMessage" class="banner error-banner">
            {{ errorMessage }}
          </div>

          <form @submit.prevent="submitQuestion" class="question-form">
            <div class="form-group">
              <label for="quiz-select">Select era:</label>
              <select id="quiz-select" v-model="selectedQuizId" class="form-input">
                <option v-for="era in eras" :key="era.id" :value="era.id">
                  {{ era.name }} ({{ era.period }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="question-text">Question *</label>
              <textarea
                id="question-text"
                v-model="questionText"
                rows="3"
                class="form-input"
                placeholder="E.g.: What was the name of Gustav Vasa's fleet?"
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label for="right-answer">Right answer *</label>
              <input
                id="right-answer"
                v-model="rightAnswer"
                type="text"
                class="form-input correct-input"
                placeholder="The correct answer"
                required
              />
            </div>

            <div class="form-group">
              <label for="wrong-1">wrong answer 1 *</label>
              <input
                id="wrong-1"
                v-model="wrongAnswer1"
                type="text"
                class="form-input"
                placeholder="An incorrect answer"
                required
              />
            </div>

            <div class="form-group">
              <label for="wrong-2">wrong answer 2 (optional)</label>
              <input
                id="wrong-2"
                v-model="wrongAnswer2"
                type="text"
                class="form-input"
                placeholder="An other incorrect answer"
              />
            </div>

            <div class="form-group">
              <label for="wrong-3">wrong answer 3 (optional)</label>
              <input
                id="wrong-3"
                v-model="wrongAnswer3"
                type="text"
                class="form-input"
                placeholder="An additional incorrect answer"
              />
            </div>

            <button type="submit" class="btn btn-submit" :disabled="submitting">
              {{ submitting ? 'Saving to MySQL...' : 'Save question to database' }}
            </button>
          </form>
        </section>

        <!-- BEFINTLIGA FRÅGOR -->
        <section class="card list-card">
          <h2>Questions in the database (Quiz {{ selectedQuizId }})</h2>
          <p class="section-desc">Questions are fetched dynamically via <code>GET /api/quiz/:quizId/questions</code></p>

          <div v-if="loadingList" class="loading-state">
            <p>Loading questions from the database...</p>
          </div>

          <div v-else-if="questionsList.length === 0" class="empty-state">
            <p>No questions found in the database for this epoch yet.</p>
          </div>

          <ul v-else class="questions-list">
            <li v-for="q in questionsList" :key="q.questionId" class="question-item">
              <div class="q-content">
                <strong>{{ q.question }}</strong>
                <div class="q-answers">
                  <span class="answer-tag correct">✓ {{ q.rightAnswer }}</span>
                  <span class="answer-tag wrong">✗ {{ q.wrongAnswer1 }}</span>
                  <span v-if="q.wrongAnswer2" class="answer-tag wrong">✗ {{ q.wrongAnswer2 }}</span>
                  <span v-if="q.wrongAnswer3" class="answer-tag wrong">✗ {{ q.wrongAnswer3 }}</span>
                </div>
              </div>
              <button
                class="btn-delete"
                title="Delete this question from the database"
                @click="deleteQuestion(q.questionId)"
              >
                Remove
              </button>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.add-question-page {
  padding-block: 2.5rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.subtitle {
  color: var(--ink-muted);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0.5rem auto 0;
}

.grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.card {
  background: var(--card);
  border: 1px solid rgba(43, 33, 24, 0.15);
  border-radius: 8px;
  padding: 1.75rem;
  box-shadow: 0 4px 12px rgba(43, 33, 24, 0.05);
}

.card h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.4rem;
}

.section-desc {
  font-size: 0.9rem;
  color: var(--ink-muted);
  margin-top: -0.5rem;
  margin-bottom: 1rem;
}

.section-desc code {
  background: rgba(43, 33, 24, 0.08);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.35rem;
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: 1px solid rgba(43, 33, 24, 0.25);
  border-radius: 6px;
  background: #fff;
  font-family: inherit;
  font-size: 0.95rem;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent);
}

.correct-input {
  border-color: #34a853;
  background-color: #f6fbf7;
}

.btn-submit {
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
  font-weight: 600;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.banner {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-bottom: 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
}

.success-banner {
  background: #e6f4ea;
  color: #137333;
  border: 1px solid #ceead6;
}

.error-banner {
  background: #fce8e6;
  color: #c5221f;
  border: 1px solid #fad2cf;
}

.questions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 520px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.question-item {
  background: #fff;
  border: 1px solid rgba(43, 33, 24, 0.1);
  border-radius: 6px;
  padding: 0.85rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.q-content {
  flex: 1;
}

.q-answers {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.5rem;
}

.answer-tag {
  font-size: 0.8rem;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.answer-tag.correct {
  background: #e6f4ea;
  color: #137333;
  font-weight: 600;
}

.answer-tag.wrong {
  background: #f1f3f4;
  color: #5f6368;
}

.btn-delete {
  background: transparent;
  border: 1px solid #d93025;
  color: #d93025;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.btn-delete:hover {
  background: #d93025;
  color: #fff;
}

@media (max-width: 850px) {
  .grid-layout {
    grid-template-columns: 1fr;
  }
}
</style>

