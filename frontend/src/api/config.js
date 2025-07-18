import axios from 'axios'

// Configure axios base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

axios.defaults.baseURL = API_URL
axios.defaults.headers.common['Content-Type'] = 'application/json'

export default axios
