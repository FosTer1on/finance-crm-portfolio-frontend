import { forwardRef, useLayoutEffect, useRef } from "react";

import { Input } from "antd";

function normalizeMoneyValue(value, { allowDecimal }) {
  const raw = String(value ?? "")
    .replace(/\s+/g, "")
    .replace(",", ".");

  if (!raw) {
    return "";
  }

  const pattern = allowDecimal ? /^\d*(?:\.\d*)?$/ : /^\d*$/;

  if (!pattern.test(raw)) {
    return null;
  }

  return raw;
}

function formatMoneyInput(value) {
  if (!value) {
    return "";
  }

  const [integerPart, decimalPart] = String(value).split(".");

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  if (decimalPart !== undefined) {
    return `${formattedInteger}.` + decimalPart;
  }

  return formattedInteger;
}

function countNumericCharacters(value) {
  return String(value)
    .slice()
    .replace(/[^\d.]/g, "").length;
}

function resolveCaretPosition(formattedValue, characterCount) {
  if (characterCount <= 0) {
    return 0;
  }

  let seen = 0;

  for (let index = 0; index < formattedValue.length; index += 1) {
    const character = formattedValue[index];

    if (/\d|\./.test(character)) {
      seen += 1;
    }

    if (seen >= characterCount) {
      return index + 1;
    }
  }

  return formattedValue.length;
}

const MoneyInput = forwardRef(function MoneyInput(
  {
    value = "",
    onChange,

    allowDecimal = false,
    positiveOnly = true,
    allowZero = true,

    disabled = false,

    prefix,
    suffix,

    ...props
  },
  forwardedRef
) {
  const inputRef = useRef(null);

  const pendingCaretRef = useRef(null);

  const setRef = (node) => {
    inputRef.current = node;

    if (typeof forwardedRef === "function") {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  };

  const formattedValue = formatMoneyInput(value);

  useLayoutEffect(() => {
    if (pendingCaretRef.current === null) {
      return;
    }

    const input = inputRef.current?.input ?? inputRef.current;

    if (!input || typeof input.setSelectionRange !== "function") {
      pendingCaretRef.current = null;

      return;
    }

    const nextPosition = resolveCaretPosition(
      formattedValue,
      pendingCaretRef.current
    );

    input.setSelectionRange(nextPosition, nextPosition);

    pendingCaretRef.current = null;
  }, [formattedValue]);

  const handleChange = (event) => {
    const rawInput = event.target.value;

    const caretPosition = event.target.selectionStart ?? rawInput.length;

    const beforeCaret = rawInput.slice(0, caretPosition);

    pendingCaretRef.current = countNumericCharacters(beforeCaret);

    const normalized = normalizeMoneyValue(rawInput, {
      allowDecimal,
    });

    if (normalized === null) {
      return;
    }

    if (positiveOnly && normalized.startsWith("-")) {
      return;
    }

    if (!allowZero && normalized === "0") {
      return;
    }

    onChange?.(normalized);
  };

  return (
    <Input
      {...props}
      ref={setRef}
      value={formattedValue}
      disabled={disabled}
      prefix={prefix}
      suffix={suffix}
      inputMode={allowDecimal ? "decimal" : "numeric"}
      onChange={handleChange}
    />
  );
});

export default MoneyInput;
