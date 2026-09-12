import MoneyText from "@/components/finance/MoneyText/MoneyText";

import styles from "./CurrentBalances.module.css";

function AccountGroup({ title, accounts }) {
  return (
    <div className={styles.accountGroup}>
      <div className={styles.groupTitle}>{title}</div>

      {accounts?.length ? (
        accounts.map((account) => (
          <div className={styles.accountRow} key={account.id}>
            <span>{account.name}</span>

            <MoneyText value={account.balance} currency="UZS" />
          </div>
        ))
      ) : (
        <div className={styles.empty}>Нет счетов</div>
      )}
    </div>
  );
}

export default function CurrentBalances({ cash, bankAccounts }) {
  return (
    <div className={styles.grid}>
      <section className={styles.section}>
        <div className={styles.heading}>
          КАССА
          <span className={styles.current}>Текущий остаток</span>
        </div>

        <div className={styles.balanceRow}>
          <span>Сум</span>

          <MoneyText value={cash?.UZS ?? "0"} currency="UZS" />
        </div>

        <div className={styles.balanceRow}>
          <span>USD</span>

          <MoneyText value={cash?.USD ?? "0"} currency="USD" />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.heading}>
          БАНКОВСКИЕ СЧЕТА
          <span className={styles.current}>Текущий остаток</span>
        </div>

        <div className={styles.accounts}>
          <AccountGroup title="MMA" accounts={bankAccounts?.mma} />

          <AccountGroup title="DEN XAN" accounts={bankAccounts?.den_xan} />
        </div>
      </section>
    </div>
  );
}
