import { useState } from "react";

import { Alert, Button, Space, Typography, Input } from "antd";

import { cancelAsiaIncoming, cancelAsiaOutgoing } from "@/api/asia";

import ConfirmActionModal from "@/components/feedback/ConfirmActionModal/ConfirmActionModal";

import { normalizeApiError } from "@/api/errors";
import { showSuccess } from "@/utils/feedback";

import BusinessDatePicker from "@/components/finance/BusinessDatePicker/BusinessDatePicker";
import CounterpartySelect from "@/components/finance/CounterpartySelect/CounterpartySelect";
import DayStatus from "@/components/finance/DayStatus/DayStatus";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import AsiaOperationForms from "./components/AsiaOperationForms/AsiaOperationForms";
import AsiaIncomingTable from "./components/AsiaIncomingTable/AsiaIncomingTable";
import AsiaOutgoingTable from "./components/AsiaOutgoingTable/AsiaOutgoingTable";
import AsiaDailySummary from "./components/AsiaDailySummary/AsiaDailySummary";
import AsiaNerudnikSummary from "./components/AsiaNerudnikSummary/AsiaNerudnikSummary";
import AsiaNerudnikSettings from "./components/AsiaNerudnikSettings/AsiaNerudnikSettings";

import { useAsiaPage } from "./hooks/useAsiaPage";

import styles from "./Asia.module.css";

const { Title, Text } = Typography;

