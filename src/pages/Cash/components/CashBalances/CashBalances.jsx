import { Alert, Button, Skeleton } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

import MoneyText from "@/components/finance/MoneyText/MoneyText";

import styles from "./CashBalances.module.css";

export default function CashBalances({
  balances,
  loading = false,
  error = "",
  onRetry,
}) {
  if (loading && !balances) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Текущий остаток</h2>

            <div className={styles.subtitle}>
              Не зависит от выбранной даты истории
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          <Skeleton.Input active block />
          <Skeleton.Input active block />
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Текущий остаток</h2>

          <div className={styles.subtitle}>
            Не зависит от выбранной даты истории
          </div>
        </div>
      </div>

      {error ? (
        <Alert
          type="error"
          showIcon
          message={error}
          action={
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={onRetry}
              loading={loading}
            >
              Повторить
            </Button>
          }
          className={styles.alert}
        />
      ) : null}

      <div className={styles.grid}>
        <div className={styles.balance}>
          <div className={styles.label}>Касса UZS</div>

          <div className={styles.value}>
            <MoneyText value={balances?.UZS ?? "0"} currency="сум" />
          </div>
        </div>

        <div className={styles.balance}>
          <div className={styles.label}>Касса USD</div>

          <div className={styles.value}>
            <MoneyText value={balances?.USD ?? "0"} currency="$" />
          </div>
        </div>
      </div>
    </section>
  );
}
