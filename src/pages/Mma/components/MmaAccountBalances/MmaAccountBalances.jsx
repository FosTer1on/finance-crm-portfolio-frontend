import { Alert, Button, Typography } from "antd";

import MoneyText from "@/components/finance/MoneyText/MoneyText";

import styles from "./MmaAccountBalances.module.css";

const { Text } = Typography;

export default function MmaAccountBalances({
  accounts,
  loading = false,
  error = "",
  onRetry,
}) {
  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        message="Не удалось загрузить счета MMA"
        description={error}
        action={
          <Button size="small" loading={loading} onClick={onRetry}>
            Повторить
          </Button>
        }
      />
    );
  }

  if (loading && accounts.length === 0) {
    return <Text type="secondary">Загрузка счетов...</Text>;
  }

  if (!loading && accounts.length === 0) {
    return (
      <Alert
        type="warning"
        showIcon
        message="Нет доступных счетов MMA"
        description="Создание операций недоступно, пока в backend нет активных счетов."
      />
    );
  }

  return (
    <div className={styles.root}>
      {accounts.map((account) => (
        <div key={account.id} className={styles.account}>
          <div className={styles.accountInfo}>
            <strong className={styles.accountName}>
              {account.name || account.code}
            </strong>

            {account.code && account.code !== account.name ? (
              <span className={styles.accountCode}>{account.code}</span>
            ) : null}
          </div>

          <MoneyText
            value={account.balance ?? "0"}
            currency="сум"
            className={styles.balance}
          />
        </div>
      ))}
    </div>
  );
}
