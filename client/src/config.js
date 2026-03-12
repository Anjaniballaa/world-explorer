// Automatically uses Render API in production, localhost in development
const API = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV 
    ? "http://localhost:5000/api"
    : "https://world-explorer-api.onrender.com/api");

export default API;
