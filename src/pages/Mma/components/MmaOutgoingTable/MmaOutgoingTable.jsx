import { Button, Typography } from "antd";

import DataTable from "@/components/common/DataTable/DataTable";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

const { Text } = Typography;

export default function MmaOutgoingTable({
  items = [],
  loading = false,
  error = "",
  cancelDisabled = false,
  onCancel,
  onRetry,
}) {
  const columns = [
    {
      title: "Человек",
      key: "counterparty",
      width: 170,
      render: (_, record) => record.counterparty?.name ?? "—",
    },
    {
      title: "Фирма",
      key: "company",
      width: 170,
      render: (_, record) => record.company?.name ?? "—",
    },
    {
      title: "Счёт",
      key: "account",
      width: 140,
      render: (_, record) =>
        record.account?.name ?? record.account?.code ?? "—",
    },
    {
      title: "Сумма",
      dataIndex: "amount",
      key: "amount",
      width: 170,
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
      title: "Получить наличкой",
      dataIndex: "cash_to_receive",
      key: "cash_to_receive",
      width: 190,
      align: "right",
      render: (value) => <MoneyText value={value} currency="сум" />,
    },
    {
      title: "Комиссия банка",
      dataIndex: "debit_fee_amount",
      key: "debit_fee_amount",
      width: 170,
      align: "right",
      render: (value) => <MoneyText value={value} currency="сум" />,
    },
    {
      title: "Списано со счёта",
      dataIndex: "total_account_debit",
      key: "total_account_debit",
      width: 180,
      align: "right",
      render: (value) => <MoneyText value={value} currency="сум" />,
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      key: "comment",
      minWidth: 220,
      render: (value) => value || "—",
    },
    {
      title: "",
      key: "actions",
      width: 110,
      fixed: "right",
      render: (_, record) => (
        <Button
          danger
          size="small"
          disabled={cancelDisabled}
          onClick={() => onCancel?.("outgoing", record)}
        >
          Отменить
        </Button>
      ),
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
      scroll={{ x: 1550 }}
      emptyText="Исходов нет"
    />
  );
}
