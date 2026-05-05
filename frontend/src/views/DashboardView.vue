<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
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
const currentPage = ref(1)
const itemsPerPage = 20
const loading = ref(false)
const error = ref('')
const success = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(beneficiaryTotal.value / itemsPerPage)))

const summaryCards = computed(() => [
  {
    label: 'Beneficiarios',
    value: summary.totalBeneficiarios,
    accent: 'blue',
    helper: 'Personas registradas'
  },
  {
    label: 'Colaboradores',
    value: summary.totalColaboradores,
    accent: 'teal',
    helper: 'Equipo activo'
  },
  {
    label: 'Entregas',
    value: summary.totalEntregas,
    accent: 'amber',
    helper: 'Ayudas entregadas'
  },
  {
    label: 'Ciudades',
    value: summary.totalCiudades,
    accent: 'violet',
    helper: 'Cobertura disponible'
  }
])

const activeFilterSummary = computed(() => {
  const parts = []

  if (lastFilters.query) {
    parts.push(`Busqueda: ${lastFilters.query}`)
  }

  if (lastFilters.cityId) {
    const city = cities.value.find((item) => String(item.id_ciudad) === lastFilters.cityId)
    if (city) parts.push(`Ciudad: ${city.nombre_ciudad}`)
  }

  if (lastFilters.populationTypeId) {
    const type = populationTypes.value.find((item) => String(item.id_tipo_poblacion) === lastFilters.populationTypeId)
    if (type) parts.push(`Poblacion: ${type.nombre_tipo}`)
  }

  if (lastFilters.helpTypeId) {
    const helpType = helpTypes.value.find((item) => String(item.id_tipo_ayuda) === lastFilters.helpTypeId)
    if (helpType) parts.push(`Ayuda: ${helpType.nombre_ayuda}`)
  }

  return parts
})

function clearMessages() {
  error.value = ''
  success.value = ''
}

function formatNumber(value) {
  return new Intl.NumberFormat('es-CO').format(value || 0)
}

function formatDate(value) {
  if (!value) return 'Sin fecha'

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(parsed)
}

