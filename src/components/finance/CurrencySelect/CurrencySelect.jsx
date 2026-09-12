import { forwardRef } from "react";

import { Select } from "antd";

const OPTIONS = [
  {
    value: "UZS",
    label: "Сум",
  },
  {
    value: "USD",
    label: "USD",
  },
];

const CurrencySelect = forwardRef(function CurrencySelect(
  { value, onChange, onAccept, acceptSelectedOnEnter = true, ...props },
  ref
) {
  const handleKeyDown = (event) => {
    //
    // В существующих формах сохраняем прежнее поведение:
    // если валюта уже выбрана, Enter принимает текущее
    // значение и переводит дальше.
    //
    // Формы, где нужно повторно открыть список Enter-ом,
    // могут отключить это через acceptSelectedOnEnter={false}.
    //
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
    }

    if (event.key === "Enter" && value && acceptSelectedOnEnter) {
      event.preventDefault();
      onAccept?.(value);
    }

    props.onKeyDown?.(event);
  };

  return (
    <Select
      {...props}
      ref={ref}
      value={value}
      options={OPTIONS}
      onChange={onChange}
      onKeyDown={handleKeyDown}
    />
  );
});

export default CurrencySelect;
