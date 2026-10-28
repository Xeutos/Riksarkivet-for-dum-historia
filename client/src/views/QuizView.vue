<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { eras } from '../data/eras'

const API_URL = 'http://localhost:3000/api'

const route = useRoute()

const eraId = computed(() => Number(route.params.id))
const era = computed(() => eras.find((e) => e.id === eraId.value))
const eraQuestions = ref([])
const loading = ref(false)
const loadError = ref(null)

async function fetchQuestions() {
  loading.value = true
  loadError.value = null
  try {
    const res = await fetch(`${API_URL}/quiz/${eraId.value}/questions`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    eraQuestions.value = await res.json()
  } catch (err) {
    console.error(err)
    eraQuestions.value = []
    loadError.value = 'Could not load the quiz. Is the server running?'
  } finally {
    loading.value = false
  }
}

const state = ref('intro')
const questions = ref([])
const currentIndex = ref(0)
const answers = ref([])
const bestScore = ref(null)
const isNewBest = ref(false)

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

function startQuiz() {
  questions.value = eraQuestions.value.map((q) => ({ ...q, options: buildOptions(q) }))
  answers.value = Array(questions.value.length).fill(null)
  currentIndex.value = 0
  isNewBest.value = false
  state.value = 'playing'
}

const currentQuestion = computed(() => questions.value[currentIndex.value])
const selected = computed(() => answers.value[currentIndex.value])
const hasAnswered = computed(() => selected.value !== null)
const isCorrect = computed(() => selected.value === currentQuestion.value?.rightAnswer)
const isLast = computed(() => currentIndex.value === questions.value.length - 1)
const progress = computed(() => ((currentIndex.value + 1) / questions.value.length) * 100)

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
  () => questions.value.filter((q, i) => answers.value[i] === q.rightAnswer).length
)

const resultMessage = computed(() => {
  const ratio = score.value / questions.value.length
  if (ratio === 1) return 'Flawless. You are dangerously well-versed in dumb history.'
  if (ratio >= 0.7) return 'Impressive! The archive approves.'
  if (ratio >= 0.4) return 'Not bad – history is weird, after all.'
  return 'History repeats itself. Maybe you should too?'
})

const storageKey = computed(() => `quiz-best-${eraId.value}`)

function loadBest() {
  try {
    const stored = localStorage.getItem(storageKey.value)
    bestScore.value = stored === null ? null : Number(stored)
  } catch {
    bestScore.value = null
  }
}

function saveBest() {
  if (bestScore.value === null || score.value > bestScore.value) {
    isNewBest.value = bestScore.value !== null
    bestScore.value = score.value
    try {
      localStorage.setItem(storageKey.value, String(score.value))
    } catch {
      // Ignore localStorage errors
    }
  }
}

function finishQuiz() {
  saveBest()
  state.value = 'done'
}

watch(
  eraId,
  () => {
    state.value = 'intro'
    loadBest()
    fetchQuestions()
  },
  { immediate: true }
)
</script>

<template>
  <div class="quiz-page">
    <RouterLink :to="`/epok/${eraId}`" class="back-link">
      ← Back to {{ era ? era.name : 'stories' }}
    </RouterLink>

    <section v-if="!era" class="quiz-card">
      <h1>Quiz not found</h1>
      <p>This time period seems to have vanished from the archive.</p>
    </section>

    <section v-else-if="loading" class="quiz-card">
      <p>Digging through the archive…</p>
    </section>

    <section v-else-if="loadError" class="quiz-card">
      <h1>{{ era.name }} quiz</h1>
      <p>{{ loadError }}</p>
      <button class="btn" @click="fetchQuestions">Try again</button>
    </section>

    <section v-else-if="!eraQuestions.length" class="quiz-card">
      <h1>{{ era.name }} quiz</h1>
      <p>No questions here yet. The absurdities are on their way!</p>
    </section>

    <!-- Intro -->
    <section v-else-if="state === 'intro'" class="quiz-card intro">
      <p class="eyebrow">Quiz</p>
      <h1>{{ era.name }}</h1>
      <p class="intro-text">
        {{ eraQuestions.length }} questions about the strangest stories from the archive.
        Every answer is true. Unfortunately.
      </p>
      <p v-if="bestScore !== null" class="best">
        Your best: {{ bestScore }} / {{ eraQuestions.length }}
      </p>
      <button class="btn start-btn" @click="startQuiz">Start quiz</button>
    </section>

    <!-- Frågor -->
    <section v-else-if="state === 'playing'" class="quiz-card">
      <div class="progress-row">
        <span>Question {{ currentIndex + 1 }} of {{ questions.length }}</span>
        <span class="era-tag">{{ era.name }}</span>
      </div>
      <div class="progress-bar" aria-hidden="true">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
      </div>

      <h2 class="question">{{ currentQuestion.question }}</h2>

      <ul class="options" :class="{ 'true-false': currentQuestion.type === 'true_false' }">
        <li v-for="option in currentQuestion.options" :key="option">
          <button
            class="option"
            :class="optionClass(option)"
            :disabled="hasAnswered"
            @click="selectAnswer(option)"
          >
            {{ option }}
          </button>
        </li>
      </ul>

      <p
        class="feedback"
        :class="{ visible: hasAnswered, correct: isCorrect, wrong: !isCorrect }"
        aria-live="polite"
      >
        <template v-if="hasAnswered">
          {{ isCorrect ? 'Correct!' : `Not quite – the answer is "${currentQuestion.rightAnswer}".` }}
        </template>
      </p>

      <div class="quiz-nav">
        <button class="nav-btn" :disabled="currentIndex === 0" @click="prev">← Previous</button>
        <button class="btn" :disabled="!hasAnswered" @click="next">
          {{ isLast ? 'See result' : 'Next →' }}
        </button>
      </div>
    </section>

    <!-- Resultat -->
    <section v-else class="quiz-card result">
      <p class="eyebrow">Your result</p>
      <p class="score">{{ score }} / {{ questions.length }}</p>
      <p class="result-message">{{ resultMessage }}</p>
      <p v-if="isNewBest" class="best new-best">New personal best! 🎉</p>
      <p v-else-if="bestScore !== null" class="best">
        Your best: {{ bestScore }} / {{ questions.length }}
      </p>

      <div class="result-actions">
        <button class="btn" @click="startQuiz">Try again</button>
        <RouterLink :to="`/epok/${eraId}`" class="nav-btn">Back to stories</RouterLink>
      </div>

      <details class="review">
        <summary>See your answers</summary>
        <ol>
          <li v-for="(q, i) in questions" :key="q.questionId">
            <p class="review-question">{{ q.question }}</p>
            <p :class="answers[i] === q.rightAnswer ? 'review-correct' : 'review-wrong'">
              Your answer: {{ answers[i] }}
            </p>
            <p v-if="answers[i] !== q.rightAnswer" class="review-right">
              Correct answer: {{ q.rightAnswer }}
            </p>
          </li>
        </ol>
      </details>
    </section>
  </div>
</template>
