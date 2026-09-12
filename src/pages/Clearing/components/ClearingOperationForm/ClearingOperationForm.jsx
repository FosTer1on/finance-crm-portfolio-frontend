import { useMemo, useState } from "react";

import { useFormKeyboardNavigation } from "@/hooks/useFormKeyboardNavigation";

import { Button, Input, message } from "antd";

import { createClearingOperation } from "@/api/clearing";
import { normalizeApiError } from "@/api/errors";

import CounterpartySelect from "@/components/finance/CounterpartySelect/CounterpartySelect";
import CompanySelect from "@/components/finance/CompanySelect/CompanySelect";
import MoneyInput from "@/components/finance/MoneyInput/MoneyInput";
import PercentInput from "@/components/finance/PercentInput/PercentInput";

import { amountAfterPercent } from "@/utils/finance";
import { formatMoney } from "@/utils/money";

import styles from "./ClearingOperationForm.module.css";

const { TextArea } = Input;

const INITIAL_FORM = {
  fromCounterpartyId: null,
  fromCounterpartyName: "",
  fromCompanyId: null,
  fromPercent: "",

  amount: "",

  toCounterpartyId: null,
  toCounterpartyName: "",
  toCompanyId: null,
  toPercent: "",

  comment: "",
};

const KEYBOARD_FIELDS = [
  "fromCounterparty",
  "fromCompany",
  "fromPercent",
  "amount",
  "toCounterparty",
  "toCompany",
  "toPercent",
  "comment",
];

function normalizeInteger(value) {
  const raw = String(value ?? "").trim();

  if (!/^\d+$/.test(raw)) {
    return 0n;
  }

  return BigInt(raw);
}

function calculatePreviewResult(receive, give) {
  return normalizeInteger(receive) - normalizeInteger(give);
}

function formatPreviewAmount(value) {
  return `${formatMoney(String(value))} сум`;
}

