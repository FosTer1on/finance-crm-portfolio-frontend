import MoneyText from "@/components/finance/MoneyText/MoneyText";

import styles from "./DailyTotals.module.css";

export default function DailyTotals({ items = [] }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className={styles.root}>
      {items.map((item) => (
        <div key={item.key} className={styles.item}>
          <span className={styles.label}>{item.label}</span>

          <MoneyText
            value={item.value}
            currency={item.currency}
            tone={item.tone ?? "neutral"}
            className={styles.value}
          />
        </div>
      ))}
    </div>
  );
}
