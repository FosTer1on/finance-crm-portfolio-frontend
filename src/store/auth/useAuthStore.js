import { create } from "zustand";

import {
  setAuthFailureHandler,
  setAccessTokenRefreshHandler,
} from "@/api/client";

import { authApi } from "@/api/auth";
import { normalizeApiError } from "@/api/errors";
import { authStorage } from "@/utils/storage";

let initializationPromise = null;

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: authStorage.getAccessToken(),
  refreshToken: authStorage.getRefreshToken(),

  isAuthenticated: false,
  isInitialized: false,

  login: async ({ username, password }) => {
    try {
      const data = await authApi.login({
        username,
        password,
      });

      const access = data.access;
      const refresh = data.refresh;
      const user = data.user;

      if (!access || !refresh || !user) {
        throw {
          code: "invalid_auth_response",
          message: "Сервер вернул некорректный ответ авторизации.",
          details: {},
          status: null,
          type: "server",
          isNormalized: true,
        };
      }

      authStorage.setTokens({
        access,
        refresh,
      });

      set({
        user,
        accessToken: access,
        refreshToken: refresh,
        isAuthenticated: true,
      });

      return user;
    } catch (error) {
      if (error?.isNormalized) {
        throw error;
      }

      throw normalizeApiError(error);
    }
  },

  logout: () => {
    authStorage.clear();

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  initialize: async () => {
    if (get().isInitialized) {
      return;
    }

    if (initializationPromise) {
      return initializationPromise;
    }

    initializationPromise = (async () => {
      const access = authStorage.getAccessToken();

      const refresh = authStorage.getRefreshToken();

      if (!access && !refresh) {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isInitialized: true,
        });

        return;
      }

      try {
        const user = await authApi.me();

        set({
          user,
          accessToken: authStorage.getAccessToken(),
          refreshToken: authStorage.getRefreshToken(),
          isAuthenticated: true,
          isInitialized: true,
        });
      } catch {
        authStorage.clear();

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isInitialized: true,
        });
      }
    })();

    try {
      await initializationPromise;
    } finally {
      initializationPromise = null;
    }
  },
}));

setAuthFailureHandler(() => {
  authStorage.clear();

  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isInitialized: true,
  });

  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
});

setAccessTokenRefreshHandler((accessToken) => {
  useAuthStore.setState({
    accessToken,
  });
});
