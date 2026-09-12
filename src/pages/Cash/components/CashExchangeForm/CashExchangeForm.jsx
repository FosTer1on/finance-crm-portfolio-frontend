import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Button, Input, Typography } from "antd";

import { createCashExchange } from "@/api/cash";
import { normalizeApiError } from "@/api/errors";

import CounterpartySelect from "@/components/finance/CounterpartySelect/CounterpartySelect";
import CurrencySelect from "@/components/finance/CurrencySelect/CurrencySelect";
import MoneyInput from "@/components/finance/MoneyInput/MoneyInput";

import { useFormKeyboardNavigation } from "@/hooks/useFormKeyboardNavigation";
import { showSuccess } from "@/utils/feedback";

import styles from "./CashExchangeForm.module.css";

const { TextArea } = Input;
const { Text } = Typography;

const EMPTY_FORM = {
  counterpartyId: null,
  fromCurrency: null,
  fromAmount: "",
  toCurrency: null,
  toAmount: "",
  declaredRate: "",
  comment: "",
};

function getOppositeCurrency(currency) {
  if (currency === "UZS") {
    return "USD";
  }

  if (currency === "USD") {
    return "UZS";
  }

  return null;
}

function getExchangeErrorMessage(error) {
  const normalized = normalizeApiError(error);

  if (normalized.code === "insufficient_cash_balance") {
    return "Недостаточно средств в кассе.";
  }

  return normalized.message || "Не удалось выполнить обмен валюты.";
}

