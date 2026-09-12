import apiClient from "@/api/client";

function buildOperationParams({ date, counterpartyId, source } = {}) {
  const params = {};

  if (date) {
    params.operation_date = date;
  }

  if (counterpartyId != null) {
    params.counterparty = counterpartyId;
  }

  if (source) {
    params.source = source;
  }

  return params;
}

export async function getMmaAccounts({ signal } = {}) {
  const response = await apiClient.get("/mma/accounts/", {
    signal,
  });

  return response.data;
}

export async function getMmaIncoming({
  date,
  counterpartyId,
  source = "MANUAL",
  signal,
} = {}) {
  const response = await apiClient.get("/mma/incomings/", {
    params: buildOperationParams({
      date,
      counterpartyId,
      source,
    }),
    signal,
  });

  return response.data;
}

export async function createMmaIncoming(payload) {
  const response = await apiClient.post("/mma/incomings/", payload);

  return response.data;
}

export async function cancelMmaIncoming(operationId, reason) {
  const response = await apiClient.post(
    `/mma/incomings/${operationId}/cancel/`,
    { reason }
  );

  return response.data;
}

export async function getMmaOutgoing({ date, counterpartyId, signal } = {}) {
  const response = await apiClient.get("/mma/outgoings/", {
    params: buildOperationParams({
      date,
      counterpartyId,
    }),
    signal,
  });

  return response.data;
}

export async function createMmaOutgoing(payload) {
  const response = await apiClient.post("/mma/outgoings/", payload);

  return response.data;
}

export async function cancelMmaOutgoing(operationId, reason) {
  const response = await apiClient.post(
    `/mma/outgoings/${operationId}/cancel/`,
    { reason }
  );

  return response.data;
}

export async function getMmaDenXanIncoming({ date, signal } = {}) {
  const response = await apiClient.get("/mma/incomings/", {
    params: buildOperationParams({
      date,
      source: "DEN_XAN",
    }),
    signal,
  });

  return response.data;
}

export async function getMmaDaily(date, { signal } = {}) {
  const response = await apiClient.get("/mma/daily/", {
    params: { date },
    signal,
  });

  return response.data;
}
