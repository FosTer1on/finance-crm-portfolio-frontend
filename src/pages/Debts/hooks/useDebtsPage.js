import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getCashBalances, getDebtSummary, getOpenDebts } from "@/api/debts";
import { normalizeApiError } from "@/api/errors";

const EMPTY_CASH_BALANCES = {
  UZS: "0.00",
  USD: "0.00",
};

export function useDebtsPage() {
  const [cashBalances, setCashBalances] = useState(EMPTY_CASH_BALANCES);
  const [globalSummary, setGlobalSummary] = useState([]);

  const [selectedCounterpartyId, setSelectedCounterpartyIdState] =
    useState(null);
  const [selectedDebts, setSelectedDebts] = useState([]);

  const [cashBalancesLoading, setCashBalancesLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [selectedDebtsLoading, setSelectedDebtsLoading] = useState(false);

  const [cashBalancesError, setCashBalancesError] = useState("");
  const [summaryError, setSummaryError] = useState("");
  const [selectedDebtsError, setSelectedDebtsError] = useState("");

  const cashRequestIdRef = useRef(0);
  const summaryRequestIdRef = useRef(0);
  const selectedDebtsRequestIdRef = useRef(0);

  const currentSelectedCounterpartyRef = useRef(null);

  const setSelectedCounterpartyId = useCallback((counterpartyId) => {
    const nextCounterpartyId = counterpartyId ?? null;

    currentSelectedCounterpartyRef.current = nextCounterpartyId;

    selectedDebtsRequestIdRef.current += 1;

    setSelectedCounterpartyIdState(nextCounterpartyId);
    setSelectedDebts([]);
    setSelectedDebtsError("");
    setSelectedDebtsLoading(false);
  }, []);

  const loadCashBalances = useCallback(async () => {
    const requestId = ++cashRequestIdRef.current;

    setCashBalancesLoading(true);
    setCashBalancesError("");

    try {
      const data = await getCashBalances();

      if (requestId !== cashRequestIdRef.current) {
        return;
      }

      setCashBalances({
        UZS: data?.UZS ?? "0.00",
        USD: data?.USD ?? "0.00",
      });
    } catch (error) {
      if (requestId !== cashRequestIdRef.current) {
        return;
      }

      const normalizedError = normalizeApiError(error);

      setCashBalancesError(
        normalizedError.message || "Не удалось загрузить остатки кассы."
      );
    } finally {
      if (requestId === cashRequestIdRef.current) {
        setCashBalancesLoading(false);
      }
    }
  }, []);

  const loadGlobalSummary = useCallback(async () => {
    const requestId = ++summaryRequestIdRef.current;

    setSummaryLoading(true);
    setSummaryError("");

    try {
      const data = await getDebtSummary();

      if (requestId !== summaryRequestIdRef.current) {
        return;
      }

      setGlobalSummary(Array.isArray(data) ? data : []);
    } catch (error) {
      if (requestId !== summaryRequestIdRef.current) {
        return;
      }

      const normalizedError = normalizeApiError(error);

      setSummaryError(
        normalizedError.message || "Не удалось загрузить взаиморасчёты."
      );
    } finally {
      if (requestId === summaryRequestIdRef.current) {
        setSummaryLoading(false);
      }
    }
  }, []);

  const loadSelectedDebts = useCallback(async (counterpartyId) => {
    if (counterpartyId == null) {
      return;
    }

    if (currentSelectedCounterpartyRef.current !== counterpartyId) {
      return;
    }

    const requestId = ++selectedDebtsRequestIdRef.current;

    setSelectedDebtsLoading(true);
    setSelectedDebtsError("");

    try {
      const data = await getOpenDebts({
        counterpartyId,
      });

      if (
        requestId !== selectedDebtsRequestIdRef.current ||
        currentSelectedCounterpartyRef.current !== counterpartyId
      ) {
        return;
      }

      setSelectedDebts(Array.isArray(data) ? data : []);
    } catch (error) {
      if (
        requestId !== selectedDebtsRequestIdRef.current ||
        currentSelectedCounterpartyRef.current !== counterpartyId
      ) {
        return;
      }

      const normalizedError = normalizeApiError(error);

      setSelectedDebtsError(
        normalizedError.message || "Не удалось загрузить долги человека."
      );
    } finally {
      if (
        requestId === selectedDebtsRequestIdRef.current &&
        currentSelectedCounterpartyRef.current === counterpartyId
      ) {
        setSelectedDebtsLoading(false);
      }
    }
  }, []);

  const refreshCashBalances = useCallback(() => {
    return loadCashBalances();
  }, [loadCashBalances]);

  const refreshGlobalSummary = useCallback(() => {
    return loadGlobalSummary();
  }, [loadGlobalSummary]);

  const refreshSelectedWorkspace = useCallback(() => {
    const currentCounterpartyId = currentSelectedCounterpartyRef.current;

    if (currentCounterpartyId == null) {
      return Promise.resolve();
    }

    return loadSelectedDebts(currentCounterpartyId);
  }, [loadSelectedDebts]);

  const refreshPage = useCallback(() => {
    const requests = [loadCashBalances(), loadGlobalSummary()];

    const currentCounterpartyId = currentSelectedCounterpartyRef.current;

    if (currentCounterpartyId != null) {
      requests.push(loadSelectedDebts(currentCounterpartyId));
    }

    return Promise.all(requests);
  }, [loadCashBalances, loadGlobalSummary, loadSelectedDebts]);

  const refreshAfterMutation = useCallback(
    ({ cashChanged = false } = {}) => {
      const requests = [loadGlobalSummary()];

      if (cashChanged) {
        requests.push(loadCashBalances());
      }

      const currentCounterpartyId = currentSelectedCounterpartyRef.current;

      if (currentCounterpartyId != null) {
        requests.push(loadSelectedDebts(currentCounterpartyId));
      }

      return Promise.all(requests);
    },
    [loadCashBalances, loadGlobalSummary, loadSelectedDebts]
  );

  const selectedSummary = useMemo(() => {
    if (selectedCounterpartyId == null) {
      return null;
    }

    return (
      globalSummary.find(
        (item) =>
          String(item?.counterparty?.id ?? "") ===
          String(selectedCounterpartyId)
      ) ?? null
    );
  }, [globalSummary, selectedCounterpartyId]);

  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      await Promise.resolve();

      if (cancelled) {
        return;
      }

      await Promise.all([loadCashBalances(), loadGlobalSummary()]);
    };

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [loadCashBalances, loadGlobalSummary]);

  useEffect(() => {
    if (selectedCounterpartyId == null) {
      return undefined;
    }

    let cancelled = false;

    const loadWorkspace = async () => {
      await Promise.resolve();

      if (cancelled) {
        return;
      }

      await loadSelectedDebts(selectedCounterpartyId);
    };

    void loadWorkspace();

    return () => {
      cancelled = true;
    };
  }, [selectedCounterpartyId, loadSelectedDebts]);

  return {
    cashBalances,
    globalSummary,

    selectedCounterpartyId,
    selectedSummary,
    selectedDebts,

    cashBalancesLoading,
    summaryLoading,
    selectedDebtsLoading,

    cashBalancesError,
    summaryError,
    selectedDebtsError,

    setSelectedCounterpartyId,

    refreshCashBalances,
    refreshGlobalSummary,
    refreshSelectedWorkspace,
    refreshPage,
    refreshAfterMutation,
  };
}
