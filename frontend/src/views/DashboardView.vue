<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'

const router = useRouter()

const summary = reactive({
  totalBeneficiarios: 0,
  totalColaboradores: 0,
  totalEntregas: 0,
  totalCiudades: 0,
  topCities: []
})

const beneficiaries = ref([])
const deliveries = ref([])
const cities = ref([])
const populationTypes = ref([])
const helpTypes = ref([])
const filters = reactive({
  query: '',
  cityId: '',
  populationTypeId: '',
  helpTypeId: ''
})
const hasSearched = ref(false)
const lastFilters = reactive({
  query: '',
  cityId: '',
  populationTypeId: '',
  helpTypeId: ''
})
const beneficiaryTotal = ref(0)
const loading = ref(false)
const error = ref('')
const success = ref('')

function clearMessages() {
  error.value = ''
  success.value = ''
}

function buildSearchParams(limit) {
  const params = new URLSearchParams({ limit: String(limit) })

  if (lastFilters.query) {
    params.set('q', lastFilters.query)
  }

  if (lastFilters.cityId) {
    params.set('cityId', lastFilters.cityId)
  }

  if (lastFilters.populationTypeId) {
    params.set('populationTypeId', lastFilters.populationTypeId)
  }

  if (lastFilters.helpTypeId) {
    params.set('helpTypeId', lastFilters.helpTypeId)
  }

  return params
}