export default function Asia() {
  const [cancelTarget, setCancelTarget] = useState(null);

  const [cancelReason, setCancelReason] = useState("");

  const [cancelError, setCancelError] = useState("");

  const [cancelLoading, setCancelLoading] = useState(false);

  const {
    selectedDate,
    setSelectedDate,

    counterpartyFilter,
    setCounterpartyFilter,

    businessDay,
    isClosed,

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

    date,
    refreshCurrentIncomingAndDaily,
    refreshCurrentOutgoingAndDaily,

    incomings,
    outgoings,

    dailySummary,
  } = useAsiaPage();

  const isFinancialActionDisabled =
    businessDayLoading || Boolean(businessDayError) || !businessDay || isClosed;

  const handleDateChange = (nextDate) => {
    setCancelTarget(null);
    setCancelReason("");
    setCancelError("");

    setCounterpartyFilter(null);
    setSelectedDate(nextDate);
  };

  const handleIncomingCancel = (operation) => {
    if (isFinancialActionDisabled) {
      return;
    }

    setCancelTarget({
      type: "incoming",
      operation,
    });

    setCancelReason("");
    setCancelError("");
  };

  const handleOutgoingCancel = (operation) => {
    if (isFinancialActionDisabled) {
      return;
    }

    setCancelTarget({
      type: "outgoing",
      operation,
    });

    setCancelReason("");
    setCancelError("");
  };

  const handleCancelModalClose = () => {
    if (cancelLoading) {
      return;
    }

    setCancelTarget(null);
    setCancelReason("");
    setCancelError("");
  };

  const handleConfirmCancellation = async () => {
    if (!cancelTarget || cancelLoading || isFinancialActionDisabled) {
      return;
    }

    const reason = cancelReason.trim();

    if (!reason) {
      setCancelError("Укажите причину отмены");
      return;
    }

    setCancelLoading(true);
    setCancelError("");

    try {
      if (cancelTarget.type === "incoming") {
        await cancelAsiaIncoming(cancelTarget.operation.id, reason);

        await refreshCurrentIncomingAndDaily();
      } else {
        await cancelAsiaOutgoing(cancelTarget.operation.id, reason);

        await refreshCurrentOutgoingAndDaily();
      }

      showSuccess("Операция отменена");

      setCancelTarget(null);
      setCancelReason("");
      setCancelError("");
    } catch (error) {
      const normalizedError = normalizeApiError(error);

      setCancelError(normalizedError.message || "Не удалось отменить операцию");
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Title level={2} className={styles.title}>
            ASIA
          </Title>

          <Text type="secondary">
            Приходы, исходы и расчёты за выбранный день
          </Text>
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
              onClick={refreshBusinessDay}
              loading={businessDayLoading}
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

      <AsiaOperationForms
        key={date}
        date={date}
        disabled={isFinancialActionDisabled}
        onIncomingSuccess={refreshCurrentIncomingAndDaily}
        onOutgoingSuccess={refreshCurrentOutgoingAndDaily}
      />

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
            Приходы за день
          </Title>

          {incomingError ? (
            <Space size="small">
              <Text type="danger">{incomingError}</Text>

              <Button
                size="small"
                onClick={refreshIncoming}
                loading={incomingLoading}
              >
                Повторить
              </Button>
            </Space>
          ) : null}
        </div>

        {!incomingError ? (
          <AsiaIncomingTable
            data={incomings}
            loading={incomingLoading}
            error={incomingError}
            cancelDisabled={isFinancialActionDisabled}
            onRetry={refreshIncoming}
            onCancel={handleIncomingCancel}
          />
        ) : null}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <Title level={4} className={styles.sectionTitle}>
            Исходы за день
          </Title>

          {outgoingError ? (
            <Space size="small">
              <Text type="danger">{outgoingError}</Text>

              <Button
                size="small"
                onClick={refreshOutgoing}
                loading={outgoingLoading}
              >
                Повторить
              </Button>
            </Space>
          ) : null}
        </div>

        {!outgoingError ? (
          <AsiaOutgoingTable
            data={outgoings}
            loading={outgoingLoading}
            error={outgoingError}
            cancelDisabled={isFinancialActionDisabled}
            onRetry={refreshOutgoing}
            onCancel={handleOutgoingCancel}
          />
        ) : null}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <Title level={4} className={styles.sectionTitle}>
            ИТОГ ЗА ДЕНЬ
          </Title>
        </div>

        <AsiaDailySummary
          data={dailySummary}
          loading={dailyLoading}
          error={dailyError}
          onRetry={refreshDaily}
        />
      </section>

      <section className={styles.section}>
        <div className={styles.nerudnikHeader}>
          <Title level={4} className={styles.sectionTitle}>
            НЕРУДНИК
          </Title>

          {!dailyError && dailySummary ? (
            <AsiaNerudnikSettings
              key={[
                date,
                dailySummary.nerudnik_settings?.allowed_deduction_percent,
                dailySummary.nerudnik_settings?.adjustment_percent,
                dailySummary.nerudnik_settings?.is_configured,
              ].join("-")}
              date={date}
              settings={dailySummary.nerudnik_settings}
              disabled={isFinancialActionDisabled}
              loading={dailyLoading}
              onSaved={refreshDaily}
            />
          ) : null}
        </div>

        {dailyError ? (
          <Text type="secondary">
            Расчёт недоступен, пока не загружен итог за день.
          </Text>
        ) : dailyLoading && !dailySummary ? (
          <Text type="secondary">Загрузка расчёта...</Text>
        ) : (
          <AsiaNerudnikSummary data={dailySummary} />
        )}
      </section>

      <ConfirmActionModal
        open={Boolean(cancelTarget)}
        title={
          cancelTarget?.type === "incoming"
            ? "Отменить приход?"
            : "Отменить исход?"
        }
        confirmText="Отменить операцию"
        danger
        loading={cancelLoading}
        onConfirm={handleConfirmCancellation}
        onCancel={handleCancelModalClose}
        description={
          cancelTarget ? (
            <div className={styles.cancelContent}>
              <div>
                <strong>Человек:</strong>{" "}
                {cancelTarget.operation.counterparty_name}
              </div>

              <div>
                <strong>Сумма:</strong>{" "}
                <MoneyText
                  value={cancelTarget.operation.amount}
                  currency="сум"
                />
              </div>

              <Text type="secondary">
                Операция исчезнет из рабочего списка, но останется в истории.
              </Text>

              <div className={styles.cancelReason}>
                <Text>Причина отмены *</Text>

                <Input.TextArea
                  value={cancelReason}
                  maxLength={500}
                  autoSize={{
                    minRows: 2,
                    maxRows: 4,
                  }}
                  placeholder="Укажите причину"
                  status={cancelError ? "error" : undefined}
                  onChange={(event) => {
                    setCancelReason(event.target.value);
                    setCancelError("");
                  }}
                />

                {cancelError ? <Text type="danger">{cancelError}</Text> : null}
              </div>
            </div>
          ) : null
        }
      />
    </div>
  );
}