const CashExchangeForm = forwardRef(function CashExchangeForm(
  { operationDate, onCreated },
  ref
) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fields = useMemo(
    () => [
      "counterparty",
      "fromCurrency",
      "fromAmount",
      "toCurrency",
      "toAmount",
      "declaredRate",
      "comment",
    ],
    []
  );

  const updateField = (fieldName, value) => {
    setForm((current) => ({
      ...current,
      [fieldName]: value,
    }));

    if (submitError) {
      setSubmitError("");
    }
  };

  const handleFromCurrencyChange = (value) => {
    setForm((current) => ({
      ...current,
      fromCurrency: value,
      toCurrency:
        value && current.toCurrency === value
          ? getOppositeCurrency(value)
          : current.toCurrency,
    }));

    setSubmitError("");
  };

  const handleFromCurrencySelect = (value) => {
    setForm((current) => ({
      ...current,
      fromCurrency: value,
      toCurrency:
        !current.toCurrency || current.toCurrency === value
          ? getOppositeCurrency(value)
          : current.toCurrency,
    }));

    setSubmitError("");

    window.requestAnimationFrame(() => {
      navigation.focusNext("fromCurrency");
    });
  };

  const handleToCurrencyChange = (value) => {
    setForm((current) => ({
      ...current,
      toCurrency: value,
      fromCurrency:
        value && current.fromCurrency === value
          ? getOppositeCurrency(value)
          : current.fromCurrency,
    }));

    setSubmitError("");
  };

  const handleToCurrencySelect = (value) => {
    setForm((current) => ({
      ...current,
      toCurrency: value,
      fromCurrency:
        !current.fromCurrency || current.fromCurrency === value
          ? getOppositeCurrency(value)
          : current.fromCurrency,
    }));

    setSubmitError("");

    window.requestAnimationFrame(() => {
      navigation.focusNext("toCurrency");
    });
  };

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    if (!form.fromCurrency) {
      setSubmitError("Выберите валюту, которую отдаём.");
      return;
    }

    if (!form.fromAmount) {
      setSubmitError("Введите сумму, которую отдаём.");
      return;
    }

    if (!form.toCurrency) {
      setSubmitError("Выберите валюту, которую получаем.");
      return;
    }

    if (!form.toAmount) {
      setSubmitError("Введите сумму, которую получаем.");
      return;
    }

    if (form.fromCurrency === form.toCurrency) {
      setSubmitError("Валюты обмена должны отличаться.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    let savedSuccessfully = false;

    try {
      await createCashExchange({
        counterparty_id: form.counterpartyId ?? null,
        from_currency: form.fromCurrency,
        from_amount: form.fromAmount,
        to_currency: form.toCurrency,
        to_amount: form.toAmount,
        declared_rate: form.declaredRate || null,
        operation_date: operationDate,
        comment: form.comment.trim(),
      });

      setForm(EMPTY_FORM);

      showSuccess("Обмен выполнен");

      savedSuccessfully = true;

      await onCreated?.();
    } catch (error) {
      setSubmitError(getExchangeErrorMessage(error));
    } finally {
      setSubmitting(false);

      if (savedSuccessfully) {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            navigation.focusFirst();
          });
        });
      }
    }
  };

  const navigation = useFormKeyboardNavigation({
    fields,
    onSubmit: handleSubmit,
  });

  useImperativeHandle(
    ref,
    () => ({
      focusFirst: navigation.focusFirst,
    }),
    [navigation.focusFirst]
  );

  return (
    <div className={styles.root}>
      <div className={styles.field}>
        <Text className={styles.label}>Человек</Text>

        <CounterpartySelect
          ref={navigation.registerField("counterparty")}
          value={form.counterpartyId}
          onChange={(value) => updateField("counterpartyId", value)}
          onSelect={(value) => {
            updateField("counterpartyId", value);

            window.requestAnimationFrame(() => {
              navigation.focusNext("counterparty");
            });
          }}
          allowClear
          placeholder="Выберите человека"
          disabled={submitting}
        />
      </div>

      <div className={styles.field}>
        <Text className={styles.label}>Отдаём</Text>

        <CurrencySelect
          ref={navigation.registerField("fromCurrency")}
          value={form.fromCurrency}
          onChange={handleFromCurrencyChange}
          onSelect={handleFromCurrencySelect}
          acceptSelectedOnEnter={false}
          disabled={submitting}
        />
      </div>

      <div className={styles.field}>
        <Text className={styles.label}>Сумма</Text>

        <MoneyInput
          ref={navigation.registerField("fromAmount")}
          value={form.fromAmount}
          onChange={(value) => updateField("fromAmount", value)}
          onKeyDown={navigation.getEnterKeyDown("fromAmount")}
          allowDecimal
          allowZero={false}
          disabled={submitting}
          placeholder="0"
        />
      </div>

      <div className={styles.field}>
        <Text className={styles.label}>Получаем</Text>

        <CurrencySelect
          ref={navigation.registerField("toCurrency")}
          value={form.toCurrency}
          onChange={handleToCurrencyChange}
          onSelect={handleToCurrencySelect}
          acceptSelectedOnEnter={false}
          disabled={submitting}
        />
      </div>

      <div className={styles.field}>
        <Text className={styles.label}>Сумма</Text>

        <MoneyInput
          ref={navigation.registerField("toAmount")}
          value={form.toAmount}
          onChange={(value) => updateField("toAmount", value)}
          onKeyDown={navigation.getEnterKeyDown("toAmount")}
          allowDecimal
          allowZero={false}
          disabled={submitting}
          placeholder="0"
        />
      </div>

      <div className={styles.field}>
        <Text className={styles.label}>Курс</Text>

        <MoneyInput
          ref={navigation.registerField("declaredRate")}
          value={form.declaredRate}
          onChange={(value) => updateField("declaredRate", value)}
          onKeyDown={navigation.getEnterKeyDown("declaredRate")}
          allowDecimal
          allowZero={false}
          disabled={submitting}
          placeholder="Необязательно"
        />
      </div>

      <div className={styles.field}>
        <Text className={styles.label}>Комментарий</Text>

        <TextArea
          ref={navigation.registerField("comment")}
          value={form.comment}
          onChange={(event) => updateField("comment", event.target.value)}
          onKeyDown={navigation.getEnterKeyDown("comment", {
            submitOnEnter: true,
            multiline: true,
          })}
          autoSize={{
            minRows: 1,
            maxRows: 3,
          }}
          disabled={submitting}
          placeholder="Комментарий"
        />
      </div>

      <Button
        type="primary"
        onClick={handleSubmit}
        loading={submitting}
        className={styles.submit}
      >
        Обменять
      </Button>

      {submitError ? (
        <Text type="danger" className={styles.error}>
          {submitError}
        </Text>
      ) : null}
    </div>
  );
});

export default CashExchangeForm;
