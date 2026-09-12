import { useCallback, useEffect, useRef, useState } from "react";

import dayjs from "dayjs";

import {
  cancelMmaIncoming,
  cancelMmaOutgoing,
  getMmaAccounts,
  getMmaDaily,
  getMmaDenXanIncoming,
  getMmaIncoming,
  getMmaOutgoing,
} from "@/api/mma";
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

export function useMmaPage() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [counterpartyFilter, setCounterpartyFilter] = useState(null);

  const [accounts, setAccounts] = useState([]);
  const [incomings, setIncomings] = useState([]);
  const [outgoings, setOutgoings] = useState([]);
  const [denXanIncomings, setDenXanIncomings] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);
  const [businessDay, setBusinessDay] = useState(null);

  const [accountsLoading, setAccountsLoading] = useState(true);
  const [incomingLoading, setIncomingLoading] = useState(true);
  const [outgoingLoading, setOutgoingLoading] = useState(true);
  const [denXanLoading, setDenXanLoading] = useState(true);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [businessDayLoading, setBusinessDayLoading] = useState(true);

  const [accountsError, setAccountsError] = useState("");
  const [incomingError, setIncomingError] = useState("");
  const [outgoingError, setOutgoingError] = useState("");
  const [denXanError, setDenXanError] = useState("");
  const [dailyError, setDailyError] = useState("");
  const [businessDayError, setBusinessDayError] = useState("");

  const accountsRequestIdRef = useRef(0);
  const incomingRequestIdRef = useRef(0);
  const outgoingRequestIdRef = useRef(0);
  const denXanRequestIdRef = useRef(0);
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

  const loadAccounts = useCallback(async () => {
    const requestId = ++accountsRequestIdRef.current;

    setAccountsLoading(true);
    setAccountsError("");

    try {
      const data = await getMmaAccounts();

      if (requestId !== accountsRequestIdRef.current) {
        return;
      }

      setAccounts(Array.isArray(data) ? data : []);
    } catch (error) {
      if (requestId !== accountsRequestIdRef.current) {
        return;
      }

      const normalizedError = normalizeApiError(error);

      setAccountsError(
        normalizedError.message || "Не удалось загрузить счета MMA"
      );
    } finally {
      if (requestId === accountsRequestIdRef.current) {
        setAccountsLoading(false);
      }
    }
  }, []);

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
        const data = await getMmaIncoming({
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
          normalizedError.message || "Не удалось загрузить приходы MMA"
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
        const data = await getMmaOutgoing({
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
          normalizedError.message || "Не удалось загрузить исходы MMA"
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

  const loadDenXanForDate = useCallback(async (requestDate) => {
    if (!isSameDateContext(currentQueryContextRef.current, requestDate)) {
      return;
    }

    const requestId = ++denXanRequestIdRef.current;

    setDenXanLoading(true);
    setDenXanError("");

    try {
      const data = await getMmaDenXanIncoming({
        date: requestDate,
      });

      if (
        requestId !== denXanRequestIdRef.current ||
        !isSameDateContext(currentQueryContextRef.current, requestDate)
      ) {
        return;
      }

      setDenXanIncomings(Array.isArray(data) ? data : []);
    } catch (error) {
      if (
        requestId !== denXanRequestIdRef.current ||
        !isSameDateContext(currentQueryContextRef.current, requestDate)
      ) {
        return;
      }

      const normalizedError = normalizeApiError(error);

      setDenXanError(
        normalizedError.message || "Не удалось загрузить операции DEN XAN → MMA"
      );
    } finally {
      if (
        requestId === denXanRequestIdRef.current &&
        isSameDateContext(currentQueryContextRef.current, requestDate)
      ) {
        setDenXanLoading(false);
      }
    }
  }, []);

  const loadDailyForDate = useCallback(async (requestDate) => {
    if (!isSameDateContext(currentQueryContextRef.current, requestDate)) {
      return;
    }

    const requestId = ++dailyRequestIdRef.current;

    setDailyLoading(true);
    setDailyError("");

    try {
      const data = await getMmaDaily(requestDate);

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

      setDailyError(normalizedError.message || "Не удалось загрузить итог MMA");
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
        normalizedError.message || "Не удалось определить статус рабочего дня"
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

  const loadDenXan = useCallback(() => {
    return loadDenXanForDate(date);
  }, [date, loadDenXanForDate]);

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
      loadAccounts(),
    ]);
  }, [loadIncomingForContext, loadDailyForDate, loadAccounts]);

  const refreshCurrentOutgoingAndDaily = useCallback(async () => {
    const { date: currentDate, counterpartyFilter: currentCounterpartyFilter } =
      currentQueryContextRef.current;

    await Promise.all([
      loadOutgoingForContext(currentDate, currentCounterpartyFilter),
      loadDailyForDate(currentDate),
      loadAccounts(),
    ]);
  }, [loadOutgoingForContext, loadDailyForDate, loadAccounts]);

  const cancelIncomingOperation = useCallback(
    async (operationId, reason) => {
      await cancelMmaIncoming(operationId, reason);

      const {
        date: currentDate,
        counterpartyFilter: currentCounterpartyFilter,
      } = currentQueryContextRef.current;

      await Promise.all([
        loadIncomingForContext(currentDate, currentCounterpartyFilter),
        loadDailyForDate(currentDate),
        loadAccounts(),
      ]);
    },
    [loadIncomingForContext, loadDailyForDate, loadAccounts]
  );

  const cancelOutgoingOperation = useCallback(
    async (operationId, reason) => {
      await cancelMmaOutgoing(operationId, reason);

      const {
        date: currentDate,
        counterpartyFilter: currentCounterpartyFilter,
      } = currentQueryContextRef.current;

      await Promise.all([
        loadOutgoingForContext(currentDate, currentCounterpartyFilter),
        loadDailyForDate(currentDate),
        loadAccounts(),
      ]);
    },
    [loadOutgoingForContext, loadDailyForDate, loadAccounts]
  );

  const refreshAccounts = useCallback(() => {
    return loadAccounts();
  }, [loadAccounts]);

  const refreshIncoming = useCallback(() => {
    return loadIncoming();
  }, [loadIncoming]);

  const refreshOutgoing = useCallback(() => {
    return loadOutgoing();
  }, [loadOutgoing]);

  const refreshDenXan = useCallback(() => {
    return loadDenXan();
  }, [loadDenXan]);

  const refreshDaily = useCallback(() => {
    return loadDaily();
  }, [loadDaily]);

  const refreshBusinessDay = useCallback(() => {
    return loadBusinessDay();
  }, [loadBusinessDay]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAccounts();
  }, [loadAccounts]);

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
    loadDenXan();
  }, [loadDenXan]);

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

    accounts,
    incomings,
    outgoings,
    denXanIncomings,
    dailySummary,
    businessDay,

    isClosed: businessDay?.is_closed === true,

    accountsLoading,
    incomingLoading,
    outgoingLoading,
    denXanLoading,
    dailyLoading,
    businessDayLoading,

    accountsError,
    incomingError,
    outgoingError,
    denXanError,
    dailyError,
    businessDayError,

    refreshAccounts,
    refreshIncoming,
    refreshOutgoing,
    refreshDenXan,
    refreshDaily,
    refreshBusinessDay,

    refreshCurrentIncomingAndDaily,
    refreshCurrentOutgoingAndDaily,

    cancelIncomingOperation,
    cancelOutgoingOperation,
  };
}
