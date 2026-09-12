import { useRef, useState } from "react";

import { Alert, Button, Typography } from "antd";

import {
  cancelDenXanIncoming,
  cancelDenXanOutgoing,
  cancelDenXanExpense,
} from "@/api/denXan";

import { showSuccess } from "@/utils/feedback";

import BusinessDatePicker from "@/components/finance/BusinessDatePicker/BusinessDatePicker";
import DayStatus from "@/components/finance/DayStatus/DayStatus";

import DenXanAccountBalances from "./components/DenXanAccountBalances/DenXanAccountBalances";
import DenXanRateForm from "./components/DenXanRateForm/DenXanRateForm";
import DenXanIncomingForm from "./components/DenXanIncomingForm/DenXanIncomingForm";
import DenXanIncomingTable from "./components/DenXanIncomingTable/DenXanIncomingTable";
import DenXanCancelModal from "./components/DenXanCancelModal/DenXanCancelModal";
import DenXanOutgoingForm from "./components/DenXanOutgoingForm/DenXanOutgoingForm";
import DenXanOutgoingTable from "./components/DenXanOutgoingTable/DenXanOutgoingTable";
import DenXanExpenseForm from "./components/DenXanExpenseForm/DenXanExpenseForm";
import DenXanExpenseTable from "./components/DenXanExpenseTable/DenXanExpenseTable";
import DenXanDailySummary from "./components/DenXanDailySummary/DenXanDailySummary";
import DenXanDistributorSummary from "./components/DenXanDistributorSummary/DenXanDistributorSummary";

import { useDenXanPage } from "./hooks/useDenXanPage";

import styles from "./DenXan.module.css";

const { Title, Text } = Typography;

