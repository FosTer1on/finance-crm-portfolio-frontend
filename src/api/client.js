import axios from "axios";

import { authStorage } from "@/utils/storage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured");
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise = null;
let authFailureHandler = null;
let accessTokenRefreshHandler = null;

export function setAuthFailureHandler(handler) {
  authFailureHandler = handler;
}

export function setAccessTokenRefreshHandler(handler) {
  accessTokenRefreshHandler = handler;
}

function handleAuthFailure() {
  authStorage.clear();

  if (authFailureHandler) {
    authFailureHandler();
  }
}

async function refreshAccessToken() {
  const refreshToken = authStorage.getRefreshToken();

  if (!refreshToken) {
    throw new Error("Refresh token is missing");
  }

  const response = await apiClient.post(
    "/auth/refresh/",
    {
      refresh: refreshToken,
    },
    {
      skipAuth: true,
      skipAuthRefresh: true,
    }
  );

  const access = response.data?.access;

  if (!access) {
    throw new Error("Access token is missing in refresh response");
  }

  authStorage.setAccessToken(access);

  if (accessTokenRefreshHandler) {
    accessTokenRefreshHandler(access);
  }

  return access;
}

function getRefreshPromise() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
  if (config.skipAuth) {
    return config;
  }

  const accessToken = authStorage.getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isUnauthorized = error.response?.status === 401;

    const shouldSkipRefresh = originalRequest.skipAuthRefresh;

    const alreadyRetried = originalRequest._retry;

    if (!isUnauthorized || shouldSkipRefresh || alreadyRetried) {
      return Promise.reject(error);
    }

    const refreshToken = authStorage.getRefreshToken();

    if (!refreshToken) {
      handleAuthFailure();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const accessToken = await getRefreshPromise();

      originalRequest.headers = originalRequest.headers ?? {};

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      handleAuthFailure();

      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
