import { useEffect, useMemo, useState } from "react";

import { Alert, Button, Input, Modal, Space } from "antd";

import { paySpecificDebt } from "@/api/debts";
import { normalizeApiError } from "@/api/errors";

import MoneyInput from "@/components/finance/MoneyInput/MoneyInput";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import { showSuccess } from "@/utils/feedback";

import styles from "./DebtPaymentModal.module.css";

const EMPTY_AMOUNTS = {
  UZS: "",
  USD: "",
};

function hasPositiveAmount(value) {
  const amount = Number(value);

  return Number.isFinite(amount) && amount > 0;
}

export default function DebtPaymentModal({ open, debt, onClose, onSuccess }) {
  const [amounts, setAmounts] = useState(EMPTY_AMOUNTS);
  const [exchangeRate, setExchangeRate] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const debtCurrency = debt?.currency ?? "UZS";

  const otherCurrency = debtCurrency === "UZS" ? "USD" : "UZS";

  const usesOtherCurrency = hasPositiveAmount(amounts[otherCurrency]);

  const paymentComponents = useMemo(() => {
    return ["UZS", "USD"]
      .filter((currency) => hasPositiveAmount(amounts[currency]))
      .map((currency) => ({
        currency,
        amount: amounts[currency],
      }));
  }, [amounts]);

  useEffect(() => {
    if (!open || !debt) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setAmounts({ ...EMPTY_AMOUNTS });

      setExchangeRate("");
      setComment("");
      setError("");
      setSubmitting(false);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [open, debt]);

  const updateAmount = (currency, value) => {
    setAmounts((current) => ({
      ...current,
      [currency]: value,
    }));
  };

  const handlePayFull = () => {
    if (!debt) {
      return;
    }

    setAmounts({
      UZS: debt.currency === "UZS" ? debt.remaining_amount ?? "" : "",
      USD: debt.currency === "USD" ? debt.remaining_amount ?? "" : "",
    });
    setExchangeRate("");
    setError("");
  };

  const handleSubmit = async () => {
    if (!debt || submitting) {
      return;
    }

    if (paymentComponents.length === 0) {
      setError("Введите сумму погашения.");
      return;
    }

    if (usesOtherCurrency) {
      const numericRate = Number(exchangeRate);

      if (!Number.isFinite(numericRate) || numericRate <= 0) {
        setError("Для погашения в другой валюте укажите курс UZS за 1 USD.");
        return;
      }
    }

    setSubmitting(true);
    setError("");

    const payload = {
      payments: paymentComponents,
      comment: comment.trim(),
    };

    if (usesOtherCurrency) {
      payload.exchange_rate = exchangeRate;
    }

    try {
      await paySpecificDebt(debt.id, payload);

      showSuccess("Долг успешно погашен");

      onSuccess?.();
      onClose?.();
    } catch (requestError) {
      const apiError = normalizeApiError(requestError);

      setError(apiError.message || "Не удалось выполнить погашение долга");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Погашение долга"
      onCancel={submitting ? undefined : onClose}
      width={560}
      destroyOnHidden
      footer={
        <Space>
          <Button onClick={onClose} disabled={submitting}>
            Отмена
          </Button>

          <Button type="primary" loading={submitting} onClick={handleSubmit}>
            Погасить
          </Button>
        </Space>
      }
    >
      <div className={styles.content}>
        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span>Контрагент</span>
            <strong>{debt?.counterparty?.name ?? "—"}</strong>
          </div>

          <div className={styles.summaryRow}>
            <span>Остаток долга</span>

            <MoneyText
              value={debt?.remaining_amount ?? "0"}
              currency={debtCurrency}
            />
          </div>
        </div>

        {error && <Alert type="error" showIcon message={error} />}

        <div>
          <Button onClick={handlePayFull} disabled={submitting}>
            Погасить полностью
          </Button>
        </div>

        <div className={styles.payments}>
          <div className={styles.field}>
            <label>Оплата UZS</label>

            <MoneyInput
              value={amounts.UZS}
              onChange={(value) => updateAmount("UZS", value)}
              placeholder="Сумма UZS"
              disabled={submitting}
            />
          </div>

          <div className={styles.field}>
            <label>Оплата USD</label>

            <MoneyInput
              value={amounts.USD}
              onChange={(value) => updateAmount("USD", value)}
              placeholder="Сумма USD"
              disabled={submitting}
            />
          </div>
        </div>

        {usesOtherCurrency && (
          <div className={styles.field}>
            <label>Курс UZS за 1 USD</label>

            <MoneyInput
              value={exchangeRate}
              onChange={setExchangeRate}
              placeholder="Например: 12500"
              disabled={submitting}
            />
          </div>
        )}

        <div className={styles.field}>
          <label>Комментарий</label>

          <Input.TextArea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Комментарий"
            disabled={submitting}
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
