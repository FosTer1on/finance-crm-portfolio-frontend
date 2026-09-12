import { useCallback, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";

import { getClearingDaily, getClearingOperations } from "@/api/clearing";
import { getBusinessDay } from "@/api/settlements";
import { normalizeApiError } from "@/api/errors";
import { toApiDate } from "@/utils/date";

function isSameOperationsContext(currentContext, date, counterpartyFilter) {
  return (
    currentContext.date === date &&
    currentContext.counterpartyFilter === (counterpartyFilter ?? null)
  );
}

function isSameDateContext(currentContext, date) {
  return currentContext.date === date;
}

export function useClearingPage() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [counterpartyFilter, setCounterpartyFilter] = useState(null);

  const [operations, setOperations] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);
  const [businessDay, setBusinessDay] = useState(null);

  const [operationsLoading, setOperationsLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [businessDayLoading, setBusinessDayLoading] = useState(true);

  const [operationsError, setOperationsError] = useState("");
  const [summaryError, setSummaryError] = useState("");
  const [businessDayError, setBusinessDayError] = useState("");

  const operationsRequestIdRef = useRef(0);
  const summaryRequestIdRef = useRef(0);
  const businessDayRequestIdRef = useRef(0);

  const currentQueryContextRef = useRef({
    date: toApiDate(selectedDate),
    counterpartyFilter: null,
  });

  const changeSelectedDate = useCallback((nextDate) => {
    const nextApiDate = toApiDate(nextDate);

    currentQueryContextRef.current = {
      date: nextApiDate,
      counterpartyFilter: currentQueryContextRef.current.counterpartyFilter,
    };

    setSelectedDate(nextDate);
  }, []);

  const changeCounterpartyFilter = useCallback((nextCounterpartyId) => {
    currentQueryContextRef.current = {
      date: currentQueryContextRef.current.date,
      counterpartyFilter: nextCounterpartyId ?? null,
    };

    setCounterpartyFilter(nextCounterpartyId ?? null);
  }, []);

  const date = toApiDate(selectedDate);

  const loadOperationsForContext = useCallback(
    async (requestDate, requestCounterpartyId = null) => {
      const normalizedCounterpartyId = requestCounterpartyId ?? null;

      if (
        !isSameOperationsContext(
          currentQueryContextRef.current,
          requestDate,
          normalizedCounterpartyId
        )
      ) {
        return;
      }

      const requestId = ++operationsRequestIdRef.current;

      setOperationsLoading(true);
      setOperationsError("");

      try {
        const data = await getClearingOperations({
          date: requestDate,
          counterpartyId: normalizedCounterpartyId,
        });

        if (
          requestId !== operationsRequestIdRef.current ||
          !isSameOperationsContext(
            currentQueryContextRef.current,
            requestDate,
            normalizedCounterpartyId
          )
        ) {
          return;
        }

        setOperations(Array.isArray(data) ? data : []);
      } catch (error) {
        if (
          requestId !== operationsRequestIdRef.current ||
          !isSameOperationsContext(
            currentQueryContextRef.current,
            requestDate,
            normalizedCounterpartyId
          )
        ) {
          return;
        }

        const normalizedError = normalizeApiError(error);

        setOperationsError(
          normalizedError.message || "Не удалось загрузить операции"
        );
      } finally {
        if (
          requestId === operationsRequestIdRef.current &&
          isSameOperationsContext(
            currentQueryContextRef.current,
            requestDate,
            normalizedCounterpartyId
          )
        ) {
          setOperationsLoading(false);
        }
      }
    },
    []
  );

  const loadOperations = useCallback(() => {
    return loadOperationsForContext(date, counterpartyFilter);
  }, [date, counterpartyFilter, loadOperationsForContext]);

  const loadDailySummaryForDate = useCallback(async (requestDate) => {
    if (!isSameDateContext(currentQueryContextRef.current, requestDate)) {
      return;
    }

    const requestId = ++summaryRequestIdRef.current;

    setSummaryLoading(true);
    setSummaryError("");

    try {
      const data = await getClearingDaily(requestDate);

      if (
        requestId !== summaryRequestIdRef.current ||
        !isSameDateContext(currentQueryContextRef.current, requestDate)
      ) {
        return;
      }

      setDailySummary(data);
    } catch (error) {
      if (
        requestId !== summaryRequestIdRef.current ||
        !isSameDateContext(currentQueryContextRef.current, requestDate)
      ) {
        return;
      }

      const normalizedError = normalizeApiError(error);

      setSummaryError(
        normalizedError.message || "Не удалось загрузить итог за день"
      );
    } finally {
      if (
        requestId === summaryRequestIdRef.current &&
        isSameDateContext(currentQueryContextRef.current, requestDate)
      ) {
        setSummaryLoading(false);
      }
    }
  }, []);

  const loadDailySummary = useCallback(() => {
    return loadDailySummaryForDate(date);
  }, [date, loadDailySummaryForDate]);

  const loadBusinessDay = useCallback(async () => {
    const requestDate = date;

    if (!isSameDateContext(currentQueryContextRef.current, requestDate)) {
      return;
    }

    const requestId = ++businessDayRequestIdRef.current;

    setBusinessDayLoading(true);
    setBusinessDayError("");

    try {
      const data = await getBusinessDay(requestDate);

      if (
        requestId !== businessDayRequestIdRef.current ||
        !isSameDateContext(currentQueryContextRef.current, requestDate)
      ) {
        return;
      }

      setBusinessDay(data);
    } catch (error) {
      if (
        requestId !== businessDayRequestIdRef.current ||
        !isSameDateContext(currentQueryContextRef.current, requestDate)
      ) {
        return;
      }

      const normalizedError = normalizeApiError(error);

      setBusinessDayError(
        normalizedError.message || "Не удалось получить статус дня"
      );
    } finally {
      if (
        requestId === businessDayRequestIdRef.current &&
        isSameDateContext(currentQueryContextRef.current, requestDate)
      ) {
        setBusinessDayLoading(false);
      }
    }
  }, [date]);

  const refreshOperations = useCallback(() => {
    return loadOperations();
  }, [loadOperations]);

  const refreshDailySummary = useCallback(() => {
    return loadDailySummary();
  }, [loadDailySummary]);

  const refreshBusinessDay = useCallback(() => {
    return loadBusinessDay();
  }, [loadBusinessDay]);

  const refreshCurrentFinancialData = useCallback(async () => {
    const { date: currentDate, counterpartyFilter: currentCounterpartyFilter } =
      currentQueryContextRef.current;

    await Promise.all([
      loadOperationsForContext(currentDate, currentCounterpartyFilter),
      loadDailySummaryForDate(currentDate),
    ]);
  }, [loadOperationsForContext, loadDailySummaryForDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOperations();
  }, [loadOperations]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDailySummary();
  }, [loadDailySummary]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBusinessDay();
  }, [loadBusinessDay]);

  return {
    selectedDate,
    setSelectedDate: changeSelectedDate,

    date,

    counterpartyFilter,
    setCounterpartyFilter: changeCounterpartyFilter,

    operations,
    dailySummary,
    businessDay,

    isClosed: businessDay?.is_closed === true,

    operationsLoading,
    summaryLoading,
    businessDayLoading,

    operationsError,
    summaryError,
    businessDayError,

    refreshOperations,
    refreshDailySummary,
    refreshBusinessDay,
    refreshCurrentFinancialData,
  };
}
