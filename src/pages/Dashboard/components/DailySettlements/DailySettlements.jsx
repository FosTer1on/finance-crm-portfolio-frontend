import { Button } from "antd";

import DataTable from "@/components/common/DataTable/DataTable";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import styles from "./DailySettlements.module.css";

function SettlementSide({ title, tone, items = [], onOpenDetails }) {
  const columns = [
    {
      title: "Человек",
      key: "counterparty",
      render: (_, item) => (
        <span className={styles.counterpartyName}>
          {item?.counterparty?.name ?? "—"}
        </span>
      ),
    },
    {
      title: "Сумма",
      key: "amount",
      align: "right",
      render: (_, item) => (
        <MoneyText
          value={item?.amount ?? "0"}
          currency={item?.currency ?? "UZS"}
          tone={tone}
        />
      ),
    },
    {
      title: "",
      key: "action",
      align: "right",
      width: 110,
      render: (_, item) => (
        <Button
          type="link"
          size="small"
          disabled={!item?.counterparty?.id}
          onClick={() => onOpenDetails?.(item.counterparty)}
        >
          Детальнее
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
        rowKey={(item) => item.counterparty?.id}
        pagination={false}
        size="small"
        scroll={{ x: 420 }}
        emptyText="За выбранный день долгов нет"
      />
    </div>
  );
}

export default function DailySettlements({ settlements, onOpenDetails }) {
  const theyOweUs = settlements?.they_owe_us ?? [];

  const weOweThem = settlements?.we_owe_them ?? [];

  return (
    <section className={styles.section}>
      <div className={styles.heading}>ДОЛГИ ЗА ДЕНЬ</div>

      <div className={styles.grid}>
        <SettlementSide
          title="НАМ ДОЛЖНЫ"
          tone="positive"
          items={theyOweUs}
          onOpenDetails={onOpenDetails}
        />

        <SettlementSide
          title="МЫ ДОЛЖНЫ"
          tone="negative"
          items={weOweThem}
          onOpenDetails={onOpenDetails}
        />
      </div>
    </section>
  );
}
