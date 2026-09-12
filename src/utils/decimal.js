export function formatDecimalString(value, fallback = "—") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const raw = String(value).trim();

  if (!raw) {
    return fallback;
  }

  if (!raw.includes(".")) {
    return raw;
  }

  const [integerPart, fractionalPart = ""] = raw.split(".");

  const trimmedFraction = fractionalPart.replace(/0+$/, "");

  return trimmedFraction ? `${integerPart}.${trimmedFraction}` : integerPart;
}