export default function DenXan() {
  const incomingFormRef = useRef(null);

  const outgoingFormRef = useRef(null);

  const incomingSectionRef = useRef(null);

  const outgoingSectionRef = useRef(null);

  const [cancelTarget, setCancelTarget] = useState(null);

  const {
    selectedDate,
    setSelectedDate,
    date,

    denXanAccounts,
    dailyRate,
    businessDay,
    isClosed,

    denXanAccountsLoading,
    dailyRateLoading,
    businessDayLoading,

    denXanAccountsError,
    dailyRateError,
    businessDayError,

    refreshDenXanAccounts,
    refreshDailyRate,
    refreshBusinessDay,

    refreshCurrentRateData,

    distributors,
    incomings,

    distributorsLoading,
    incomingLoading,

    distributorsError,
    incomingError,

    refreshIncoming,
    refreshCurrentIncomingData,

    mmaAccounts,
    outgoings,

    mmaAccountsLoading,
    outgoingLoading,

    mmaAccountsError,
    outgoingError,

    refreshOutgoing,
    refreshCurrentOutgoingData,

    expenses,
    expensesLoading,
    expensesError,
    refreshExpenses,
    refreshCurrentExpenseData,

    dailySummary,
    dailyLoading,
    dailyError,
    refreshDaily,
  } = useDenXanPage();

  const isDayActionDisabled =
    businessDayLoading || Boolean(businessDayError) || !businessDay || isClosed;

  const activeDenXanAccounts = denXanAccounts.filter(
    (account) => account.is_active !== false
  );

  const activeMmaAccounts = mmaAccounts.filter(
    (account) => account.is_active !== false
  );

  const isOutgoingCreateDisabled =
    isDayActionDisabled ||
    denXanAccountsLoading ||
    Boolean(denXanAccountsError) ||
    activeDenXanAccounts.length !== 1 ||
    mmaAccountsLoading ||
    Boolean(mmaAccountsError) ||
    activeMmaAccounts.length === 0;

  const isIncomingCreateDisabled =
    isDayActionDisabled ||
    distributorsLoading ||
    Boolean(distributorsError) ||
    distributors.length === 0 ||
    denXanAccountsLoading ||
    Boolean(denXanAccountsError) ||
    activeDenXanAccounts.length !== 1;

  const isCancelDisabled = isDayActionDisabled;

  const isExpenseCreateDisabled =
    isDayActionDisabled ||
    denXanAccountsLoading ||
    Boolean(denXanAccountsError) ||
    activeDenXanAccounts.length !== 1;

  const isExpenseCancelDisabled = isDayActionDisabled;

  const handleConfirmCancel = async (reason) => {
    if (!cancelTarget) {
      return;
    }

    if (cancelTarget.type === "incoming") {
      await cancelDenXanIncoming(cancelTarget.operation.id, reason);

      await refreshCurrentIncomingData();

      showSuccess("Приход отменён");

      return;
    }

    if (cancelTarget.type === "outgoing") {
      await cancelDenXanOutgoing(cancelTarget.operation.id, reason);

      await refreshCurrentOutgoingData();

      showSuccess("Исход отменён");

      return;
    }

    if (cancelTarget.type === "expense") {
      await cancelDenXanExpense(cancelTarget.operation.id, reason);

      await refreshCurrentExpenseData();

      showSuccess("Расход отменён");
    }
  };

  const focusFormAndScroll = (formRef, sectionRef) => {
    formRef.current?.focusFirst?.();

    window.requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  };

  const getCancelModalContent = () => {
    if (cancelTarget?.type === "incoming") {
      return {
        title: "Отменить приход",
        description: "Укажите причину отмены прихода DEN XAN.",
      };
    }

    if (cancelTarget?.type === "outgoing") {
      return {
        title: "Отменить исход",
        description: "Укажите причину отмены исхода DEN XAN.",
      };
    }

    if (cancelTarget?.type === "expense") {
      return {
        title: "Отменить расход",
        description: "Укажите причину отмены расхода DEN XAN.",
      };
    }

    return {
      title: "",
      description: "",
    };
  };

  const cancelModalContent = getCancelModalContent();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Title level={2} className={styles.title}>
            DEN XAN
          </Title>

          <Text type="secondary">Банковские операции и расчёты DEN XAN</Text>
        </div>

        <div className={styles.headerActions}>
          <BusinessDatePicker value={selectedDate} onChange={setSelectedDate} />

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
          description="Добавление, отмена операций и изменение курса недоступны."
        />
      ) : null}

      <section className={`${styles.section} ${styles.accountsSection}`}>
        <div className={styles.sectionHeader}>
          <div>
            <Title level={4} className={styles.sectionTitle}>
              БАНКОВСКИЕ СЧЕТА
            </Title>

            <Text type="secondary" className={styles.sectionDescription}>
              Текущий остаток на счетах DEN XAN
            </Text>
          </div>
        </div>

        <DenXanAccountBalances
          accounts={denXanAccounts}
          loading={denXanAccountsLoading}
          error={denXanAccountsError}
          onRetry={refreshDenXanAccounts}
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <Title level={4} className={styles.sectionTitle}>
              КУРСЫ
            </Title>

            <Text type="secondary" className={styles.sectionDescription}>
              Курсы для выбранной даты
            </Text>
          </div>
        </div>

        <DenXanRateForm
          key={`${date}-${dailyRate?.id ?? "empty"}-${
            dailyRate?.den_xan_rate ?? ""
          }-${dailyRate?.street_rate ?? ""}`}
          date={date}
          rate={dailyRate}
          loading={dailyRateLoading}
          error={dailyRateError}
          disabled={isDayActionDisabled}
          onRetry={refreshDailyRate}
          refreshCurrentRateData={refreshCurrentRateData}
        />
      </section>

      <section className={styles.section} ref={incomingSectionRef}>
        <div className={styles.sectionHeader}>
          <div>
            <Title level={4} className={styles.sectionTitle}>
              ПРИХОДЫ
            </Title>

            <Text type="secondary" className={styles.sectionDescription}>
              Приходы дистрибьюторов DEN XAN
            </Text>
          </div>
        </div>

        {distributorsError ? (
          <Alert
            type="error"
            showIcon
            message="Не удалось загрузить дистрибьюторов"
            description={distributorsError}
            className={styles.sectionAlert}
          />
        ) : null}

        <div className={styles.operationForm}>
          <DenXanIncomingForm
            key={date}
            ref={incomingFormRef}
            date={date}
            distributors={distributors}
            accounts={denXanAccounts}
            distributorsLoading={distributorsLoading}
            disabled={isIncomingCreateDisabled}
            refreshCurrentIncomingData={refreshCurrentIncomingData}
            onFirstFieldTab={() => {
              focusFormAndScroll(outgoingFormRef, outgoingSectionRef);
            }}
          />
        </div>

        <DenXanIncomingTable
          data={incomings}
          loading={incomingLoading}
          error={incomingError}
          onRetry={refreshIncoming}
          onCancel={(operation) => {
            setCancelTarget({
              type: "incoming",
              operation,
            });
          }}
          cancelDisabled={isCancelDisabled}
        />
      </section>

      <section className={styles.section} ref={outgoingSectionRef}>
        <div className={styles.sectionHeader}>
          <div>
            <Title level={4} className={styles.sectionTitle}>
              ИСХОД → MMA
            </Title>

            <Text type="secondary" className={styles.sectionDescription}>
              Исходы DEN XAN с автоматическим приходом в MMA
            </Text>
          </div>
        </div>

        {mmaAccountsError ? (
          <Alert
            type="error"
            showIcon
            message="Не удалось загрузить счета MMA"
            description={mmaAccountsError}
            className={styles.sectionAlert}
          />
        ) : null}

        <div className={styles.operationForm}>
          <DenXanOutgoingForm
            key={date}
            ref={outgoingFormRef}
            date={date}
            denXanAccounts={denXanAccounts}
            mmaAccounts={mmaAccounts}
            mmaAccountsLoading={mmaAccountsLoading}
            disabled={isOutgoingCreateDisabled}
            refreshCurrentOutgoingData={refreshCurrentOutgoingData}
            onFirstFieldTab={() => {
              focusFormAndScroll(incomingFormRef, incomingSectionRef);
            }}
          />
        </div>

        <DenXanOutgoingTable
          data={outgoings}
          loading={outgoingLoading}
          error={outgoingError}
          onRetry={refreshOutgoing}
          cancelDisabled={isCancelDisabled}
          onCancel={(operation) => {
            setCancelTarget({
              type: "outgoing",
              operation,
            });
          }}
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <Title level={4} className={styles.sectionTitle}>
              РАСХОДЫ
            </Title>

            <Text type="secondary" className={styles.sectionDescription}>
              Прочие расходы и системные банковские комиссии DEN XAN
            </Text>
          </div>
        </div>

        <div className={styles.operationForm}>
          <DenXanExpenseForm
            key={date}
            date={date}
            accounts={denXanAccounts}
            disabled={isExpenseCreateDisabled}
            refreshCurrentExpenseData={refreshCurrentExpenseData}
          />
        </div>

        <DenXanExpenseTable
          data={expenses}
          loading={expensesLoading}
          error={expensesError}
          onRetry={refreshExpenses}
          cancelDisabled={isExpenseCancelDisabled}
          onCancel={(operation) => {
            setCancelTarget({
              type: "expense",
              operation,
            });
          }}
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <Title level={4} className={styles.sectionTitle}>
              ДНЕВНАЯ СВОДКА
            </Title>

            <Text type="secondary" className={styles.sectionDescription}>
              Итоги DEN XAN за выбранный день
            </Text>
          </div>
        </div>

        <DenXanDailySummary
          summary={dailySummary}
          loading={dailyLoading}
          error={dailyError}
          onRetry={refreshDaily}
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <Title level={4} className={styles.sectionTitle}>
              ПО ДИСТРИБЬЮТОРАМ
            </Title>

            <Text type="secondary" className={styles.sectionDescription}>
              Backend-сводка по каждому дистрибьютору
            </Text>
          </div>
        </div>

        <DenXanDistributorSummary
          data={dailySummary?.distributors ?? []}
          loading={dailyLoading}
          error={dailyError}
          onRetry={refreshDaily}
        />
      </section>

      <DenXanCancelModal
        open={Boolean(cancelTarget)}
        title={cancelModalContent.title}
        description={cancelModalContent.description}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
