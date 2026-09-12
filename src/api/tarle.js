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

export async function getTarleProducts({ signal } = {}) {
  const response = await apiClient.get("/tarle/products/", {
    signal,
  });

  return response.data;
}

export async function getTarleIncoming({ date, counterpartyId, signal } = {}) {
  const response = await apiClient.get("/tarle/incoming/", {
    params: buildOperationsParams({
      date,
      counterpartyId,
    }),
    signal,
  });

  return response.data;
}

export async function createTarleIncoming(payload) {
  const response = await apiClient.post("/tarle/incoming/", payload);

  return response.data;
}

export async function cancelTarleIncoming(operationId, reason) {
  const response = await apiClient.post(
    `/tarle/incoming/${operationId}/cancel/`,
    { reason }
  );

  return response.data;
}

export async function getTarleOutgoing({ date, counterpartyId, signal } = {}) {
  const response = await apiClient.get("/tarle/outgoing/", {
    params: buildOperationsParams({
      date,
      counterpartyId,
    }),
    signal,
  });

  return response.data;
}

export async function createTarleOutgoing(payload) {
  const response = await apiClient.post("/tarle/outgoing/", payload);

  return response.data;
}

export async function cancelTarleOutgoing(operationId, reason) {
  const response = await apiClient.post(
    `/tarle/outgoing/${operationId}/cancel/`,
    { reason }
  );

  return response.data;
}

export async function getTarleDaily(date, { signal } = {}) {
  const response = await apiClient.get("/tarle/daily/", {
    params: { date },
    signal,
  });

  return response.data;
}
