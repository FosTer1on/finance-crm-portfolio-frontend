import { forwardRef, useMemo } from "react";

import { Select } from "antd";

const DenXanMmaAccountSelect = forwardRef(function DenXanMmaAccountSelect(
  { accounts = [], loading = false, ...props },
  ref
) {
  const options = useMemo(
    () =>
      accounts
        .filter((account) => account.is_active !== false)
        .map((account) => ({
          value: account.id,
          label: account.name || account.code,
        })),
    [accounts]
  );

  return (
    <Select
      ref={ref}
      showSearch
      allowClear
      optionFilterProp="label"
      options={options}
      loading={loading}
      placeholder="Счёт MMA"
      {...props}
    />
  );
});

export default DenXanMmaAccountSelect;
