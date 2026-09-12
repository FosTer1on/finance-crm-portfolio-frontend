import { useState } from "react";

import { Button } from "antd";

import DataTable from "@/components/common/DataTable/DataTable";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import DebtDetailsModal from "../DebtDetailsModal/DebtDetailsModal";

import styles from "./DebtSummary.module.css";

function DebtSide({ title, tone, items = [], onOpen }) {
  const columns = [
    {
      title: "Человек",
      key: "counterparty",
      render: (_, item) => item?.counterparty?.name ?? "—",
    },
    {
      title: "За день",
      key: "day",
      align: "right",
      render: (_, item) => (
        <div className={styles.amountCell}>
          <MoneyText
            value={item?.day?.net_amount ?? "0"}
            currency={item?.currency}
            tone={tone}
          />
          {item?.day_type === "PREVIEW" && (
            <span className={styles.previewLabel}>предварительно</span>
          )}
        </div>
      ),
    },
    {
      title: "До этого",
      key: "before",
      align: "right",
      render: (_, item) => (
        <MoneyText
          value={item?.before?.net_amount ?? "0"}
          currency={item?.currency}
          tone={tone}
        />
      ),
    },
    {
      title: "Всего",
      key: "total",
      align: "right",
      render: (_, item) => (
        <MoneyText
          value={item?.total?.net_amount ?? "0"}
          currency={item?.currency}
          tone={tone}
        />
      ),
    },
    {
      title: "Валюта",
      dataIndex: "currency",
      key: "currency",
      align: "center",
      width: 90,
    },
    {
      title: "Действие",
      key: "action",
      align: "center",
      width: 100,
      render: (_, item) => (
        <Button
          type="link"
          size="small"
          disabled={!item?.counterparty?.id}
          onClick={() => onOpen(item.counterparty)}
        >
          Открыть
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.side}>
      <div className={styles.sideHeader}>
        <span>{title}</span>
        <span
          className={
            tone === "positive" ? styles.positiveMarker : styles.negativeMarker
          }
        />
      </div>

      <DataTable
        columns={columns}
        dataSource={items}
        rowKey={(item) => `${item.counterparty?.id}-${item.currency}`}
        pagination={false}
        size="small"
        scroll={{ x: 760 }}
        emptyText="Нет долгов"
      />
    </div>
  );
}

export default function DebtSummary({ debts, onDashboardRefresh }) {
  const [detailsCounterparty, setDetailsCounterparty] = useState(null);

  const theyOweUs = debts?.they_owe_us ?? [];
  const weOweThem = debts?.we_owe_them ?? [];

  return (
    <>
      <section className={styles.section}>
        <div className={styles.heading}>ДОЛГИ</div>

        <div className={styles.list}>
          <DebtSide
            title="МЫ ДОЛЖНЫ"
            tone="negative"
            items={weOweThem}
            onOpen={setDetailsCounterparty}
          />

          <DebtSide
            title="НАМ ДОЛЖНЫ"
            tone="positive"
            items={theyOweUs}
            onOpen={setDetailsCounterparty}
          />
        </div>
      </section>

      <DebtDetailsModal
        open={Boolean(detailsCounterparty)}
        counterparty={detailsCounterparty}
        onClose={() => setDetailsCounterparty(null)}
        onDashboardRefresh={onDashboardRefresh}
      />
    </>
  );
}
