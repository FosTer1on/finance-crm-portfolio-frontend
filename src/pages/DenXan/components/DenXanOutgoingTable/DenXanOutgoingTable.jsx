import { Alert, Button } from "antd";

import DataTable from "@/components/common/DataTable/DataTable";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

function renderMoney(value) {
  if (value == null || value === "") {
    return "—";
  }

  return <MoneyText value={value} currency="сум" />;
}

function renderRelatedName(value) {
  if (!value) {
    return "—";
  }

  if (typeof value === "string") {
    return value;
  }

  return value.name || value.code || "—";
}

function formatDecimal(value) {
  if (value == null || value === "") {
    return "—";
  }

  const stringValue = String(value);

  if (!stringValue.includes(".")) {
    return stringValue;
  }

  return stringValue.replace(/0+$/, "").replace(/\.$/, "");
}

function renderPurpose(value) {
  if (value === "REGULAR") {
    return "Обычный";
  }

  if (value === "VAT") {
    return "НДС";
  }

  return value || "—";
}

export default function DenXanOutgoingTable({
  data,
  loading = false,
  error = "",
  onRetry,
  onCancel,
  cancelDisabled = false,
}) {
  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        message="Не удалось загрузить исходы"
        description={error}
        action={
          <Button size="small" loading={loading} onClick={onRetry}>
            Повторить
          </Button>
        }
      />
    );
  }

  const columns = [
    {
      title: "Счёт DEN XAN",
      dataIndex: "account",
      width: 150,
      render: renderRelatedName,
    },
    {
      title: "Счёт MMA",
      dataIndex: "mma_account",
      width: 150,
      render: renderRelatedName,
    },
    {
      title: "Тип",
      dataIndex: "purpose",
      width: 100,
      render: renderPurpose,
    },
    {
      title: "Сумма",
      dataIndex: "amount",
      width: 160,
      align: "right",
      render: renderMoney,
    },
    {
      title: "%",
      dataIndex: "percent",
      width: 80,
      align: "right",
      render: (value) => {
        const formatted = formatDecimal(value);

        return formatted === "—" ? "—" : `${formatted}%`;
      },
    },
    {
      title: "Получить от MMA",
      dataIndex: "cash_to_receive_from_mma",
      width: 170,
      align: "right",
      render: renderMoney,
    },
    {
      title: "Комиссия банка",
      dataIndex: "debit_fee_amount",
      width: 160,
      align: "right",
      render: renderMoney,
    },
    {
      title: "Списано со счёта",
      dataIndex: "total_account_debit",
      width: 170,
      align: "right",
      render: renderMoney,
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      width: 220,
      render: (value) => value || "—",
    },
    {
      title: "Действие",
      key: "action",
      width: 100,
      fixed: "right",
      render: (_, operation) => (
        <Button
          type="link"
          danger
          size="small"
          disabled={cancelDisabled}
          onClick={() => onCancel?.(operation)}
        >
          Отменить
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
      emptyText="Исходов за выбранный день нет"
      scroll={{ x: 1500 }}
    />
  );
}
