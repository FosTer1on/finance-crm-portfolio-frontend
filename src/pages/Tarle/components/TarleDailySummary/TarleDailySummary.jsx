import { Button, Typography } from "antd";

import DataTable from "@/components/common/DataTable/DataTable";
import DailyTotals from "@/components/finance/DailyTotals/DailyTotals";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import styles from "./TarleDailySummary.module.css";

const { Text } = Typography;

function getResultLabel(resultType) {
  switch (resultType) {
    case "PROFIT":
      return "Прибыль";
    case "LOSS":
      return "Убыток";
    case "ZERO":
      return "Без результата";
    default:
      return "—";
  }
}

function getDirectionLabel(direction) {
  switch (direction) {
    case "THEY_OWE_US":
      return "Нам должны";
    case "WE_OWE_THEM":
      return "Мы должны";
    default:
      return "Расчёт закрыт";
  }
}

function ResultValue({ type, amount }) {
  return (
    <div className={styles.resultValue}>
      <span>{getResultLabel(type)}</span>

      <MoneyText value={amount ?? "0"} currency="сум" />
    </div>
  );
}

function DirectionValue({ direction, amount }) {
  return (
    <div className={styles.resultValue}>
      <span>{getDirectionLabel(direction)}</span>

      <MoneyText value={amount ?? "0"} currency="сум" />
    </div>
  );
}

export default function TarleDailySummary({
  daily,
  loading = false,
  error = "",
  onRetry,
}) {
  if (error) {
    return (
      <div className={styles.error}>
        <Text type="danger">Не удалось загрузить итог за день: {error}</Text>

        <Button size="small" loading={loading} onClick={onRetry}>
          Повторить
        </Button>
      </div>
    );
  }

  if (loading && !daily) {
    return <Text type="secondary">Загрузка итогов...</Text>;
  }

  if (!daily) {
    return <Text type="secondary">Итог за день недоступен</Text>;
  }

  const summary = daily.summary ?? {};
  const products = Array.isArray(daily.products) ? daily.products : [];
  const counterparties = Array.isArray(daily.counterparties)
    ? daily.counterparties
    : [];

  const productColumns = [
    {
      title: "Продукт",
      key: "product",
      render: (_, row) => row.product?.name || row.product?.code || "—",
    },
    {
      title: "Приход",
      dataIndex: "incoming_amount_total",
      key: "incoming_amount_total",
      align: "right",
      render: (value) => <MoneyText value={value ?? "0"} currency="сум" />,
    },
    {
      title: "Отдать",
      dataIndex: "cash_to_give_total",
      key: "cash_to_give_total",
      align: "right",
      render: (value) => <MoneyText value={value ?? "0"} currency="сум" />,
    },
    {
      title: "Исход",
      dataIndex: "outgoing_amount_total",
      key: "outgoing_amount_total",
      align: "right",
      render: (value) => <MoneyText value={value ?? "0"} currency="сум" />,
    },
    {
      title: "Получить",
      dataIndex: "cash_to_receive_total",
      key: "cash_to_receive_total",
      align: "right",
      render: (value) => <MoneyText value={value ?? "0"} currency="сум" />,
    },
    {
      title: "Итог",
      key: "result",
      align: "right",
      render: (_, row) => (
        <ResultValue type={row.result_type} amount={row.result_amount} />
      ),
    },
  ];

  const counterpartyColumns = [
    {
      title: "Человек",
      key: "counterparty",
      render: (_, row) => row.counterparty?.name || "—",
    },
    {
      title: "Приход",
      dataIndex: "incoming_amount_total",
      key: "incoming_amount_total",
      align: "right",
      render: (value) => <MoneyText value={value ?? "0"} currency="сум" />,
    },
    {
      title: "Отдать",
      dataIndex: "cash_to_give_total",
      key: "cash_to_give_total",
      align: "right",
      render: (value) => <MoneyText value={value ?? "0"} currency="сум" />,
    },
    {
      title: "Исход",
      dataIndex: "outgoing_amount_total",
      key: "outgoing_amount_total",
      align: "right",
      render: (value) => <MoneyText value={value ?? "0"} currency="сум" />,
    },
    {
      title: "Получить",
      dataIndex: "cash_to_receive_total",
      key: "cash_to_receive_total",
      align: "right",
      render: (value) => <MoneyText value={value ?? "0"} currency="сум" />,
    },
    {
      title: "Итог",
      key: "result",
      align: "right",
      render: (_, row) => (
        <DirectionValue direction={row.net_direction} amount={row.net_amount} />
      ),
    },
  ];

  return (
    <div className={styles.root}>
      <section className={styles.block}>
        <h3 className={styles.heading}>ИТОГ ЗА ДЕНЬ</h3>

        <DailyTotals
          items={[
            {
              key: "incoming_total",
              label: "Общий приход",
              value: summary.incoming_total ?? "0",
              currency: "сум",
            },
            {
              key: "cash_to_give_total",
              label: "Отдать наличкой",
              value: summary.cash_to_give_total ?? "0",
              currency: "сум",
            },
            {
              key: "outgoing_total",
              label: "Общий исход",
              value: summary.outgoing_total ?? "0",
              currency: "сум",
            },
            {
              key: "cash_to_receive_total",
              label: "Получить наличкой",
              value: summary.cash_to_receive_total ?? "0",
              currency: "сум",
            },
          ]}
        />

        <div className={styles.overallResult}>
          <span>Результат</span>

          <ResultValue
            type={summary.result_type}
            amount={summary.result_amount}
          />
        </div>
      </section>

      <section className={styles.block}>
        <h3 className={styles.heading}>ПО ПРОДУКТАМ</h3>

        <DataTable
          columns={productColumns}
          dataSource={products}
          rowKey={(row) => row.product?.id ?? row.product?.code}
          loading={loading}
          pagination={false}
          scroll={{ x: 1000 }}
          emptyText="Нет данных по продуктам"
        />
      </section>

      <section className={styles.block}>
        <h3 className={styles.heading}>ПО ЛЮДЯМ</h3>

        <DataTable
          columns={counterpartyColumns}
          dataSource={counterparties}
          rowKey={(row) => row.counterparty?.id}
          loading={loading}
          pagination={false}
          scroll={{ x: 1000 }}
          emptyText="Нет данных по людям"
        />
      </section>
    </div>
  );
}
