import axios from "axios";

// Axios Instance Configuration
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default axios.create({
  baseURL: API_URL,
  withCredentials: true,
});
