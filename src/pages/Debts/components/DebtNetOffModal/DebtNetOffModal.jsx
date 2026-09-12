import { useMemo, useState } from "react";

import { Input, Modal, Radio } from "antd";

import dayjs from "dayjs";

import { netOffDebts } from "@/api/debts";
import { normalizeApiError } from "@/api/errors";

import BusinessDatePicker from "@/components/finance/BusinessDatePicker/BusinessDatePicker";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import { showSuccess } from "@/utils/feedback";

import styles from "../DebtModals.module.css";

const { TextArea } = Input;

function hasPositiveAmount(value) {
  const normalized = String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/^[-+]/, "")
    .replace(".", "")
    .replace(/^0+/, "");

  return normalized !== "";
}

function hasMutualInCurrency(summary, currency) {
  const currencySummary = summary?.[currency];

  return (
    hasPositiveAmount(currencySummary?.they_owe_us) &&
    hasPositiveAmount(currencySummary?.we_owe_them)
  );
}

export default function DebtNetOffModal({
  counterparty,
  summary,
  onCancel,
  onSuccess,
}) {
  const availableCurrencies = useMemo(
    () =>
      ["UZS", "USD"].filter((currency) =>
        hasMutualInCurrency(summary, currency)
      ),
    [summary]
  );

  const [currency, setCurrency] = useState(availableCurrencies[0] ?? null);

  const [operationDate, setOperationDate] = useState(dayjs());

  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const currentSummary = currency != null ? summary?.[currency] : null;

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    if (!counterparty?.id) {
      setError("Не выбран человек.");
      return;
    }

    if (!currency) {
      setError("Нет валюты со встречными обязательствами.");
      return;
    }

    if (!operationDate) {
      setError("Выберите дату операции.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const netOff = await netOffDebts({
        counterparty_id: counterparty.id,
        currency,
        operation_date: operationDate.format("YYYY-MM-DD"),
        comment: comment.trim(),
      });

      showSuccess("Взаимозачёт выполнен");

      await onSuccess?.({
        netOff,
        counterpartyId: counterparty.id,
      });

      onCancel?.();
    } catch (requestError) {
      const normalized = normalizeApiError(requestError);

      setError(normalized.message || "Не удалось выполнить взаимозачёт.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open
      title={`Взаимозачёт — ${counterparty?.name ?? ""}`}
      okText="Выполнить взаимозачёт"
      cancelText="Отмена"
      confirmLoading={submitting}
      okButtonProps={{
        disabled: availableCurrencies.length === 0,
      }}
      onOk={handleSubmit}
      onCancel={() => {
        if (!submitting) {
          onCancel?.();
        }
      }}
      destroyOnHidden
      width={540}
    >
      <div className={styles.form}>
        {error ? <div className={styles.error}>{error}</div> : null}

        {availableCurrencies.length > 1 ? (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Валюта</span>

            <Radio.Group
              value={currency}
              onChange={(event) => {
                setCurrency(event.target.value);
                setError("");
              }}
              disabled={submitting}
            >
              {availableCurrencies.map((item) => (
                <Radio key={item} value={item}>
                  {item}
                </Radio>
              ))}
            </Radio.Group>
          </div>
        ) : null}

        {currency ? (
          <>
            <div className={styles.debtInfo}>
              <span className={styles.debtInfoLabel}>Валюта</span>

              <span className={styles.debtInfoValue}>{currency}</span>

              <span className={styles.debtInfoLabel}>Нам должны</span>

              <span className={styles.debtInfoValue}>
                <MoneyText
                  value={currentSummary?.they_owe_us ?? "0.00"}
                  currency={currency}
                />
              </span>

              <span className={styles.debtInfoLabel}>Мы должны</span>

              <span className={styles.debtInfoValue}>
                <MoneyText
                  value={currentSummary?.we_owe_them ?? "0.00"}
                  currency={currency}
                />
              </span>
            </div>

            <div className={styles.hint}>
              Backend взаимозачтёт максимально возможную сумму. Фактическая
              сумма операции будет взята из ответа backend.
            </div>
          </>
        ) : (
          <div className={styles.hint}>
            У человека нет встречных обязательств в одной валюте.
          </div>
        )}

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Дата операции</span>

          <BusinessDatePicker
            value={operationDate}
            onChange={(value) => {
              setOperationDate(value);
              setError("");
            }}
            disabled={submitting}
          />
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Комментарий</span>

          <TextArea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            disabled={submitting}
            placeholder="Комментарий"
            maxLength={500}
            autoSize={{
              minRows: 2,
              maxRows: 4,
            }}
          />
        </div>
      </div>
    </Modal>
  );
}
