import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  // timeout: 30000,
})

api.interceptors.request.use((config) => {
  console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
  return config
})

api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.message)
    return Promise.reject(error)
  }
)

export const profileAPI = {
  getProfile: (username) =>
    api.get(`/profile/${username}`),

  getPosts: (username) =>
    api.get(`/profile/${username}/posts`),

  getAllProfiles: () =>
    api.get(`/profile/all`),

  refreshProfile: (username) =>
    api.post(`/profile/${username}/refresh`),

  compareProfiles: (usernames) =>
    api.get(`/compare?users=${usernames.join(',')}`),
}
