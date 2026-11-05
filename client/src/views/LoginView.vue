<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import antiquityImg from '@/assets/images/antiquity.png'
import medievalImg from '@/assets/images/medieval.png'
import modernImg from '@/assets/images/modern-history.png'

const router = useRouter()

const scatteredPhotos = [
  { src: antiquityImg, top: '4%', left: '3%', rotate: '-7deg' },
  { src: modernImg, top: '36%', left: '2%', rotate: '4deg' },
  { src: medievalImg, top: '68%', left: '4%', rotate: '-6deg' },
  { src: medievalImg, top: '5%', left: '74%', rotate: '6deg' },
  { src: antiquityImg, top: '37%', left: '75%', rotate: '-4deg' },
  { src: modernImg, top: '68%', left: '73%', rotate: '7deg' }
]

const isRegister = ref(false)
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')

function toggleMode() {
  isRegister.value = !isRegister.value
  errorMessage.value = ''
  successMessage.value = ''
}

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  const cleanUsername = username.value.trim()

  if (isRegister.value) {
    if (cleanUsername.length < 2 || cleanUsername.length > 15) {
      errorMessage.value = 'Username must be between 2-15 characters'
      return
    }

    if (password.value.length < 8) {
      errorMessage.value = 'Password must be at least 8 characters'
      return
    }

    if (password.value !== confirmPassword.value) {
      errorMessage.value = 'Passwords do not match!'
      return
    }
  }

  const endpoint = isRegister.value ? '/api/auth/register' : '/api/auth/login'

  try {
    const res = await fetch(`http://localhost:3000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    })

    const rawText = await res.text()
    let parsedData = null
    try {
      parsedData = JSON.parse(rawText)
    } catch {
      parsedData = null
    }

    if (!res.ok) {
      const errText = parsedData?.error || parsedData?.message || rawText || 'Something went wrong'
      throw new Error(errText)
    }

    if (isRegister.value) {
      successMessage.value = 'Account created! You can now log in.'
      isRegister.value = false
      password.value = ''
      confirmPassword.value = ''
    } else {
      const userObj = parsedData?.user || { username: username.value }
      localStorage.setItem('user', JSON.stringify(userObj))
      window.dispatchEvent(new Event('auth-changed'))

      successMessage.value = 'Logged in successfully!'
      setTimeout(() => {
        router.push('/')
      }, 500)
    }
  } catch (err) {
    errorMessage.value = err.message
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="scattered-background" aria-hidden="true">
      <div
        v-for="(photo, index) in scatteredPhotos"
        :key="index"
        class="photo-pin"
        :style="{
          top: photo.top,
          left: photo.left,
          transform: `rotate(${photo.rotate})`
        }"
      >
        <img :src="photo.src" alt="" class="photo-img" />
      </div>
    </div>

    <!-- Inloggningskortet -->
    <div class="auth-card">
      <div class="badge-wrapper">
        <span class="auth-badge">{{ isRegister ? 'New Record' : 'Restricted Access' }}</span>
      </div>

      <h2 class="auth-title">
        {{ isRegister ? 'Create Account' : 'Log In' }}
      </h2>

      <!-- Error / Success messages -->
      <div v-if="errorMessage" class="message error-msg">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="message success-msg">
        {{ successMessage }}
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Your username"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Your password"
            required
          />
        </div>

        <!-- Confirm password field shown only during registration -->
        <div v-if="isRegister" class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="Repeat password"
            required
          />
        </div>

        <button type="submit" class="submit-btn">
          {{ isRegister ? 'Register' : 'Log In' }}
        </button>
      </form>

      <div class="toggle-container">
        <button type="button" class="toggle-btn" @click="toggleMode">
          {{
            isRegister ? 'Already have an account? Log in' : "Don't have an account? Sign up here"
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
body {
  margin: 0;
  padding: 0;
}

.auth-page {
  position: relative;
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  overflow: hidden;
  background-color: var(--paper, #fdfbf7);
  box-sizing: border-box;
}

/* Dold som standard på mobiler och mindre surfplattor */
.scattered-background {
  display: none;
}

/* Visas endast på större skärmar (laptop/desktop) */
@media (min-width: 1024px) {
  .scattered-background {
    display: block;
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
  }

  .photo-pin {
    position: absolute;
    width: clamp(240px, 19vw, 360px);
    background: #ffffff;
    padding: 8px;
    border: 1.5px solid var(--ink, #2c2621);
    border-radius: 4px;
    box-shadow: 4px 6px 0px rgba(44, 38, 33, 0.18);
    opacity: 0.92;
    transition: transform 0.3s ease;
  }
}

.photo-img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
  border-radius: 2px;
}

.auth-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  background-color: #ffffff;
  border: 2px solid var(--ink, #2c2621);
  border-radius: 12px;
  padding: 2.5rem 2rem;
  box-shadow: 6px 8px 0px var(--ink, #2c2621);
  z-index: 2;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 1.75rem 1.25rem;
    box-shadow: 4px 5px 0px var(--ink, #2c2621);
  }

  .auth-title {
    font-size: 1.65rem;
  }
}

.badge-wrapper {
  text-align: center;
  margin-bottom: 0.5rem;
}

.auth-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #b54930;
  border: 1.5px solid #b54930;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  transform: rotate(-2deg);
}

.auth-title {
  font-family: var(--font-heading, serif);
  font-size: 2rem;
  color: var(--ink, #2c2621);
  margin: 0.25rem 0 1.5rem;
  text-align: center;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ink, #2c2621);
}

input {
  padding: 0.75rem 0.9rem;
  font-size: 0.95rem;
  border: 1.5px solid var(--ink, #2c2621);
  border-radius: 6px;
  background-color: #fdfcf9;
  color: var(--ink, #2c2621);
  outline: none;
  transition: all 0.2s ease;
}

input:focus {
  border-color: #b54930;
  box-shadow: 0 0 0 3px rgba(181, 73, 48, 0.15);
  background-color: #ffffff;
}

.submit-btn {
  margin-top: 0.5rem;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  background-color: var(--ink, #2c2621);
  color: #ede6dc;
  border: 2px solid var(--ink, #2c2621);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.15);
}

.submit-btn:hover {
  background-color: #b54930;
  border-color: #b54930;
  color: #ffffff;
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0px var(--ink, #2c2621);
}

.toggle-container {
  margin-top: 1.5rem;
  text-align: center;
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--ink, #2c2621);
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.15s ease;
}

.toggle-btn:hover {
  color: #b54930;
}

.message {
  padding: 0.65rem 0.8rem;
  border-radius: 6px;
  margin-bottom: 1.25rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.error-msg {
  background-color: #fde8e8;
  color: #9b1c1c;
  border: 1.5px solid #f8b4b4;
}

.success-msg {
  background-color: #def7ec;
  color: #03543f;
  border: 1.5px solid #84e1bc;
}

</style>
