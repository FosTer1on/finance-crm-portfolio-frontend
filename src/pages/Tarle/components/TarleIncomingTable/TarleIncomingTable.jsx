import { Button, Typography } from "antd";

import DataTable from "@/components/common/DataTable/DataTable";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import styles from "./TarleIncomingTable.module.css";

const { Text } = Typography;

export default function TarleIncomingTable({
  operations = [],
  loading = false,
  error = "",
  actionsDisabled = false,
  onRetry,
  onCancel,
}) {
  const columns = [
    {
      title: "Человек",
      key: "counterparty",
      render: (_, operation) => operation.counterparty?.name || "—",
    },
    {
      title: "Фирма",
      key: "company",
      render: (_, operation) => operation.company?.name || "—",
    },
    {
      title: "Продукт",
      key: "product",
      render: (_, operation) =>
        operation.product?.name || operation.product?.code || "—",
    },
    {
      title: "Сумма",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (value) => <MoneyText value={value} currency="сум" />,
    },
    {
      title: "%",
      dataIndex: "percent",
      key: "percent",
      align: "right",
      width: 90,
      render: (value) =>
        value === null || value === undefined ? "—" : `${value}%`,
    },
    {
      title: "Отдать наличкой",
      dataIndex: "cash_to_give",
      key: "cash_to_give",
      align: "right",
      render: (value) => <MoneyText value={value} currency="сум" />,
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      key: "comment",
      render: (value) => value || "—",
    },
    {
      title: "Действие",
      key: "actions",
      width: 110,
      render: (_, operation) => (
        <Button
          type="link"
          danger
          size="small"
          disabled={actionsDisabled}
          onClick={() => onCancel?.(operation)}
        >
          Отменить
        </Button>
      ),
    },
  ];

  if (error) {
    return (
      <div className={styles.error}>
        <Text type="danger">Не удалось загрузить приходы: {error}</Text>

        <Button size="small" loading={loading} onClick={onRetry}>
          Повторить
        </Button>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      dataSource={operations}
      loading={loading}
      pagination={false}
      scroll={{ x: 1050 }}
      emptyText="За выбранную дату приходов нет"
    />
  );
}
