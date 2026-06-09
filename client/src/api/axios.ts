import axios from "axios";

// Axios Instance Configuration
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Attach JWT Token To Every Request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

// import axios from "axios";

// // Axios Instance Configuration
// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// export default axios.create({
//   baseURL: API_URL,
//   withCredentials: true,
// });
