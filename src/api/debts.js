import apiClient from "@/api/client";

function buildDebtParams({
  counterpartyId,
  direction,
  currency,
  status,
  source,
  sourceDate,
  dateFrom,
  dateTo,
} = {}) {
  const params = {};

  if (counterpartyId != null) {
    params.counterparty = counterpartyId;
  }

  if (direction) {
    params.direction = direction;
  }

  if (currency) {
    params.currency = currency;
  }

  if (status) {
    params.status = status;
  }

  if (source) {
    params.source = source;
  }

  if (sourceDate) {
    params.source_date = sourceDate;
  }

  if (dateFrom) {
    params.date_from = dateFrom;
  }

  if (dateTo) {
    params.date_to = dateTo;
  }

  return params;
}

function compareDebts(left, right) {
  const sourceDateCompare = String(left.source_date ?? "").localeCompare(
    String(right.source_date ?? "")
  );

  if (sourceDateCompare !== 0) {
    return sourceDateCompare;
  }

  const createdAtCompare = String(left.created_at ?? "").localeCompare(
    String(right.created_at ?? "")
  );

  if (createdAtCompare !== 0) {
    return createdAtCompare;
  }

  return String(left.id ?? "").localeCompare(
    String(right.id ?? ""),
    undefined,
    {
      numeric: true,
    }
  );
}

export async function getCashBalances() {
  const response = await apiClient.get("/cash/balances/");

  return response.data;
}

export async function getDebtSummary() {
  const response = await apiClient.get("/debts/summary/");

  return response.data;
}

export async function getDebts(filters = {}) {
  const response = await apiClient.get("/debts/", {
    params: buildDebtParams(filters),
  });

  return response.data;
}

export async function getOpenDebts({
  counterpartyId,
  direction,
  currency,
  source,
  sourceDate,
  dateFrom,
  dateTo,
} = {}) {
  const filters = {
    counterpartyId,
    direction,
    currency,
    source,
    sourceDate,
    dateFrom,
    dateTo,
  };

  const [openDebts, partiallyPaidDebts] = await Promise.all([
    getDebts({
      ...filters,
      status: "OPEN",
    }),
    getDebts({
      ...filters,
      status: "PARTIALLY_PAID",
    }),
  ]);

  return [
    ...(Array.isArray(openDebts) ? openDebts : []),
    ...(Array.isArray(partiallyPaidDebts) ? partiallyPaidDebts : []),
  ].sort(compareDebts);
}

export async function createManualDebt(payload) {
  const response = await apiClient.post("/debts/", payload);

  return response.data;
}

export async function payDebt(debtId, payload) {
  const response = await apiClient.post(`/debts/${debtId}/pay/`, payload);

  return response.data;
}

export async function paySpecificDebt(debtId, payload) {
  return payDebt(debtId, payload);
}

export async function payDebtsFifo(payload) {
  const response = await apiClient.post("/debts/pay/", payload);

  return response.data;
}

export async function settleDebts(payload) {
  const response = await apiClient.post("/debts/settle/", payload);

  return response.data;
}

export async function netOffDebts(payload) {
  const response = await apiClient.post("/debts/net-off/", payload);

  return response.data;
}

export async function convertDebt(debtId, payload) {
  const response = await apiClient.post(`/debts/${debtId}/convert/`, payload);

  return response.data;
}

export async function forgiveDebt(debtId, payload) {
  const response = await apiClient.post(`/debts/${debtId}/forgive/`, payload);

  return response.data;
}

export async function getDebtPayments() {
  const response = await apiClient.get("/debts/payments/");

  return response.data;
}

export async function getDebtPayment(paymentId) {
  const response = await apiClient.get(`/debts/payments/${paymentId}/`);

  return response.data;
}

export async function getDebtNetOffs({ counterpartyId, currency } = {}) {
  const params = {};

  if (counterpartyId != null) {
    params.counterparty = counterpartyId;
  }

  if (currency) {
    params.currency = currency;
  }

  const response = await apiClient.get("/debts/net-offs/", {
    params,
  });

  return response.data;
}

export async function getDebtNetOff(netOffId) {
  const response = await apiClient.get(`/debts/net-offs/${netOffId}/`);

  return response.data;
}

export async function getDebtConversions() {
  const response = await apiClient.get("/debts/conversions/");

  return response.data;
}

export async function getDebtConversion(conversionId) {
  const response = await apiClient.get(`/debts/conversions/${conversionId}/`);

  return response.data;
}

export async function getDebtAdjustments() {
  const response = await apiClient.get("/debts/adjustments/");

  return response.data;
}

export async function getDebtAdjustment(adjustmentId) {
  const response = await apiClient.get(`/debts/adjustments/${adjustmentId}/`);

  return response.data;
}
