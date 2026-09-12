import dayjs from "dayjs";

export const API_DATE_FORMAT = "YYYY-MM-DD";

export const UI_DATE_FORMAT = "DD.MM.YYYY";

export function formatDate(value, format = UI_DATE_FORMAT) {
  if (!value) {
    return "—";
  }

  const parsed = dayjs(value);

  if (!parsed.isValid()) {
    return "—";
  }

  return parsed.format(format);
}

export function toApiDate(value) {
  if (!value) {
    return null;
  }

  const parsed = dayjs(value);

  if (!parsed.isValid()) {
    return null;
  }

  return parsed.format(API_DATE_FORMAT);
}

export function getTodayApiDate() {
  return dayjs().format(API_DATE_FORMAT);
}
