import { forwardRef, useMemo } from "react";
import { Select } from "antd";

const MmaAccountSelect = forwardRef(function MmaAccountSelect(
  {
    accounts = [],
    value,
    onChange,
    disabled = false,
    loading = false,
    placeholder = "Выберите счёт",
    ...props
  },
  ref
) {
  const options = useMemo(
    () =>
      accounts.map((account) => ({
        value: account.id,
        label: account.name || account.code,
      })),
    [accounts]
  );

  return (
    <Select
      {...props}
      ref={ref}
      value={value}
      onChange={onChange}
      disabled={disabled}
      loading={loading}
      placeholder={placeholder}
      options={options}
      showSearch
      optionFilterProp="label"
      filterOption={(input, option) =>
        String(option?.label ?? "")
          .toLocaleLowerCase()
          .includes(input.trim().toLocaleLowerCase())
      }
    />
  );
});

export default MmaAccountSelect;