async function loadDashboard() {
  loading.value = true
  clearMessages()

  try {
    const requests = [
      api.getSummary(),
      api.getEntregas(hasSearched.value ? `?${buildSearchParams(8).toString()}` : '?limit=8')
    ]

    if (hasSearched.value) {
      requests.push(api.getBeneficiarios(`?${buildSearchParams(20).toString()}`))
    }

    const [summaryResponse, deliveriesResponse, beneficiariesResponse] = await Promise.all(requests)

    summary.totalBeneficiarios = summaryResponse.totalBeneficiarios
    summary.totalColaboradores = summaryResponse.totalColaboradores
    summary.totalEntregas = summaryResponse.totalEntregas
    summary.totalCiudades = summaryResponse.totalCiudades
    summary.topCities = summaryResponse.topCities
    deliveries.value = deliveriesResponse.data

    if (beneficiariesResponse) {
      beneficiaries.value = beneficiariesResponse.data
      beneficiaryTotal.value = beneficiariesResponse.pagination.total
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function loadCatalogs() {
  const [citiesResponse, populationTypesResponse, helpTypesResponse] = await Promise.all([
    api.getCiudades(),
    api.getTiposPoblacion(),
    api.getTiposAyuda()
  ])

  cities.value = citiesResponse
  populationTypes.value = populationTypesResponse
  helpTypes.value = helpTypesResponse
}

function hasActiveFilters() {
  return Boolean(
    filters.query.trim() ||
    filters.cityId ||
    filters.populationTypeId ||
    filters.helpTypeId
  )
}

async function runSearch() {
  if (!hasActiveFilters()) {
    hasSearched.value = false
    lastFilters.query = ''
    lastFilters.cityId = ''
    lastFilters.populationTypeId = ''
    lastFilters.helpTypeId = ''
    beneficiaries.value = []
    beneficiaryTotal.value = 0
    error.value = 'Selecciona al menos un criterio para consultar.'
    return
  }

  hasSearched.value = true
  lastFilters.query = filters.query.trim()
  lastFilters.cityId = filters.cityId
  lastFilters.populationTypeId = filters.populationTypeId
  lastFilters.helpTypeId = filters.helpTypeId
  await loadDashboard()
}

function clearSearch() {
  filters.query = ''
  filters.cityId = ''
  filters.populationTypeId = ''
  filters.helpTypeId = ''
  hasSearched.value = false
  lastFilters.query = ''
  lastFilters.cityId = ''
  lastFilters.populationTypeId = ''
  lastFilters.helpTypeId = ''
  beneficiaries.value = []
  beneficiaryTotal.value = 0
  clearMessages()
}

function logout() {
  localStorage.removeItem('authToken')
  router.push('/')
}

onMounted(async () => {
  try {
    await loadCatalogs()
    await loadDashboard()
  } catch (err) {
    error.value = err.message
  }
})
</script>

<template>
  <main class="dashboard-shell">
    <header class="topbar">
      <div>
        <p class="eyebrow">Panel de consulta</p>
        <h1>Ayudas sociales</h1>
      </div>

      <div class="topbar-actions">
        <button class="secondary-button" @click="loadDashboard">Actualizar</button>
        <button class="secondary-button" @click="logout">Salir</button>
      </div>
    </header>

    <p v-if="error" class="error-banner">{{ error }}</p>
    <p v-if="success" class="success-banner">{{ success }}</p>

    <section class="stats-grid">
      <article class="stat-card">
        <span>Beneficiarios</span>
        <strong>{{ summary.totalBeneficiarios }}</strong>
      </article>
      <article class="stat-card">
        <span>Colaboradores</span>
        <strong>{{ summary.totalColaboradores }}</strong>
      </article>
      <article class="stat-card">
        <span>Entregas</span>
        <strong>{{ summary.totalEntregas }}</strong>
      </article>
      <article class="stat-card">
        <span>Ciudades</span>
        <strong>{{ summary.totalCiudades }}</strong>
      </article>
    </section>

    <section class="content-grid">
      <article class="panel-card wide-panel">
        <div class="panel-heading">
          <h2>{{ hasSearched ? 'Resultados de la consulta' : 'Consulta de beneficiarios' }}</h2>
          <form class="inline-search" @submit.prevent="runSearch">
            <input v-model="filters.query" placeholder="Buscar por nombre, documento o correo" />
            <select v-model="filters.cityId">
              <option value="">Todas las ciudades</option>
              <option v-for="city in cities" :key="city.id_ciudad" :value="String(city.id_ciudad)">
                {{ city.nombre_ciudad }}
              </option>
            </select>
            <select v-model="filters.populationTypeId">
              <option value="">Todos los tipos de poblacion</option>
              <option
                v-for="populationType in populationTypes"
                :key="populationType.id_tipo_poblacion"
                :value="String(populationType.id_tipo_poblacion)"
              >
                {{ populationType.nombre_tipo }}
              </option>
            </select>
            <select v-model="filters.helpTypeId">
              <option value="">Todos los tipos de ayuda</option>
              <option v-for="helpType in helpTypes" :key="helpType.id_tipo_ayuda" :value="String(helpType.id_tipo_ayuda)">
                {{ helpType.nombre_ayuda }}
              </option>
            </select>
            <div class="search-actions">
              <button class="secondary-button" type="submit">Consultar</button>
              <button v-if="hasSearched || hasActiveFilters()" class="secondary-button" type="button" @click="clearSearch">Limpiar</button>
            </div>
          </form>
        </div>

        <p v-if="hasSearched" class="muted result-caption">
          {{ beneficiaryTotal }} resultado<span v-if="beneficiaryTotal !== 1">s</span>
        </p>

        <div v-if="!hasSearched" class="empty-state">
          Consulta por nombre, ciudad, tipo de poblacion y tipo de ayuda, de forma individual o combinada.
        </div>

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Ciudad</th>
                <th>Tipo poblacion</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!beneficiaries.length">
                <td colspan="5">No se encontraron beneficiarios para la consulta realizada.</td>
              </tr>
              <tr v-for="item in beneficiaries" :key="item.id_beneficiario">
                <td>{{ item.id_beneficiario }}</td>
                <td>{{ item.nombres }}</td>
                <td>{{ item.documento }}</td>
                <td>{{ item.nombre_ciudad }}</td>
                <td>{{ item.nombre_tipo }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <article class="panel-card">
        <h2>Ciudades con mas entregas</h2>
        <ul class="rank-list">
          <li v-for="item in summary.topCities" :key="item.nombre_ciudad">
            <span>{{ item.nombre_ciudad }}</span>
            <strong>{{ item.total_entregas }}</strong>
          </li>
        </ul>
      </article>

      <article class="panel-card wide-panel">
        <h2>Entregas recientes</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Beneficiario</th>
                <th>Ciudad</th>
                <th>Ayuda</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!deliveries.length">
                <td colspan="6">No se encontraron entregas para los filtros seleccionados.</td>
              </tr>
              <tr v-for="item in deliveries" :key="item.id_entrega">
                <td>{{ item.id_entrega }}</td>
                <td>{{ item.fecha_entrega }}</td>
                <td>{{ item.beneficiario }}</td>
                <td>{{ item.nombre_ciudad }}</td>
                <td>{{ item.nombre_ayuda }}</td>
                <td>{{ item.cantidad }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

     </section>

    <p v-if="loading" class="muted">Cargando informacion...</p>
  </main>
</template>
