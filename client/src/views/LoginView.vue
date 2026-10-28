<template>
  <div class="auth-page">
    <div class="auth-card">
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
          {{ isRegister ? 'Already have an account? Log in' : "Don't have an account? Sign up here" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

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

  if (isRegister.value && password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match!'
    return
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

    const data = await res.text()

    if (!res.ok) {
      throw new Error(data || 'Something went wrong')
    }

    if (isRegister.value) {
      successMessage.value = 'Account created! You can now log in.';
      isRegister.value = false;
      password.value = '';
      confirmPassword.value = '';
    } else {
      localStorage.setItem('user', JSON.stringify({ username: username.value }));
      window.dispatchEvent(new Event('auth-changed'));

      successMessage.value = 'Logged in successfully!';
      setTimeout(() => {
        router.push('/');
      }, 500);
    }

  } catch (err) {
    errorMessage.value = err.message
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background-color: var(--paper, #fdfbf7);
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background-color: #fefbe5;
  border: 1.5px solid var(--ink, #1a1a1a);
  border-radius: 8px;
  padding: 2.5rem 2rem;
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.08);
}

.auth-title {
  font-family: var(--font-heading, serif);
  font-size: 2rem;
  color: var(--ink, #1a1a1a);
  margin-bottom: 1.5rem;
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
  color: var(--ink, #1a1a1a);
}

input {
  padding: 0.65rem 0.8rem;
  font-size: 1rem;
  border: 1px solid var(--ink, #1a1a1a);
  border-radius: 4px;
  background-color: #ffffff;
  color: var(--ink, #1a1a1a);
  outline: none;
}

input:focus {
  outline: 2px solid var(--ink, #1a1a1a);
}

.submit-btn {
  margin-top: 0.5rem;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: bold;
  background-color: var(--ink, #1a1a1a);
  color: #fefbe5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.submit-btn:hover {
  opacity: 0.9;
}

.toggle-container {
  margin-top: 1.5rem;
  text-align: center;
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--ink, #1a1a1a);
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.9rem;
}

.toggle-btn:hover {
  color: #666;
}

.message {
  padding: 0.65rem 0.8rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.error-msg {
  background-color: #fde8e8;
  color: #9b1c1c;
  border: 1px solid #f8b4b4;
}

.success-msg {
  background-color: #def7ec;
  color: #03543f;
  border: 1px solid #84e1bc;
}
</style>
