const API_BASE = import.meta.env.VITE_API_BASE || ''

async function request(path, options = {}) {
  const token = localStorage.getItem('authToken')
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  })

  if (response.status === 204) {
    return null
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Error en la solicitud')
  }

  return data
}

export const api = {
  login(payload) {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  getSummary() {
    return request('/api/dashboard/summary')
  },
  getBeneficiarios(query = '') {
    return request(`/api/beneficiarios${query}`)
  },
  createBeneficiario(payload) {
    return request('/api/beneficiarios', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  getEntregas(query = '') {
    return request(`/api/entregas${query}`)
  },
  createEntrega(payload) {
    return request('/api/entregas', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  getCiudades() {
    return request('/api/catalogos/ciudades')
  },
  getTiposPoblacion() {
    return request('/api/catalogos/tipos-poblacion')
  },
  getTiposAyuda() {
    return request('/api/catalogos/tipos-ayuda')
  },
  getColaboradores() {
    return request('/api/colaboradores')
  },
  getHealth() {
    return request('/api/health')
  }
}
