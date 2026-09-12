import { useState } from "react";

import { Alert, Button, Input, Typography } from "antd";

import { cancelTarleIncoming, cancelTarleOutgoing } from "@/api/tarle";

import { normalizeApiError } from "@/api/errors";

import { showSuccess } from "@/utils/feedback";

import BusinessDatePicker from "@/components/finance/BusinessDatePicker/BusinessDatePicker";
import CounterpartySelect from "@/components/finance/CounterpartySelect/CounterpartySelect";
import DayStatus from "@/components/finance/DayStatus/DayStatus";
import ConfirmActionModal from "@/components/feedback/ConfirmActionModal/ConfirmActionModal";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import TarleOperationForms from "./components/TarleOperationForms/TarleOperationForms";
import TarleIncomingTable from "./components/TarleIncomingTable/TarleIncomingTable";
import TarleOutgoingTable from "./components/TarleOutgoingTable/TarleOutgoingTable";
import TarleDailySummary from "./components/TarleDailySummary/TarleDailySummary";

import { useTarlePage } from "./hooks/useTarlePage";

import styles from "./Tarle.module.css";

const { Title, Text } = Typography;

export default function Tarle() {
  const {
    selectedDate,
    setSelectedDate,

    counterpartyFilter,
    setCounterpartyFilter,

    products,
    businessDay,
    isClosed,

    productsLoading,
    incomingLoading,
    outgoingLoading,
    dailyLoading,
    businessDayLoading,

    productsError,
    incomingError,
    outgoingError,
    dailyError,
    businessDayError,

    refreshProducts,
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
  } = useTarlePage();

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  const isDayActionDisabled =
    businessDayLoading || Boolean(businessDayError) || !businessDay || isClosed;

  const isCreateDisabled =
    isDayActionDisabled ||
    productsLoading ||
    Boolean(productsError) ||
    products.length === 0;

  const handleDateChange = (nextDate) => {
    setCancelTarget(null);
    setCancelReason("");
    setCancelError("");

    setCounterpartyFilter(null);
    setSelectedDate(nextDate);
  };

  const openCancelModal = (type, operation) => {
    setCancelTarget({
      type,
      operation,
    });

    setCancelReason("");
    setCancelError("");
  };

  const closeCancelModal = () => {
    if (cancelLoading) {
      return;
    }

    setCancelTarget(null);
    setCancelReason("");
    setCancelError("");
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget || cancelLoading) {
      return;
    }

    const reason = cancelReason.trim();

    if (!reason) {
      setCancelError("Укажите причину отмены");
      return;
    }

    if (reason.length > 500) {
      setCancelError("Причина отмены не может быть длиннее 500 символов");
      return;
    }

    setCancelLoading(true);
    setCancelError("");

    try {
      if (cancelTarget.type === "incoming") {
        await cancelTarleIncoming(cancelTarget.operation.id, reason);

        await refreshCurrentIncomingAndDaily();

        showSuccess("Приход TARLE отменён");
      } else {
        await cancelTarleOutgoing(cancelTarget.operation.id, reason);

        await refreshCurrentOutgoingAndDaily();

        showSuccess("Исход TARLE отменён");
      }

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
            TARLE
          </Title>

          <Text type="secondary">Приходы, исходы и расчёты по продуктам</Text>
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

      {productsError ? (
        <Alert
          type="error"
          showIcon
          message="Не удалось загрузить продукты TARLE"
          description={productsError}
          action={
            <Button
              size="small"
              loading={productsLoading}
              onClick={refreshProducts}
            >
              Повторить
            </Button>
          }
        />
      ) : null}

      {!productsError && !productsLoading && products.length === 0 ? (
        <Alert
          type="warning"
          showIcon
          message="Нет доступных продуктов TARLE"
          description="Создание операций недоступно, пока в backend нет активных продуктов."
        />
      ) : null}

      <TarleOperationForms
        key={date}
        date={date}
        products={products}
        productsLoading={productsLoading}
        disabled={isCreateDisabled}
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
            ПРИХОДЫ
          </Title>
        </div>

        <TarleIncomingTable
          operations={incomings}
          loading={incomingLoading}
          error={incomingError}
          actionsDisabled={isDayActionDisabled}
          onRetry={refreshIncoming}
          onCancel={(operation) => openCancelModal("incoming", operation)}
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <Title level={4} className={styles.sectionTitle}>
            ИСХОДЫ
          </Title>
        </div>

        <TarleOutgoingTable
          operations={outgoings}
          loading={outgoingLoading}
          error={outgoingError}
          actionsDisabled={isDayActionDisabled}
          onRetry={refreshOutgoing}
          onCancel={(operation) => openCancelModal("outgoing", operation)}
        />
      </section>

      <section className={styles.section}>
        <TarleDailySummary
          daily={dailySummary}
          loading={dailyLoading}
          error={dailyError}
          onRetry={refreshDaily}
        />
      </section>

      <ConfirmActionModal
        open={Boolean(cancelTarget)}
        title={
          cancelTarget?.type === "incoming"
            ? "Отменить приход TARLE?"
            : "Отменить исход TARLE?"
        }
        confirmText="Отменить операцию"
        danger
        loading={cancelLoading}
        onConfirm={handleCancelConfirm}
        onCancel={closeCancelModal}
        description={
          cancelTarget ? (
            <div className={styles.cancelContent}>
              <div className={styles.cancelDetails}>
                <div>
                  <span>Человек</span>
                  <strong>
                    {cancelTarget.operation.counterparty?.name || "—"}
                  </strong>
                </div>

                <div>
                  <span>Продукт</span>
                  <strong>
                    {cancelTarget.operation.product?.name ||
                      cancelTarget.operation.product?.code ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>Сумма</span>
                  <strong>
                    <MoneyText
                      value={cancelTarget.operation.amount}
                      currency="сум"
                    />
                  </strong>
                </div>
              </div>

              <Typography.Paragraph
                type="secondary"
                className={styles.cancelDescription}
              >
                После отмены операция исчезнет из рабочего списка, но останется
                в истории.
              </Typography.Paragraph>

              <label className={styles.cancelReason}>
                <span>Причина отмены *</span>

                <Input.TextArea
                  value={cancelReason}
                  disabled={cancelLoading}
                  maxLength={500}
                  showCount
                  autoSize={{
                    minRows: 3,
                    maxRows: 5,
                  }}
                  status={cancelError ? "error" : undefined}
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
                <Alert type="error" showIcon title={cancelError} />
              ) : null}
            </div>
          ) : null
        }
      />
    </div>
  );
}
