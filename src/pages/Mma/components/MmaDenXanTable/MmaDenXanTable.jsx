import { Button, Tag, Typography } from "antd";

import DataTable from "@/components/common/DataTable/DataTable";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

const { Text } = Typography;

function renderPurpose(value) {
  if (value === "REGULAR") {
    return <Tag>Обычный</Tag>;
  }

  if (value === "VAT") {
    return <Tag>НДС</Tag>;
  }

  return value || "—";
}

export default function MmaDenXanTable({
  items = [],
  loading = false,
  error = "",
  onRetry,
}) {
  const columns = [
    {
      title: "Тип",
      dataIndex: "den_xan_purpose",
      key: "den_xan_purpose",
      width: 120,
      render: renderPurpose,
    },
    {
      title: "Источник",
      key: "source",
      width: 140,
      render: () => "DEN XAN",
    },
    {
      title: "Счёт MMA",
      key: "account",
      width: 160,
      render: (_, record) =>
        record.account?.name ?? record.account?.code ?? "—",
    },
    {
      title: "Сумма",
      dataIndex: "amount",
      key: "amount",
      width: 180,
      align: "right",
      render: (value) => <MoneyText value={value} currency="сум" />,
    },
    {
      title: "%",
      dataIndex: "percent",
      key: "percent",
      width: 90,
      align: "right",
      render: (value) => (value == null ? "—" : `${value}%`),
    },
    {
      title: "Отдать DEN XAN",
      dataIndex: "cash_to_give",
      key: "cash_to_give",
      width: 190,
      align: "right",
      render: (value) => <MoneyText value={value} currency="сум" />,
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      key: "comment",
      minWidth: 240,
      render: (value) => value || "—",
    },
  ];

  if (error) {
    return (
      <div>
        <Text type="danger">{error}</Text>

        <Button
          size="small"
          loading={loading}
          onClick={onRetry}
          style={{ marginLeft: 8 }}
        >
          Повторить
        </Button>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      dataSource={items}
      loading={loading}
      pagination={false}
      size="small"
      scroll={{ x: 1100 }}
      emptyText="Системных приходов DEN XAN нет"
    />
  );
}
