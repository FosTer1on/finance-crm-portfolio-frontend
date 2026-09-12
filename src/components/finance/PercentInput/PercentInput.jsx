import { forwardRef } from "react";

import { Input } from "antd";

const PercentInput = forwardRef(function PercentInput(
  { value = "", onChange, min = 0, max = 100, disabled = false, ...props },
  ref
) {
  const handleChange = (event) => {
    const raw = event.target.value.replace(",", ".").trim();

    if (raw === "") {
      onChange?.("");
      return;
    }

    if (!/^\d*(?:\.\d*)?$/.test(raw)) {
      return;
    }

    const numeric = Number(raw);

    if (Number.isFinite(numeric)) {
      if (min !== undefined && numeric < min) {
        return;
      }

      if (max !== undefined && numeric > max) {
        return;
      }
    }

    onChange?.(raw);
  };

  return (
    <Input
      {...props}
      ref={ref}
      value={value}
      disabled={disabled}
      suffix="%"
      inputMode="decimal"
      onChange={handleChange}
    />
  );
});

export default PercentInput;
