function normalizeDecimalString(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const raw = String(value).trim().replace(/\s+/g, "").replace(",", ".");

  if (!/^\d+(?:\.\d+)?$/.test(raw)) {
    return null;
  }

  return raw;
}

function toScaledInteger(value, scale) {
  const normalized = normalizeDecimalString(value);

  if (!normalized) {
    return null;
  }

  const [integer, fraction = ""] = normalized.split(".");

  const paddedFraction = fraction.padEnd(scale, "0").slice(0, scale);

  return BigInt(`${integer}${paddedFraction}`);
}

function fromScaledInteger(value, scale) {
  const raw = value.toString();

  if (scale === 0) {
    return raw;
  }

  const padded = raw.padStart(scale + 1, "0");

  const integer = padded.slice(0, -scale);

  const fraction = padded.slice(-scale).replace(/0+$/, "");

  return fraction ? `${integer}.${fraction}` : integer;
}

export function amountAfterPercent(amount, percent) {
  const amountScale = 2;
  const percentScale = 4;

  const scaledAmount = toScaledInteger(amount, amountScale);

  const scaledPercent = toScaledInteger(percent, percentScale);

  if (scaledAmount === null || scaledPercent === null) {
    return null;
  }

  const hundred = BigInt(100) * BigInt(10 ** percentScale);

  if (scaledPercent < 0 || scaledPercent > hundred) {
    return null;
  }

  const numerator = scaledAmount * (hundred - scaledPercent);

  const denominator = hundred;

  const rounded = (numerator + denominator / BigInt(2)) / denominator;

  return fromScaledInteger(rounded, amountScale);
}
