import { forwardRef, useImperativeHandle, useMemo, useState } from "react";

import { Button, Input, Select, Typography } from "antd";

import { createDenXanOutgoing } from "@/api/denXan";
import { normalizeApiError } from "@/api/errors";

import MoneyInput from "@/components/finance/MoneyInput/MoneyInput";
import PercentInput from "@/components/finance/PercentInput/PercentInput";

import { useFormKeyboardNavigation } from "@/hooks/useFormKeyboardNavigation";

import { showSuccess } from "@/utils/feedback";

import DenXanMmaAccountSelect from "../DenXanMmaAccountSelect/DenXanMmaAccountSelect";

import styles from "./DenXanOutgoingForm.module.css";

const { TextArea } = Input;
const { Text } = Typography;

const EMPTY_FORM = {
  mmaAccountId: null,
  purpose: "REGULAR",
  amount: "",
  percent: "9",
  comment: "",
};

const PURPOSE_OPTIONS = [
  {
    value: "REGULAR",
    label: "Обычный",
  },
  {
    value: "VAT",
    label: "НДС",
  },
];

const DenXanOutgoingForm = forwardRef(function DenXanOutgoingForm(
  {
    date,
    denXanAccounts,
    mmaAccounts,

    mmaAccountsLoading = false,

    disabled = false,

    refreshCurrentOutgoingData,

    onFirstFieldTab,
  },
  ref
) {
  const [form, setForm] = useState(EMPTY_FORM);

  const [submitting, setSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState("");

  const fields = useMemo(
    () => ["mmaAccount", "purpose", "amount", "percent", "comment"],
    []
  );

  // Пока DEN XAN использует один активный счёт.
  // Когда появится второй счёт, здесь возвращаем
  // отдельный DEN XAN account Select.
  const activeDenXanAccounts = denXanAccounts.filter(
    (account) => account.is_active !== false
  );

  const automaticDenXanAccount =
    activeDenXanAccounts.length === 1 ? activeDenXanAccounts[0] : null;

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

    if (!automaticDenXanAccount) {
      setSubmitError(
        activeDenXanAccounts.length > 1
          ? "Для DEN XAN найдено несколько активных счетов. Нужно включить выбор счёта."
          : "Активный счёт DEN XAN не найден."
      );
      return;
    }

    if (!form.mmaAccountId) {
      setSubmitError("Выберите счёт MMA.");
      return;
    }

    if (!form.purpose) {
      setSubmitError("Выберите тип исхода.");
      return;
    }

    if (!form.amount) {
      setSubmitError("Введите сумму исхода.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    let savedSuccessfully = false;

    try {
      const payload = {
        account_id: automaticDenXanAccount.id,
        mma_account_id: form.mmaAccountId,
        purpose: form.purpose,
        amount: form.amount,
        operation_date: date,
        comment: form.comment.trim(),
      };

      if (form.percent !== "" && form.percent != null) {
        payload.percent = form.percent;
      }

      await createDenXanOutgoing(payload);

      showSuccess("Исход DEN XAN сохранён");

      resetForm();

      savedSuccessfully = true;

      await refreshCurrentOutgoingData();
    } catch (error) {
      const normalized = normalizeApiError(error);

      setSubmitError(normalized.message || "Не удалось сохранить исход.");
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
        <DenXanMmaAccountSelect
          ref={navigation.registerField("mmaAccount")}
          value={form.mmaAccountId}
          accounts={mmaAccounts}
          loading={mmaAccountsLoading}
          disabled={disabled || submitting}
          onChange={(value) => updateField("mmaAccountId", value)}
          onKeyDownCapture={(event) => {
            if (event.key !== "Tab" || !onFirstFieldTab) {
              return;
            }

            event.preventDefault();
            event.stopPropagation();

            onFirstFieldTab();
          }}
          onSelect={() => {
            window.requestAnimationFrame(() => {
              navigation.focusNext("mmaAccount");
            });
          }}
        />
      </div>

      <div className={styles.field}>
        <Select
          ref={navigation.registerField("purpose")}
          value={form.purpose}
          options={PURPOSE_OPTIONS}
          disabled={disabled || submitting}
          onChange={(value) => updateField("purpose", value)}
          onSelect={() => {
            window.requestAnimationFrame(() => {
              navigation.focusNext("purpose");
            });
          }}
          style={{
            width: "100%",
          }}
        />
      </div>

      <div className={styles.field}>
        <MoneyInput
          ref={navigation.registerField("amount")}
          value={form.amount}
          onChange={(value) => updateField("amount", value)}
          allowDecimal
          allowZero={false}
          disabled={disabled || submitting}
          placeholder="Сумма"
          onKeyDown={navigation.getEnterKeyDown("amount")}
        />
      </div>

      <div className={styles.field}>
        <PercentInput
          ref={navigation.registerField("percent")}
          value={form.percent}
          onChange={(value) => updateField("percent", value)}
          disabled={disabled || submitting}
          placeholder="%"
          onKeyDown={navigation.getEnterKeyDown("percent")}
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
});

export default DenXanOutgoingForm;
