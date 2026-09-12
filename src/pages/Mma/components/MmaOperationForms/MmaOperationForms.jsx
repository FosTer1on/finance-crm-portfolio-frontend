import { useMemo, useState, useEffect, useRef } from "react";
import { Alert, Button, Input, Typography } from "antd";

import { createMmaIncoming, createMmaOutgoing } from "@/api/mma";
import { normalizeApiError } from "@/api/errors";

import CompanySelect from "@/components/finance/CompanySelect/CompanySelect";
import CounterpartySelect from "@/components/finance/CounterpartySelect/CounterpartySelect";
import MoneyInput from "@/components/finance/MoneyInput/MoneyInput";
import MoneyText from "@/components/finance/MoneyText/MoneyText";
import PercentInput from "@/components/finance/PercentInput/PercentInput";

import { amountAfterPercent } from "@/utils/finance";
import { showSuccess } from "@/utils/feedback";

import { useFormKeyboardNavigation } from "@/hooks/useFormKeyboardNavigation";
import { usePairedFormNavigation } from "@/hooks/usePairedFormNavigation";

import MmaAccountSelect from "../MmaAccountSelect/MmaAccountSelect";

import styles from "./MmaOperationForms.module.css";

const { Text } = Typography;
const { TextArea } = Input;

const FORM_FIELDS = [
  "counterparty",
  "company",
  "account",
  "amount",
  "percent",
  "comment",
];

const PAIRED_FIELDS = [
  {
    left: "counterparty",
    right: "counterparty",
  },
  {
    left: "company",
    right: "company",
  },
  {
    left: "account",
    right: "account",
  },
  {
    left: "amount",
    right: "amount",
  },
  {
    left: "percent",
    right: "percent",
  },
  {
    left: "comment",
    right: "comment",
  },
];

const EMPTY_FORM = {
  counterpartyId: null,
  companyId: null,
  accountId: null,
  amount: "",
  percent: "",
  comment: "",
};

function getFieldError(fields, fieldName) {
  const value = fields?.[fieldName];

  if (Array.isArray(value) && value.length > 0) {
    return String(value[0]);
  }

  if (typeof value === "string") {
    return value;
  }

  return "";
}

