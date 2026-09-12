import { Alert, Button, Typography } from "antd";

import DataTable from "@/components/common/DataTable/DataTable";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import styles from "./AsiaDailySummary.module.css";

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
      return "Результат";
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

export default function AsiaDailySummary({ data, loading, error, onRetry }) {
  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        message="Не удалось загрузить итог за день"
        description={error}
        action={
          <Button size="small" onClick={onRetry} loading={loading}>
            Повторить
          </Button>
        }
      />
    );
  }

  if (loading && !data) {
    return <Text type="secondary">Загрузка итогов...</Text>;
  }

  const summary = data?.summary ?? {};
  const counterparties = Array.isArray(data?.counterparties)
    ? data.counterparties
    : [];

  const counterpartyColumns = [
    {
      title: "Человек",
      dataIndex: "counterparty_name",
      key: "counterparty_name",
      width: 220,
    },
    {
      title: "Отдать",
      dataIndex: "cash_to_give_total",
      key: "cash_to_give_total",
      align: "right",
      width: 180,
      render: (value) => <MoneyText value={value} currency="сум" />,
    },
    {
      title: "Получить",
      dataIndex: "cash_to_receive_total",
      key: "cash_to_receive_total",
      align: "right",
      width: 180,
      render: (value) => <MoneyText value={value} currency="сум" />,
    },
    {
      title: "Итог",
      key: "net",
      align: "right",
      width: 230,
      render: (_, row) => (
        <div className={styles.netCell}>
          <Text>{getDirectionLabel(row.net_direction)}</Text>

          <MoneyText value={row.net_amount} currency="сум" />
        </div>
      ),
    },
  ];

  return (
    <div className={styles.root}>
      <div className={styles.totals}>
        <div className={styles.totalItem}>
          <Text type="secondary">Общий приход</Text>

          <MoneyText value={summary.incoming_total} currency="сум" />
        </div>

        <div className={styles.totalItem}>
          <Text type="secondary">Отдать наличкой</Text>

          <MoneyText value={summary.cash_to_give_total} currency="сум" />
        </div>

        <div className={styles.totalItem}>
          <Text type="secondary">Общий исход</Text>

          <MoneyText value={summary.outgoing_total} currency="сум" />
        </div>

        <div className={styles.totalItem}>
          <Text type="secondary">Получить наличкой</Text>

          <MoneyText value={summary.cash_to_receive_total} currency="сум" />
        </div>

        <div className={`${styles.totalItem} ${styles.resultItem}`}>
          <Text type="secondary">{getResultLabel(summary.result_type)}</Text>

          <MoneyText value={summary.result_amount} currency="сум" />
        </div>
      </div>

      <div className={styles.people}>
        <h3 className={styles.subtitle}>ПО ЛЮДЯМ</h3>

        <DataTable
          columns={counterpartyColumns}
          dataSource={counterparties}
          rowKey="counterparty_id"
          loading={loading}
          pagination={false}
          scroll={{ x: 850 }}
          emptyText="За выбранную дату расчётов по людям нет"
        />
      </div>
    </div>
  );
}
