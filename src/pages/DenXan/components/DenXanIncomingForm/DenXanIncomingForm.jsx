import { forwardRef, useImperativeHandle, useMemo, useState } from "react";

import { Button, Input, Typography } from "antd";

import { createDenXanIncoming } from "@/api/denXan";
import { normalizeApiError } from "@/api/errors";

import MoneyInput from "@/components/finance/MoneyInput/MoneyInput";
import PercentInput from "@/components/finance/PercentInput/PercentInput";

import { useFormKeyboardNavigation } from "@/hooks/useFormKeyboardNavigation";

import { showSuccess } from "@/utils/feedback";

import DenXanDistributorSelect from "../DenXanDistributorSelect/DenXanDistributorSelect";

import styles from "./DenXanIncomingForm.module.css";

const { TextArea } = Input;
const { Text } = Typography;

const EMPTY_FORM = {
  distributorId: null,
  amount: "",
  percent: "",
  redirectAmount: "",
  redirectTargetId: null,
  comment: "",
};

function hasPositiveValue(value) {
  if (value == null || value === "") {
    return false;
  }

  const normalized = String(value).replace(/\s/g, "").replace(",", ".");

  return /[1-9]/.test(normalized);
}

const DenXanIncomingForm = forwardRef(function DenXanIncomingForm(
  {
    date,
    distributors,
    accounts,
    distributorsLoading = false,
    disabled = false,
    refreshCurrentIncomingData,
    onFirstFieldTab,
  },
  ref
) {
  const [form, setForm] = useState(EMPTY_FORM);

  const [submitting, setSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState("");

  const redirectEnabled = hasPositiveValue(form.redirectAmount);

  const fields = useMemo(
    () =>
      redirectEnabled
        ? [
            "distributor",
            "amount",
            "percent",
            "redirectAmount",
            "redirectTarget",
            "comment",
          ]
        : ["distributor", "amount", "percent", "redirectAmount", "comment"],
    [redirectEnabled]
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
    if (disabled || submitting) {
      return;
    }

    if (!form.distributorId) {
      setSubmitError("Выберите дистрибьютора.");
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
      setSubmitError("Введите сумму прихода.");
      return;
    }

    if (redirectEnabled && !form.redirectTargetId) {
      setSubmitError("Выберите, куда выполнить редирект.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    let savedSuccessfully = false;

    try {
      const payload = {
        distributor_id: form.distributorId,
        account_id: automaticAccount.id,
        amount: form.amount,
        operation_date: date,
        comment: form.comment.trim(),
      };

      if (form.percent !== "" && form.percent != null) {
        payload.percent = form.percent;
      }

      if (redirectEnabled) {
        payload.redirect_amount = form.redirectAmount;

        payload.redirect_target_id = form.redirectTargetId;
      }

      await createDenXanIncoming(payload);

      showSuccess("Приход DEN XAN сохранён");

      resetForm();

      savedSuccessfully = true;

      await refreshCurrentIncomingData();
    } catch (error) {
      const normalized = normalizeApiError(error);

      setSubmitError(normalized.message || "Не удалось сохранить приход.");
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

  const handleDistributorChange = (distributorId) => {
    const distributor = distributors.find((item) => item.id === distributorId);

    const defaultPercent =
      distributor?.code === "VAT" ? "0" : distributorId ? "6" : "";

    setForm((current) => ({
      ...current,
      distributorId,
      percent: defaultPercent,
    }));

    if (submitError) {
      setSubmitError("");
    }
  };

  const handleRedirectChange = (value) => {
    const enabled = hasPositiveValue(value);

    setForm((current) => ({
      ...current,
      redirectAmount: value,
      redirectTargetId: enabled ? current.redirectTargetId : null,
    }));

    if (submitError) {
      setSubmitError("");
    }
  };

  // Пока DEN XAN использует один активный банковский счёт.
  // Когда появится второй счёт, вернуть DenXanAccountSelect
  // вместо автоматического выбора.
  const activeAccounts = accounts.filter(
    (account) => account.is_active !== false
  );

  const automaticAccount =
    activeAccounts.length === 1 ? activeAccounts[0] : null;

  return (
    <div className={styles.root}>
      <div className={styles.field}>
        <DenXanDistributorSelect
          ref={navigation.registerField("distributor")}
          value={form.distributorId}
          distributors={distributors}
          loading={distributorsLoading}
          disabled={disabled || submitting}
          onChange={handleDistributorChange}
          onSelect={() => {
            window.requestAnimationFrame(() => {
              navigation.focusNext("distributor");
            });
          }}
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

      <div className={styles.field}>
        <MoneyInput
          ref={navigation.registerField("redirectAmount")}
          value={form.redirectAmount}
          onChange={handleRedirectChange}
          allowDecimal
          allowZero
          disabled={disabled || submitting}
          placeholder="Редирект"
          onKeyDown={navigation.getEnterKeyDown("redirectAmount")}
        />
      </div>

      {redirectEnabled ? (
        <div className={styles.field}>
          <DenXanDistributorSelect
            ref={navigation.registerField("redirectTarget")}
            value={form.redirectTargetId}
            distributors={distributors}
            loading={distributorsLoading}
            disabled={disabled || submitting}
            placeholder="Куда"
            onChange={(value) => updateField("redirectTargetId", value)}
            onSelect={() => {
              window.requestAnimationFrame(() => {
                navigation.focusNext("redirectTarget");
              });
            }}
          />
        </div>
      ) : null}

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

export default DenXanIncomingForm;
