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
  requestPasswordReset: (data) => api.post("/auth/forgot-password", data),
  getPasswordResetRequests: () => api.get("/auth/password-reset-requests"),
  approvePasswordReset: (requestId) =>
    api.post(`/auth/password-reset-requests/${requestId}/approve`),
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

export const noticesAPI = {
  getAll: (params) => api.get("/notices", { params }),
  create: (notice) => api.post("/notices", notice),
};

export const teamSelectionsAPI = {
  getAll: () => api.get("/team-selections"),
  create: (selection) => api.post("/team-selections", selection),
  delete: (selectionId) => api.delete(`/team-selections/${selectionId}`),
};

export default api;
