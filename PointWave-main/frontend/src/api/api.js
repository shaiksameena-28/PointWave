const API_URL = 'http://localhost:5000/api'

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('pointwave-token')

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
      ...options.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong')
  }

  return data
}

export const apiGet = (endpoint) => {
  return apiRequest(endpoint, {
    method: 'GET',
  })
}

export const apiPost = (endpoint, body) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const apiPut = (endpoint, body) => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export const apiDelete = (endpoint) => {
  return apiRequest(endpoint, {
    method: 'DELETE',
  })
}