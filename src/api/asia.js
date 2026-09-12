import apiClient from "@/api/client";

function buildOperationsParams({ date, counterpartyId } = {}) {
  const params = {};

  if (date) {
    params.operation_date = date;
  }

  if (counterpartyId != null) {
    params.counterparty = counterpartyId;
  }

  return params;
}

export async function getAsiaIncoming({ date, counterpartyId, signal } = {}) {
  const response = await apiClient.get("/asia/incoming/", {
    params: buildOperationsParams({
      date,
      counterpartyId,
    }),
    signal,
  });

  return response.data;
}

export async function createAsiaIncoming(payload) {
  const response = await apiClient.post("/asia/incoming/", payload);

  return response.data;
}

export async function cancelAsiaIncoming(operationId, reason) {
  const response = await apiClient.post(
    `/asia/incoming/${operationId}/cancel/`,
    { reason }
  );

  return response.data;
}

export async function getAsiaOutgoing({ date, counterpartyId, signal } = {}) {
  const response = await apiClient.get("/asia/outgoing/", {
    params: buildOperationsParams({
      date,
      counterpartyId,
    }),
    signal,
  });

  return response.data;
}

export async function createAsiaOutgoing(payload) {
  const response = await apiClient.post("/asia/outgoing/", payload);

  return response.data;
}

export async function cancelAsiaOutgoing(operationId, reason) {
  const response = await apiClient.post(
    `/asia/outgoing/${operationId}/cancel/`,
    { reason }
  );

  return response.data;
}

export async function getAsiaDaily(date, { signal } = {}) {
  const response = await apiClient.get("/asia/daily/", {
    params: { date },
    signal,
  });

  return response.data;
}

export async function saveAsiaDailySettings(payload) {
  const response = await apiClient.put("/asia/daily-settings/", payload);

  return response.data;
}
