import { useState } from "react";

import { Input, Modal } from "antd";

import dayjs from "dayjs";

import { convertDebt } from "@/api/debts";
import { normalizeApiError } from "@/api/errors";

import BusinessDatePicker from "@/components/finance/BusinessDatePicker/BusinessDatePicker";
import MoneyInput from "@/components/finance/MoneyInput/MoneyInput";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import { showSuccess } from "@/utils/feedback";

import styles from "../DebtModals.module.css";

const { TextArea } = Input;

function isPositiveDecimalString(value) {
  const normalized = String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(",", ".");

  if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
    return false;
  }

  return normalized.replace(".", "").replace(/^0+/, "") !== "";
}

export default function DebtConversionModal({ debt, onCancel, onSuccess }) {
  const targetCurrency = debt.currency === "UZS" ? "USD" : "UZS";

  const [exchangeRate, setExchangeRate] = useState("");

  const [operationDate, setOperationDate] = useState(dayjs());

  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    if (!isPositiveDecimalString(exchangeRate)) {
      setError("Введите курс UZS за 1 USD.");
      return;
    }

    if (!operationDate) {
      setError("Выберите дату операции.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const conversion = await convertDebt(debt.id, {
        to_currency: targetCurrency,
        uzs_per_usd: exchangeRate,
        operation_date: operationDate.format("YYYY-MM-DD"),
        comment: comment.trim(),
      });

      showSuccess("Долг конвертирован");

      await onSuccess?.({
        conversion,
        debt,
      });

      onCancel?.();
    } catch (requestError) {
      const normalized = normalizeApiError(requestError);

      setError(normalized.message || "Не удалось конвертировать долг.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open
      title={`Конвертация долга — ${debt.counterparty?.name ?? ""}`}
      okText="Конвертировать"
      cancelText="Отмена"
      confirmLoading={submitting}
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

        <div className={styles.debtInfo}>
          <span className={styles.debtInfoLabel}>Текущий долг</span>

          <span className={styles.debtInfoValue}>
            <MoneyText value={debt.remaining_amount} currency={debt.currency} />
          </span>

          <span className={styles.debtInfoLabel}>Текущая валюта</span>

          <span className={styles.debtInfoValue}>{debt.currency}</span>

          <span className={styles.debtInfoLabel}>Новая валюта</span>

          <span className={styles.debtInfoValue}>{targetCurrency}</span>
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Курс UZS за 1 USD</span>

          <MoneyInput
            value={exchangeRate}
            onChange={(value) => {
              setExchangeRate(value);
              setError("");
            }}
            allowDecimal
            allowZero={false}
            disabled={submitting}
            placeholder="Например: 12000"
          />

          <span className={styles.hint}>
            Итоговую сумму в новой валюте рассчитывает backend.
          </span>
        </div>

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
