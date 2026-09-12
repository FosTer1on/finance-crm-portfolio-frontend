import { useState } from "react";
import { Input, message, Alert } from "antd";

import { cancelClearingOperation } from "@/api/clearing";
import { normalizeApiError } from "@/api/errors";

import ConfirmActionModal from "@/components/feedback/ConfirmActionModal/ConfirmActionModal";
import BusinessDatePicker from "@/components/finance/BusinessDatePicker/BusinessDatePicker";
import DayStatus from "@/components/finance/DayStatus/DayStatus";
import MoneyText from "@/components/finance/MoneyText/MoneyText";
import CounterpartySelect from "@/components/finance/CounterpartySelect/CounterpartySelect";

import ClearingOperationsTable from "./components/ClearingOperationsTable/ClearingOperationsTable";
import ClearingOperationForm from "./components/ClearingOperationForm/ClearingOperationForm";
import ClearingDailySummary from "./components/ClearingDailySummary/ClearingDailySummary";

import { useClearingPage } from "./hooks/useClearingPage";

import styles from "./Clearing.module.css";

export default function Clearing() {
  const {
    selectedDate,
    setSelectedDate,
    date,

    isClosed,
    businessDayLoading,
    businessDayError,

    refreshCurrentFinancialData,

    counterpartyFilter,
    setCounterpartyFilter,

    operations,
    operationsLoading,
    operationsError,

    refreshOperations,

    dailySummary,
    summaryLoading,
    summaryError,
    refreshDailySummary,
  } = useClearingPage();

  const isFinancialActionDisabled =
    businessDayLoading || Boolean(businessDayError) || isClosed;

  const [operationToCancel, setOperationToCancel] = useState(null);

  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const handleDateChange = (nextDate) => {
    setOperationToCancel(null);
    setCancelReason("");
    setCancelError("");
    setCounterpartyFilter(null);
    setSelectedDate(nextDate);
  };

  const handleCancelRequest = (operation) => {
    if (isFinancialActionDisabled) {
      return;
    }

    setOperationToCancel(operation);
    setCancelReason("");
    setCancelError("");
  };

  const handleCancelModalClose = () => {
    if (cancelling) {
      return;
    }

    setOperationToCancel(null);
    setCancelReason("");
    setCancelError("");
  };

  const handleCancelConfirm = async () => {
    if (!operationToCancel || isFinancialActionDisabled || cancelling) {
      return;
    }

    const reason = cancelReason.trim();

    if (!reason) {
      setCancelError("Укажите причину отмены");
      return;
    }

    setCancelling(true);
    setCancelError("");

    try {
      await cancelClearingOperation(operationToCancel.id, reason);

      setOperationToCancel(null);
      setCancelReason("");
      setCancelError("");

      message.success("Операция отменена");

      await refreshCurrentFinancialData();
    } catch (error) {
      const normalizedError = normalizeApiError(error);

      setCancelError(normalizedError.message || "Не удалось отменить операцию");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>ВЗАИМОРАСЧЁТЫ</h1>
          <div className={styles.subtitle}>Рабочий лист Clearing</div>
        </div>

        <div className={styles.dateControls}>
          <BusinessDatePicker
            value={selectedDate}
            onChange={handleDateChange}
          />

          {!businessDayLoading && !businessDayError ? (
            <DayStatus status={isClosed ? "CLOSED" : "OPEN"} />
          ) : null}
        </div>
      </header>

      {businessDayError ? (
        <Alert type="error" showIcon message={businessDayError} />
      ) : null}

      {!businessDayLoading && !businessDayError && isClosed ? (
        <Alert
          type="warning"
          showIcon
          message="День закрыт. Добавление и отмена операций недоступны."
        />
      ) : null}

      <ClearingOperationForm
        key={date}
        date={date}
        disabled={isFinancialActionDisabled}
        onSuccess={refreshCurrentFinancialData}
      />

      <div className={styles.tableToolbar}>
        <label className={styles.filterField}>
          <span>Человек</span>

          <CounterpartySelect
            value={counterpartyFilter}
            onChange={(value) => {
              setCounterpartyFilter(value ?? null);
            }}
            placeholder="Все"
            allowClear
            style={{ width: 260 }}
          />
        </label>
      </div>

      <ClearingOperationsTable
        operations={operations}
        loading={operationsLoading}
        error={operationsError}
        isClosed={isFinancialActionDisabled}
        cancellingId={cancelling ? operationToCancel?.id : null}
        onCancel={handleCancelRequest}
        onRetry={refreshOperations}
      />

      <ClearingDailySummary
        dailySummary={dailySummary}
        loading={summaryLoading}
        error={summaryError}
        onRetry={refreshDailySummary}
      />

      <ConfirmActionModal
        open={Boolean(operationToCancel)}
        title="Отменить операцию?"
        confirmText="Отменить операцию"
        cancelText="Назад"
        danger
        loading={cancelling}
        onConfirm={handleCancelConfirm}
        onCancel={handleCancelModalClose}
        description={
          operationToCancel ? (
            <div className={styles.cancelContent}>
              <div className={styles.cancelOperation}>
                <div>
                  <span>От кого:</span>
                  <strong>
                    {operationToCancel.from_counterparty?.name || "—"}
                  </strong>
                </div>

                <div>
                  <span>Кому:</span>
                  <strong>
                    {operationToCancel.to_counterparty?.name || "—"}
                  </strong>
                </div>

                <div>
                  <span>Сумма:</span>
                  <MoneyText value={operationToCancel.amount} currency="сум" />
                </div>
              </div>

              <p className={styles.cancelWarning}>
                После отмены операция исчезнет из активного списка, но останется
                в полной истории.
              </p>

              <label className={styles.cancelReason}>
                <span>Причина отмены</span>

                <Input.TextArea
                  value={cancelReason}
                  rows={3}
                  maxLength={500}
                  disabled={cancelling}
                  placeholder="Укажите причину отмены"
                  onChange={(event) => {
                    setCancelReason(event.target.value);

                    if (cancelError) {
                      setCancelError("");
                    }
                  }}
                />
              </label>

              {cancelError ? (
                <Alert
                  className={styles.cancelError}
                  type="error"
                  showIcon
                  message={cancelError}
                />
              ) : null}
            </div>
          ) : null
        }
      />
    </div>
  );
}
