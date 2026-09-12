import apiClient from "@/api/client";

export async function getSettlementPreview(date) {
  const response = await apiClient.get("/settlements/preview/", {
    params: {
      date,
    },
  });

  return response.data;
}

export async function closeBusinessDay(date) {
  const response = await apiClient.post("/settlements/close/", {
    date,
  });

  return response.data;
}

export async function getBusinessDay(date, { signal } = {}) {
  const response = await apiClient.get(`/settlements/days/${date}/`, {
    signal,
  });

  return response.data;
}
