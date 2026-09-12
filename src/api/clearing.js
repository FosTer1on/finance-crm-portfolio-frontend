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

export async function getClearingOperations({
  date,
  counterpartyId,
  signal,
} = {}) {
  const response = await apiClient.get("/clearing/operations/", {
    params: buildOperationsParams({
      date,
      counterpartyId,
    }),
    signal,
  });

  return response.data;
}

export async function createClearingOperation(payload) {
  const response = await apiClient.post("/clearing/operations/", payload);

  return response.data;
}

export async function cancelClearingOperation(operationId, reason) {
  const response = await apiClient.post(
    `/clearing/operations/${operationId}/cancel/`,
    {
      reason,
    }
  );

  return response.data;
}

export async function getClearingDaily(date, { signal } = {}) {
  const response = await apiClient.get("/clearing/daily/", {
    params: {
      date,
    },
    signal,
  });

  return response.data;
}
