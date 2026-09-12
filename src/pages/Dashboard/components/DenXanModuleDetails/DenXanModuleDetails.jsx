import { useEffect, useState } from "react";

import { Alert, Button, Spin } from "antd";

import { getDenXan } from "@/api/dashboard";

import { normalizeApiError } from "@/api/errors";

import DataTable from "@/components/common/DataTable/DataTable";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import styles from "./DenXanModuleDetails.module.css";

function ValueRow({ label, value, currency = "UZS", tone = "neutral" }) {
  return (
    <div className={styles.valueRow}>
      <span>{label}</span>

      <MoneyText value={value ?? "0"} currency={currency} tone={tone} />
    </div>
  );
}

export default function DenXanModuleDetails({ date }) {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getDenXan(date)
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

        setError(apiError.message || "Не удалось загрузить DEN XAN.");
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

  const distributorColumns = [
    {
      title: "Дистрибьютор",
      dataIndex: "distributor",
      render: (value) => value?.name || "—",
    },
    {
      title: "Приход",
      dataIndex: "incoming_amount_total",
      align: "right",
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "Редирект",
      dataIndex: "redirect_amount_total",
      align: "right",
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "Комиссия редиректа",
      dataIndex: "redirect_debit_fee_total",
      align: "right",
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "После редиректа",
      dataIndex: "amount_after_redirect_total",
      align: "right",
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "Чистый эффект банка",
      dataIndex: "bank_net_effect_total",
      align: "right",
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "Отдать Джамшиду",
      dataIndex: "cash_to_give_jamshid_total",
      align: "right",
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "Операций",
      dataIndex: "operations_count",
      align: "center",
      width: 80,
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

  const rates = data?.rates ?? {};

  const incoming = data?.incoming ?? {};

  const outgoing = data?.outgoing ?? {};

  const vat = data?.vat ?? {};

  const expenses = data?.expenses ?? {};

  const losses = data?.losses ?? {};

  return (
    <div className={styles.root}>
      <div className={styles.topGrid}>
        <section className={styles.panel}>
          <div className={styles.heading}>КУРСЫ</div>

          <ValueRow
            label="Курс DEN XAN"
            value={rates.den_xan_rate}
            currency={null}
          />

          <ValueRow
            label="Уличный курс"
            value={rates.street_rate}
            currency={null}
          />
        </section>

        <section className={styles.panel}>
          <div className={styles.heading}>ПРИХОД</div>

          <ValueRow
            label="Общий приход"
            value={incoming.gross_incoming_total}
          />

          <ValueRow label="Редиректы" value={incoming.redirect_amount_total} />

          <ValueRow
            label="Комиссия редиректов"
            value={incoming.redirect_debit_fee_total}
          />

          <ValueRow
            label="После редиректов"
            value={incoming.amount_after_redirect_total}
          />

          <ValueRow
            label="Чистый эффект банка"
            value={incoming.bank_net_effect_total}
          />

          <ValueRow
            label="Отдать Джамшиду"
            value={incoming.cash_to_give_jamshid_total}
          />
        </section>

        <section className={styles.panel}>
          <div className={styles.heading}>ИСХОД</div>

          <ValueRow label="Общий исход" value={outgoing.amount_total} />

          <ValueRow
            label="Получить от MMA"
            value={outgoing.cash_to_receive_from_mma_total}
          />

          <ValueRow
            label="Банковская комиссия"
            value={outgoing.debit_fee_total}
          />

          <ValueRow
            label="Списание со счёта"
            value={outgoing.total_account_debit}
          />

          <div className={styles.countRow}>
            <span>Операций</span>
            <strong>{outgoing.operations_count ?? 0}</strong>
          </div>
        </section>
      </div>

      <section className={styles.panel}>
        <div className={styles.heading}>ДИСТРИБЬЮТОРЫ</div>

        <DataTable
          rowKey={(row) => row.distributor.id}
          columns={distributorColumns}
          dataSource={data?.distributors ?? []}
          pagination={false}
          size="small"
          scroll={{
            x: 1200,
          }}
          emptyText="Операций по дистрибьюторам нет"
        />
      </section>

      <div className={styles.bottomGrid}>
        <section className={styles.panel}>
          <div className={styles.heading}>НДС</div>

          <ValueRow label="НДС приход" value={vat.incoming_amount_total} />

          <ValueRow label="НДС исход" value={vat.outgoing_amount_total} />

          <ValueRow
            label="Получить от MMA"
            value={vat.cash_to_receive_from_mma_total}
          />

          <ValueRow
            label="Комиссия исходов"
            value={vat.outgoing_debit_fee_total}
          />
        </section>

        <section className={styles.panel}>
          <div className={styles.heading}>РАСХОДЫ</div>

          <ValueRow
            label="Комиссии редиректов"
            value={expenses.redirect_debit_fee_total}
          />

          <ValueRow
            label="Комиссии исходов"
            value={expenses.outgoing_debit_fee_total}
          />

          <ValueRow
            label="Прочие расходы"
            value={expenses.other_expense_total}
          />

          <ValueRow
            label="Всего расходов"
            value={expenses.expenses_total}
            tone="negative"
          />
        </section>

        <section className={styles.panel}>
          <div className={styles.heading}>УБЫТКИ</div>

          <ValueRow
            label="Обычный убыток"
            value={losses.regular_loss}
            tone="negative"
          />

          <ValueRow
            label="USD по DEN XAN"
            value={losses.jamshid_usd_den_xan}
            currency="USD"
          />

          <ValueRow
            label="USD по улице"
            value={losses.jamshid_usd_street}
            currency="USD"
          />

          <ValueRow
            label="Курсовой убыток USD"
            value={losses.currency_loss_usd}
            currency="USD"
            tone="negative"
          />

          <ValueRow
            label="Курсовой убыток UZS"
            value={losses.currency_loss_uzs}
            tone="negative"
          />

          <ValueRow
            label="Общий убыток"
            value={losses.total_loss}
            tone="negative"
          />
        </section>
      </div>
    </div>
  );
}
