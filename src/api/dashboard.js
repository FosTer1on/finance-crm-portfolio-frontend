import apiClient from "@/api/client";

function buildDateParams(date) {
  return date ? { date } : {};
}

export async function getDashboard(date) {
  const response = await apiClient.get("/dashboard/", {
    params: buildDateParams(date),
  });

  return response.data;
}

export async function getClearing(date) {
  const response = await apiClient.get("/dashboard/clearing/", {
    params: buildDateParams(date),
  });

  return response.data;
}

export async function getClearingCounterparty(counterpartyId, date) {
  const response = await apiClient.get(
    `/dashboard/clearing/counterparties/${counterpartyId}/`,
    {
      params: buildDateParams(date),
    }
  );

  return response.data;
}

export async function getAsia(date) {
  const response = await apiClient.get("/dashboard/asia/", {
    params: buildDateParams(date),
  });

  return response.data;
}

export async function getAsiaCounterparty(counterpartyId, date) {
  const response = await apiClient.get(
    `/dashboard/asia/counterparties/${counterpartyId}/`,
    {
      params: buildDateParams(date),
    }
  );

  return response.data;
}

export async function getTarle(date) {
  const response = await apiClient.get("/dashboard/tarle/", {
    params: buildDateParams(date),
  });

  return response.data;
}

export async function getTarleProduct(productId, date) {
  const response = await apiClient.get(
    `/dashboard/tarle/products/${productId}/`,
    {
      params: buildDateParams(date),
    }
  );

  return response.data;
}

export async function getTarleProductCounterparty(
  productId,
  counterpartyId,
  date
) {
  const response = await apiClient.get(
    `/dashboard/tarle/products/${productId}/counterparties/${counterpartyId}/`,
    {
      params: buildDateParams(date),
    }
  );

  return response.data;
}

export async function getDenXan(date) {
  const response = await apiClient.get("/dashboard/den-xan/", {
    params: buildDateParams(date),
  });

  return response.data;
}

export async function getMma(date) {
  const response = await apiClient.get("/dashboard/mma/", {
    params: buildDateParams(date),
  });

  return response.data;
}

export async function getMmaCounterparty(counterpartyId, date) {
  const response = await apiClient.get(
    `/dashboard/mma/counterparties/${counterpartyId}/`,
    {
      params: buildDateParams(date),
    }
  );

  return response.data;
}

export async function getCounterpartyDayDetail(counterpartyId, date) {
  const response = await apiClient.get(
    `/dashboard/counterparties/${counterpartyId}/day-detail/`,
    {
      params: buildDateParams(date),
    }
  );

  return response.data;
}
