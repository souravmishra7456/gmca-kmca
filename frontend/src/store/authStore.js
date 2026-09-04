import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI } from "@/services/api";

const useAuthStore = create(persist((set) => ({
  user: null,
  role: null,
  loading: true,
  isAuthenticated: false,

  setUser: (user) =>
    set({
      user,
      role: user?.role || null,
      isAuthenticated: !!user,
      loading: false,
    }),

  setLoading: (loading) => set({ loading }),

  login: async (credentials) => {
    set({ loading: true });
    try {
      const { data } = await authAPI.login(credentials);
      set({
        user: data.user,
        role: data.user.role,
        isAuthenticated: true,
        loading: false,
      });
      return data.user;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    set({ loading: true });
    try {
      const user = useAuthStore.getState().user;

      if (!user?.id) {
        throw new Error("Please log in before changing your password");
      }

      const { data } = await authAPI.changePassword({
        userId: user.id,
        currentPassword,
        newPassword,
      });

      set({
        user: data.user,
        role: data.user.role,
        isAuthenticated: true,
        loading: false,
      });

      return data.user;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch {
      // Clear local state even if API call fails
    } finally {
      set({
        user: null,
        role: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  },

  getCurrentUser: async () => {
    set({ loading: true });
    try {
      const { data } = await authAPI.getMe();
      set({
        user: data.user,
        role: data.user.role,
        isAuthenticated: true,
        loading: false,
      });
      return data.user;
    } catch {
      set({
        user: null,
        role: null,
        isAuthenticated: false,
        loading: false,
      });
      return null;
    }
  },
}), {
  name: "gmca-kmca-session",
  skipHydration: true,
  partialize: ({ user, role, isAuthenticated }) => ({
    user,
    role,
    isAuthenticated,
  }),
  onRehydrateStorage: () => () => {
    useAuthStore.setState({ loading: false });
  },
}));

export default useAuthStore;
