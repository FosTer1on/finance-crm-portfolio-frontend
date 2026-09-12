import { useMemo, useState } from "react";

import { Alert, Button, Input } from "antd";

import { createAsiaIncoming, createAsiaOutgoing } from "@/api/asia";
import { normalizeApiError } from "@/api/errors";

import CompanySelect from "@/components/finance/CompanySelect/CompanySelect";
import CounterpartySelect from "@/components/finance/CounterpartySelect/CounterpartySelect";
import MoneyInput from "@/components/finance/MoneyInput/MoneyInput";
import MoneyText from "@/components/finance/MoneyText/MoneyText";
import PercentInput from "@/components/finance/PercentInput/PercentInput";

import { useFormKeyboardNavigation } from "@/hooks/useFormKeyboardNavigation";
import { usePairedFormNavigation } from "@/hooks/usePairedFormNavigation";

import { amountAfterPercent } from "@/utils/finance";
import { showSuccess } from "@/utils/feedback";

import styles from "./AsiaOperationForms.module.css";

const { TextArea } = Input;

const INITIAL_FORM = {
  counterpartyId: null,
  companyId: null,
  amount: "",
  percent: "",
  comment: "",
};

const FORM_FIELDS = ["counterparty", "company", "amount", "percent", "comment"];

const FIELD_PAIRS = [
  {
    left: "counterparty",
    right: "counterparty",
  },
  {
    left: "company",
    right: "company",
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

function isPositiveDecimal(value) {
  const raw = String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(",", ".");

  if (!/^\d+(?:\.\d+)?$/.test(raw)) {
    return false;
  }

  return raw.replace(/[.0]/g, "") !== "";
}

function getFirstError(value) {
  if (Array.isArray(value)) {
    return value.length > 0 ? String(value[0]) : "";
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function mapBackendFieldErrors(details) {
  if (!details || typeof details !== "object") {
    return {};
  }

  return {
    counterpartyId: getFirstError(details.counterparty_id),
    companyId: getFirstError(details.company_id),
    amount: getFirstError(details.amount),
    percent: getFirstError(details.percent),
    comment: getFirstError(details.comment),
  };
}

function FieldError({ children }) {
  if (!children) {
    return null;
  }

  return <span className={styles.fieldError}>{children}</span>;
}

export default function AsiaOperationForms({
  date,
  disabled = false,
  onIncomingSuccess,
  onOutgoingSuccess,
}) {
  const [incomingForm, setIncomingForm] = useState(INITIAL_FORM);

  const [outgoingForm, setOutgoingForm] = useState(INITIAL_FORM);

  const [incomingSubmitting, setIncomingSubmitting] = useState(false);

  const [outgoingSubmitting, setOutgoingSubmitting] = useState(false);

  const [incomingError, setIncomingError] = useState("");

  const [outgoingError, setOutgoingError] = useState("");

  const [incomingFieldErrors, setIncomingFieldErrors] = useState({});

  const [outgoingFieldErrors, setOutgoingFieldErrors] = useState({});

  const incomingNavigation = useFormKeyboardNavigation({
    fields: FORM_FIELDS,
    onSubmit: handleIncomingSubmit,
  });

  const outgoingNavigation = useFormKeyboardNavigation({
    fields: FORM_FIELDS,
    onSubmit: handleOutgoingSubmit,
  });

  const pairedNavigation = usePairedFormNavigation({
    leftNavigation: incomingNavigation,
    rightNavigation: outgoingNavigation,
    pairs: FIELD_PAIRS,
  });

  const incomingPreview = useMemo(() => {
    if (!incomingForm.amount || incomingForm.percent === "") {
      return null;
    }

    return amountAfterPercent(incomingForm.amount, incomingForm.percent);
  }, [incomingForm.amount, incomingForm.percent]);

  const outgoingPreview = useMemo(() => {
    if (!outgoingForm.amount || outgoingForm.percent === "") {
      return null;
    }

    return amountAfterPercent(outgoingForm.amount, outgoingForm.percent);
  }, [outgoingForm.amount, outgoingForm.percent]);

  const updateIncomingField = (field, value) => {
    setIncomingForm((current) => ({
      ...current,
      [field]: value,
    }));

    setIncomingFieldErrors((current) => ({
      ...current,
      [field]: "",
    }));

    setIncomingError("");
  };

  const updateOutgoingField = (field, value) => {
    setOutgoingForm((current) => ({
      ...current,
      [field]: value,
    }));

    setOutgoingFieldErrors((current) => ({
      ...current,
      [field]: "",
    }));

    setOutgoingError("");
  };

  const validateIncoming = () => {
    const errors = {};

    if (!incomingForm.counterpartyId) {
      errors.counterpartyId = "Выберите человека";
    }

    if (!isPositiveDecimal(incomingForm.amount)) {
      errors.amount = "Введите сумму больше нуля";
    }

    if (incomingForm.percent === "") {
      errors.percent = "Укажите процент";
    }

    return errors;
  };

  const validateOutgoing = () => {
    const errors = {};

    if (!outgoingForm.counterpartyId) {
      errors.counterpartyId = "Выберите человека";
    }

    if (!isPositiveDecimal(outgoingForm.amount)) {
      errors.amount = "Введите сумму больше нуля";
    }

    if (outgoingForm.percent === "") {
      errors.percent = "Укажите процент";
    }

    return errors;
  };

  async function handleIncomingSubmit() {
    if (disabled || incomingSubmitting) {
      return;
    }

    const validationErrors = validateIncoming();

    if (Object.keys(validationErrors).length > 0) {
      setIncomingFieldErrors(validationErrors);
      setIncomingError("Проверьте обязательные поля");
      return;
    }

    setIncomingSubmitting(true);
    setIncomingError("");
    setIncomingFieldErrors({});

    try {
      await createAsiaIncoming({
        counterparty_id: incomingForm.counterpartyId,

        company_id: incomingForm.companyId ?? null,

        amount: incomingForm.amount,
        percent: incomingForm.percent,

        operation_date: date,

        comment: incomingForm.comment.trim(),
      });

      showSuccess("Операция сохранена");

      setIncomingForm(INITIAL_FORM);
      setIncomingFieldErrors({});
      setIncomingError("");

      await onIncomingSuccess?.();

      window.requestAnimationFrame(() => {
        incomingNavigation.focusFirst();
      });
    } catch (error) {
      const normalizedError = normalizeApiError(error);

      setIncomingError(
        normalizedError.message || "Не удалось сохранить приход"
      );

      setIncomingFieldErrors(mapBackendFieldErrors(normalizedError.details));
    } finally {
      setIncomingSubmitting(false);
    }
  }

  async function handleOutgoingSubmit() {
    if (disabled || outgoingSubmitting) {
      return;
    }

    const validationErrors = validateOutgoing();

    if (Object.keys(validationErrors).length > 0) {
      setOutgoingFieldErrors(validationErrors);
      setOutgoingError("Проверьте обязательные поля");
      return;
    }

    setOutgoingSubmitting(true);
    setOutgoingError("");
    setOutgoingFieldErrors({});

    try {
      await createAsiaOutgoing({
        counterparty_id: outgoingForm.counterpartyId,

        company_id: outgoingForm.companyId ?? null,

        amount: outgoingForm.amount,
        percent: outgoingForm.percent,

        operation_date: date,

        comment: outgoingForm.comment.trim(),
      });

      showSuccess("Операция сохранена");

      setOutgoingForm(INITIAL_FORM);
      setOutgoingFieldErrors({});
      setOutgoingError("");

      await onOutgoingSuccess?.();

      window.requestAnimationFrame(() => {
        incomingNavigation.focusFirst();
      });
    } catch (error) {
      const normalizedError = normalizeApiError(error);

      setOutgoingError(normalizedError.message || "Не удалось сохранить исход");

      setOutgoingFieldErrors(mapBackendFieldErrors(normalizedError.details));
    } finally {
      setOutgoingSubmitting(false);
    }
  }

  const incomingDisabled = disabled || incomingSubmitting;

  const outgoingDisabled = disabled || outgoingSubmitting;

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
    <section className={styles.section}>
      <div className={styles.forms}>
        <div className={styles.form}>
          <h2 className={styles.formTitle}>ПРИХОД</h2>

          <label className={styles.field}>
            <span>Человек *</span>

            <CounterpartySelect
              ref={incomingNavigation.registerField("counterparty")}
              value={incomingForm.counterpartyId}
              disabled={incomingDisabled}
              placeholder="Выберите человека"
              status={incomingFieldErrors.counterpartyId ? "error" : undefined}
              onKeyDown={incomingKeyDown("counterparty")}
              onChange={(value) => {
                updateIncomingField("counterpartyId", value ?? null);
              }}
            />

            <FieldError>{incomingFieldErrors.counterpartyId}</FieldError>
          </label>

          <label className={styles.field}>
            <span>Фирма</span>

            <CompanySelect
              ref={incomingNavigation.registerField("company")}
              value={incomingForm.companyId}
              disabled={incomingDisabled}
              placeholder="Не выбрана"
              status={incomingFieldErrors.companyId ? "error" : undefined}
              onKeyDown={incomingKeyDown("company")}
              onChange={(value) => {
                updateIncomingField("companyId", value ?? null);
              }}
            />

            <FieldError>{incomingFieldErrors.companyId}</FieldError>
          </label>

          <label className={styles.field}>
            <span>Сумма *</span>

            <MoneyInput
              ref={incomingNavigation.registerField("amount")}
              value={incomingForm.amount}
              disabled={incomingDisabled}
              allowDecimal
              allowZero={false}
              suffix="сум"
              placeholder="0"
              status={incomingFieldErrors.amount ? "error" : undefined}
              onKeyDown={incomingKeyDown("amount")}
              onChange={(value) => {
                updateIncomingField("amount", value);
              }}
            />

            <FieldError>{incomingFieldErrors.amount}</FieldError>
          </label>

          <label className={styles.field}>
            <span>Процент *</span>

            <PercentInput
              ref={incomingNavigation.registerField("percent")}
              value={incomingForm.percent}
              disabled={incomingDisabled}
              status={incomingFieldErrors.percent ? "error" : undefined}
              onKeyDown={incomingKeyDown("percent")}
              onChange={(value) => {
                updateIncomingField("percent", value);
              }}
            />

            <FieldError>{incomingFieldErrors.percent}</FieldError>
          </label>

          <div className={styles.preview}>
            <span>Отдать наличкой</span>

            {incomingPreview === null ? (
              <strong>—</strong>
            ) : (
              <MoneyText value={incomingPreview} currency="сум" />
            )}
          </div>

          <label className={styles.field}>
            <span>Комментарий</span>

            <TextArea
              ref={incomingNavigation.registerField("comment")}
              value={incomingForm.comment}
              disabled={incomingDisabled}
              autoSize={{
                minRows: 2,
                maxRows: 4,
              }}
              placeholder="Комментарий к приходу"
              status={incomingFieldErrors.comment ? "error" : undefined}
              onKeyDown={incomingKeyDown("comment", {
                submitOnEnter: true,
                multiline: true,
              })}
              onChange={(event) => {
                updateIncomingField("comment", event.target.value);
              }}
            />

            <FieldError>{incomingFieldErrors.comment}</FieldError>
          </label>

          {incomingError ? (
            <Alert
              type="error"
              showIcon
              message={incomingError}
              className={styles.formError}
            />
          ) : null}

          <div className={styles.actions}>
            <Button
              type="primary"
              disabled={disabled}
              loading={incomingSubmitting}
              onClick={handleIncomingSubmit}
            >
              Сохранить приход
            </Button>
          </div>
        </div>

        <div className={styles.form}>
          <h2 className={styles.formTitle}>ИСХОД</h2>

          <label className={styles.field}>
            <span>Человек *</span>

            <CounterpartySelect
              ref={outgoingNavigation.registerField("counterparty")}
              value={outgoingForm.counterpartyId}
              disabled={outgoingDisabled}
              placeholder="Выберите человека"
              status={outgoingFieldErrors.counterpartyId ? "error" : undefined}
              onKeyDown={outgoingKeyDown("counterparty")}
              onChange={(value) => {
                updateOutgoingField("counterpartyId", value ?? null);
              }}
            />

            <FieldError>{outgoingFieldErrors.counterpartyId}</FieldError>
          </label>

          <label className={styles.field}>
            <span>Фирма</span>

            <CompanySelect
              ref={outgoingNavigation.registerField("company")}
              value={outgoingForm.companyId}
              disabled={outgoingDisabled}
              placeholder="Не выбрана"
              status={outgoingFieldErrors.companyId ? "error" : undefined}
              onKeyDown={outgoingKeyDown("company")}
              onChange={(value) => {
                updateOutgoingField("companyId", value ?? null);
              }}
            />

            <FieldError>{outgoingFieldErrors.companyId}</FieldError>
          </label>

          <label className={styles.field}>
            <span>Сумма *</span>

            <MoneyInput
              ref={outgoingNavigation.registerField("amount")}
              value={outgoingForm.amount}
              disabled={outgoingDisabled}
              allowDecimal
              allowZero={false}
              suffix="сум"
              placeholder="0"
              status={outgoingFieldErrors.amount ? "error" : undefined}
              onKeyDown={outgoingKeyDown("amount")}
              onChange={(value) => {
                updateOutgoingField("amount", value);
              }}
            />

            <FieldError>{outgoingFieldErrors.amount}</FieldError>
          </label>

          <label className={styles.field}>
            <span>Процент *</span>

            <PercentInput
              ref={outgoingNavigation.registerField("percent")}
              value={outgoingForm.percent}
              disabled={outgoingDisabled}
              status={outgoingFieldErrors.percent ? "error" : undefined}
              onKeyDown={outgoingKeyDown("percent")}
              onChange={(value) => {
                updateOutgoingField("percent", value);
              }}
            />

            <FieldError>{outgoingFieldErrors.percent}</FieldError>
          </label>

          <div className={styles.preview}>
            <span>Получить наличкой</span>

            {outgoingPreview === null ? (
              <strong>—</strong>
            ) : (
              <MoneyText value={outgoingPreview} currency="сум" />
            )}
          </div>

          <label className={styles.field}>
            <span>Комментарий</span>

            <TextArea
              ref={outgoingNavigation.registerField("comment")}
              value={outgoingForm.comment}
              disabled={outgoingDisabled}
              autoSize={{
                minRows: 2,
                maxRows: 4,
              }}
              placeholder="Комментарий к исходу"
              status={outgoingFieldErrors.comment ? "error" : undefined}
              onKeyDown={outgoingKeyDown("comment", {
                submitOnEnter: true,
                multiline: true,
              })}
              onChange={(event) => {
                updateOutgoingField("comment", event.target.value);
              }}
            />

            <FieldError>{outgoingFieldErrors.comment}</FieldError>
          </label>

          {outgoingError ? (
            <Alert
              type="error"
              showIcon
              message={outgoingError}
              className={styles.formError}
            />
          ) : null}

          <div className={styles.actions}>
            <Button
              type="primary"
              disabled={disabled}
              loading={outgoingSubmitting}
              onClick={handleOutgoingSubmit}
            >
              Сохранить исход
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
