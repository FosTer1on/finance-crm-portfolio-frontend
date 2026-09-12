import { Typography } from "antd";

import MoneyText from "@/components/finance/MoneyText/MoneyText";

import { formatDecimalString } from "@/utils/decimal";

import styles from "./AsiaNerudnikSummary.module.css";

const { Text } = Typography;

function getNerudnikDirection(direction) {
  switch (direction) {
    case "THEY_OWE_US":
      return "Нерудник должен нам";

    case "WE_OWE_THEM":
      return "Мы должны Неруднику";

    default:
      return "Расчёт закрыт";
  }
}

export default function AsiaNerudnikSummary({ data }) {
  const nerudnik = data?.nerudnik;

  const settings = data?.nerudnik_settings;

  if (!nerudnik) {
    return <Text type="secondary">Расчёт Нерудника отсутствует</Text>;
  }

  const allowedPercent = formatDecimalString(
    settings?.allowed_deduction_percent
  );

  const adjustmentPercent = formatDecimalString(settings?.adjustment_percent);

  const isZero = !nerudnik.direction;

  return (
    <div className={styles.root}>
      <div className={styles.rows}>
        <div className={styles.row}>
          <Text type="secondary">Общий приход</Text>

          <MoneyText value={nerudnik.incoming_total} currency="сум" />
        </div>

        <div className={styles.row}>
          <Text type="secondary">Разрешено снять после {allowedPercent}%</Text>

          <MoneyText value={nerudnik.allowed_outgoing} currency="сум" />
        </div>

        <div className={styles.row}>
          <Text type="secondary">Общий исход</Text>

          <MoneyText value={nerudnik.outgoing_total} currency="сум" />
        </div>

        <div className={styles.row}>
          <Text type="secondary">Разница</Text>

          <MoneyText value={nerudnik.difference} currency="сум" />
        </div>

        <div className={styles.row}>
          <Text type="secondary">После корректировки {adjustmentPercent}%</Text>

          <MoneyText value={nerudnik.adjusted_amount} currency="сум" />
        </div>
      </div>

      <div className={styles.result}>
        <Text strong>{getNerudnikDirection(nerudnik.direction)}</Text>

        <MoneyText
          value={isZero ? "0" : nerudnik.adjusted_amount}
          currency="сум"
        />
      </div>
    </div>
  );
}
