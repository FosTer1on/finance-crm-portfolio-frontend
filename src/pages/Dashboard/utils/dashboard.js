export const MODULE_NAMES = {
  CLEARING: "Взаиморасчёты",
  ASIA: "ASIA",
  TARLE: "TARLE",
  DEN_XAN: "DEN XAN",
  MMA: "MMA",
};

export const MODULE_ORDER = ["CLEARING", "ASIA", "TARLE", "DEN_XAN", "MMA"];

export function getResultLabel(resultType) {
  switch (resultType) {
    case "PROFIT":
      return "Прибыль";

    case "LOSS":
      return "Убыток";

    case "ZERO":
      return "Без результата";

    default:
      return "—";
  }
}

export function getResultTone(resultType) {
  switch (resultType) {
    case "PROFIT":
      return "positive";

    case "LOSS":
      return "negative";

    default:
      return "neutral";
  }
}

export function sortDashboardModules(modules = []) {
  const order = new Map(MODULE_ORDER.map((code, index) => [code, index]));

  return [...modules].sort((left, right) => {
    const leftOrder = order.get(left.code) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = order.get(right.code) ?? Number.MAX_SAFE_INTEGER;

    return leftOrder - rightOrder;
  });
}

export function getNetDirectionLabel(direction) {
  switch (direction) {
    case "THEY_OWE_US":
      return "Должен нам";

    case "WE_OWE_THEM":
      return "Мы должны";

    default:
      return "Без долга";
  }
}

export function getNetDirectionTone(direction) {
  switch (direction) {
    case "THEY_OWE_US":
      return "positive";

    case "WE_OWE_THEM":
      return "negative";

    default:
      return "neutral";
  }
}

export function getClearingRoleLabel(role) {
  switch (role) {
    case "FROM":
      return "Отправитель";

    case "TO":
      return "Получатель";

    case "BOTH":
      return "Обе стороны";

    default:
      return role || "—";
  }
}

export function getAsiaDirectionLabel(direction) {
  switch (direction) {
    case "THEY_OWE_US":
      return "Должен нам";

    case "WE_OWE_THEM":
      return "Мы должны";

    default:
      return "Без долга";
  }
}

export function getOperationDirectionLabel(direction) {
  switch (direction) {
    case "INCOMING":
      return "Приход";

    case "OUTGOING":
      return "Исход";

    default:
      return direction || "—";
  }
}
