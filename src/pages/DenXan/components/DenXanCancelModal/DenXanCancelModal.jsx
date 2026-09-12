import { Input, Typography } from "antd";
import { useState } from "react";

import { normalizeApiError } from "@/api/errors";

import ConfirmActionModal from "@/components/feedback/ConfirmActionModal/ConfirmActionModal";

const { TextArea } = Input;
const { Text } = Typography;

export default function DenXanCancelModal({
  open,
  title,
  description,
  onConfirm,
  onCancel,
}) {
  const [reason, setReason] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    if (loading) {
      return;
    }

    setReason("");
    setError("");
    onCancel?.();
  };

  const handleConfirm = async () => {
    const normalizedReason = reason.trim();

    if (!normalizedReason) {
      setError("Укажите причину отмены.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onConfirm(normalizedReason);

      setReason("");
      onCancel?.();
    } catch (requestError) {
      const normalized = normalizeApiError(requestError);

      setError(normalized.message || "Не удалось отменить операцию.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfirmActionModal
      open={open}
      title={title}
      confirmText="Отменить операцию"
      cancelText="Назад"
      danger
      loading={loading}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      description={
        <div>
          {description ? <Text>{description}</Text> : null}

          <TextArea
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);

              if (error) {
                setError("");
              }
            }}
            placeholder="Причина отмены"
            maxLength={500}
            autoSize={{
              minRows: 2,
              maxRows: 4,
            }}
            style={{
              marginTop: 12,
            }}
          />

          {error ? (
            <Text
              type="danger"
              style={{
                display: "block",
                marginTop: 6,
              }}
            >
              {error}
            </Text>
          ) : null}
        </div>
      }
    />
  );
}
