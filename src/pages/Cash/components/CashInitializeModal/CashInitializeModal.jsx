import { useState } from "react";
import { Alert, Form, Input, Modal } from "antd";

import { initializeCashBalance } from "@/api/cash";
import { normalizeApiError } from "@/api/errors";

import BusinessDatePicker from "@/components/finance/BusinessDatePicker/BusinessDatePicker";
import CurrencySelect from "@/components/finance/CurrencySelect/CurrencySelect";
import MoneyInput from "@/components/finance/MoneyInput/MoneyInput";

import { toApiDate } from "@/utils/date";
import { showSuccess } from "@/utils/feedback";

const EMPTY_FORM = {
  currency: null,
  amount: "",
  operationDate: null,
  comment: "",
};

function getInitializeError(error) {
  const normalized = normalizeApiError(error);

  if (normalized.code === "cash_balance_already_initialized") {
    return "Начальный баланс для этой валюты уже был установлен.";
  }

  return normalized.message || "Не удалось установить начальный баланс.";
}

export default function CashInitializeModal({
  open,
  selectedDate,
  onClose,
  onCreated,
}) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    operationDate: selectedDate,
  }));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const updateField = (fieldName, value) => {
    setForm((current) => ({
      ...current,
      [fieldName]: value,
    }));

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

    if (!form.operationDate) {
      setSubmitError("Выберите дату.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      await initializeCashBalance({
        currency: form.currency,
        amount: form.amount,
        operation_date: toApiDate(form.operationDate),
        comment: form.comment.trim(),
      });

      showSuccess("Начальный баланс установлен");

      await onCreated?.();

      setForm({
        ...EMPTY_FORM,
        operationDate: selectedDate,
      });

      setSubmitError("");

      onClose?.();
    } catch (error) {
      setSubmitError(getInitializeError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) {
      return;
    }

    onClose?.();
  };

  return (
    <Modal
      open={open}
      title="Начальный баланс кассы"
      okText="Установить"
      cancelText="Отмена"
      confirmLoading={submitting}
      onOk={handleSubmit}
      onCancel={handleClose}
      destroyOnHidden
    >
      <Alert
        type="warning"
        showIcon
        message="Начальный баланс можно установить только один раз для каждой валюты."
        style={{
          marginBottom: 16,
        }}
      />

      <Form layout="vertical">
        <Form.Item label="Валюта" required>
          <CurrencySelect
            value={form.currency}
            onChange={(value) => updateField("currency", value)}
            acceptSelectedOnEnter={false}
          />
        </Form.Item>

        <Form.Item label="Сумма" required>
          <MoneyInput
            value={form.amount}
            onChange={(value) => updateField("amount", value)}
            allowDecimal
            allowZero
            placeholder="0"
          />
        </Form.Item>

        <Form.Item label="Дата" required>
          <BusinessDatePicker
            value={form.operationDate}
            onChange={(value) => updateField("operationDate", value)}
          />
        </Form.Item>

        <Form.Item label="Комментарий">
          <Input.TextArea
            value={form.comment}
            onChange={(event) => updateField("comment", event.target.value)}
            autoSize={{
              minRows: 2,
              maxRows: 4,
            }}
          />
        </Form.Item>
      </Form>

      {submitError ? (
        <Alert type="error" showIcon message={submitError} />
      ) : null}
    </Modal>
  );
}
