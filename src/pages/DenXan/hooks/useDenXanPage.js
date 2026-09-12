import { useCallback, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";

import {
  getDenXanAccounts,
  getDenXanDaily,
  getDenXanDailyRate,
  getDenXanDistributors,
  getDenXanExpenses,
  getDenXanIncomings,
  getDenXanOutgoings,
} from "@/api/denXan";
import { getMmaAccounts } from "@/api/mma";
import { getBusinessDay } from "@/api/settlements";
import { normalizeApiError } from "@/api/errors";
import { toApiDate } from "@/utils/date";

function isSameDateContext(currentContext, date) {
  return currentContext.date === date;
}

export function useDenXanPage() {
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const [distributors, setDistributors] = useState([]);

  const [denXanAccounts, setDenXanAccounts] = useState([]);

  const [mmaAccounts, setMmaAccounts] = useState([]);

  const [incomings, setIncomings] = useState([]);

  const [outgoings, setOutgoings] = useState([]);

  const [expenses, setExpenses] = useState([]);

  const [dailySummary, setDailySummary] = useState(null);

  const [dailyRate, setDailyRate] = useState(null);

  const [businessDay, setBusinessDay] = useState(null);

  const [distributorsLoading, setDistributorsLoading] = useState(true);

  const [denXanAccountsLoading, setDenXanAccountsLoading] = useState(true);

  const [mmaAccountsLoading, setMmaAccountsLoading] = useState(true);

  const [incomingLoading, setIncomingLoading] = useState(true);

  const [outgoingLoading, setOutgoingLoading] = useState(true);

  const [expensesLoading, setExpensesLoading] = useState(true);

  const [dailyLoading, setDailyLoading] = useState(true);

  const [dailyRateLoading, setDailyRateLoading] = useState(true);

  const [businessDayLoading, setBusinessDayLoading] = useState(true);

  const [distributorsError, setDistributorsError] = useState("");

  const [denXanAccountsError, setDenXanAccountsError] = useState("");

  const [mmaAccountsError, setMmaAccountsError] = useState("");

  const [incomingError, setIncomingError] = useState("");

  const [outgoingError, setOutgoingError] = useState("");

  const [expensesError, setExpensesError] = useState("");

  const [dailyError, setDailyError] = useState("");

  const [dailyRateError, setDailyRateError] = useState("");

  const [businessDayError, setBusinessDayError] = useState("");

  const distributorsRequestIdRef = useRef(0);

  const denXanAccountsRequestIdRef = useRef(0);

  const mmaAccountsRequestIdRef = useRef(0);

  const incomingRequestIdRef = useRef(0);

  const outgoingRequestIdRef = useRef(0);

  const expensesRequestIdRef = useRef(0);

  const dailyRequestIdRef = useRef(0);

  const dailyRateRequestIdRef = useRef(0);

  const businessDayRequestIdRef = useRef(0);

  const currentQueryContextRef = useRef({
    date: toApiDate(selectedDate),
  });

  const date = toApiDate(selectedDate);

  const changeSelectedDate = useCallback((nextDate) => {
    const nextApiDate = toApiDate(nextDate);

    currentQueryContextRef.current = {
      date: nextApiDate,
    };

    setSelectedDate(nextDate);
  }, []);

  const loadDistributors = useCallback(async () => {
    const requestId = ++distributorsRequestIdRef.current;

    setDistributorsLoading(true);
    setDistributorsError("");

    try {
      const data = await getDenXanDistributors();

      if (requestId !== distributorsRequestIdRef.current) {
        return;
      }

      setDistributors(Array.isArray(data) ? data : []);
    } catch (error) {
      if (requestId !== distributorsRequestIdRef.current) {
        return;
      }

      const normalizedError = normalizeApiError(error);

      setDistributorsError(
        normalizedError.message || "Не удалось загрузить дистрибьюторов DEN XAN"
      );
    } finally {
      if (requestId === distributorsRequestIdRef.current) {
        setDistributorsLoading(false);
      }
    }
  }, []);

  const loadDenXanAccounts = useCallback(async () => {
    const requestId = ++denXanAccountsRequestIdRef.current;

    setDenXanAccountsLoading(true);
    setDenXanAccountsError("");

    try {
      const data = await getDenXanAccounts();

      if (requestId !== denXanAccountsRequestIdRef.current) {
        return;
      }

      setDenXanAccounts(Array.isArray(data) ? data : []);
    } catch (error) {
      if (requestId !== denXanAccountsRequestIdRef.current) {
        return;
      }

      const normalizedError = normalizeApiError(error);

      setDenXanAccountsError(
        normalizedError.message || "Не удалось загрузить счета DEN XAN"
      );
    } finally {
      if (requestId === denXanAccountsRequestIdRef.current) {
        setDenXanAccountsLoading(false);
      }
    }
  }, []);

  const loadMmaAccounts = useCallback(async () => {
    const requestId = ++mmaAccountsRequestIdRef.current;

    setMmaAccountsLoading(true);
    setMmaAccountsError("");

    try {
      const data = await getMmaAccounts();

      if (requestId !== mmaAccountsRequestIdRef.current) {
        return;
      }

      setMmaAccounts(Array.isArray(data) ? data : []);
    } catch (error) {
      if (requestId !== mmaAccountsRequestIdRef.current) {
        return;
      }

      const normalizedError = normalizeApiError(error);

      setMmaAccountsError(
        normalizedError.message || "Не удалось загрузить счета MMA"
      );
    } finally {
      if (requestId === mmaAccountsRequestIdRef.current) {
        setMmaAccountsLoading(false);
      }
    }
  }, []);

  const loadIncomingForDate = useCallback(async (requestDate) => {
    if (!isSameDateContext(currentQueryContextRef.current, requestDate)) {
      return;
    }

    const requestId = ++incomingRequestIdRef.current;

    setIncomingLoading(true);
    setIncomingError("");

    try {
      const data = await getDenXanIncomings({
        date: requestDate,
      });

      if (
        requestId !== incomingRequestIdRef.current ||
        !isSameDateContext(currentQueryContextRef.current, requestDate)
      ) {
        return;
      }

      setIncomings(Array.isArray(data) ? data : []);
    } catch (error) {
      if (
        requestId !== incomingRequestIdRef.current ||
        !isSameDateContext(currentQueryContextRef.current, requestDate)
      ) {
        return;
      }

      const normalizedError = normalizeApiError(error);

      setIncomingError(
        normalizedError.message || "Не удалось загрузить приходы DEN XAN"
      );
    } finally {
      if (
        requestId === incomingRequestIdRef.current &&
        isSameDateContext(currentQueryContextRef.current, requestDate)
      ) {
        setIncomingLoading(false);
      }
    }
  }, []);

  const loadOutgoingForDate = useCallback(async (requestDate) => {
    if (!isSameDateContext(currentQueryContextRef.current, requestDate)) {
      return;
    }

    const requestId = ++outgoingRequestIdRef.current;

    setOutgoingLoading(true);
    setOutgoingError("");

    try {
      const data = await getDenXanOutgoings({
        date: requestDate,
      });

      if (
        requestId !== outgoingRequestIdRef.current ||
        !isSameDateContext(currentQueryContextRef.current, requestDate)
      ) {
        return;
      }

      setOutgoings(Array.isArray(data) ? data : []);
    } catch (error) {
      if (
        requestId !== outgoingRequestIdRef.current ||
        !isSameDateContext(currentQueryContextRef.current, requestDate)
      ) {
        return;
      }

      const normalizedError = normalizeApiError(error);

      setOutgoingError(
        normalizedError.message || "Не удалось загрузить исходы DEN XAN"
      );
    } finally {
      if (
        requestId === outgoingRequestIdRef.current &&
        isSameDateContext(currentQueryContextRef.current, requestDate)
      ) {
        setOutgoingLoading(false);
      }
    }
  }, []);

  const loadExpensesForDate = useCallback(async (requestDate) => {
    if (!isSameDateContext(currentQueryContextRef.current, requestDate)) {
      return;
    }

    const requestId = ++expensesRequestIdRef.current;

    setExpensesLoading(true);
    setExpensesError("");

    try {
      const data = await getDenXanExpenses({
        date: requestDate,
      });

      if (
        requestId !== expensesRequestIdRef.current ||
        !isSameDateContext(currentQueryContextRef.current, requestDate)
      ) {
        return;
      }

      setExpenses(Array.isArray(data) ? data : []);
    } catch (error) {
      if (
        requestId !== expensesRequestIdRef.current ||
        !isSameDateContext(currentQueryContextRef.current, requestDate)
      ) {
        return;
      }

      const normalizedError = normalizeApiError(error);

      setExpensesError(
        normalizedError.message || "Не удалось загрузить расходы DEN XAN"
      );
    } finally {
      if (
        requestId === expensesRequestIdRef.current &&
        isSameDateContext(currentQueryContextRef.current, requestDate)
      ) {
        setExpensesLoading(false);
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
      const data = await getDenXanDaily(requestDate);

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
        normalizedError.message || "Не удалось загрузить итог DEN XAN"
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

  const loadDailyRateForDate = useCallback(async (requestDate) => {
    if (!isSameDateContext(currentQueryContextRef.current, requestDate)) {
      return;
    }

    const requestId = ++dailyRateRequestIdRef.current;

    setDailyRateLoading(true);
    setDailyRateError("");

    try {
      const data = await getDenXanDailyRate(requestDate);

      if (
        requestId !== dailyRateRequestIdRef.current ||
        !isSameDateContext(currentQueryContextRef.current, requestDate)
      ) {
        return;
      }

      setDailyRate(data ?? null);
    } catch (error) {
      if (
        requestId !== dailyRateRequestIdRef.current ||
        !isSameDateContext(currentQueryContextRef.current, requestDate)
      ) {
        return;
      }

      const normalizedError = normalizeApiError(error);

      setDailyRateError(
        normalizedError.message || "Не удалось загрузить курсы DEN XAN"
      );
    } finally {
      if (
        requestId === dailyRateRequestIdRef.current &&
        isSameDateContext(currentQueryContextRef.current, requestDate)
      ) {
        setDailyRateLoading(false);
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

      setBusinessDay(null);

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

  const loadIncoming = useCallback(
    () => loadIncomingForDate(date),
    [date, loadIncomingForDate]
  );

  const loadOutgoing = useCallback(
    () => loadOutgoingForDate(date),
    [date, loadOutgoingForDate]
  );

  const loadExpenses = useCallback(
    () => loadExpensesForDate(date),
    [date, loadExpensesForDate]
  );

  const loadDaily = useCallback(
    () => loadDailyForDate(date),
    [date, loadDailyForDate]
  );

  const loadDailyRate = useCallback(
    () => loadDailyRateForDate(date),
    [date, loadDailyRateForDate]
  );

  const loadBusinessDay = useCallback(
    () => loadBusinessDayForDate(date),
    [date, loadBusinessDayForDate]
  );

  const refreshCurrentIncomingData = useCallback(async () => {
    const { date: currentDate } = currentQueryContextRef.current;

    await Promise.all([
      loadIncomingForDate(currentDate),
      loadExpensesForDate(currentDate),
      loadDailyForDate(currentDate),
      loadDenXanAccounts(),
    ]);
  }, [
    loadIncomingForDate,
    loadExpensesForDate,
    loadDailyForDate,
    loadDenXanAccounts,
  ]);

  const refreshCurrentOutgoingData = useCallback(async () => {
    const { date: currentDate } = currentQueryContextRef.current;

    await Promise.all([
      loadOutgoingForDate(currentDate),
      loadExpensesForDate(currentDate),
      loadDailyForDate(currentDate),
      loadDenXanAccounts(),
    ]);
  }, [
    loadOutgoingForDate,
    loadExpensesForDate,
    loadDailyForDate,
    loadDenXanAccounts,
  ]);

  const refreshCurrentExpenseData = useCallback(async () => {
    const { date: currentDate } = currentQueryContextRef.current;

    await Promise.all([
      loadExpensesForDate(currentDate),
      loadDailyForDate(currentDate),
      loadDenXanAccounts(),
    ]);
  }, [loadExpensesForDate, loadDailyForDate, loadDenXanAccounts]);

  const refreshCurrentRateData = useCallback(async () => {
    const { date: currentDate } = currentQueryContextRef.current;

    await Promise.all([
      loadDailyRateForDate(currentDate),
      loadDailyForDate(currentDate),
    ]);
  }, [loadDailyRateForDate, loadDailyForDate]);

  const refreshDistributors = useCallback(
    () => loadDistributors(),
    [loadDistributors]
  );

  const refreshDenXanAccounts = useCallback(
    () => loadDenXanAccounts(),
    [loadDenXanAccounts]
  );

  const refreshMmaAccounts = useCallback(
    () => loadMmaAccounts(),
    [loadMmaAccounts]
  );

  const refreshIncoming = useCallback(() => loadIncoming(), [loadIncoming]);

  const refreshOutgoing = useCallback(() => loadOutgoing(), [loadOutgoing]);

  const refreshExpenses = useCallback(() => loadExpenses(), [loadExpenses]);

  const refreshDaily = useCallback(() => loadDaily(), [loadDaily]);

  const refreshDailyRate = useCallback(() => loadDailyRate(), [loadDailyRate]);

  const refreshBusinessDay = useCallback(
    () => loadBusinessDay(),
    [loadBusinessDay]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDistributors();
  }, [loadDistributors]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDenXanAccounts();
  }, [loadDenXanAccounts]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMmaAccounts();
  }, [loadMmaAccounts]);

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
    loadExpenses();
  }, [loadExpenses]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDaily();
  }, [loadDaily]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDailyRate();
  }, [loadDailyRate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBusinessDay();
  }, [loadBusinessDay]);

  return {
    selectedDate,
    setSelectedDate: changeSelectedDate,
    date,

    distributors,
    denXanAccounts,
    mmaAccounts,

    incomings,
    outgoings,
    expenses,

    dailySummary,
    dailyRate,
    businessDay,

    isClosed: businessDay?.is_closed === true,

    distributorsLoading,
    denXanAccountsLoading,
    mmaAccountsLoading,

    incomingLoading,
    outgoingLoading,
    expensesLoading,
    dailyLoading,
    dailyRateLoading,
    businessDayLoading,

    distributorsError,
    denXanAccountsError,
    mmaAccountsError,

    incomingError,
    outgoingError,
    expensesError,
    dailyError,
    dailyRateError,
    businessDayError,

    refreshDistributors,
    refreshDenXanAccounts,
    refreshMmaAccounts,

    refreshIncoming,
    refreshOutgoing,
    refreshExpenses,
    refreshDaily,
    refreshDailyRate,
    refreshBusinessDay,

    refreshCurrentIncomingData,
    refreshCurrentOutgoingData,
    refreshCurrentExpenseData,
    refreshCurrentRateData,
  };
}
