import { useMemo, useState } from "react";

import { Input, Modal, Radio } from "antd";

import dayjs from "dayjs";

import { settleDebts } from "@/api/debts";
import { normalizeApiError } from "@/api/errors";

import BusinessDatePicker from "@/components/finance/BusinessDatePicker/BusinessDatePicker";
import MoneyInput from "@/components/finance/MoneyInput/MoneyInput";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import { showSuccess } from "@/utils/feedback";

import styles from "../DebtModals.module.css";

const { TextArea } = Input;

const DIRECTION = {
  THEY_OWE_US: "THEY_OWE_US",
  WE_OWE_THEM: "WE_OWE_THEM",
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

function hasAmount(value) {
  return isPositiveDecimalString(String(value ?? "").replace(/\s+/g, ""));
}

function getDirectionTotals(summary, direction) {
  if (direction === DIRECTION.THEY_OWE_US) {
    return {
      UZS: summary?.UZS?.they_owe_us ?? "0.00",
      USD: summary?.USD?.they_owe_us ?? "0.00",
    };
  }

  return {
    UZS: summary?.UZS?.we_owe_them ?? "0.00",
    USD: summary?.USD?.we_owe_them ?? "0.00",
  };
}

export default function DebtSettlementModal({
  counterparty,
  summary,
  onCancel,
  onSuccess,
}) {
  const theyOweUsAvailable =
    hasAmount(summary?.UZS?.they_owe_us) ||
    hasAmount(summary?.USD?.they_owe_us);

  const weOweThemAvailable =
    hasAmount(summary?.UZS?.we_owe_them) ||
    hasAmount(summary?.USD?.we_owe_them);

  const initialDirection = theyOweUsAvailable
    ? DIRECTION.THEY_OWE_US
    : DIRECTION.WE_OWE_THEM;

  const [direction, setDirection] = useState(initialDirection);

  const [uzsAmount, setUzsAmount] = useState("");

  const [usdAmount, setUsdAmount] = useState("");

  const [exchangeRate, setExchangeRate] = useState("");

  const [operationDate, setOperationDate] = useState(dayjs());

  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const totals = useMemo(
    () => getDirectionTotals(summary, direction),
    [summary, direction]
  );

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    if (!counterparty?.id) {
      setError("Не выбран человек.");
      return;
    }

    if (!operationDate) {
      setError("Выберите дату расчёта.");
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
      setError("Введите хотя бы одну физически переданную сумму.");
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
        counterparty_id: counterparty.id,
        direction,
        payments,
        operation_date: operationDate.format("YYYY-MM-DD"),
        comment: comment.trim(),
      };

      if (isPositiveDecimalString(exchangeRate)) {
        payload.exchange_rate = exchangeRate;
      }

      const settlement = await settleDebts(payload);

      showSuccess("Расчёт выполнен");

      await onSuccess?.({
        settlement,
        counterpartyId: counterparty.id,
      });

      onCancel?.();
    } catch (requestError) {
      const normalized = normalizeApiError(requestError);

      setError(normalized.message || "Не удалось выполнить расчёт.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open
      title={`Погашение — ${counterparty?.name ?? ""}`}
      okText="Подтвердить расчёт"
      cancelText="Отмена"
      confirmLoading={submitting}
      onOk={handleSubmit}
      onCancel={() => {
        if (!submitting) {
          onCancel?.();
        }
      }}
      destroyOnHidden
      width={600}
    >
      <div className={styles.form}>
        {error ? <div className={styles.error}>{error}</div> : null}

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Направление</span>

          <Radio.Group
            value={direction}
            onChange={(event) => {
              setDirection(event.target.value);
              setError("");
            }}
            disabled={submitting}
          >
            <Radio value={DIRECTION.THEY_OWE_US} disabled={!theyOweUsAvailable}>
              Он должен нам
            </Radio>

            <Radio value={DIRECTION.WE_OWE_THEM} disabled={!weOweThemAvailable}>
              Мы должны ему
            </Radio>
          </Radio.Group>
        </div>

        <div className={styles.debtInfo}>
          <span className={styles.debtInfoLabel}>Обязательство UZS</span>

          <span className={styles.debtInfoValue}>
            <MoneyText value={totals.UZS} currency="UZS" />
          </span>

          <span className={styles.debtInfoLabel}>Обязательство USD</span>

          <span className={styles.debtInfoValue}>
            <MoneyText value={totals.USD} currency="USD" />
          </span>
        </div>

        <div className={styles.hint}>
          Ниже указываются только реальные физические деньги. Backend сам
          распределит их по долгам.
        </div>

        <div className={styles.twoColumns}>
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
            Нужен только если физическая валюта должна закрывать долг в другой
            валюте.
          </span>
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Дата расчёта</span>

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
