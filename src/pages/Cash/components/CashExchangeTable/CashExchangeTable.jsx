import { Alert, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import DataTable from "@/components/common/DataTable/DataTable";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import styles from "./CashExchangeTable.module.css";

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

function getCurrencySuffix(currency) {
  return currency === "USD" ? "$" : "сум";
}

function formatOperationDate(value) {
  if (!value) {
    return "—";
  }

  const date = dayjs(value);

  if (!date.isValid()) {
    return "—";
  }

  return date.format("DD.MM.YYYY");
}

export default function CashExchangeTable({
  exchanges,
  loading = false,
  error = "",
  onRetry,
}) {
  const columns = [
    {
      title: "Дата",
      dataIndex: "operation_date",
      key: "operation_date",
      width: 110,
      render: formatOperationDate,
    },
    {
      title: "Человек",
      key: "counterparty",
      width: 180,
      render: (_, exchange) => getCounterpartyName(exchange.counterparty),
    },
    {
      title: "Отдали",
      key: "from",
      width: 190,
      align: "right",
      render: (_, exchange) => (
        <MoneyText
          value={exchange.from_amount}
          currency={getCurrencySuffix(exchange.from_currency)}
        />
      ),
    },
    {
      title: "Получили",
      key: "to",
      width: 190,
      align: "right",
      render: (_, exchange) => (
        <MoneyText
          value={exchange.to_amount}
          currency={getCurrencySuffix(exchange.to_currency)}
        />
      ),
    },
    {
      title: "Факт. курс",
      dataIndex: "uzs_per_usd",
      key: "uzs_per_usd",
      width: 150,
      align: "right",
      render: (value) =>
        value ? <MoneyText value={value} currency="сум" /> : "—",
    },
    {
      title: "Заявл. курс",
      dataIndex: "declared_rate",
      key: "declared_rate",
      width: 150,
      align: "right",
      render: (value) =>
        value ? <MoneyText value={value} currency="сум" /> : "—",
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      key: "comment",
      render: (comment) => comment || "—",
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
        dataSource={exchanges}
        loading={loading}
        pagination={false}
        scroll={{ x: 1050 }}
        emptyText="Обменов пока нет"
      />
    </div>
  );
}
