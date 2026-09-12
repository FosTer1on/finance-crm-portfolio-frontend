import apiClient from "@/api/client";

export const companiesApi = {
  async list({ search = "" } = {}) {
    const params = {};

    const normalizedSearch = search.trim();

    if (normalizedSearch) {
      params.search = normalizedSearch;
    }

    const response = await apiClient.get("/companies/", {
      params,
    });

    return response.data;
  },

  async create(payload) {
    const response = await apiClient.post("/companies/", payload);

    return response.data;
  },
};
