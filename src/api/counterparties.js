import apiClient from "@/api/client";

export const counterpartiesApi = {
  async list({ search = "" } = {}) {
    const params = {};

    const normalizedSearch = search.trim();

    if (normalizedSearch) {
      params.search = normalizedSearch;
    }

    const response = await apiClient.get("/counterparties/", {
      params,
    });

    return response.data;
  },

  async create(payload) {
    const response = await apiClient.post("/counterparties/", payload);

    return response.data;
  },
};
