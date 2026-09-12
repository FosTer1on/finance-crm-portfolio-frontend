import { forwardRef, useMemo } from "react";

import { Select } from "antd";

const TarleProductSelect = forwardRef(function TarleProductSelect(
  {
    products = [],
    loading = false,
    value,
    onChange,
    disabled = false,
    placeholder = "Выберите продукт",
    allowClear = false,
    ...props
  },
  ref
) {
  const options = useMemo(
    () =>
      products.map((product) => ({
        value: product.id,
        label: product.name,
        searchText: `${product.name ?? ""} ${product.code ?? ""}`.trim(),
      })),
    [products]
  );

  return (
    <Select
      {...props}
      ref={ref}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      allowClear={allowClear}
      showSearch
      loading={loading}
      options={options}
      filterOption={(input, option) =>
        String(option?.searchText ?? "")
          .toLowerCase()
          .includes(input.trim().toLowerCase())
      }
      notFoundContent={loading ? "Загрузка..." : "Не найдено"}
    />
  );
});

export default TarleProductSelect;
