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
    <section class="login-layout">
      <article class="login-info-panel">
        <p class="eyebrow">Sistema de Ayudas Sociales</p>
        <h1>Gestion clara para una operacion social mas visible</h1>
        <p class="muted login-lead">
          Accede al panel operativo para consultar beneficiarios, revisar entregas recientes y seguir la cobertura del programa.
        </p>

        <div class="login-info-grid">
          <div class="login-info-card">
            <strong>Consulta centralizada</strong>
            <span>Busca beneficiarios por ciudad, tipo de poblacion y tipo de ayuda.</span>
          </div>
          <div class="login-info-card">
            <strong>Seguimiento rapido</strong>
            <span>Revisa entregas recientes y concentra la operacion en una sola vista.</span>
          </div>
        </div>
      </article>

      <section class="login-card login-card-rich">
        <div class="login-card-header">
          <p class="eyebrow">Acceso seguro</p>
          <h2>Ingreso al panel</h2>
          <p class="muted">
            Usa las credenciales habilitadas para entrar al sistema y continuar con la gestion operativa.
          </p>
        </div>

        <form class="form-grid" @submit.prevent="submit">
          <label class="field-stack">
            <span>Usuario</span>
            <input v-model="form.usuario" type="text" autocomplete="username" />
          </label>

          <label class="field-stack">
            <span>Contrasena</span>
            <input v-model="form.contrasena" type="password" autocomplete="current-password" />
          </label>

          <button class="primary-button login-submit" :disabled="loading" type="submit">
            {{ loading ? 'Ingresando al sistema...' : 'Ingresar al panel' }}
          </button>
        </form>

        <p v-if="error" class="error-text">{{ error }}</p>

        <div class="hint-box login-credentials">
          <div class="credentials-header">
            <strong>Credenciales iniciales</strong>
            <span>Entorno de demostracion</span>
          </div>
          <div class="credentials-grid">
            <div>
              <span class="credential-label">Usuario</span>
              <strong>admin</strong>
            </div>
            <div>
              <span class="credential-label">Contrasena</span>
              <strong>admin123</strong>
            </div>
          </div>
        </div>
      </section>
    </section>
  </main>
</template>
