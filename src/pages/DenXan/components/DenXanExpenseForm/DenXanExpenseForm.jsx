import { useState } from "react";

import { Button, Input, Typography } from "antd";

import { createDenXanExpense } from "@/api/denXan";
import { normalizeApiError } from "@/api/errors";

import MoneyInput from "@/components/finance/MoneyInput/MoneyInput";

import { useFormKeyboardNavigation } from "@/hooks/useFormKeyboardNavigation";

import { showSuccess } from "@/utils/feedback";

import styles from "./DenXanExpenseForm.module.css";

const { TextArea } = Input;
const { Text } = Typography;

const EMPTY_FORM = {
  amount: "",
  comment: "",
};

export default function DenXanExpenseForm({
  date,
  accounts,
  disabled = false,
  refreshCurrentExpenseData,
}) {
  const [form, setForm] = useState(EMPTY_FORM);

  const [submitting, setSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState("");

  const activeAccounts = accounts.filter(
    (account) => account.is_active !== false
  );

  // Пока у DEN XAN один активный банковский счёт.
  // При появлении второго счёта нужно вернуть
  // явный выбор счёта в форме.
  const automaticAccount =
    activeAccounts.length === 1 ? activeAccounts[0] : null;

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
    if (disabled || submitting) {
      return;
    }

    if (!automaticAccount) {
      setSubmitError(
        activeAccounts.length > 1
          ? "Для DEN XAN найдено несколько активных счетов. Нужно включить выбор счёта."
          : "Активный счёт DEN XAN не найден."
      );
      return;
    }

    if (!form.amount) {
      setSubmitError("Введите сумму расхода.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    let savedSuccessfully = false;

    try {
      await createDenXanExpense({
        account_id: automaticAccount.id,
        amount: form.amount,
        operation_date: date,
        comment: form.comment.trim(),
      });

      showSuccess("Расход DEN XAN сохранён");

      resetForm();

      savedSuccessfully = true;

      await refreshCurrentExpenseData();
    } catch (error) {
      const normalized = normalizeApiError(error);

      setSubmitError(normalized.message || "Не удалось сохранить расход.");
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
    fields: ["amount", "comment"],
    onSubmit: handleSubmit,
  });

  return (
    <div className={styles.root}>
      <div className={styles.field}>
        <MoneyInput
          ref={navigation.registerField("amount")}
          value={form.amount}
          onChange={(value) => updateField("amount", value)}
          allowDecimal
          allowZero={false}
          disabled={disabled || submitting}
          placeholder="Сумма расхода"
          onKeyDown={navigation.getEnterKeyDown("amount")}
        />
      </div>

      <div className={`${styles.field} ${styles.comment}`}>
        <TextArea
          ref={navigation.registerField("comment")}
          value={form.comment}
          onChange={(event) => updateField("comment", event.target.value)}
          disabled={disabled || submitting}
          placeholder="Комментарий"
          autoSize={{
            minRows: 1,
            maxRows: 3,
          }}
          onKeyDown={navigation.getEnterKeyDown("comment", {
            submitOnEnter: true,
            multiline: true,
          })}
        />
      </div>

      <Button
        type="primary"
        loading={submitting}
        disabled={disabled || submitting}
        onClick={handleSubmit}
        className={styles.saveButton}
      >
        Сохранить
      </Button>

      {submitError ? (
        <Text type="danger" className={styles.error}>
          {submitError}
        </Text>
      ) : null}
    </div>
  );
}