export default function ClearingOperationForm({
  date,
  disabled = false,
  onSuccess,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const { registerField, focusFirst, getEnterKeyDown } =
    useFormKeyboardNavigation({
      fields: KEYBOARD_FIELDS,
      onSubmit: handleSubmit,
    });

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const cashToGivePreview = useMemo(() => {
    if (!form.amount || form.fromPercent === "") {
      return "";
    }

    return amountAfterPercent(form.amount, form.fromPercent);
  }, [form.amount, form.fromPercent]);

  const cashToReceivePreview = useMemo(() => {
    if (!form.amount || form.toPercent === "") {
      return "";
    }

    return amountAfterPercent(form.amount, form.toPercent);
  }, [form.amount, form.toPercent]);

  const resultPreview = useMemo(() => {
    if (cashToGivePreview === "" || cashToReceivePreview === "") {
      return null;
    }

    return calculatePreviewResult(cashToReceivePreview, cashToGivePreview);
  }, [cashToGivePreview, cashToReceivePreview]);

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setFormError("");
  };

  const validateForm = () => {
    if (!form.fromCounterpartyId) {
      return "Выберите человека в поле «От кого»";
    }

    if (form.fromPercent === "") {
      return "Укажите комиссию для стороны «От кого»";
    }

    if (!form.amount || normalizeInteger(form.amount) <= 0n) {
      return "Введите сумму операции";
    }

    if (!form.toCounterpartyId) {
      return "Выберите человека в поле «Кому»";
    }

    if (form.toPercent === "") {
      return "Укажите комиссию для стороны «Кому»";
    }

    return "";
  };

  async function handleSubmit() {
    if (disabled || submitting) {
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      await createClearingOperation({
        from_counterparty_id: form.fromCounterpartyId,
        from_company_id: form.fromCompanyId ?? null,
        from_percent: form.fromPercent,

        amount: form.amount,

        to_counterparty_id: form.toCounterpartyId,
        to_company_id: form.toCompanyId ?? null,
        to_percent: form.toPercent,

        operation_date: date,
        comment: form.comment.trim(),
      });

      message.success("Операция сохранена");

      resetForm();

      await onSuccess?.();

      window.requestAnimationFrame(() => {
        focusFirst();
      });
    } catch (error) {
      const normalizedError = normalizeApiError(error);

      setFormError(normalizedError.message || "Не удалось сохранить операцию");
    } finally {
      setSubmitting(false);
    }
  }

  const resultLabel =
    resultPreview === null
      ? "Без результата"
      : resultPreview > 0n
      ? "Прибыль"
      : resultPreview < 0n
      ? "Убыток"
      : "Без результата";

  const resultAmount =
    resultPreview === null
      ? 0n
      : resultPreview < 0n
      ? -resultPreview
      : resultPreview;

  return (
    <section className={styles.formSection}>
      <div className={styles.sides}>
        <div className={styles.side}>
          <h2 className={styles.sideTitle}>ОТ КОГО</h2>

          <label className={styles.field}>
            <span>Человек</span>

            <CounterpartySelect
              ref={registerField("fromCounterparty")}
              value={form.fromCounterpartyId}
              disabled={disabled || submitting}
              placeholder="Выберите человека"
              onKeyDown={getEnterKeyDown("fromCounterparty")}
              onChange={(value, option) => {
                updateField("fromCounterpartyId", value ?? null);
                updateField("fromCounterpartyName", option?.label ?? "");
              }}
            />
          </label>

          <label className={styles.field}>
            <span>Фирма</span>

            <CompanySelect
              ref={registerField("fromCompany")}
              value={form.fromCompanyId}
              disabled={disabled || submitting}
              placeholder="Не выбрана"
              onKeyDown={getEnterKeyDown("fromCompany")}
              onChange={(value) => {
                updateField("fromCompanyId", value ?? null);
              }}
            />
          </label>

          <label className={styles.field}>
            <span>Комиссия</span>

            <PercentInput
              ref={registerField("fromPercent")}
              value={form.fromPercent}
              disabled={disabled || submitting}
              onKeyDown={getEnterKeyDown("fromPercent")}
              onChange={(value) => {
                updateField("fromPercent", value);
              }}
            />
          </label>
        </div>

        <div className={styles.side}>
          <h2 className={styles.sideTitle}>КОМУ</h2>

          <label className={styles.field}>
            <span>Человек</span>

            <CounterpartySelect
              ref={registerField("toCounterparty")}
              value={form.toCounterpartyId}
              disabled={disabled || submitting}
              placeholder="Выберите человека"
              onKeyDown={getEnterKeyDown("toCounterparty")}
              onChange={(value, option) => {
                updateField("toCounterpartyId", value ?? null);
                updateField("toCounterpartyName", option?.label ?? "");
              }}
            />
          </label>

          <label className={styles.field}>
            <span>Фирма</span>

            <CompanySelect
              ref={registerField("toCompany")}
              value={form.toCompanyId}
              disabled={disabled || submitting}
              placeholder="Не выбрана"
              onKeyDown={getEnterKeyDown("toCompany")}
              onChange={(value) => {
                updateField("toCompanyId", value ?? null);
              }}
            />
          </label>

          <label className={styles.field}>
            <span>Комиссия</span>

            <PercentInput
              ref={registerField("toPercent")}
              value={form.toPercent}
              disabled={disabled || submitting}
              onKeyDown={getEnterKeyDown("toPercent")}
              onChange={(value) => {
                updateField("toPercent", value);
              }}
            />
          </label>
        </div>
      </div>

      <div className={styles.amountBlock}>
        <label className={styles.amountField}>
          <span>СУММА</span>

          <MoneyInput
            ref={registerField("amount")}
            value={form.amount}
            disabled={disabled || submitting}
            allowDecimal={false}
            allowZero={false}
            suffix="сум"
            placeholder="0"
            onKeyDown={getEnterKeyDown("amount")}
            onChange={(value) => {
              updateField("amount", value);
            }}
          />
        </label>

        <div className={styles.preview}>
          <div className={styles.previewRow}>
            <span>Отдать {form.fromCounterpartyName || "—"}:</span>

            <strong>
              {cashToGivePreview === ""
                ? "—"
                : formatPreviewAmount(cashToGivePreview)}
            </strong>
          </div>

          <div className={styles.previewRow}>
            <span>Получить с {form.toCounterpartyName || "—"}:</span>

            <strong>
              {cashToReceivePreview === ""
                ? "—"
                : formatPreviewAmount(cashToReceivePreview)}
            </strong>
          </div>

          <div className={styles.resultRow}>
            <span>{resultLabel}</span>

            <strong>
              {resultPreview === null
                ? "—"
                : formatPreviewAmount(resultAmount.toString())}
            </strong>
          </div>
        </div>
      </div>

      <label className={styles.commentField}>
        <span>Комментарий</span>

        <TextArea
          ref={registerField("comment")}
          value={form.comment}
          disabled={disabled || submitting}
          rows={2}
          placeholder="Комментарий к операции"
          onChange={(event) => {
            updateField("comment", event.target.value);
          }}
          onKeyDown={getEnterKeyDown("comment", {
            submitOnEnter: true,
            multiline: true,
          })}
        />
      </label>

      {formError ? <div className={styles.error}>{formError}</div> : null}

      <div className={styles.actions}>
        <Button
          type="primary"
          loading={submitting}
          disabled={disabled}
          onClick={handleSubmit}
        >
          Сохранить операцию
        </Button>
      </div>
    </section>
  );
}
