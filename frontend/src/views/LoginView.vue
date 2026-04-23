<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const form = reactive({
  usuario: 'admin',
  contrasena: 'admin123'
})

async function submit() {
  loading.value = true
  error.value = ''

  try {
    const response = await api.login(form)
    localStorage.setItem('authToken', response.token)
    router.push('/app')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login-shell">
    <section class="login-card">
      <p class="eyebrow">Sistema de Ayudas Sociales</p>
      <h1>Ingreso al panel operativo</h1>
      <p class="muted">Usa las credenciales iniciales del entorno para entrar al aplicativo.</p>

      <form class="form-grid" @submit.prevent="submit">
        <label>
          <span>Usuario</span>
          <input v-model="form.usuario" type="text" autocomplete="username" />
        </label>

        <label>
          <span>Contrasena</span>
          <input v-model="form.contrasena" type="password" autocomplete="current-password" />
        </label>

        <button class="primary-button" :disabled="loading" type="submit">
          {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>

      <p v-if="error" class="error-text">{{ error }}</p>

      <div class="hint-box">
        <strong>Credenciales por defecto</strong>
        <span>Usuario: `admin`</span>
        <span>Contrasena: `admin123`</span>
      </div>
    </section>
  </main>
</template>