export default function MmaOperationForms({
  date,
  accounts,
  accountsLoading = false,
  disabled = false,
  refreshCurrentIncomingAndDaily,
  refreshCurrentOutgoingAndDaily,
}) {
  const [incomingForm, setIncomingForm] = useState(EMPTY_FORM);
  const [outgoingForm, setOutgoingForm] = useState(EMPTY_FORM);

  const [incomingSubmitting, setIncomingSubmitting] = useState(false);
  const [outgoingSubmitting, setOutgoingSubmitting] = useState(false);

  const pendingFocusRef = useRef(null);

  const [incomingError, setIncomingError] = useState("");
  const [outgoingError, setOutgoingError] = useState("");

  const [incomingFieldErrors, setIncomingFieldErrors] = useState({});
  const [outgoingFieldErrors, setOutgoingFieldErrors] = useState({});

  const incomingPreview = useMemo(
    () => amountAfterPercent(incomingForm.amount, incomingForm.percent),
    [incomingForm.amount, incomingForm.percent]
  );

  const outgoingPreview = useMemo(
    () => amountAfterPercent(outgoingForm.amount, outgoingForm.percent),
    [outgoingForm.amount, outgoingForm.percent]
  );

  const updateIncoming = (field, value) => {
    setIncomingForm((current) => ({
      ...current,
      [field]: value,
    }));

    setIncomingFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setIncomingError("");
  };

  const updateOutgoing = (field, value) => {
    setOutgoingForm((current) => ({
      ...current,
      [field]: value,
    }));

    setOutgoingFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setOutgoingError("");
  };

  const validateIncoming = () => {
    const errors = {};

    if (!incomingForm.counterpartyId) {
      errors.counterpartyId = "Выберите человека.";
    }

    if (!incomingForm.accountId) {
      errors.accountId = "Выберите счёт.";
    }

    if (!incomingForm.amount) {
      errors.amount = "Введите сумму.";
    }

    if (incomingForm.percent === "" || incomingForm.percent == null) {
      errors.percent = "Введите процент.";
    }

    setIncomingFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const validateOutgoing = () => {
    const errors = {};

    if (!outgoingForm.counterpartyId) {
      errors.counterpartyId = "Выберите человека.";
    }

    if (!outgoingForm.accountId) {
      errors.accountId = "Выберите счёт.";
    }

    if (!outgoingForm.amount) {
      errors.amount = "Введите сумму.";
    }

    if (outgoingForm.percent === "" || outgoingForm.percent == null) {
      errors.percent = "Введите процент.";
    }

    setOutgoingFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleIncomingSubmit = async () => {
    if (disabled || incomingSubmitting || !validateIncoming()) {
      return;
    }

    setIncomingSubmitting(true);
    setIncomingError("");
    setIncomingFieldErrors({});

    try {
      await createMmaIncoming({
        counterparty_id: incomingForm.counterpartyId,
        company_id: incomingForm.companyId ?? null,
        account_id: incomingForm.accountId,
        amount: incomingForm.amount,
        percent: incomingForm.percent,
        operation_date: date,
        comment: incomingForm.comment.trim(),
      });

      setIncomingForm(EMPTY_FORM);
      showSuccess("Приход MMA сохранён");

      await refreshCurrentIncomingAndDaily();

      pendingFocusRef.current = "incoming";
    } catch (error) {
      const normalized = normalizeApiError(
        error,
        "Не удалось сохранить приход MMA."
      );

      setIncomingError(normalized.message);
      setIncomingFieldErrors({
        counterpartyId: getFieldError(normalized.fields, "counterparty_id"),
        companyId: getFieldError(normalized.fields, "company_id"),
        accountId: getFieldError(normalized.fields, "account_id"),
        amount: getFieldError(normalized.fields, "amount"),
        percent: getFieldError(normalized.fields, "percent"),
        comment: getFieldError(normalized.fields, "comment"),
      });
    } finally {
      setIncomingSubmitting(false);
    }
  };

  const handleOutgoingSubmit = async () => {
    if (disabled || outgoingSubmitting || !validateOutgoing()) {
      return;
    }

    setOutgoingSubmitting(true);
    setOutgoingError("");
    setOutgoingFieldErrors({});

    try {
      await createMmaOutgoing({
        counterparty_id: outgoingForm.counterpartyId,
        company_id: outgoingForm.companyId ?? null,
        account_id: outgoingForm.accountId,
        amount: outgoingForm.amount,
        percent: outgoingForm.percent,
        operation_date: date,
        comment: outgoingForm.comment.trim(),
      });

      setOutgoingForm(EMPTY_FORM);
      showSuccess("Исход MMA сохранён");

      await refreshCurrentOutgoingAndDaily();

      pendingFocusRef.current = "outgoing";
    } catch (error) {
      const normalized = normalizeApiError(
        error,
        "Не удалось сохранить исход MMA."
      );

      setOutgoingError(normalized.message);
      setOutgoingFieldErrors({
        counterpartyId: getFieldError(normalized.fields, "counterparty_id"),
        companyId: getFieldError(normalized.fields, "company_id"),
        accountId: getFieldError(normalized.fields, "account_id"),
        amount: getFieldError(normalized.fields, "amount"),
        percent: getFieldError(normalized.fields, "percent"),
        comment: getFieldError(normalized.fields, "comment"),
      });
    } finally {
      setOutgoingSubmitting(false);
    }
  };

  const incomingNavigation = useFormKeyboardNavigation({
    fields: FORM_FIELDS,
    onSubmit: handleIncomingSubmit,
  });

  const outgoingNavigation = useFormKeyboardNavigation({
    fields: FORM_FIELDS,
    onSubmit: handleOutgoingSubmit,
  });

  useEffect(() => {
    if (incomingSubmitting || outgoingSubmitting || !pendingFocusRef.current) {
      return undefined;
    }

    const target = pendingFocusRef.current;

    pendingFocusRef.current = null;

    const frameId = requestAnimationFrame(() => {
      if (target === "incoming") {
        incomingNavigation.focusFirst();
        return;
      }

      if (target === "outgoing") {
        outgoingNavigation.focusFirst();
      }
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [
    incomingSubmitting,
    outgoingSubmitting,
    incomingNavigation,
    outgoingNavigation,
  ]);

  const pairedNavigation = usePairedFormNavigation({
    leftNavigation: incomingNavigation,
    rightNavigation: outgoingNavigation,
    pairs: PAIRED_FIELDS,
  });

  const incomingKeyDown = (fieldName, options) =>
    pairedNavigation.getFieldKeyDown({
      side: "left",
      fieldName,
      onEnterKeyDown: incomingNavigation.getEnterKeyDown(fieldName, options),
    });

  const outgoingKeyDown = (fieldName, options) =>
    pairedNavigation.getFieldKeyDown({
      side: "right",
      fieldName,
      onEnterKeyDown: outgoingNavigation.getEnterKeyDown(fieldName, options),
    });

  return (
    <div className={styles.forms}>
      <OperationForm
        title="РУЧНОЙ ПРИХОД"
        form={incomingForm}
        fieldErrors={incomingFieldErrors}
        error={incomingError}
        submitting={incomingSubmitting}
        disabled={disabled}
        accounts={accounts}
        accountsLoading={accountsLoading}
        previewLabel="Отдать наличкой"
        preview={incomingPreview}
        submitText="Сохранить приход"
        navigation={incomingNavigation}
        getKeyDown={incomingKeyDown}
        onChange={updateIncoming}
        onSubmit={handleIncomingSubmit}
      />

      <OperationForm
        title="РУЧНОЙ ИСХОД"
        form={outgoingForm}
        fieldErrors={outgoingFieldErrors}
        error={outgoingError}
        submitting={outgoingSubmitting}
        disabled={disabled}
        accounts={accounts}
        accountsLoading={accountsLoading}
        previewLabel="Получить наличкой"
        preview={outgoingPreview}
        submitText="Сохранить исход"
        navigation={outgoingNavigation}
        getKeyDown={outgoingKeyDown}
        onChange={updateOutgoing}
        onSubmit={handleOutgoingSubmit}
      />
    </div>
  );
}

function OperationForm({
  title,
  form,
  fieldErrors,
  error,
  submitting,
  disabled,
  accounts,
  accountsLoading,
  previewLabel,
  preview,
  submitText,
  navigation,
  getKeyDown,
  onChange,
  onSubmit,
}) {
  return (
    <div className={styles.form}>
      <h3 className={styles.heading}>{title}</h3>

      {error ? <Alert type="error" showIcon message={error} /> : null}

      <div className={styles.fields}>
        <FormField label="Человек *" error={fieldErrors.counterpartyId}>
          <CounterpartySelect
            ref={navigation.registerField("counterparty")}
            value={form.counterpartyId}
            onChange={(value) => onChange("counterpartyId", value ?? null)}
            disabled={disabled || submitting}
            status={fieldErrors.counterpartyId ? "error" : undefined}
            onKeyDown={getKeyDown("counterparty")}
          />
        </FormField>

        <FormField label="Фирма" error={fieldErrors.companyId}>
          <CompanySelect
            ref={navigation.registerField("company")}
            value={form.companyId}
            onChange={(value) => onChange("companyId", value ?? null)}
            disabled={disabled || submitting}
            allowClear
            status={fieldErrors.companyId ? "error" : undefined}
            onKeyDown={getKeyDown("company")}
          />
        </FormField>

        <FormField label="Счёт *" error={fieldErrors.accountId}>
          <MmaAccountSelect
            ref={navigation.registerField("account")}
            accounts={accounts}
            value={form.accountId}
            onChange={(value) => onChange("accountId", value ?? null)}
            loading={accountsLoading}
            disabled={disabled || submitting}
            status={fieldErrors.accountId ? "error" : undefined}
            onKeyDown={getKeyDown("account")}
          />
        </FormField>

        <FormField label="Сумма *" error={fieldErrors.amount}>
          <MoneyInput
            ref={navigation.registerField("amount")}
            value={form.amount}
            onChange={(value) => onChange("amount", value)}
            disabled={disabled || submitting}
            allowDecimal
            suffix="сум"
            status={fieldErrors.amount ? "error" : undefined}
            onKeyDown={getKeyDown("amount")}
          />
        </FormField>

        <FormField label="Процент *" error={fieldErrors.percent}>
          <PercentInput
            ref={navigation.registerField("percent")}
            value={form.percent}
            onChange={(value) => onChange("percent", value)}
            disabled={disabled || submitting}
            status={fieldErrors.percent ? "error" : undefined}
            onKeyDown={getKeyDown("percent")}
          />
        </FormField>

        <div className={styles.preview}>
          <Text type="secondary">{previewLabel}</Text>

          <MoneyText value={preview ?? "0"} currency="сум" />
        </div>

        <FormField label="Комментарий" error={fieldErrors.comment}>
          <TextArea
            ref={navigation.registerField("comment")}
            value={form.comment}
            onChange={(event) => onChange("comment", event.target.value)}
            disabled={disabled || submitting}
            rows={2}
            maxLength={1000}
            status={fieldErrors.comment ? "error" : undefined}
            onKeyDown={getKeyDown("comment", {
              submitOnEnter: true,
              multiline: true,
            })}
          />
        </FormField>
      </div>

      <Button
        type="primary"
        block
        disabled={disabled}
        loading={submitting}
        onClick={onSubmit}
      >
        {submitText}
      </Button>
    </div>
  );
}

function FormField({ label, error, children }) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>

      {children}

      {error ? <span className={styles.fieldError}>{error}</span> : null}
    </label>
  );
}
