import { useRef, useState } from "react";
import { Button } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";

import BusinessDatePicker from "@/components/finance/BusinessDatePicker/BusinessDatePicker";
import PageToolbar from "@/components/common/PageToolbar/PageToolbar";

import CashBalances from "./components/CashBalances/CashBalances";
import CashIncomeForm from "./components/CashIncomeForm/CashIncomeForm";
import CashTransactionTable from "./components/CashTransactionTable/CashTransactionTable";
import CashExpenseForm from "./components/CashExpenseForm/CashExpenseForm";
import CashTransactionFilters from "./components/CashTransactionFilters/CashTransactionFilters";
import CashExchangeForm from "./components/CashExchangeForm/CashExchangeForm";
import CashExchangeTable from "./components/CashExchangeTable/CashExchangeTable";
import CashInitializeModal from "./components/CashInitializeModal/CashInitializeModal";

import useCashPage from "./hooks/useCashPage";

import styles from "./Cash.module.css";

export default function Cash() {
  const incomeFormRef = useRef(null);
  const expenseFormRef = useRef(null);

  const incomeSectionRef = useRef(null);
  const expenseSectionRef = useRef(null);

  const [initializeOpen, setInitializeOpen] = useState(false);

  const {
    selectedDate,
    changeSelectedDate,

    balances,
    balancesLoading,
    balancesError,

    refreshBalances,
    refreshAll,

    date,

    incomeTransactions,
    incomeTransactionsLoading,
    incomeTransactionsError,

    refreshIncomeTransactions,
    refreshAfterIncome,

    expenseTransactions,
    expenseTransactionsLoading,
    expenseTransactionsError,

    refreshExpenseTransactions,
    refreshAfterExpense,

    incomeFilters,
    changeIncomeFilters,
    resetIncomeFilters,

    expenseFilters,
    changeExpenseFilters,
    resetExpenseFilters,

    exchanges,
    exchangesLoading,
    exchangesError,

    refreshExchanges,
    refreshAfterExchange,
    refreshAfterInitialize,
  } = useCashPage();

  const focusFormAndScroll = (formRef, sectionRef) => {
    sectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        formRef.current?.focusFirst();
      });
    });
  };

  const moveToExpenseForm = () => {
    focusFormAndScroll(expenseFormRef, expenseSectionRef);
  };

  const moveToIncomeForm = () => {
    focusFormAndScroll(incomeFormRef, incomeSectionRef);
  };

  return (
    <div className={styles.page}>
      <PageToolbar
        title="Касса"
        actions={
          <div className={styles.toolbarActions}>
            <div className={styles.dateControl}>
              <span className={styles.dateLabel}>Дата истории</span>

              <BusinessDatePicker
                value={selectedDate}
                onChange={changeSelectedDate}
              />
            </div>

            <Button
              icon={<PlusOutlined />}
              onClick={() => setInitializeOpen(true)}
            >
              Начальный баланс
            </Button>

            <Button icon={<ReloadOutlined />} onClick={refreshAll}>
              Обновить
            </Button>
          </div>
        }
      />

      <div className={styles.stickyBalances}>
        <CashBalances
          balances={balances}
          loading={balancesLoading}
          error={balancesError}
          onRetry={refreshBalances}
        />
      </div>

      <section ref={incomeSectionRef} className={styles.operationSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Приход в кассу</h2>
        </div>

        <div className={styles.formArea}>
          <CashIncomeForm
            ref={incomeFormRef}
            operationDate={date}
            onCreated={refreshAfterIncome}
            onFirstFieldTab={moveToExpenseForm}
          />
        </div>

        <CashTransactionFilters
          filters={incomeFilters}
          onChange={changeIncomeFilters}
          onReset={resetIncomeFilters}
          loading={incomeTransactionsLoading}
        />

        <div className={styles.tableArea}>
          <CashTransactionTable
            transactions={incomeTransactions}
            loading={incomeTransactionsLoading}
            error={incomeTransactionsError}
            onRetry={refreshIncomeTransactions}
            emptyText="Приходов за выбранный день нет"
          />
        </div>
      </section>

      <section ref={expenseSectionRef} className={styles.operationSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Расход из кассы</h2>
        </div>

        <div className={styles.formArea}>
          <CashExpenseForm
            ref={expenseFormRef}
            operationDate={date}
            onCreated={refreshAfterExpense}
            onFirstFieldTab={moveToIncomeForm}
          />
        </div>

        <CashTransactionFilters
          filters={expenseFilters}
          onChange={changeExpenseFilters}
          onReset={resetExpenseFilters}
          loading={expenseTransactionsLoading}
        />

        <div className={styles.tableArea}>
          <CashTransactionTable
            transactions={expenseTransactions}
            loading={expenseTransactionsLoading}
            error={expenseTransactionsError}
            onRetry={refreshExpenseTransactions}
            emptyText="Расходов за выбранный день нет"
          />
        </div>
      </section>

      <section className={styles.operationSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Обмен валюты</h2>
        </div>

        <div className={styles.formArea}>
          <CashExchangeForm
            operationDate={date}
            onCreated={refreshAfterExchange}
          />
        </div>

        <div className={styles.tableArea}>
          <CashExchangeTable
            exchanges={exchanges}
            loading={exchangesLoading}
            error={exchangesError}
            onRetry={refreshExchanges}
          />
        </div>
      </section>

      {initializeOpen ? (
        <CashInitializeModal
          open
          selectedDate={selectedDate}
          onClose={() => setInitializeOpen(false)}
          onCreated={refreshAfterInitialize}
        />
      ) : null}
    </div>
  );
}
