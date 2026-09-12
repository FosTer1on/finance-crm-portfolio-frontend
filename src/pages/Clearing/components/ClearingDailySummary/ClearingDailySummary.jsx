import { Alert, Button } from "antd";

import DataTable from "@/components/common/DataTable/DataTable";
import DailyTotals from "@/components/finance/DailyTotals/DailyTotals";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import styles from "./ClearingDailySummary.module.css";

function getSummaryResultLabel(resultType) {
  if (resultType === "PROFIT") {
    return "Прибыль";
  }

  if (resultType === "LOSS") {
    return "Убыток";
  }

  return "Без результата";
}

function getNetLabel(direction) {
  if (direction === "THEY_OWE_US") {
    return "Нам должны";
  }

  if (direction === "WE_OWE_THEM") {
    return "Мы должны";
  }

  return "Расчёт закрыт";
}

export default function ClearingDailySummary({
  dailySummary,
  loading,
  error,
  onRetry,
}) {
  const summary = dailySummary?.summary ?? null;
  const counterparties = Array.isArray(dailySummary?.counterparties)
    ? dailySummary.counterparties
    : [];

  const columns = [
    {
      title: "Человек",
      key: "counterparty",
      width: 220,
      render: (_, row) => row.counterparty?.name || "—",
    },
    {
      title: "Получить",
      dataIndex: "cash_to_receive_total",
      key: "cash_to_receive_total",
      width: 180,
      align: "right",
      render: (value) => <MoneyText value={value} currency="сум" />,
    },
    {
      title: "Отдать",
      dataIndex: "cash_to_give_total",
      key: "cash_to_give_total",
      width: 180,
      align: "right",
      render: (value) => <MoneyText value={value} currency="сум" />,
    },
    {
      title: "Итог",
      key: "net",
      width: 220,
      align: "right",
      render: (_, row) => (
        <div className={styles.net}>
          <span>{getNetLabel(row.net_direction)}</span>

          <MoneyText value={row.net_amount} currency="сум" />
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <h2>ИТОГ ЗА ДЕНЬ</h2>
        </div>

        <Alert
          type="error"
          showIcon
          message="Не удалось загрузить итог за день"
          description={
            <div className={styles.errorDescription}>
              <span>{error}</span>

              <Button size="small" onClick={onRetry}>
                Повторить
              </Button>
            </div>
          }
        />
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2>ИТОГ ЗА ДЕНЬ</h2>
      </div>

      <div className={styles.content}>
        <DailyTotals
          loading={loading}
          items={[
            {
              key: "recieve",
              label: "Получить",
              value: summary?.cash_to_receive_total ?? "0",
              currency: "сум",
            },
            {
              key: "give",
              label: "Отдать",
              value: summary?.cash_to_give_total ?? "0",
              currency: "сум",
            },
            {
              key: "currency",
              label: getSummaryResultLabel(summary?.result_type),
              value: summary?.result_amount ?? "0",
              currency: "сум",
            },
          ]}
        />

        <div className={styles.tableBlock}>
          <div className={styles.tableTitle}>По людям</div>

          <DataTable
            rowKey={(row) => row.counterparty?.id ?? row.counterparty?.name}
            columns={columns}
            dataSource={counterparties}
            loading={loading}
            pagination={false}
            size="small"
            scroll={{ x: 800 }}
            emptyText="За выбранную дату расчётов нет"
          />
        </div>
      </div>
    </section>
  );
}
