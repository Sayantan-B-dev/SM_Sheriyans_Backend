import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important: Send cookies with requests
});

// Auth API
export const authAPI = {
  register: (firstName, lastName, email, password) =>
    api.post("/auth/register", {
      fullName: { firstName, lastName },
      email,
      password,
    }),
  login: (email, password) =>
    api.post("/auth/login", { email, password }),
  logout: () =>
    api.get("/auth/logout"),
};

// Chat API
export const chatAPI = {
  createChat: (title) =>
    api.post("/chat", { title }),
  getChats: () =>
    api.get("/chat"),
};

export default api;
