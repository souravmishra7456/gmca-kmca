"use client";

import { useEffect } from "react";
import useAuthStore from "@/store/authStore";

export function useAuth() {
  const { user, role, loading, isAuthenticated, login, logout, getCurrentUser } =
    useAuthStore();

  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  return {
    user,
    role,
    loading,
    isAuthenticated,
    login,
    logout,
    getCurrentUser,
  };
}
