import { forwardRef, useEffect, useMemo, useState } from "react";

import { Select } from "antd";

import { companiesApi } from "@/api/companies";
import { normalizeApiError } from "@/api/errors";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

function normalizeForComparison(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase();
}

const CompanySelect = forwardRef(function CompanySelect(
  {
    value,
    onChange,
    disabled = false,
    placeholder = "Выберите компанию",
    allowClear = true,
    ...props
  },
  ref
) {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const debouncedSearch = useDebouncedValue(search, 350);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      try {
        const data = await companiesApi.list({
          search: debouncedSearch,
        });

        if (!cancelled) {
          setItems(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch]);

  const trimmedSearch = search.trim();

  const hasMatchingCompany = useMemo(() => {
    if (!trimmedSearch) {
      return false;
    }

    const normalizedSearch = normalizeForComparison(trimmedSearch);

    return items.some(
      (item) => normalizeForComparison(item.name) === normalizedSearch
    );
  }, [items, trimmedSearch]);

  const canCreate =
    Boolean(trimmedSearch) && !loading && !creating && !hasMatchingCompany;

  const options = useMemo(() => {
    const companyOptions = items.map((item) => ({
      value: item.id,
      label: item.name,
    }));

    if (!canCreate) {
      return companyOptions;
    }

    return [
      ...companyOptions,
      {
        value: "__create_company__",
        label: `+ Создать «${trimmedSearch}»`,
      },
    ];
  }, [items, canCreate, trimmedSearch]);

  const handleCreate = async () => {
    if (!canCreate || creating) {
      return;
    }

    const companyName = trimmedSearch;

    setCreating(true);
    setCreateError("");

    try {
      const createdCompany = await companiesApi.create({
        name: companyName,
      });

      setItems((current) => {
        const alreadyExists = current.some(
          (item) => item.id === createdCompany.id
        );

        if (alreadyExists) {
          return current;
        }

        return [...current, createdCompany];
      });

      setSearch("");

      onChange?.(createdCompany.id);
    } catch (error) {
      const apiError = normalizeApiError(error);

      setCreateError(apiError.message || "Не удалось создать компанию.");
    } finally {
      setCreating(false);
    }
  };

  const handleChange = (nextValue, option) => {
    if (nextValue === "__create_company__") {
      void handleCreate();
      return;
    }

    setCreateError("");
    setSearch("");

    onChange?.(nextValue, option);
  };

  const handleSearch = (nextSearch) => {
    setSearch(nextSearch);

    if (createError) {
      setCreateError("");
    }
  };

  return (
    <Select
      {...props}
      ref={ref}
      value={value}
      onChange={handleChange}
      disabled={disabled || creating}
      placeholder={placeholder}
      allowClear={allowClear}
      showSearch
      filterOption={false}
      searchValue={search}
      onSearch={handleSearch}
      loading={loading || creating}
      options={options}
      notFoundContent={
        loading
          ? "Загрузка..."
          : creating
          ? "Создание компании..."
          : createError || "Не найдено"
      }
    />
  );
});

export default CompanySelect;
