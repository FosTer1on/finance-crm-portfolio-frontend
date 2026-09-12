import { useEffect, useState } from "react";

import { Alert, Button, Spin } from "antd";

import { getMma } from "@/api/dashboard";

import { normalizeApiError } from "@/api/errors";

import DataTable from "@/components/common/DataTable/DataTable";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import MmaCounterpartyModal from "../MmaCounterpartyModal/MmaCounterpartyModal";

import {
  getNetDirectionLabel,
  getNetDirectionTone,
} from "../../utils/dashboard";

import styles from "./MmaModuleDetails.module.css";

function ValueRow({ label, value, tone = "neutral" }) {
  return (
    <div className={styles.valueRow}>
      <span>{label}</span>

      <MoneyText value={value ?? "0"} currency="UZS" tone={tone} />
    </div>
  );
}

function CountRow({ label, value }) {
  return (
    <div className={styles.valueRow}>
      <span>{label}</span>

      <strong>{value ?? 0}</strong>
    </div>
  );
}

export default function MmaModuleDetails({ date }) {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);

  const [selectedCounterparty, setSelectedCounterparty] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getMma(date)
      .then((response) => {
        if (cancelled) {
          return;
        }

        setData(response);
        setError("");
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }

        const apiError = normalizeApiError(requestError);

        setError(apiError.message || "Не удалось загрузить MMA.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [date, reloadKey]);

  const columns = [
    {
      title: "Человек",
      dataIndex: "counterparty",
      render: (value) => value?.name || "—",
    },
    {
      title: "Приход",
      dataIndex: "incoming_amount_total",
      align: "right",
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "Исход",
      dataIndex: "outgoing_amount_total",
      align: "right",
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "Отдать",
      dataIndex: "cash_to_give_total",
      align: "right",
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "Получить",
      dataIndex: "cash_to_receive_total",
      align: "right",
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "Итог",
      key: "net",
      align: "right",
      render: (_, row) => {
        const tone = getNetDirectionTone(row.net_direction);

        return (
          <div className={styles.net}>
            <span>{getNetDirectionLabel(row.net_direction)}</span>

            <MoneyText value={row.net_amount} currency="UZS" tone={tone} />
          </div>
        );
      },
    },
    {
      title: "Приходов",
      dataIndex: "incoming_count",
      align: "center",
      width: 80,
    },
    {
      title: "Исходов",
      dataIndex: "outgoing_count",
      align: "center",
      width: 80,
    },
    {
      title: "Действие",
      key: "action",
      align: "center",
      width: 100,
      render: (_, row) => (
        <Button
          type="link"
          size="small"
          onClick={() => setSelectedCounterparty(row.counterparty)}
        >
          Детали
        </Button>
      ),
    },
  ];

  if (loading && !data) {
    return (
      <div className={styles.loading}>
        <Spin />
      </div>
    );
  }

  if (error && !data) {
    return (
      <Alert
        type="error"
        showIcon
        message={error}
        action={
          <Button
            size="small"
            onClick={() => {
              setLoading(true);

              setReloadKey((current) => current + 1);
            }}
          >
            Повторить
          </Button>
        }
      />
    );
  }

  const manual = data?.manual ?? {};

  const totals = data?.totals ?? {};

  const denXan = data?.den_xan ?? {};

  const regular = denXan.regular ?? {};

  const vat = denXan.vat ?? {};

  const expenses = data?.expenses ?? {};

  return (
    <div className={styles.root}>
      <section className={styles.cashPanel}>
        <div className={styles.heading}>ИТОГ ПО НАЛИЧКЕ</div>

        <div className={styles.cashSummaryGrid}>
          <ValueRow
            label="Получить наличкой"
            value={totals.cash_to_receive_total}
          />

          <ValueRow label="Отдать наличкой" value={totals.cash_to_give_total} />

          <ValueRow
            label={
              totals.result_type === "PROFIT"
                ? "Прибыль"
                : totals.result_type === "LOSS"
                ? "Убыток"
                : "Результат"
            }
            value={totals.result_amount}
            tone={
              totals.result_type === "PROFIT"
                ? "positive"
                : totals.result_type === "LOSS"
                ? "negative"
                : "neutral"
            }
          />
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.heading}>ОБЫЧНЫЕ ОПЕРАЦИИ</div>

        <div className={styles.summaryGrid}>
          <ValueRow label="Приход" value={manual.incoming_amount_total} />

          <ValueRow label="Исход" value={manual.outgoing_amount_total} />

          <ValueRow label="Отдать наличкой" value={manual.cash_to_give_total} />

          <ValueRow
            label="Получить наличкой"
            value={manual.cash_to_receive_total}
          />
        </div>

        <DataTable
          rowKey={(row) => row.counterparty.id}
          columns={columns}
          dataSource={data?.manual_counterparties ?? []}
          pagination={false}
          size="small"
          scroll={{
            x: 1150,
          }}
          emptyText="Обычных операций MMA нет"
        />
      </section>

      <div className={styles.bottomGrid}>
        <section className={styles.panel}>
          <div className={styles.heading}>DEN XAN → MMA</div>

          <CountRow label="Количество приходов" value={denXan.incoming_count} />

          <ValueRow label="Общая сумма" value={denXan.amount_total} />

          <ValueRow label="Отдать наличкой" value={denXan.cash_to_give_total} />
        </section>

        <section className={styles.panel}>
          <div className={styles.heading}>DEN XAN — REGULAR</div>

          <ValueRow label="Приход" value={regular.incoming_amount_total} />

          <ValueRow
            label="Отдать наличкой"
            value={regular.cash_to_give_total}
          />
        </section>

        <section className={styles.panel}>
          <div className={styles.heading}>DEN XAN — НДС</div>

          <ValueRow label="Приход" value={vat.incoming_amount_total} />

          <ValueRow label="Отдать наличкой" value={vat.cash_to_give_total} />
        </section>

        <section className={styles.panel}>
          <div className={styles.heading}>РАСХОДЫ</div>

          <ValueRow
            label="Прочие расходы"
            value={expenses.other_expense_total}
          />

          <ValueRow
            label="Банковские комиссии"
            value={expenses.debit_fee_total}
          />

          <ValueRow
            label="Всего расходов"
            value={expenses.expenses_total}
            tone="negative"
          />
        </section>
      </div>

      <MmaCounterpartyModal
        key={
          selectedCounterparty ? `${selectedCounterparty.id}-${date}` : "closed"
        }
        open={Boolean(selectedCounterparty)}
        counterparty={selectedCounterparty}
        date={date}
        onClose={() => setSelectedCounterparty(null)}
      />
    </div>
  );
}
