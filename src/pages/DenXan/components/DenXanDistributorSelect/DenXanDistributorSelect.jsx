import { forwardRef, useMemo } from "react";

import { Select } from "antd";

const DenXanDistributorSelect = forwardRef(function DenXanDistributorSelect(
  { distributors = [], loading = false, ...props },
  ref
) {
  const options = useMemo(
    () =>
      distributors
        .filter((distributor) => distributor.is_active !== false)
        .map((distributor) => ({
          value: distributor.id,
          label: distributor.name,
        })),
    [distributors]
  );

  return (
    <Select
      ref={ref}
      showSearch
      allowClear
      optionFilterProp="label"
      options={options}
      loading={loading}
      placeholder="Дистрибьютор"
      {...props}
    />
  );
});

export default DenXanDistributorSelect;
