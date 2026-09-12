import { Input, Typography } from "antd";

import ConfirmActionModal from "@/components/feedback/ConfirmActionModal/ConfirmActionModal";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

const { Text } = Typography;
const { TextArea } = Input;

export default function MmaCancelModal({
  open,
  type,
  operation,
  reason,
  error,
  loading = false,
  onReasonChange,
  onConfirm,
  onCancel,
}) {
  if (!operation) {
    return null;
  }

  const isIncoming = type === "incoming";

  const counterpartyName = operation.counterparty?.name ?? "—";

  const accountName = operation.account?.name ?? operation.account?.code ?? "—";

  return (
    <ConfirmActionModal
      open={open}
      title={isIncoming ? "Отменить приход MMA?" : "Отменить исход MMA?"}
      confirmText="Отменить операцию"
      cancelText="Назад"
      danger
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
      description={
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div>
            <div>
              <Text type="secondary">Человек: </Text>
              <Text>{counterpartyName}</Text>
            </div>

            <div>
              <Text type="secondary">Счёт: </Text>
              <Text>{accountName}</Text>
            </div>

            <div>
              <Text type="secondary">Сумма: </Text>
              <MoneyText value={operation.amount} currency="сум" />
            </div>
          </div>

          <Text type="secondary">
            После отмены операция исчезнет из рабочего списка, но останется в
            истории.
          </Text>

          <div>
            <Text>Причина отмены *</Text>

            <TextArea
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              rows={3}
              maxLength={500}
              disabled={loading}
              status={error ? "error" : undefined}
              placeholder="Укажите причину отмены"
            />

            {error ? <Text type="danger">{error}</Text> : null}
          </div>
        </div>
      }
    />
  );
}
