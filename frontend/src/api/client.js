import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 5000,
})

client.interceptors.response.use(
  (response) => {
    const payload = response.data
    if (![200, 201].includes(payload?.code)) {
      return Promise.reject(new Error(payload?.message || 'request failed'))
    }
    return payload.data
  },
  (error) => Promise.reject(new Error(error.response?.data?.message || 'service unavailable')),
)

export default client
