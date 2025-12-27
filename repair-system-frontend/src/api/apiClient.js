import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
})

apiClient.interceptors.request.use(
  (config) => {
    config.headers["Content-Type"] = "application/json";
    const token = JSON.parse(localStorage.getItem("repair-auth-storage"))?.state?.token;
    console.log(token);
    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // если токен протух/неверный — чистим localStorage
    if (error?.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
    return Promise.reject(error)
  },
)

export default apiClient
