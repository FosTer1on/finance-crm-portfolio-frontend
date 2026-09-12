import MoneyText from "@/components/finance/MoneyText/MoneyText";

import { getResultLabel, getResultTone } from "../../utils/dashboard";

import styles from "./DashboardTotals.module.css";

export default function DashboardTotals({ totals }) {
  if (!totals) {
    return null;
  }

  const resultTone = getResultTone(totals.result_type);

  return (
    <section className={styles.section}>
      <div className={styles.heading}>ПОЛНЫЙ ОБОРОТ ЗА ДЕНЬ</div>

      <div className={styles.grid}>
        <div className={styles.item}>
          <span className={styles.label}>Получить наличкой</span>

          <MoneyText
            value={totals.cash_to_receive_total}
            className={styles.money}
            currency="UZS"
          />
        </div>

        <div className={styles.item}>
          <span className={styles.label}>Отдать наличкой</span>

          <MoneyText
            value={totals.cash_to_give_total}
            className={styles.money}
            currency="UZS"
          />
        </div>

        <div className={styles.item}>
          <span className={styles.label}>Результат</span>

          <div className={styles.result}>
            <MoneyText
              value={totals.result_amount}
              className={styles.money}
              currency="UZS"
              tone={resultTone}
            />

            <span className={[styles.resultType, styles[resultTone]].join(" ")}>
              {getResultLabel(totals.result_type)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
