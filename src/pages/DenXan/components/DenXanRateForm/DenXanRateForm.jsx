import { useRef, useState } from "react";

import { Button, Typography } from "antd";

import { normalizeApiError } from "@/api/errors";
import { saveDenXanDailyRate } from "@/api/denXan";

import MoneyInput from "@/components/finance/MoneyInput/MoneyInput";

import { showSuccess } from "@/utils/feedback";

import styles from "./DenXanRateForm.module.css";

const { Text } = Typography;

function trimDecimalZeros(value) {
  if (value == null || value === "") {
    return "";
  }

  const stringValue = String(value);

  if (!stringValue.includes(".")) {
    return stringValue;
  }

  return stringValue.replace(/0+$/, "").replace(/\.$/, "");
}

export default function DenXanRateForm({
  date,
  rate,
  loading = false,
  error = "",
  disabled = false,
  onRetry,
  refreshCurrentRateData,
}) {
  const [denXanRate, setDenXanRate] = useState(() =>
    trimDecimalZeros(rate?.den_xan_rate)
  );

  const [streetRate, setStreetRate] = useState(() =>
    trimDecimalZeros(rate?.street_rate)
  );

  const [submitting, setSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState("");

  const denXanRateRef = useRef(null);
  const streetRateRef = useRef(null);

  const handleSubmit = async () => {
    if (disabled || submitting) {
      return;
    }

    if (!denXanRate || !streetRate) {
      setSubmitError("Укажите оба курса.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      await saveDenXanDailyRate({
        operation_date: date,
        den_xan_rate: denXanRate,
        street_rate: streetRate,
      });

      showSuccess("Курсы DEN XAN сохранены");

      await refreshCurrentRateData();
    } catch (requestError) {
      const normalizedError = normalizeApiError(requestError);

      setSubmitError(normalizedError.message || "Не удалось сохранить курсы.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDenXanRateKeyDown = (event) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();

    streetRateRef.current?.focus?.();
  };

  const handleStreetRateKeyDown = (event) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();

    handleSubmit();
  };

  if (error) {
    return (
      <div className={styles.error}>
        <Text type="danger">{error}</Text>

        <Button size="small" loading={loading} onClick={onRetry}>
          Повторить
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.field}>
        <Text type="secondary" className={styles.label}>
          Курс DEN XAN
        </Text>

        <MoneyInput
          ref={denXanRateRef}
          value={denXanRate}
          onChange={(value) => {
            setDenXanRate(value);

            if (submitError) {
              setSubmitError("");
            }
          }}
          allowDecimal
          allowZero={false}
          disabled={disabled || loading || submitting}
          placeholder="Введите курс"
          onKeyDown={handleDenXanRateKeyDown}
        />
      </div>

      <div className={styles.field}>
        <Text type="secondary" className={styles.label}>
          Курс улицы
        </Text>

        <MoneyInput
          ref={streetRateRef}
          value={streetRate}
          onChange={(value) => {
            setStreetRate(value);

            if (submitError) {
              setSubmitError("");
            }
          }}
          allowDecimal
          allowZero={false}
          disabled={disabled || loading || submitting}
          placeholder="Введите курс"
          onKeyDown={handleStreetRateKeyDown}
        />
      </div>

      <Button
        type="primary"
        loading={submitting}
        disabled={disabled || loading || submitting}
        onClick={handleSubmit}
        className={styles.button}
      >
        Сохранить
      </Button>

      {submitError ? (
        <Text type="danger" className={styles.submitError}>
          {submitError}
        </Text>
      ) : null}
    </div>
  );
}
