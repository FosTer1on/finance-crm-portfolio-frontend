import { useCallback, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";

import {
  getCashBalances,
  getCashExchanges,
  getCashTransactions,
} from "@/api/cash";
import { normalizeApiError } from "@/api/errors";
import { toApiDate } from "@/utils/date";

const EMPTY_FILTERS = {
  currency: null,
  counterpartyId: null,
};

function getErrorMessage(error, fallback) {
  const normalized = normalizeApiError(error);

  return normalized.message || fallback;
}

function isSameTransactionContext(currentContext, requestContext, section) {
  const currentFilters = currentContext[section];

  return (
    currentContext.date === requestContext.date &&
    currentFilters.currency === requestContext.currency &&
    currentFilters.counterpartyId === requestContext.counterpartyId
  );
}

export default function useCashPage() {
  const [selectedDate, setSelectedDate] = useState(() => dayjs());

  const date = toApiDate(selectedDate);

  const [incomeFilters, setIncomeFilters] = useState(EMPTY_FILTERS);

  const [expenseFilters, setExpenseFilters] = useState(EMPTY_FILTERS);

  const [balances, setBalances] = useState(null);

  const [incomeTransactions, setIncomeTransactions] = useState([]);

  const [expenseTransactions, setExpenseTransactions] = useState([]);

  const [exchanges, setExchanges] = useState([]);

  const [balancesLoading, setBalancesLoading] = useState(false);

  const [incomeTransactionsLoading, setIncomeTransactionsLoading] =
    useState(false);

  const [expenseTransactionsLoading, setExpenseTransactionsLoading] =
    useState(false);

  const [exchangesLoading, setExchangesLoading] = useState(false);

  const [balancesError, setBalancesError] = useState("");

  const [incomeTransactionsError, setIncomeTransactionsError] = useState("");

  const [expenseTransactionsError, setExpenseTransactionsError] = useState("");

  const [exchangesError, setExchangesError] = useState("");

  const balancesRequestIdRef = useRef(0);
  const incomeRequestIdRef = useRef(0);
  const expenseRequestIdRef = useRef(0);
  const exchangesRequestIdRef = useRef(0);

  const currentQueryContextRef = useRef({
    date,
    income: incomeFilters,
    expense: expenseFilters,
  });

  const changeSelectedDate = useCallback((nextDate) => {
    const nextDateValue = nextDate ?? dayjs();
    const nextApiDate = toApiDate(nextDateValue);

    currentQueryContextRef.current = {
      ...currentQueryContextRef.current,
      date: nextApiDate,
    };

    setSelectedDate(nextDateValue);
  }, []);

  const changeIncomeFilters = useCallback((nextFilters) => {
    setIncomeFilters((currentFilters) => {
      const updatedFilters =
        typeof nextFilters === "function"
          ? nextFilters(currentFilters)
          : nextFilters;

      currentQueryContextRef.current = {
        ...currentQueryContextRef.current,
        income: updatedFilters,
      };

      return updatedFilters;
    });
  }, []);

  const changeExpenseFilters = useCallback((nextFilters) => {
    setExpenseFilters((currentFilters) => {
      const updatedFilters =
        typeof nextFilters === "function"
          ? nextFilters(currentFilters)
          : nextFilters;

      currentQueryContextRef.current = {
        ...currentQueryContextRef.current,
        expense: updatedFilters,
      };

      return updatedFilters;
    });
  }, []);

  const resetIncomeFilters = useCallback(() => {
    const nextFilters = {
      ...EMPTY_FILTERS,
    };

    currentQueryContextRef.current = {
      ...currentQueryContextRef.current,
      income: nextFilters,
    };

    setIncomeFilters(nextFilters);
  }, []);

  const resetExpenseFilters = useCallback(() => {
    const nextFilters = {
      ...EMPTY_FILTERS,
    };

    currentQueryContextRef.current = {
      ...currentQueryContextRef.current,
      expense: nextFilters,
    };

    setExpenseFilters(nextFilters);
  }, []);

  const loadBalances = useCallback(async () => {
    const requestId = ++balancesRequestIdRef.current;

    setBalancesLoading(true);
    setBalancesError("");

    try {
      const data = await getCashBalances();

      if (requestId !== balancesRequestIdRef.current) {
        return;
      }

      setBalances(data);
    } catch (error) {
      if (requestId !== balancesRequestIdRef.current) {
        return;
      }

      setBalancesError(
        getErrorMessage(error, "Не удалось загрузить остатки кассы.")
      );
    } finally {
      if (requestId === balancesRequestIdRef.current) {
        setBalancesLoading(false);
      }
    }
  }, []);

  const loadIncomeTransactionsForContext = useCallback(
    async (requestContext) => {
      if (
        !isSameTransactionContext(
          currentQueryContextRef.current,
          requestContext,
          "income"
        )
      ) {
        return;
      }

      const requestId = ++incomeRequestIdRef.current;

      setIncomeTransactionsLoading(true);
      setIncomeTransactionsError("");

      try {
        const data = await getCashTransactions({
          date: requestContext.date,
          currency: requestContext.currency,
          counterpartyId: requestContext.counterpartyId,
          transactionType: "INCOME",
        });

        if (
          requestId !== incomeRequestIdRef.current ||
          !isSameTransactionContext(
            currentQueryContextRef.current,
            requestContext,
            "income"
          )
        ) {
          return;
        }

        setIncomeTransactions(Array.isArray(data) ? data : []);
      } catch (error) {
        if (
          requestId !== incomeRequestIdRef.current ||
          !isSameTransactionContext(
            currentQueryContextRef.current,
            requestContext,
            "income"
          )
        ) {
          return;
        }

        setIncomeTransactionsError(
          getErrorMessage(error, "Не удалось загрузить приходы кассы.")
        );
      } finally {
        if (
          requestId === incomeRequestIdRef.current &&
          isSameTransactionContext(
            currentQueryContextRef.current,
            requestContext,
            "income"
          )
        ) {
          setIncomeTransactionsLoading(false);
        }
      }
    },
    []
  );

  const loadExpenseTransactionsForContext = useCallback(
    async (requestContext) => {
      if (
        !isSameTransactionContext(
          currentQueryContextRef.current,
          requestContext,
          "expense"
        )
      ) {
        return;
      }

      const requestId = ++expenseRequestIdRef.current;

      setExpenseTransactionsLoading(true);
      setExpenseTransactionsError("");

      try {
        const data = await getCashTransactions({
          date: requestContext.date,
          currency: requestContext.currency,
          counterpartyId: requestContext.counterpartyId,
          transactionType: "EXPENSE",
        });

        if (
          requestId !== expenseRequestIdRef.current ||
          !isSameTransactionContext(
            currentQueryContextRef.current,
            requestContext,
            "expense"
          )
        ) {
          return;
        }

        setExpenseTransactions(Array.isArray(data) ? data : []);
      } catch (error) {
        if (
          requestId !== expenseRequestIdRef.current ||
          !isSameTransactionContext(
            currentQueryContextRef.current,
            requestContext,
            "expense"
          )
        ) {
          return;
        }

        setExpenseTransactionsError(
          getErrorMessage(error, "Не удалось загрузить расходы кассы.")
        );
      } finally {
        if (
          requestId === expenseRequestIdRef.current &&
          isSameTransactionContext(
            currentQueryContextRef.current,
            requestContext,
            "expense"
          )
        ) {
          setExpenseTransactionsLoading(false);
        }
      }
    },
    []
  );

  const loadIncomeTransactions = useCallback(() => {
    const context = currentQueryContextRef.current;

    return loadIncomeTransactionsForContext({
      date: context.date,
      currency: context.income.currency,
      counterpartyId: context.income.counterpartyId,
    });
  }, [loadIncomeTransactionsForContext]);

  const loadExpenseTransactions = useCallback(() => {
    const context = currentQueryContextRef.current;

    return loadExpenseTransactionsForContext({
      date: context.date,
      currency: context.expense.currency,
      counterpartyId: context.expense.counterpartyId,
    });
  }, [loadExpenseTransactionsForContext]);

  const loadExchanges = useCallback(async () => {
    const requestId = ++exchangesRequestIdRef.current;

    setExchangesLoading(true);
    setExchangesError("");

    try {
      const data = await getCashExchanges();

      if (requestId !== exchangesRequestIdRef.current) {
        return;
      }

      setExchanges(data);
    } catch (error) {
      if (requestId !== exchangesRequestIdRef.current) {
        return;
      }

      setExchangesError(
        getErrorMessage(error, "Не удалось загрузить историю обменов.")
      );
    } finally {
      if (requestId === exchangesRequestIdRef.current) {
        setExchangesLoading(false);
      }
    }
  }, []);

  const refreshCurrentTransactions = useCallback(async () => {
    const context = currentQueryContextRef.current;

    await Promise.all([
      loadIncomeTransactionsForContext({
        date: context.date,
        currency: context.income.currency,
        counterpartyId: context.income.counterpartyId,
      }),

      loadExpenseTransactionsForContext({
        date: context.date,
        currency: context.expense.currency,
        counterpartyId: context.expense.counterpartyId,
      }),
    ]);
  }, [loadIncomeTransactionsForContext, loadExpenseTransactionsForContext]);

  const refreshAfterIncome = useCallback(async () => {
    const context = currentQueryContextRef.current;

    await Promise.all([
      loadBalances(),
      loadIncomeTransactionsForContext({
        date: context.date,
        currency: context.income.currency,
        counterpartyId: context.income.counterpartyId,
      }),
    ]);
  }, [loadBalances, loadIncomeTransactionsForContext]);

  const refreshAfterExpense = useCallback(async () => {
    const context = currentQueryContextRef.current;

    await Promise.all([
      loadBalances(),
      loadExpenseTransactionsForContext({
        date: context.date,
        currency: context.expense.currency,
        counterpartyId: context.expense.counterpartyId,
      }),
    ]);
  }, [loadBalances, loadExpenseTransactionsForContext]);

  const refreshAfterExchange = useCallback(async () => {
    const context = currentQueryContextRef.current;

    await Promise.all([
      loadBalances(),

      loadIncomeTransactionsForContext({
        date: context.date,
        currency: context.income.currency,
        counterpartyId: context.income.counterpartyId,
      }),

      loadExpenseTransactionsForContext({
        date: context.date,
        currency: context.expense.currency,
        counterpartyId: context.expense.counterpartyId,
      }),

      loadExchanges(),
    ]);
  }, [
    loadBalances,
    loadIncomeTransactionsForContext,
    loadExpenseTransactionsForContext,
    loadExchanges,
  ]);

  const refreshAfterInitialize = useCallback(async () => {
    const context = currentQueryContextRef.current;

    await Promise.all([
      loadBalances(),

      loadIncomeTransactionsForContext({
        date: context.date,
        currency: context.income.currency,
        counterpartyId: context.income.counterpartyId,
      }),

      loadExpenseTransactionsForContext({
        date: context.date,
        currency: context.expense.currency,
        counterpartyId: context.expense.counterpartyId,
      }),
    ]);
  }, [
    loadBalances,
    loadIncomeTransactionsForContext,
    loadExpenseTransactionsForContext,
  ]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadBalances(),
      loadIncomeTransactions(),
      loadExpenseTransactions(),
      loadExchanges(),
    ]);
  }, [
    loadBalances,
    loadIncomeTransactions,
    loadExpenseTransactions,
    loadExchanges,
  ]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBalances();
  }, [loadBalances]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadExchanges();
  }, [loadExchanges]);

  useEffect(() => {
    loadIncomeTransactions();
  }, [date, incomeFilters, loadIncomeTransactions]);

  useEffect(() => {
    loadExpenseTransactions();
  }, [date, expenseFilters, loadExpenseTransactions]);

  return {
    selectedDate,
    date,
    changeSelectedDate,

    incomeFilters,
    changeIncomeFilters,
    resetIncomeFilters,

    expenseFilters,
    changeExpenseFilters,
    resetExpenseFilters,

    balances,
    incomeTransactions,
    expenseTransactions,
    exchanges,

    balancesLoading,
    incomeTransactionsLoading,
    expenseTransactionsLoading,
    exchangesLoading,

    balancesError,
    incomeTransactionsError,
    expenseTransactionsError,
    exchangesError,

    refreshBalances: loadBalances,
    refreshIncomeTransactions: loadIncomeTransactions,
    refreshExpenseTransactions: loadExpenseTransactions,
    refreshCurrentTransactions,
    refreshExchanges: loadExchanges,

    refreshAfterIncome,
    refreshAfterExpense,
    refreshAfterExchange,
    refreshAfterInitialize,
    refreshAll,
  };
}
