import { useCallback, useEffect, useRef, useState } from "react";

import dayjs from "dayjs";

import { getAsiaDaily, getAsiaIncoming, getAsiaOutgoing } from "@/api/asia";

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

export function useAsiaPage() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [counterpartyFilter, setCounterpartyFilter] = useState(null);

  const [incomings, setIncomings] = useState([]);
  const [outgoings, setOutgoings] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);
  const [businessDay, setBusinessDay] = useState(null);

  const [incomingLoading, setIncomingLoading] = useState(true);
  const [outgoingLoading, setOutgoingLoading] = useState(true);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [businessDayLoading, setBusinessDayLoading] = useState(true);

  const [incomingError, setIncomingError] = useState("");
  const [outgoingError, setOutgoingError] = useState("");
  const [dailyError, setDailyError] = useState("");
  const [businessDayError, setBusinessDayError] = useState("");

  const incomingRequestIdRef = useRef(0);
  const outgoingRequestIdRef = useRef(0);
  const dailyRequestIdRef = useRef(0);
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

  const loadIncomingForContext = useCallback(
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

      const requestId = ++incomingRequestIdRef.current;

      setIncomingLoading(true);
      setIncomingError("");

      try {
        const data = await getAsiaIncoming({
          date: requestDate,
          counterpartyId: normalizedCounterpartyId,
        });

        if (
          requestId !== incomingRequestIdRef.current ||
          !isSameOperationsContext(
            currentQueryContextRef.current,
            requestDate,
            normalizedCounterpartyId
          )
        ) {
          return;
        }

        setIncomings(Array.isArray(data) ? data : []);
      } catch (error) {
        if (
          requestId !== incomingRequestIdRef.current ||
          !isSameOperationsContext(
            currentQueryContextRef.current,
            requestDate,
            normalizedCounterpartyId
          )
        ) {
          return;
        }

        const normalizedError = normalizeApiError(error);

        setIncomingError(
          normalizedError.message || "Не удалось загрузить приходы"
        );
      } finally {
        if (
          requestId === incomingRequestIdRef.current &&
          isSameOperationsContext(
            currentQueryContextRef.current,
            requestDate,
            normalizedCounterpartyId
          )
        ) {
          setIncomingLoading(false);
        }
      }
    },
    []
  );

  const loadOutgoingForContext = useCallback(
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

      const requestId = ++outgoingRequestIdRef.current;

      setOutgoingLoading(true);
      setOutgoingError("");

      try {
        const data = await getAsiaOutgoing({
          date: requestDate,
          counterpartyId: normalizedCounterpartyId,
        });

        if (
          requestId !== outgoingRequestIdRef.current ||
          !isSameOperationsContext(
            currentQueryContextRef.current,
            requestDate,
            normalizedCounterpartyId
          )
        ) {
          return;
        }

        setOutgoings(Array.isArray(data) ? data : []);
      } catch (error) {
        if (
          requestId !== outgoingRequestIdRef.current ||
          !isSameOperationsContext(
            currentQueryContextRef.current,
            requestDate,
            normalizedCounterpartyId
          )
        ) {
          return;
        }

        const normalizedError = normalizeApiError(error);

        setOutgoingError(
          normalizedError.message || "Не удалось загрузить исходы"
        );
      } finally {
        if (
          requestId === outgoingRequestIdRef.current &&
          isSameOperationsContext(
            currentQueryContextRef.current,
            requestDate,
            normalizedCounterpartyId
          )
        ) {
          setOutgoingLoading(false);
        }
      }
    },
    []
  );

  const loadDailyForDate = useCallback(async (requestDate) => {
    if (!isSameDateContext(currentQueryContextRef.current, requestDate)) {
      return;
    }

    const requestId = ++dailyRequestIdRef.current;

    setDailyLoading(true);
    setDailyError("");

    try {
      const data = await getAsiaDaily(requestDate);

      if (
        requestId !== dailyRequestIdRef.current ||
        !isSameDateContext(currentQueryContextRef.current, requestDate)
      ) {
        return;
      }

      setDailySummary(data);
    } catch (error) {
      if (
        requestId !== dailyRequestIdRef.current ||
        !isSameDateContext(currentQueryContextRef.current, requestDate)
      ) {
        return;
      }

      const normalizedError = normalizeApiError(error);

      setDailyError(
        normalizedError.message || "Не удалось загрузить итог за день"
      );
    } finally {
      if (
        requestId === dailyRequestIdRef.current &&
        isSameDateContext(currentQueryContextRef.current, requestDate)
      ) {
        setDailyLoading(false);
      }
    }
  }, []);

  const loadBusinessDayForDate = useCallback(async (requestDate) => {
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
  }, []);

  const loadIncoming = useCallback(() => {
    return loadIncomingForContext(date, counterpartyFilter);
  }, [date, counterpartyFilter, loadIncomingForContext]);

  const loadOutgoing = useCallback(() => {
    return loadOutgoingForContext(date, counterpartyFilter);
  }, [date, counterpartyFilter, loadOutgoingForContext]);

  const loadDaily = useCallback(() => {
    return loadDailyForDate(date);
  }, [date, loadDailyForDate]);

  const loadBusinessDay = useCallback(() => {
    return loadBusinessDayForDate(date);
  }, [date, loadBusinessDayForDate]);

  const refreshCurrentIncomingAndDaily = useCallback(async () => {
    const { date: currentDate, counterpartyFilter: currentCounterpartyFilter } =
      currentQueryContextRef.current;

    await Promise.all([
      loadIncomingForContext(currentDate, currentCounterpartyFilter),
      loadDailyForDate(currentDate),
    ]);
  }, [loadIncomingForContext, loadDailyForDate]);

  const refreshCurrentOutgoingAndDaily = useCallback(async () => {
    const { date: currentDate, counterpartyFilter: currentCounterpartyFilter } =
      currentQueryContextRef.current;

    await Promise.all([
      loadOutgoingForContext(currentDate, currentCounterpartyFilter),
      loadDailyForDate(currentDate),
    ]);
  }, [loadOutgoingForContext, loadDailyForDate]);

  const refreshIncoming = useCallback(() => {
    return loadIncoming();
  }, [loadIncoming]);

  const refreshOutgoing = useCallback(() => {
    return loadOutgoing();
  }, [loadOutgoing]);

  const refreshDaily = useCallback(() => {
    return loadDaily();
  }, [loadDaily]);

  const refreshBusinessDay = useCallback(() => {
    return loadBusinessDay();
  }, [loadBusinessDay]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadIncoming();
  }, [loadIncoming]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOutgoing();
  }, [loadOutgoing]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDaily();
  }, [loadDaily]);

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

    incomings,
    outgoings,
    dailySummary,
    businessDay,

    isClosed: businessDay?.is_closed === true,

    incomingLoading,
    outgoingLoading,
    dailyLoading,
    businessDayLoading,

    incomingError,
    outgoingError,
    dailyError,
    businessDayError,

    refreshIncoming,
    refreshOutgoing,
    refreshDaily,
    refreshBusinessDay,

    refreshCurrentIncomingAndDaily,
    refreshCurrentOutgoingAndDaily,
  };
}
