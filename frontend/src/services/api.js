import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  changePassword: (data) => api.post("/auth/change-password", data),
  getMe: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

export const playersAPI = {
  getAll: () => api.get("/players"),
  create: (data) => api.post("/players", data),
  updateProfile: (playerId, data) => api.put(`/players/${playerId}/profile`, data),
  updateStats: (playerId, data) => api.put(`/players/${playerId}/stats`, data),
};

export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
};

export default api;