function buildSearchParams(limit, page = 1) {
  const params = new URLSearchParams({ limit: String(limit), page: String(page) })

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

async function loadBeneficiaries(page = 1) {
  loading.value = true
  clearMessages()

  try {
    const beneficiariesResponse = await api.getBeneficiarios(`?${buildSearchParams(itemsPerPage, page).toString()}`)
    beneficiaries.value = beneficiariesResponse.data
    beneficiaryTotal.value = beneficiariesResponse.pagination.total
    currentPage.value = page
    success.value = 'Consulta actualizada correctamente.'
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
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
      requests.push(api.getBeneficiarios(`?${buildSearchParams(itemsPerPage, currentPage.value).toString()}`))
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

    success.value = 'Panel actualizado.'
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
    currentPage.value = 1
    error.value = 'Selecciona al menos un criterio para consultar.'
    success.value = ''
    return
  }

  hasSearched.value = true
  lastFilters.query = filters.query.trim()
  lastFilters.cityId = filters.cityId
  lastFilters.populationTypeId = filters.populationTypeId
  lastFilters.helpTypeId = filters.helpTypeId
  currentPage.value = 1
  await loadBeneficiaries(1)
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
  currentPage.value = 1
  clearMessages()
}

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    loadBeneficiaries(page)
  }
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
    <section class="dashboard-hero panel-card">
      <div class="dashboard-hero-copy">
        <p class="eyebrow">Sistema de Ayudas Sociales</p>
        <h1>Panel operativo de seguimiento</h1>
        <p class="muted dashboard-hero-text">
          Consulta beneficiarios, revisa entregas recientes y mantén visibilidad rápida sobre la cobertura del programa.
        </p>
      </div>

      <div class="dashboard-hero-side">
        <div class="dashboard-status-card">
          <span class="status-label">Estado del panel</span>
          <strong>{{ loading ? 'Actualizando datos' : 'Operacion estable' }}</strong>
          <p class="muted">
            {{ hasSearched ? 'Hay filtros aplicados en la vista principal.' : 'Vista general sin filtros activos.' }}
          </p>
        </div>

        <div class="topbar-actions">
          <button class="secondary-button" @click="loadDashboard">
            {{ loading ? 'Actualizando...' : 'Actualizar panel' }}
          </button>
          <button class="secondary-button" @click="logout">Cerrar sesion</button>
        </div>
      </div>
    </section>

    <p v-if="error" class="error-banner">{{ error }}</p>
    <p v-if="success" class="success-banner">{{ success }}</p>

    <section class="stats-grid">
      <article
        v-for="card in summaryCards"
        :key="card.label"
        class="stat-card stat-card-rich"
        :data-accent="card.accent"
      >
        <div class="stat-card-top">
          <span>{{ card.label }}</span>
          <small>{{ card.helper }}</small>
        </div>
        <strong>{{ formatNumber(card.value) }}</strong>
      </article>
    </section>

    <section class="content-grid">
      <article class="panel-card wide-panel">
        <div class="section-block">
          <div class="section-intro">
            <p class="eyebrow">Consulta principal</p>
            <h2>{{ hasSearched ? 'Resultados de beneficiarios' : 'Buscar beneficiarios' }}</h2>
            <p class="muted">
              Filtra por nombre, documento, ciudad, tipo de poblacion o tipo de ayuda para ubicar registros con mas rapidez.
            </p>
          </div>

          <form class="filter-toolbar" @submit.prevent="runSearch">
            <div class="filter-grid">
              <label class="field-stack">
                <span>Busqueda general</span>
                <input v-model="filters.query" placeholder="Nombre, documento o correo" />
              </label>

              <label class="field-stack">
                <span>Ciudad</span>
                <select v-model="filters.cityId">
                  <option value="">Todas las ciudades</option>
                  <option v-for="city in cities" :key="city.id_ciudad" :value="String(city.id_ciudad)">
                    {{ city.nombre_ciudad }}
                  </option>
                </select>
              </label>

              <label class="field-stack">
                <span>Tipo de poblacion</span>
                <select v-model="filters.populationTypeId">
                  <option value="">Todos los tipos</option>
                  <option
                    v-for="populationType in populationTypes"
                    :key="populationType.id_tipo_poblacion"
                    :value="String(populationType.id_tipo_poblacion)"
                  >
                    {{ populationType.nombre_tipo }}
                  </option>
                </select>
              </label>

              <label class="field-stack">
                <span>Tipo de ayuda</span>
                <select v-model="filters.helpTypeId">
                  <option value="">Todas las ayudas</option>
                  <option
                    v-for="helpType in helpTypes"
                    :key="helpType.id_tipo_ayuda"
                    :value="String(helpType.id_tipo_ayuda)"
                  >
                    {{ helpType.nombre_ayuda }}
                  </option>
                </select>
              </label>
            </div>

            <div class="filter-actions">
              <button class="primary-button" type="submit">Consultar beneficiarios</button>
              <button
                v-if="hasSearched || hasActiveFilters()"
                class="secondary-button"
                type="button"
                @click="clearSearch"
              >
                Limpiar filtros
              </button>
            </div>
          </form>
        </div>

        <div class="results-toolbar">
          <div>
            <p class="results-count">
              {{ hasSearched ? formatNumber(beneficiaryTotal) : '0' }}
              <span>{{ hasSearched ? 'resultados encontrados' : 'resultados activos' }}</span>
            </p>
            <p class="muted results-subtitle">
              {{ hasSearched ? 'La tabla refleja la ultima consulta ejecutada.' : 'Ejecuta una consulta para ver beneficiarios.' }}
            </p>
          </div>

          <div v-if="hasSearched && activeFilterSummary.length" class="filter-chip-group">
            <span v-for="item in activeFilterSummary" :key="item" class="filter-chip">{{ item }}</span>
          </div>
        </div>

        <div v-if="!hasSearched" class="empty-state dashboard-empty-state">
          <strong>Empieza con un filtro para consultar beneficiarios.</strong>
          <span>
            Puedes combinar ciudad, tipo de poblacion y tipo de ayuda para reducir resultados y revisar la informacion con mas rapidez.
          </span>
        </div>

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Beneficiario</th>
                <th>Documento</th>
                <th>Ciudad</th>
                <th>Tipo de poblacion</th>
                <th>Tipos de ayuda</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!beneficiaries.length">
                <td colspan="6">
                  <div class="table-empty-copy">
                    <strong>Sin coincidencias para esta consulta.</strong>
                    <span>Prueba ajustar los filtros para ampliar los resultados.</span>
                  </div>
                </td>
              </tr>
              <tr v-for="item in beneficiaries" :key="item.id_beneficiario">
                <td>
                  <span class="table-id">#{{ item.id_beneficiario }}</span>
                </td>
                <td>
                  <div class="table-primary">
                    <strong>{{ item.nombres }}</strong>
                    <span>{{ item.correo || 'Sin correo registrado' }}</span>
                  </div>
                </td>
                <td>{{ item.documento }}</td>
                <td>{{ item.nombre_ciudad }}</td>
                <td>
                  <span class="soft-badge">{{ item.nombre_tipo }}</span>
                </td>
                <td>
                  <span class="soft-badge soft-badge-neutral">{{ item.tipos_ayuda || 'Sin entregas registradas' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="hasSearched && beneficiaries.length > 0" class="pagination-controls">
          <span class="pagination-info">Pagina {{ currentPage }} de {{ totalPages }}</span>
          <div class="pagination-buttons">
            <button
              class="pagination-button"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              Anterior
            </button>

            <button
              class="pagination-button"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              Siguiente
            </button>
          </div>
        </div>
      </article>

      <article class="panel-card">
        <div class="section-intro section-intro-tight">
          <p class="eyebrow">Cobertura</p>
          <h2>Ciudades con mas entregas</h2>
          <p class="muted">Ranking rapido para identificar en que ciudades se concentra la operacion.</p>
        </div>

        <ul class="rank-list rank-list-rich">
          <li v-for="item in summary.topCities" :key="item.nombre_ciudad">
            <div class="rank-list-copy">
              <strong>{{ item.nombre_ciudad }}</strong>
              <span>Entregas registradas</span>
            </div>
            <strong class="rank-number">{{ formatNumber(item.total_entregas) }}</strong>
          </li>
        </ul>
      </article>

      <article class="panel-card wide-panel">
        <div class="section-intro section-intro-inline">
          <div>
            <p class="eyebrow">Actividad reciente</p>
            <h2>Entregas recientes</h2>
          </div>
          <p class="muted">Ultimos movimientos cargados en el sistema para seguimiento operativo.</p>
        </div>

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
                <td colspan="6">
                  <div class="table-empty-copy">
                    <strong>No hay entregas para mostrar.</strong>
                    <span>Cuando existan movimientos recientes apareceran en esta tabla.</span>
                  </div>
                </td>
              </tr>
              <tr v-for="item in deliveries" :key="item.id_entrega">
                <td><span class="table-id">#{{ item.id_entrega }}</span></td>
                <td>{{ formatDate(item.fecha_entrega) }}</td>
                <td>
                  <div class="table-primary">
                    <strong>{{ item.beneficiario }}</strong>
                    <span>Registro de entrega</span>
                  </div>
                </td>
                <td>{{ item.nombre_ciudad }}</td>
                <td><span class="soft-badge">{{ item.nombre_ayuda }}</span></td>
                <td><strong class="quantity-pill">{{ formatNumber(item.cantidad) }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </section>

    <p v-if="loading" class="muted loading-note">Cargando informacion del panel...</p>
  </main>
</template>
