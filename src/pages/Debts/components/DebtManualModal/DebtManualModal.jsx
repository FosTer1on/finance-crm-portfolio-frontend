import { useState } from "react";

import { DatePicker, Input, Modal, Select } from "antd";

import dayjs from "dayjs";

import { createManualDebt } from "@/api/debts";
import { normalizeApiError } from "@/api/errors";

import BusinessDatePicker from "@/components/finance/BusinessDatePicker/BusinessDatePicker";
import CounterpartySelect from "@/components/finance/CounterpartySelect/CounterpartySelect";
import CurrencySelect from "@/components/finance/CurrencySelect/CurrencySelect";
import MoneyInput from "@/components/finance/MoneyInput/MoneyInput";

import { showSuccess } from "@/utils/feedback";

import styles from "../DebtModals.module.css";

const { TextArea } = Input;

const DIRECTION_OPTIONS = [
  {
    value: "THEY_OWE_US",
    label: "Он должен нам",
  },
  {
    value: "WE_OWE_THEM",
    label: "Мы должны ему",
  },
];

function isPositiveDecimalString(value) {
  const normalized = String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(",", ".");

  if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
    return false;
  }

  const digits = normalized.replace(".", "");

  return digits.replace(/^0+/, "") !== "";
}

export default function DebtManualModal({
  initialCounterpartyId = null,
  onCancel,
  onSuccess,
}) {
  const [counterpartyId, setCounterpartyId] = useState(initialCounterpartyId);

  const [direction, setDirection] = useState("THEY_OWE_US");

  const [currency, setCurrency] = useState("UZS");

  const [amount, setAmount] = useState("");

  const [sourceDate, setSourceDate] = useState(dayjs());

  const [dueDate, setDueDate] = useState(null);

  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    if (!counterpartyId) {
      setError("Выберите человека.");
      return;
    }

    if (!direction) {
      setError("Выберите направление долга.");
      return;
    }

    if (!currency) {
      setError("Выберите валюту.");
      return;
    }

    if (!isPositiveDecimalString(amount)) {
      setError("Введите сумму больше нуля.");
      return;
    }

    if (!sourceDate) {
      setError("Выберите дату долга.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const debt = await createManualDebt({
        counterparty_id: counterpartyId,
        direction,
        currency,
        amount,
        source_date: sourceDate.format("YYYY-MM-DD"),
        due_date: dueDate ? dueDate.format("YYYY-MM-DD") : null,
        comment: comment.trim(),
      });

      showSuccess("Ручной долг создан");

      await onSuccess?.({
        debt,
        counterpartyId,
      });

      onCancel?.();
    } catch (requestError) {
      const normalized = normalizeApiError(requestError);

      setError(normalized.message || "Не удалось создать ручной долг.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open
      title="Ручной долг"
      okText="Создать долг"
      cancelText="Отмена"
      confirmLoading={submitting}
      onOk={handleSubmit}
      onCancel={() => {
        if (!submitting) {
          onCancel?.();
        }
      }}
      destroyOnHidden
    >
      <div className={styles.form}>
        {error ? <div className={styles.error}>{error}</div> : null}

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Человек</span>

          <CounterpartySelect
            className={styles.fullWidth}
            value={counterpartyId}
            onChange={(value) => {
              setCounterpartyId(value);
              setError("");
            }}
            placeholder="Выберите человека"
            disabled={submitting}
          />
        </div>

        <div className={styles.twoColumns}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Направление</span>

            <Select
              className={styles.fullWidth}
              value={direction}
              options={DIRECTION_OPTIONS}
              onChange={(value) => {
                setDirection(value);
                setError("");
              }}
              disabled={submitting}
            />
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Валюта</span>

            <CurrencySelect
              className={styles.fullWidth}
              value={currency}
              onChange={(value) => {
                setCurrency(value);
                setError("");
              }}
              disabled={submitting}
            />
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Сумма</span>

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
            suffix={currency}
          />
        </div>

        <div className={styles.twoColumns}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Дата</span>

            <BusinessDatePicker
              value={sourceDate}
              onChange={(value) => {
                setSourceDate(value);
                setError("");
              }}
              disabled={submitting}
            />
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Срок оплаты</span>

            <DatePicker
              className={styles.fullWidth}
              value={dueDate}
              onChange={setDueDate}
              disabled={submitting}
              allowClear
              format="DD.MM.YYYY"
              placeholder="Не указан"
            />
          </div>
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
