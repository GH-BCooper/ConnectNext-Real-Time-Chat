import axios from "axios";

// Axios Instance Configuration
export default axios.create({
  baseURL: "https://connectnext-backend.onrender.com",
  // baseURL: "http://localhost:5000",
  withCredentials: true
});