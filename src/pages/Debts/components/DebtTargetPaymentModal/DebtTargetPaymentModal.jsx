import { useState } from "react";

import { Input, Modal } from "antd";

import dayjs from "dayjs";

import { payDebt } from "@/api/debts";
import { normalizeApiError } from "@/api/errors";

import BusinessDatePicker from "@/components/finance/BusinessDatePicker/BusinessDatePicker";
import MoneyInput from "@/components/finance/MoneyInput/MoneyInput";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import { showSuccess } from "@/utils/feedback";

import styles from "../DebtModals.module.css";

const { TextArea } = Input;

const DIRECTION_LABELS = {
  THEY_OWE_US: "Он должен нам",
  WE_OWE_THEM: "Мы должны ему",
};

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

export default function DebtTargetPaymentModal({ debt, onCancel, onSuccess }) {
  const [uzsAmount, setUzsAmount] = useState("");

  const [usdAmount, setUsdAmount] = useState("");

  const [exchangeRate, setExchangeRate] = useState("");

  const [operationDate, setOperationDate] = useState(dayjs());

  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    const payments = [];

    if (isPositiveDecimalString(uzsAmount)) {
      payments.push({
        currency: "UZS",
        amount: uzsAmount,
      });
    }

    if (isPositiveDecimalString(usdAmount)) {
      payments.push({
        currency: "USD",
        amount: usdAmount,
      });
    }

    if (payments.length === 0) {
      setError("Введите физически переданную сумму.");
      return;
    }

    if (!operationDate) {
      setError("Выберите дату операции.");
      return;
    }

    if (exchangeRate && !isPositiveDecimalString(exchangeRate)) {
      setError("Курс должен быть больше нуля.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        operation_date: operationDate.format("YYYY-MM-DD"),
        payments,
        comment: comment.trim(),
      };

      if (isPositiveDecimalString(exchangeRate)) {
        payload.exchange_rate = exchangeRate;
      }

      const payment = await payDebt(debt.id, payload);

      showSuccess("Погашение выполнено");

      await onSuccess?.({
        payment,
        debt,
      });

      onCancel?.();
    } catch (requestError) {
      const normalized = normalizeApiError(requestError);

      setError(normalized.message || "Не удалось погасить долг.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open
      title={`Погашение долга — ${debt.counterparty?.name ?? ""}`}
      okText="Подтвердить"
      cancelText="Отмена"
      confirmLoading={submitting}
      onOk={handleSubmit}
      onCancel={() => {
        if (!submitting) {
          onCancel?.();
        }
      }}
      destroyOnHidden
      width={560}
    >
      <div className={styles.form}>
        {error ? <div className={styles.error}>{error}</div> : null}

        <div className={styles.debtInfo}>
          <span className={styles.debtInfoLabel}>Направление</span>

          <span className={styles.debtInfoValue}>
            {DIRECTION_LABELS[debt.direction] ?? debt.direction}
          </span>

          <span className={styles.debtInfoLabel}>Изначально</span>

          <span className={styles.debtInfoValue}>
            <MoneyText value={debt.original_amount} currency={debt.currency} />
          </span>

          <span className={styles.debtInfoLabel}>Остаток</span>

          <span className={styles.debtInfoValue}>
            <MoneyText value={debt.remaining_amount} currency={debt.currency} />
          </span>
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Физически передано — UZS</span>

          <MoneyInput
            value={uzsAmount}
            onChange={(value) => {
              setUzsAmount(value);
              setError("");
            }}
            allowDecimal
            allowZero={false}
            disabled={submitting}
            placeholder="0"
            suffix="UZS"
          />
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Физически передано — USD</span>

          <MoneyInput
            value={usdAmount}
            onChange={(value) => {
              setUsdAmount(value);
              setError("");
            }}
            allowDecimal
            allowZero={false}
            disabled={submitting}
            placeholder="0"
            suffix="USD"
          />
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
            placeholder="Можно оставить пустым"
          />

          <span className={styles.hint}>
            Курс нужен только если одна валюта физически закрывает долг в другой
            валюте.
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
