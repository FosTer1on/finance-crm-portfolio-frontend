import apiClient from "@/api/client";

export const authApi = {
  async login(payload) {
    const response = await apiClient.post("/auth/login/", payload, {
      skipAuth: true,
      skipAuthRefresh: true,
    });

    return response.data;
  },

  async refresh(refreshToken) {
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

    return response.data;
  },

  async me() {
    const response = await apiClient.get("/auth/me/");

    return response.data;
  },
};
