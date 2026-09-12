import apiClient from "@/api/client";

function buildTransactionParams({
  date,
  currency,
  transactionType,
  counterpartyId,
}) {
  const params = {};

  if (date) {
    params.operation_date = date;
  }

  if (currency) {
    params.currency = currency;
  }

  if (transactionType) {
    params.transaction_type = transactionType;
  }

  if (
    counterpartyId !== null &&
    counterpartyId !== undefined &&
    counterpartyId !== ""
  ) {
    params.counterparty = counterpartyId;
  }

  return params;
}

export async function getCashBalances({ signal } = {}) {
  const response = await apiClient.get("/cash/balances/", {
    signal,
  });

  return response.data;
}

export async function initializeCashBalance(payload) {
  const response = await apiClient.post("/cash/initialize/", payload);

  return response.data;
}

export async function createCashIncome(payload) {
  const response = await apiClient.post("/cash/income/", payload);

  return response.data;
}

export async function createCashExpense(payload) {
  const response = await apiClient.post("/cash/expense/", payload);

  return response.data;
}

export async function getCashTransactions({
  date,
  currency,
  transactionType,
  counterpartyId,
  signal,
} = {}) {
  const response = await apiClient.get("/cash/transactions/", {
    params: buildTransactionParams({
      date,
      currency,
      transactionType,
      counterpartyId,
    }),
    signal,
  });

  return response.data;
}

export async function getCashExchanges({ signal } = {}) {
  const response = await apiClient.get("/cash/exchanges/", {
    signal,
  });

  return response.data;
}

export async function createCashExchange(payload) {
  const response = await apiClient.post("/cash/exchanges/", payload);

  return response.data;
}
