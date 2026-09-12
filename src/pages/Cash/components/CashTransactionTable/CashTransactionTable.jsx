import { Alert, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import DataTable from "@/components/common/DataTable/DataTable";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import styles from "./CashTransactionTable.module.css";

function getCounterpartyName(counterparty) {
  if (!counterparty) {
    return "—";
  }

  if (typeof counterparty === "string") {
    return counterparty;
  }

  return (
    counterparty.name ||
    counterparty.full_name ||
    counterparty.display_name ||
    "—"
  );
}

function getSource(transaction) {
  if (transaction.exchange_id) {
    return `Обмен #${transaction.exchange_id}`;
  }

  return "—";
}

function getTime(createdAt) {
  if (!createdAt) {
    return "—";
  }

  const value = dayjs(createdAt);

  if (!value.isValid()) {
    return "—";
  }

  return value.format("HH:mm");
}

export default function CashTransactionTable({
  transactions,
  loading = false,
  error = "",
  onRetry,
  emptyText = "Операций нет",
}) {
  const columns = [
    {
      title: "Время",
      key: "time",
      width: 85,
      render: (_, transaction) => getTime(transaction.created_at),
    },
    {
      title: "Человек",
      key: "counterparty",
      width: 180,
      render: (_, transaction) => getCounterpartyName(transaction.counterparty),
    },
    {
      title: "Валюта",
      dataIndex: "currency",
      key: "currency",
      width: 90,
      render: (currency) => currency || "—",
    },
    {
      title: "Сумма",
      dataIndex: "amount",
      key: "amount",
      width: 170,
      align: "right",
      render: (amount, transaction) => (
        <MoneyText
          value={amount}
          currency={transaction.currency === "USD" ? "$" : "сум"}
        />
      ),
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      key: "comment",
      render: (comment) => comment || "—",
    },
    {
      title: "Источник",
      key: "source",
      width: 130,
      render: (_, transaction) => getSource(transaction),
    },
  ];

  return (
    <div className={styles.root}>
      {error ? (
        <Alert
          type="error"
          showIcon
          message={error}
          action={
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={onRetry}
              loading={loading}
            >
              Повторить
            </Button>
          }
          className={styles.alert}
        />
      ) : null}

      <DataTable
        columns={columns}
        dataSource={transactions}
        loading={loading}
        pagination={false}
        scroll={{ x: 850 }}
        emptyText={emptyText}
      />
    </div>
  );
}
