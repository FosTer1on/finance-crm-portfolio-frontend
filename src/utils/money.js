const CURRENCY_LABELS = {
  UZS: "сум",
  USD: "$",
};

function normalizeDecimal(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const raw = String(value).trim().replace(/\s+/g, "").replace(",", ".");

  const isNegative = raw.startsWith("-");

  const unsigned = isNegative ? raw.slice(1) : raw;

  if (!/^\d+(?:\.\d+)?$/.test(unsigned)) {
    return null;
  }

  let [integerPart, decimalPart = ""] = unsigned.split(".");

  integerPart = integerPart.replace(/^0+(?=\d)/, "") || "0";

  decimalPart = decimalPart.replace(/0+$/, "");

  return {
    isNegative,
    integerPart,
    decimalPart,
  };
}

function groupThousands(value) {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function formatMoney(value, currency = null) {
  const normalized = normalizeDecimal(value);

  if (!normalized) {
    return "—";
  }

  const { isNegative, integerPart, decimalPart } = normalized;

  const sign = isNegative ? "-" : "";

  const integer = groupThousands(integerPart);

  const decimal = decimalPart ? `.${decimalPart}` : "";

  const formatted = `${sign}${integer}${decimal}`;

  const currencyLabel = currency ? CURRENCY_LABELS[currency] : null;

  if (!currencyLabel) {
    return formatted;
  }

  return `${formatted} ${currencyLabel}`;
}

export function formatPercent(value) {
  const normalized = normalizeDecimal(value);

  if (!normalized) {
    return "—";
  }

  const { isNegative, integerPart, decimalPart } = normalized;

  const sign = isNegative ? "-" : "";

  const decimal = decimalPart ? `.${decimalPart}` : "";

  return `${sign}${integerPart}${decimal}%`;
}
