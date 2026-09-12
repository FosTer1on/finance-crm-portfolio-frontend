import { useState } from "react";

import { Input, Modal } from "antd";

import dayjs from "dayjs";

import { forgiveDebt } from "@/api/debts";
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

export default function DebtForgivenessModal({ debt, onCancel, onSuccess }) {
  const [amount, setAmount] = useState("");

  const [operationDate, setOperationDate] = useState(dayjs());

  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    if (!isPositiveDecimalString(amount)) {
      setError("Введите сумму списания больше нуля.");
      return;
    }

    if (!operationDate) {
      setError("Выберите дату операции.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const adjustment = await forgiveDebt(debt.id, {
        amount,
        operation_date: operationDate.format("YYYY-MM-DD"),
        comment: comment.trim(),
      });

      showSuccess("Остаток списан");

      await onSuccess?.({
        adjustment,
        debt,
      });

      onCancel?.();
    } catch (requestError) {
      const normalized = normalizeApiError(requestError);

      setError(normalized.message || "Не удалось списать остаток.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open
      title={`Списание остатка — ${debt.counterparty?.name ?? ""}`}
      okText="Списать"
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
          <span className={styles.debtInfoLabel}>Человек</span>

          <span className={styles.debtInfoValue}>
            {debt.counterparty?.name ?? "—"}
          </span>

          <span className={styles.debtInfoLabel}>Направление</span>

          <span className={styles.debtInfoValue}>
            {DIRECTION_LABELS[debt.direction] ?? debt.direction}
          </span>

          <span className={styles.debtInfoLabel}>Текущий остаток</span>

          <span className={styles.debtInfoValue}>
            <MoneyText value={debt.remaining_amount} currency={debt.currency} />
          </span>

          <span className={styles.debtInfoLabel}>Валюта</span>

          <span className={styles.debtInfoValue}>{debt.currency}</span>
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Сумма списания</span>

          <MoneyInput
            value={amount}
            onChange={(value) => {
              setAmount(value);
              setError("");
            }}
            allowDecimal
            allowZero={false}
            disabled={submitting}
            placeholder="0"
            suffix={debt.currency}
          />

          <span className={styles.hint}>
            Допустимость суммы проверяет backend. Frontend автоматически остатки
            не списывает.
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
          <span className={styles.fieldLabel}>Причина / комментарий</span>

          <TextArea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            disabled={submitting}
            placeholder="Причина списания"
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
