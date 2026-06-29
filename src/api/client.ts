import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_URL || "https://nakowa-mangement-system.onrender.com/api"

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 8000,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("nakowa_token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || "Something went wrong"
    return Promise.reject(new Error(message))
  }
)
