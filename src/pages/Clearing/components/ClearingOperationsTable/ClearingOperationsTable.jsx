import { Button } from "antd";

import DataTable from "@/components/common/DataTable/DataTable";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import { formatPercent } from "@/utils/money";

import styles from "./ClearingOperationsTable.module.css";

function getResultLabel(resultType) {
  if (resultType === "PROFIT") {
    return "Прибыль";
  }

  if (resultType === "LOSS") {
    return "Убыток";
  }

  return "Без результата";
}

export default function ClearingOperationsTable({
  operations,
  loading,
  error,
  isClosed,
  cancellingId,
  onCancel,
  onRetry,
}) {
  const columns = [
    {
      title: "От кого",
      key: "from_counterparty",
      width: 150,
      render: (_, operation) => operation.from_counterparty?.name || "—",
    },
    {
      title: "Фирма",
      key: "from_company",
      width: 140,
      render: (_, operation) => operation.from_company?.name || "—",
    },
    {
      title: "%",
      dataIndex: "from_percent",
      key: "from_percent",
      width: 75,
      align: "right",
      render: (value) => formatPercent(value),
    },
    {
      title: "Кому",
      key: "to_counterparty",
      width: 150,
      render: (_, operation) => operation.to_counterparty?.name || "—",
    },
    {
      title: "Фирма",
      key: "to_company",
      width: 140,
      render: (_, operation) => operation.to_company?.name || "—",
    },
    {
      title: "%",
      dataIndex: "to_percent",
      key: "to_percent",
      width: 75,
      align: "right",
      render: (value) => formatPercent(value),
    },
    {
      title: "Сумма",
      dataIndex: "amount",
      key: "amount",
      width: 145,
      align: "right",
      render: (value) => <MoneyText value={value} currency="сум" />,
    },
    {
      title: "Отдать",
      dataIndex: "cash_to_give",
      key: "cash_to_give",
      width: 145,
      align: "right",
      render: (value) => <MoneyText value={value} currency="сум" />,
    },
    {
      title: "Получить",
      dataIndex: "cash_to_receive",
      key: "cash_to_receive",
      width: 145,
      align: "right",
      render: (value) => <MoneyText value={value} currency="сум" />,
    },
    {
      title: "Результат",
      key: "result",
      width: 170,
      align: "right",
      render: (_, operation) => (
        <div className={styles.result}>
          <span>{getResultLabel(operation.result_type)}</span>

          <MoneyText value={operation.result_amount} currency="сум" />
        </div>
      ),
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      key: "comment",
      width: 190,
      render: (value) => value || "—",
    },
    {
      title: "Действие",
      key: "action",
      width: 115,
      fixed: "right",
      render: (_, operation) =>
        isClosed ? (
          <span className={styles.readOnly}>—</span>
        ) : (
          <Button
            danger
            size="small"
            loading={cancellingId === operation.id}
            onClick={() => onCancel(operation)}
          >
            Отменить
          </Button>
        ),
    },
  ];

  if (error) {
    return (
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>ОПЕРАЦИИ ЗА ДЕНЬ</h2>
        </div>

        <div className={styles.error}>
          <span>Не удалось загрузить операции</span>

          <Button size="small" onClick={onRetry}>
            Повторить
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>ОПЕРАЦИИ ЗА ДЕНЬ</h2>
      </div>

      <DataTable
        rowKey="id"
        columns={columns}
        dataSource={operations}
        loading={loading}
        pagination={false}
        size="small"
        scroll={{
          x: 1600,
          y: 460,
        }}
        sticky
        emptyText="За выбранную дату операций нет"
      />
    </section>
  );
}
