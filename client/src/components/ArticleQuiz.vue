<script setup>
import { ref, computed, watch } from 'vue'
import { useProgressStore } from '../stores/progress'

const props = defineProps({
  articleId: {
    type: [Number, String],
    required: true,
  },
  eraId: {
    type: [Number, String],
    default: null,
  },
})

const API_URL = 'http://localhost:3000/api'
const progressStore = useProgressStore()

const questions = ref([])
const loading = ref(false)
const loadError = ref(null)

const state = ref('ready') // 'ready', 'playing', 'done'
const preparedQuestions = ref([])
const currentIndex = ref(0)
const answers = ref([])

const articleIdNum = computed(() => Number(props.articleId))
const existingResult = computed(() => progressStore.getArticleResult(articleIdNum.value))
const isAlreadyPassed = computed(() => progressStore.isArticlePassed(articleIdNum.value))

function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function buildOptions(q) {
  if (q.type === 'true_false') return ['True', 'False']
  return shuffle([q.rightAnswer, q.wrongAnswer1, q.wrongAnswer2, q.wrongAnswer3].filter(Boolean))
}

async function fetchArticleQuestions() {
  if (!articleIdNum.value) return
  loading.value = true
  loadError.value = null

  try {
    const res = await fetch(`${API_URL}/articles/${articleIdNum.value}/questions`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    questions.value = data
  } catch (err) {
    console.error('Failed to load article questions:', err)
    questions.value = []
    loadError.value = 'Could not load the quiz for this article.'
  } finally {
    loading.value = false
  }
}

function startQuiz() {
  preparedQuestions.value = questions.value.map((q) => ({
    ...q,
    options: buildOptions(q),
  }))
  answers.value = Array(preparedQuestions.value.length).fill(null)
  currentIndex.value = 0
  state.value = 'playing'
}

const currentQuestion = computed(() => preparedQuestions.value[currentIndex.value])
const selected = computed(() => answers.value[currentIndex.value])
const hasAnswered = computed(() => selected.value !== null)
const isCorrect = computed(() => selected.value === currentQuestion.value?.rightAnswer)
const isLast = computed(() => currentIndex.value === preparedQuestions.value.length - 1)
const progressPercent = computed(() =>
  preparedQuestions.value.length
    ? ((currentIndex.value + 1) / preparedQuestions.value.length) * 100
    : 0
)

function selectAnswer(option) {
  if (hasAnswered.value) return
  answers.value[currentIndex.value] = option
}

function next() {
  if (!hasAnswered.value) return
  if (isLast.value) {
    finishQuiz()
  } else {
    currentIndex.value++
  }
}

function prev() {
  if (currentIndex.value > 0) currentIndex.value--
}

function optionClass(option) {
  if (!hasAnswered.value) return ''
  if (option === currentQuestion.value.rightAnswer) return 'correct'
  if (option === selected.value) return 'wrong'
  return 'faded'
}

const score = computed(
  () => preparedQuestions.value.filter((q, i) => answers.value[i] === q.rightAnswer).length
)

const passThresholdMet = computed(() => {
  if (!preparedQuestions.value.length) return false
  return score.value / preparedQuestions.value.length >= 0.5
})

function finishQuiz() {
  const quizIdVal = props.eraId ? Number(props.eraId) : currentQuestion.value?.quizId || null
  progressStore.recordResult({
    articleId: articleIdNum.value,
    quizId: quizIdVal,
    score: score.value,
    total: preparedQuestions.value.length,
  })
  state.value = 'done'
}

watch(
  () => props.articleId,
  () => {
    state.value = 'ready'
    fetchArticleQuestions()
  },
  { immediate: true }
)
</script>

<template>
  <section v-if="loading" class="article-quiz-wrapper">
    <div class="article-quiz-card loading-state">
      <p>Loading quiz questions…</p>
    </div>
  </section>

  <section v-else-if="questions.length > 0" class="article-quiz-wrapper">
    <!-- Ready to start -->
    <div v-if="state === 'ready'" class="article-quiz-card ready-state">
      <div class="quiz-header">
        <div class="title-with-badge">
          <span class="quiz-eyebrow">Article Quiz</span>
          <h2 class="quiz-title">Test what you've learned!</h2>
        </div>
        <div v-if="isAlreadyPassed" class="passed-pill">
          <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <span>Completed</span>
          <span v-if="existingResult?.bestScore !== undefined" class="pill-score">
            ({{ existingResult.bestScore }}/{{ questions.length }})
          </span>
        </div>
      </div>

      <p class="quiz-description">
        Answer {{ questions.length }} questions about this article. Score at least 50% to pass the article
        and earn a green checkmark!
      </p>

      <button class="btn start-btn" @click="startQuiz">
        {{ isAlreadyPassed ? 'Retake quiz' : 'Start quiz' }}
      </button>
    </div>

    <!-- Playing quiz -->
    <div v-else-if="state === 'playing'" class="article-quiz-card playing-state">
      <div class="quiz-progress-bar">
        <div class="quiz-progress-fill" :style="{ width: `${progressPercent}%` }"></div>
      </div>

      <div class="quiz-top-info">
        <span class="question-counter">
          Question {{ currentIndex + 1 }} of {{ preparedQuestions.length }}
        </span>
        <span class="required-notice">50% required to pass</span>
      </div>

      <h3 class="question-title">{{ currentQuestion.question }}</h3>

      <ul class="options-list">
        <li v-for="option in currentQuestion.options" :key="option">
          <button
            class="option-btn"
            :class="optionClass(option)"
            :disabled="hasAnswered"
            @click="selectAnswer(option)"
          >
            {{ option }}
          </button>
        </li>
      </ul>

      <p
        v-if="hasAnswered"
        class="feedback-msg"
        :class="{ correct: isCorrect, wrong: !isCorrect }"
      >
        <span v-if="isCorrect">✓ Correct!</span>
        <span v-else>✕ Incorrect – the correct answer was: <strong>{{ currentQuestion.rightAnswer }}</strong></span>
      </p>

      <div class="quiz-controls">
        <button class="btn-subtle" :disabled="currentIndex === 0" @click="prev">
          ← Previous
        </button>
        <button class="btn" :disabled="!hasAnswered" @click="next">
          {{ isLast ? 'See result' : 'Next question →' }}
        </button>
      </div>
    </div>

    <!-- Results -->
    <div v-else-if="state === 'done'" class="article-quiz-card result-state">
      <div v-if="passThresholdMet" class="result-banner pass">
        <div class="banner-icon-wrap">
          <svg class="large-check" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="banner-text">
          <h3>Great job! You passed the article!</h3>
          <p>This article is now completed and marked with a green checkmark.</p>
        </div>
      </div>

      <div v-else class="result-banner fail">
        <div class="banner-text">
          <h3>Not quite there yet!</h3>
          <p>You need at least 50% correct to pass this article. Read through and try again!</p>
        </div>
      </div>

      <div class="score-summary">
        <span class="score-number">{{ score }} / {{ preparedQuestions.length }} correct</span>
        <span class="score-percent">
          ({{ Math.round((score / preparedQuestions.length) * 100) }}%)
        </span>
      </div>

      <div class="result-actions">
        <button class="btn" @click="startQuiz">Try again</button>
      </div>

      <details class="answer-review">
        <summary>Review your answers</summary>
        <ol class="review-list">
          <li v-for="(q, i) in preparedQuestions" :key="q.questionId" class="review-item">
            <p class="review-q">{{ q.question }}</p>
            <p :class="answers[i] === q.rightAnswer ? 'rev-correct' : 'rev-wrong'">
              Your answer: {{ answers[i] || 'No answer' }}
            </p>
            <p v-if="answers[i] !== q.rightAnswer" class="rev-solution">
              Correct answer: {{ q.rightAnswer }}
            </p>
          </li>
        </ol>
      </details>
    </div>
  </section>
</template>

<style scoped>
.article-quiz-wrapper {
  margin-top: 3rem;
  margin-bottom: 2rem;
}

.article-quiz-card {
  background: var(--card, #fffaf0);
  border: 2px solid var(--ink, #2b2118);
  border-radius: 8px;
  padding: 1.75rem;
  box-shadow: 4px 4px 0px rgba(43, 33, 24, 0.15);
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.quiz-eyebrow {
  display: block;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent, #8b2e1f);
  font-weight: 600;
}

.quiz-title {
  margin: 0.2rem 0 0;
  font-size: 1.5rem;
  color: var(--ink, #2b2118);
}

.passed-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #e8f5e9;
  border: 1.5px solid #2e7d32;
  color: #1b5e20;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.check-icon {
  width: 18px;
  height: 18px;
  color: #2e7d32;
}

.pill-score {
  opacity: 0.85;
  font-size: 0.8rem;
}

.quiz-description {
  color: var(--ink-muted, #6b5a48);
  margin-bottom: 1.25rem;
  line-height: 1.5;
}

.start-btn {
  font-size: 1rem;
  padding: 0.6rem 1.4rem;
}

/* Progress bar */
.quiz-progress-bar {
  height: 6px;
  background: #e0d8c8;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.quiz-progress-fill {
  height: 100%;
  background: var(--accent, #8b2e1f);
  transition: width 0.3s ease;
}

.quiz-top-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--ink-muted, #6b5a48);
  margin-bottom: 0.75rem;
}

.question-title {
  font-size: 1.25rem;
  margin: 0 0 1.25rem 0;
  color: var(--ink, #2b2118);
}

.options-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1.25rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.option-btn {
  width: 100%;
  text-align: left;
  padding: 0.8rem 1rem;
  background: #fdfbf7;
  border: 1.5px solid #dcd4c3;
  border-radius: 6px;
  font: inherit;
  font-size: 1rem;
  color: var(--ink, #2b2118);
  cursor: pointer;
  transition: all 0.15s ease;
}

.option-btn:hover:not(:disabled) {
  border-color: var(--ink, #2b2118);
  background: #fff;
}

.option-btn.correct {
  background: #e8f5e9;
  border-color: #2e7d32;
  color: #1b5e20;
  font-weight: 600;
}

.option-btn.wrong {
  background: #ffebee;
  border-color: #c62828;
  color: #b71c1c;
}

.option-btn.faded {
  opacity: 0.5;
}

.feedback-msg {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.95rem;
  margin-bottom: 1.25rem;
}

.feedback-msg.correct {
  background: #e8f5e9;
  color: #1b5e20;
}

.feedback-msg.wrong {
  background: #ffebee;
  color: #b71c1c;
}

.quiz-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.btn-subtle {
  background: transparent;
  border: 1px solid #c9beae;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font: inherit;
  color: var(--ink, #2b2118);
  cursor: pointer;
}

.btn-subtle:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Results */
.result-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem;
  border-radius: 8px;
  margin-bottom: 1.25rem;
}

.result-banner.pass {
  background: #e8f5e9;
  border: 1.5px solid #2e7d32;
  color: #1b5e20;
}

.result-banner.fail {
  background: #fff3e0;
  border: 1.5px solid #ef6c00;
  color: #e65100;
}

.large-check {
  width: 36px;
  height: 36px;
  color: #2e7d32;
  flex-shrink: 0;
}

.result-banner h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.2rem;
}

.result-banner p {
  margin: 0;
  font-size: 0.95rem;
}

.score-summary {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.score-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--ink, #2b2118);
}

.score-percent {
  font-size: 1.1rem;
  color: var(--ink-muted, #6b5a48);
}

.result-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.answer-review {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0d8c8;
}

.answer-review summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--ink, #2b2118);
}

.review-list {
  padding-left: 1.2rem;
  margin-top: 0.75rem;
}

.review-item {
  margin-bottom: 0.75rem;
}

.review-q {
  font-weight: 600;
  margin: 0 0 0.2rem 0;
}

.rev-correct {
  color: #2e7d32;
  margin: 0;
}

.rev-wrong {
  color: #c62828;
  margin: 0;
}

.rev-solution {
  color: #2e7d32;
  font-weight: 600;
  margin: 0.1rem 0 0 0;
}
</style>

