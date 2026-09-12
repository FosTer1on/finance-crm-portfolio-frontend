import { Button, Typography } from "antd";

import DataTable from "@/components/common/DataTable/DataTable";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import styles from "./MmaDailySummary.module.css";

const { Text } = Typography;

function Metric({ label, value, tone = "neutral", prominent = false }) {
  return (
    <div
      className={[styles.metric, prominent ? styles.prominentMetric : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <Text type="secondary" className={styles.metricLabel}>
        {label}
      </Text>

      <MoneyText
        value={value ?? "0"}
        currency="сум"
        tone={tone}
        className={[styles.metricValue, prominent ? styles.prominentValue : ""]
          .filter(Boolean)
          .join(" ")}
      />
    </div>
  );
}

function renderDirection(value) {
  if (value === "WE_OWE_THEM") {
    return "Мы должны";
  }

  if (value === "THEY_OWE_US") {
    return "Нам должны";
  }

  if (value === "BALANCED") {
    return "Расчёт закрыт";
  }

  return "—";
}

function getResultTone(resultType) {
  if (resultType === "PROFIT") {
    return "positive";
  }

  if (resultType === "LOSS") {
    return "negative";
  }

  return "neutral";
}

function getResultLabel(resultType) {
  if (resultType === "PROFIT") {
    return "Прибыль";
  }

  if (resultType === "LOSS") {
    return "Убыток";
  }

  return "Ноль";
}

export default function MmaDailySummary({
  data,
  loading = false,
  error = "",
  onRetry,
}) {
  if (error) {
    return (
      <div className={styles.error}>
        <Text type="danger">{error}</Text>

        <Button size="small" loading={loading} onClick={onRetry}>
          Повторить
        </Button>
      </div>
    );
  }

  if (loading && !data) {
    return <Text type="secondary">Загрузка итогов MMA...</Text>;
  }

  if (!data) {
    return <Text type="secondary">Нет данных за выбранный день</Text>;
  }

  const summary = data.summary ?? {};
  const denXan = data.den_xan ?? {};

  const counterparties = Array.isArray(data.counterparties)
    ? data.counterparties
    : [];

  const resultTone = getResultTone(summary.result_type);
  const resultLabel = getResultLabel(summary.result_type);

  const counterpartyColumns = [
    {
      title: "Человек",
      key: "counterparty",
      width: 180,
      render: (_, record) => record.counterparty?.name ?? "—",
    },
    {
      title: "Приходы",
      dataIndex: "incoming_amount_total",
      key: "incoming_amount_total",
      width: 170,
      align: "right",
      render: (value) => <MoneyText value={value} currency="сум" />,
    },
    {
      title: "Исходы",
      dataIndex: "outgoing_amount_total",
      key: "outgoing_amount_total",
      width: 170,
      align: "right",
      render: (value) => <MoneyText value={value} currency="сум" />,
    },
    {
      title: "Отдать наличкой",
      dataIndex: "cash_to_give_total",
      key: "cash_to_give_total",
      width: 180,
      align: "right",
      render: (value) => <MoneyText value={value} currency="сум" />,
    },
    {
      title: "Получить наличкой",
      dataIndex: "cash_to_receive_total",
      key: "cash_to_receive_total",
      width: 190,
      align: "right",
      render: (value) => <MoneyText value={value} currency="сум" />,
    },
    {
      title: "Итог",
      dataIndex: "net_amount",
      key: "net_amount",
      width: 170,
      align: "right",
      render: (value) => <MoneyText value={value} currency="сум" />,
    },
    {
      title: "Направление",
      dataIndex: "net_direction",
      key: "net_direction",
      width: 150,
      render: renderDirection,
    },
  ];

  return (
    <div className={styles.root}>
      <div className={styles.cashSummary}>
        <div className={styles.cashSummaryHeader}>
          <strong>ИТОГ ПО НАЛИЧКЕ</strong>
        </div>

        <div className={styles.cashMetrics}>
          <Metric
            label="Получить наличкой"
            value={summary.total_cash_to_receive}
            prominent
          />

          <Metric
            label="Отдать наличкой"
            value={summary.total_cash_to_give}
            prominent
          />

          <div className={styles.resultMetric}>
            <Text type="secondary" className={styles.metricLabel}>
              Результат
            </Text>

            <div className={styles.resultValue}>
              <MoneyText
                value={summary.result_amount ?? "0"}
                currency="сум"
                tone={resultTone}
                className={styles.prominentValue}
              />

              <span
                className={[styles.resultType, styles[resultTone]].join(" ")}
              >
                {resultLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.block}>
        <div className={styles.blockHeader}>
          <strong>РУЧНЫЕ ОПЕРАЦИИ</strong>
        </div>

        <div className={styles.metrics}>
          <Metric
            label="Ручные приходы"
            value={summary.manual_incoming_amount_total}
          />

          <Metric
            label="Отдать по ручным приходам"
            value={summary.manual_cash_to_give_total}
          />

          <Metric label="Исходы" value={summary.outgoing_amount_total} />

          <Metric
            label="Получить по исходам"
            value={summary.outgoing_cash_to_receive_total}
          />

          <Metric label="Комиссия банка" value={summary.debit_fee_total} />

          <Metric label="Прочие расходы" value={summary.other_expense_total} />
        </div>
      </div>

      <div className={styles.block}>
        <div className={styles.blockHeader}>
          <strong>DEN XAN → MMA</strong>
        </div>

        <div className={styles.metrics}>
          <Metric
            label="Всего системных приходов"
            value={denXan.amount_total}
          />

          <Metric
            label="Всего отдать DEN XAN"
            value={denXan.cash_to_give_total}
          />

          <Metric
            label="Обычные приходы"
            value={denXan.regular_incoming_amount_total}
          />

          <Metric
            label="Отдать по обычным"
            value={denXan.regular_cash_to_give_total}
          />

          <Metric
            label="НДС приходы"
            value={denXan.vat_incoming_amount_total}
          />

          <Metric label="Отдать по НДС" value={denXan.vat_cash_to_give_total} />
        </div>
      </div>

      <div className={styles.block}>
        <div className={styles.blockHeader}>
          <strong>БАНКОВСКИЕ ПОКАЗАТЕЛИ</strong>
        </div>

        <div className={styles.metrics}>
          <Metric
            label="Все приходы"
            value={summary.incoming_amount_total_all}
          />

          <Metric label="Все исходы" value={summary.outgoing_amount_total} />

          <Metric label="Банковские комиссии" value={summary.debit_fee_total} />

          <Metric label="Прочие расходы" value={summary.other_expense_total} />

          <Metric label="Всего расходов" value={summary.expenses_total} />
        </div>
      </div>

      <div className={styles.block}>
        <div className={styles.blockHeader}>
          <strong>РАСЧЁТЫ ПО ЛЮДЯМ</strong>
        </div>

        <DataTable
          columns={counterpartyColumns}
          dataSource={counterparties}
          loading={loading}
          pagination={false}
          size="small"
          scroll={{ x: 1200 }}
          emptyText="Расчётов по людям нет"
        />
      </div>
    </div>
  );
}
