import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Button, Input, Typography } from "antd";

import { createCashExpense } from "@/api/cash";
import { normalizeApiError } from "@/api/errors";

import CounterpartySelect from "@/components/finance/CounterpartySelect/CounterpartySelect";
import CurrencySelect from "@/components/finance/CurrencySelect/CurrencySelect";
import MoneyInput from "@/components/finance/MoneyInput/MoneyInput";

import { useFormKeyboardNavigation } from "@/hooks/useFormKeyboardNavigation";
import { showSuccess } from "@/utils/feedback";

import styles from "./CashExpenseForm.module.css";

const { TextArea } = Input;
const { Text } = Typography;

const EMPTY_FORM = {
  counterpartyId: null,
  currency: null,
  amount: "",
  comment: "",
};

function getExpenseErrorMessage(error) {
  const normalized = normalizeApiError(error);

  if (normalized.code === "insufficient_cash_balance") {
    return "Недостаточно средств в кассе.";
  }

  return normalized.message || "Не удалось добавить расход из кассы.";
}

const CashExpenseForm = forwardRef(function CashExpenseForm(
  { operationDate, onCreated, onFirstFieldTab },
  ref
) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fields = useMemo(
    () => ["counterparty", "currency", "amount", "comment"],
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

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setSubmitError("");
  };

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    if (!form.currency) {
      setSubmitError("Выберите валюту.");
      return;
    }

    if (!form.amount) {
      setSubmitError("Введите сумму.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    let savedSuccessfully = false;

    try {
      await createCashExpense({
        currency: form.currency,
        amount: form.amount,
        counterparty_id: form.counterpartyId ?? null,
        operation_date: operationDate,
        comment: form.comment.trim(),
      });

      showSuccess("Расход добавлен");

      resetForm();

      savedSuccessfully = true;

      await onCreated?.();
    } catch (error) {
      setSubmitError(getExpenseErrorMessage(error));
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

  const handleCounterpartyChange = (value) => {
    updateField("counterpartyId", value);
  };

  const handleCounterpartySelect = (value) => {
    updateField("counterpartyId", value);

    window.requestAnimationFrame(() => {
      navigation.focusNext("counterparty");
    });
  };

  const handleCurrencyChange = (value) => {
    updateField("currency", value);
  };

  const handleCurrencySelect = (value) => {
    updateField("currency", value);

    window.requestAnimationFrame(() => {
      navigation.focusNext("currency");
    });
  };

  return (
    <div className={styles.root}>
      <div className={styles.field}>
        <Text className={styles.label}>Человек</Text>

        <CounterpartySelect
          ref={navigation.registerField("counterparty")}
          value={form.counterpartyId}
          onChange={handleCounterpartyChange}
          onSelect={handleCounterpartySelect}
          allowClear
          placeholder="Выберите человека"
          disabled={submitting}
          onKeyDownCapture={(event) => {
            if (event.key !== "Tab" || !onFirstFieldTab) {
              return;
            }

            event.preventDefault();
            event.stopPropagation();

            onFirstFieldTab();
          }}
        />
      </div>

      <div className={styles.field}>
        <Text className={styles.label}>Валюта</Text>

        <CurrencySelect
          ref={navigation.registerField("currency")}
          value={form.currency}
          onChange={handleCurrencyChange}
          onSelect={handleCurrencySelect}
          acceptSelectedOnEnter={false}
          disabled={submitting}
        />
      </div>

      <div className={styles.field}>
        <Text className={styles.label}>Сумма</Text>

        <MoneyInput
          ref={navigation.registerField("amount")}
          value={form.amount}
          onChange={(value) => updateField("amount", value)}
          onKeyDown={navigation.getEnterKeyDown("amount")}
          allowDecimal
          allowZero={false}
          disabled={submitting}
          placeholder="0"
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
          disabled={submitting}
          placeholder="Комментарий"
          autoSize={{
            minRows: 1,
            maxRows: 3,
          }}
        />
      </div>

      <Button
        type="primary"
        loading={submitting}
        onClick={handleSubmit}
        className={styles.submit}
      >
        Добавить
      </Button>

      {submitError ? (
        <Text type="danger" className={styles.error}>
          {submitError}
        </Text>
      ) : null}
    </div>
  );
});

export default CashExpenseForm;
