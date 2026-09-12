import { Button, Typography } from "antd";

import DataTable from "@/components/common/DataTable/DataTable";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import styles from "./AsiaIncomingTable.module.css";

const { Text } = Typography;

export default function AsiaIncomingTable({
  data,
  loading,
  error,
  cancelDisabled = false,
  onRetry,
  onCancel,
}) {
  const columns = [
    {
      title: "Человек",
      dataIndex: "counterparty_name",
      key: "counterparty_name",
      width: 180,
    },
    {
      title: "Фирма",
      dataIndex: "company_name",
      key: "company_name",
      width: 180,
      render: (value) => value || "—",
    },
    {
      title: "Сумма",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      width: 160,
      render: (value) => <MoneyText value={value} currency="сум" />,
    },
    {
      title: "%",
      dataIndex: "percent",
      key: "percent",
      align: "right",
      width: 90,
    },
    {
      title: "Отдать наличкой",
      dataIndex: "cash_to_give",
      key: "cash_to_give",
      align: "right",
      width: 180,
      render: (value) => <MoneyText value={value} currency="сум" />,
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      key: "comment",
      ellipsis: true,
      render: (value) => value || "—",
    },
    {
      title: "Действие",
      key: "action",
      width: 110,
      render: (_, operation) => (
        <Button
          danger
          size="small"
          disabled={cancelDisabled}
          onClick={() => onCancel(operation)}
        >
          Отменить
        </Button>
      ),
    },
  ];

  if (error) {
    return (
      <div className={styles.error}>
        <Text type="danger">{error}</Text>

        <Button size="small" onClick={onRetry}>
          Повторить
        </Button>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
      scroll={{ x: 1100 }}
      emptyText="За выбранную дату приходов нет"
    />
  );
}
