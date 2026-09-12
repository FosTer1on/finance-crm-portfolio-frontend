import apiClient from "@/api/client";

function buildIncomingParams({ date, distributorId } = {}) {
  const params = {};

  if (date) {
    params.operation_date = date;
  }

  if (distributorId != null) {
    params.distributor = distributorId;
  }

  return params;
}

function buildOutgoingParams({ date, purpose } = {}) {
  const params = {};

  if (date) {
    params.operation_date = date;
  }

  if (purpose) {
    params.purpose = purpose;
  }

  return params;
}

function buildExpenseParams({ date } = {}) {
  const params = {};

  if (date) {
    params.operation_date = date;
  }

  return params;
}

export async function getDenXanDistributors({ signal } = {}) {
  const response = await apiClient.get("/den-xan/distributors/", {
    signal,
  });

  return response.data;
}

export async function getDenXanAccounts({ signal } = {}) {
  const response = await apiClient.get("/den-xan/accounts/", {
    signal,
  });

  return response.data;
}

export async function getDenXanIncomings({ date, distributorId, signal } = {}) {
  const response = await apiClient.get("/den-xan/incomings/", {
    params: buildIncomingParams({
      date,
      distributorId,
    }),
    signal,
  });

  return response.data;
}

export async function createDenXanIncoming(payload) {
  const response = await apiClient.post("/den-xan/incomings/", payload);

  return response.data;
}

export async function cancelDenXanIncoming(operationId, reason) {
  const response = await apiClient.post(
    `/den-xan/incomings/${operationId}/cancel/`,
    { reason }
  );

  return response.data;
}

export async function getDenXanOutgoings({ date, purpose, signal } = {}) {
  const response = await apiClient.get("/den-xan/outgoings/", {
    params: buildOutgoingParams({
      date,
      purpose,
    }),
    signal,
  });

  return response.data;
}

export async function createDenXanOutgoing(payload) {
  const response = await apiClient.post("/den-xan/outgoings/", payload);

  return response.data;
}

export async function cancelDenXanOutgoing(operationId, reason) {
  const response = await apiClient.post(
    `/den-xan/outgoings/${operationId}/cancel/`,
    { reason }
  );

  return response.data;
}

export async function getDenXanExpenses({ date, signal } = {}) {
  const response = await apiClient.get("/den-xan/expenses/", {
    params: buildExpenseParams({ date }),
    signal,
  });

  return response.data;
}

export async function createDenXanExpense(payload) {
  const response = await apiClient.post("/den-xan/expenses/", payload);

  return response.data;
}

export async function cancelDenXanExpense(expenseId, reason) {
  const response = await apiClient.post(
    `/den-xan/expenses/${expenseId}/cancel/`,
    { reason }
  );

  return response.data;
}

export async function getDenXanDaily(date, { signal } = {}) {
  const response = await apiClient.get("/den-xan/daily/", {
    params: { date },
    signal,
  });

  return response.data;
}

export async function getDenXanDailyRate(date, { signal } = {}) {
  const response = await apiClient.get("/den-xan/daily-rate/", {
    params: { date },
    signal,
  });

  return response.data;
}

export async function saveDenXanDailyRate(payload) {
  const response = await apiClient.put("/den-xan/daily-rate/", payload);

  return response.data;
}
