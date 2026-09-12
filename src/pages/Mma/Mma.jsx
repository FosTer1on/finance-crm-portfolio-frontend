import { useState } from "react";

import { Alert, Button, Typography } from "antd";

import { normalizeApiError } from "@/api/errors";
import { showSuccess } from "@/utils/feedback";

import BusinessDatePicker from "@/components/finance/BusinessDatePicker/BusinessDatePicker";
import CounterpartySelect from "@/components/finance/CounterpartySelect/CounterpartySelect";
import DayStatus from "@/components/finance/DayStatus/DayStatus";

import MmaAccountBalances from "./components/MmaAccountBalances/MmaAccountBalances";
import MmaOperationForms from "./components/MmaOperationForms/MmaOperationForms";
import MmaCancelModal from "./components/MmaCancelModal/MmaCancelModal";
import MmaIncomingTable from "./components/MmaIncomingTable/MmaIncomingTable";
import MmaOutgoingTable from "./components/MmaOutgoingTable/MmaOutgoingTable";
import MmaDenXanTable from "./components/MmaDenXanTable/MmaDenXanTable";
import MmaDailySummary from "./components/MmaDailySummary/MmaDailySummary";

import { useMmaPage } from "./hooks/useMmaPage";

import styles from "./Mma.module.css";

const { Title, Text } = Typography;

