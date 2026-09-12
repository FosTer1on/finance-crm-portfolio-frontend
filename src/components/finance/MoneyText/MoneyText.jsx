import { formatMoney } from "@/utils/money";

import styles from "./MoneyText.module.css";

export default function MoneyText({
  value,
  currency = null,
  tone = "neutral",
  className = "",
}) {
  const classes = [styles.root, styles[tone], className]
    .filter(Boolean)
    .join(" ");

  return <span className={classes}>{formatMoney(value, currency)}</span>;
}
