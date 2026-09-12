import { Button } from "antd";
import { ClearOutlined } from "@ant-design/icons";

import CounterpartySelect from "@/components/finance/CounterpartySelect/CounterpartySelect";
import CurrencySelect from "@/components/finance/CurrencySelect/CurrencySelect";

import styles from "./CashTransactionFilters.module.css";

export default function CashTransactionFilters({
  filters,
  onChange,
  onReset,
  loading = false,
}) {
  const handleCurrencyChange = (currency) => {
    onChange({
      ...filters,
      currency: currency ?? null,
    });
  };

  const handleCounterpartyChange = (counterpartyId) => {
    onChange({
      ...filters,
      counterpartyId: counterpartyId ?? null,
    });
  };

  const hasFilters =
    Boolean(filters.currency) || filters.counterpartyId !== null;

  return (
    <div className={styles.root}>
      <div className={styles.label}>Фильтр:</div>

      <div className={styles.counterparty}>
        <CounterpartySelect
          value={filters.counterpartyId}
          onChange={handleCounterpartyChange}
          allowClear
          placeholder="Все люди"
          disabled={loading}
        />
      </div>

      <div className={styles.currency}>
        <CurrencySelect
          value={filters.currency}
          onChange={handleCurrencyChange}
          allowClear
          placeholder="Все валюты"
          acceptSelectedOnEnter={false}
          disabled={loading}
        />
      </div>

      <Button
        icon={<ClearOutlined />}
        onClick={onReset}
        disabled={!hasFilters || loading}
      >
        Сбросить
      </Button>
    </div>
  );
}