export default function Mma() {
  const {
    selectedDate,
    setSelectedDate,

    counterpartyFilter,
    setCounterpartyFilter,

    accounts,
    businessDay,
    isClosed,

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

    date,

    refreshCurrentIncomingAndDaily,
    refreshCurrentOutgoingAndDaily,

    incomings,
    outgoings,

    cancelIncomingOperation,
    cancelOutgoingOperation,

    denXanIncomings,

    dailySummary,
  } = useMmaPage();

  const [cancelTarget, setCancelTarget] = useState(null);

  const [cancelReason, setCancelReason] = useState("");

  const [cancelError, setCancelError] = useState("");

  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  const isDayActionDisabled =
    businessDayLoading || Boolean(businessDayError) || !businessDay || isClosed;

  const isCreateDisabled =
    isDayActionDisabled ||
    accountsLoading ||
    Boolean(accountsError) ||
    accounts.length === 0;

  const handleDateChange = (nextDate) => {
    setCancelTarget(null);
    setCancelReason("");
    setCancelError("");

    setCounterpartyFilter(null);
    setSelectedDate(nextDate);
  };

  const closeCancelModal = () => {
    if (cancelSubmitting) {
      return;
    }

    setCancelTarget(null);
    setCancelReason("");
    setCancelError("");
  };

  const handleOpenCancel = (type, operation) => {
    if (isDayActionDisabled) {
      return;
    }

    setCancelTarget({
      type,
      operation,
    });

    setCancelReason("");
    setCancelError("");
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget || cancelSubmitting || isDayActionDisabled) {
      return;
    }

    const normalizedReason = cancelReason.trim();

    if (!normalizedReason) {
      setCancelError("Укажите причину отмены.");
      return;
    }

    setCancelSubmitting(true);
    setCancelError("");

    try {
      if (cancelTarget.type === "incoming") {
        await cancelIncomingOperation(
          cancelTarget.operation.id,
          normalizedReason
        );

        showSuccess("Приход MMA отменён");
      } else {
        await cancelOutgoingOperation(
          cancelTarget.operation.id,
          normalizedReason
        );

        showSuccess("Исход MMA отменён");
      }

      setCancelTarget(null);
      setCancelReason("");
      setCancelError("");
    } catch (error) {
      const normalizedError = normalizeApiError(error);

      setCancelError(
        normalizedError.message || "Не удалось отменить операцию."
      );
    } finally {
      setCancelSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Title level={2} className={styles.title}>
            MMA
          </Title>

          <Text type="secondary">Банковские операции и расчёты MMA</Text>
        </div>

        <div className={styles.headerActions}>
          <BusinessDatePicker
            value={selectedDate}
            onChange={handleDateChange}
          />

          {!businessDayLoading && !businessDayError && businessDay ? (
            <DayStatus status={isClosed ? "CLOSED" : "OPEN"} />
          ) : null}
        </div>
      </div>

      {businessDayError ? (
        <Alert
          type="error"
          showIcon
          message="Не удалось получить статус дня"
          description={businessDayError}
          action={
            <Button
              size="small"
              loading={businessDayLoading}
              onClick={refreshBusinessDay}
            >
              Повторить
            </Button>
          }
        />
      ) : null}

      {!businessDayLoading && !businessDayError && businessDay && isClosed ? (
        <Alert
          type="warning"
          showIcon
          message="День закрыт"
          description="Добавление и отмена операций недоступны."
        />
      ) : null}

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <Title level={4} className={styles.sectionTitle}>
              БАНКОВСКИЕ СЧЕТА
            </Title>

            <Text type="secondary" className={styles.sectionDescription}>
              Текущие остатки на счетах
            </Text>
          </div>
        </div>

        <MmaAccountBalances
          accounts={accounts}
          loading={accountsLoading}
          error={accountsError}
          onRetry={refreshAccounts}
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <Title level={4} className={styles.sectionTitle}>
            РУЧНЫЕ ОПЕРАЦИИ
          </Title>
        </div>

        <MmaOperationForms
          key={date}
          date={date}
          accounts={accounts}
          accountsLoading={accountsLoading}
          disabled={isCreateDisabled}
          refreshCurrentIncomingAndDaily={refreshCurrentIncomingAndDaily}
          refreshCurrentOutgoingAndDaily={refreshCurrentOutgoingAndDaily}
        />
      </section>

      <div className={styles.filterRow}>
        <div className={styles.filterField}>
          <Text type="secondary" className={styles.fieldLabel}>
            Человек
          </Text>

          <CounterpartySelect
            value={counterpartyFilter}
            onChange={setCounterpartyFilter}
            allowClear
            placeholder="Все"
          />
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <Title level={4} className={styles.sectionTitle}>
            РУЧНЫЕ ПРИХОДЫ
          </Title>
        </div>

        <MmaIncomingTable
          items={incomings}
          loading={incomingLoading}
          error={incomingError}
          cancelDisabled={isDayActionDisabled}
          onCancel={handleOpenCancel}
          onRetry={refreshIncoming}
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <Title level={4} className={styles.sectionTitle}>
            РУЧНЫЕ ИСХОДЫ
          </Title>
        </div>

        <MmaOutgoingTable
          items={outgoings}
          loading={outgoingLoading}
          error={outgoingError}
          cancelDisabled={isDayActionDisabled}
          onCancel={handleOpenCancel}
          onRetry={refreshOutgoing}
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <Title level={4} className={styles.sectionTitle}>
              DEN XAN → MMA
            </Title>

            <Text type="secondary" className={styles.sectionDescription}>
              Системные приходы из DEN XAN
            </Text>
          </div>
        </div>

        <MmaDenXanTable
          items={denXanIncomings}
          loading={denXanLoading}
          error={denXanError}
          onRetry={refreshDenXan}
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <Title level={4} className={styles.sectionTitle}>
              ИТОГ ЗА ДЕНЬ
            </Title>

            <Text type="secondary" className={styles.sectionDescription}>
              Итог за выбранную дату по данным backend
            </Text>
          </div>
        </div>

        <MmaDailySummary
          data={dailySummary}
          loading={dailyLoading}
          error={dailyError}
          onRetry={refreshDaily}
        />
      </section>

      <MmaCancelModal
        open={Boolean(cancelTarget)}
        type={cancelTarget?.type}
        operation={cancelTarget?.operation}
        reason={cancelReason}
        error={cancelError}
        loading={cancelSubmitting}
        onReasonChange={(value) => {
          setCancelReason(value);

          if (cancelError) {
            setCancelError("");
          }
        }}
        onConfirm={handleConfirmCancel}
        onCancel={closeCancelModal}
      />
    </div>
  );
}
