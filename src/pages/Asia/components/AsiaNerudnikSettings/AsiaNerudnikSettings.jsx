import { useRef, useState } from "react";

import { Button, InputNumber, Space, Typography } from "antd";

import { saveAsiaDailySettings } from "@/api/asia";
import { normalizeApiError } from "@/api/errors";
import { formatDecimalString } from "@/utils/decimal";
import { showSuccess } from "@/utils/feedback";

import styles from "./AsiaNerudnikSettings.module.css";

const { Text } = Typography;

function normalizePercentValue(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  return formatDecimalString(value, "");
}

export default function AsiaNerudnikSettings({
  date,
  settings,
  disabled,
  loading,
  onSaved,
}) {
  const [allowedPercent, setAllowedPercent] = useState(() =>
    normalizePercentValue(settings?.allowed_deduction_percent)
  );

  const [adjustmentPercent, setAdjustmentPercent] = useState(() =>
    normalizePercentValue(settings?.adjustment_percent)
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const adjustmentInputRef = useRef(null);
  const saveButtonRef = useRef(null);

  const handleAllowedPressEnter = () => {
    adjustmentInputRef.current?.focus();
  };

  const handleAdjustmentPressEnter = () => {
    saveButtonRef.current?.focus();
  };

  const handleSave = async () => {
    if (
      disabled ||
      saving ||
      allowedPercent === "" ||
      adjustmentPercent === ""
    ) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await saveAsiaDailySettings({
        operation_date: date,
        allowed_deduction_percent: allowedPercent,
        adjustment_percent: adjustmentPercent,
      });

      await onSaved?.();

      showSuccess("Проценты Нерудника сохранены");
    } catch (requestError) {
      const normalizedError = normalizeApiError(requestError);

      setError(
        normalizedError.message || "Не удалось сохранить проценты Нерудника"
      );
    } finally {
      setSaving(false);
    }
  };

  const isSaveDisabled =
    disabled || loading || allowedPercent === "" || adjustmentPercent === "";

  return (
    <div className={styles.root}>
      <div className={styles.fields}>
        <div className={styles.field}>
          <Text type="secondary" className={styles.label}>
            Допустимый %
          </Text>

          <InputNumber
            stringMode
            value={allowedPercent}
            onChange={(value) => {
              setAllowedPercent(value ?? "");
            }}
            min="0"
            max="100"
            step="0.01"
            controls={false}
            disabled={disabled || loading}
            className={styles.input}
            onPressEnter={handleAllowedPressEnter}
          />
        </div>

        <div className={styles.field}>
          <Text type="secondary" className={styles.label}>
            Корректировка %
          </Text>

          <InputNumber
            ref={adjustmentInputRef}
            stringMode
            value={adjustmentPercent}
            onChange={(value) => {
              setAdjustmentPercent(value ?? "");
            }}
            min="0"
            max="100"
            step="0.01"
            controls={false}
            disabled={disabled || loading}
            className={styles.input}
            onPressEnter={handleAdjustmentPressEnter}
          />
        </div>

        <div className={styles.save}>
          <Text type="secondary" className={styles.label}>
            &nbsp;
          </Text>

          <Button
            ref={saveButtonRef}
            type="primary"
            onClick={handleSave}
            loading={saving}
            disabled={isSaveDisabled}
          >
            Сохранить
          </Button>
        </div>
      </div>

      <Space size="small" className={styles.statusRow}>
        {settings?.is_configured ? (
          <Text type="success">Настроено</Text>
        ) : (
          <Text type="secondary">Используются значения по умолчанию</Text>
        )}

        {error ? <Text type="danger">{error}</Text> : null}
      </Space>
    </div>
  );
}
