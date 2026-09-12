import { forwardRef, useEffect, useMemo, useState } from "react";

import { Select } from "antd";

import { counterpartiesApi } from "@/api/counterparties";
import { normalizeApiError } from "@/api/errors";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";

function normalizeForComparison(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase();
}

const CREATE_COUNTERPARTY_VALUE = "__create_counterparty__";

const CounterpartySelect = forwardRef(function CounterpartySelect(
  {
    value,
    onChange,
    disabled = false,
    placeholder = "Выберите контрагента",
    allowClear = true,
    allowCreate = true,
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
        const data = await counterpartiesApi.list({
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

  const hasMatchingCounterparty = useMemo(() => {
    if (!trimmedSearch) {
      return false;
    }

    const normalizedSearch = normalizeForComparison(trimmedSearch);

    return items.some(
      (item) => normalizeForComparison(item.name) === normalizedSearch
    );
  }, [items, trimmedSearch]);

  const canCreate =
    allowCreate &&
    Boolean(trimmedSearch) &&
    !loading &&
    !creating &&
    !hasMatchingCounterparty;

  const options = useMemo(() => {
    const counterpartyOptions = items.map((item) => ({
      value: item.id,
      label: item.name,
    }));

    if (!canCreate) {
      return counterpartyOptions;
    }

    return [
      ...counterpartyOptions,
      {
        value: CREATE_COUNTERPARTY_VALUE,
        label: `+ Создать «${trimmedSearch}»`,
      },
    ];
  }, [items, canCreate, trimmedSearch]);

  const handleCreate = async () => {
    if (!canCreate || creating) {
      return;
    }

    const counterpartyName = trimmedSearch;

    setCreating(true);
    setCreateError("");

    try {
      const createdCounterparty = await counterpartiesApi.create({
        name: counterpartyName,
      });

      setItems((current) => {
        const alreadyExists = current.some(
          (item) => item.id === createdCounterparty.id
        );

        if (alreadyExists) {
          return current;
        }

        return [...current, createdCounterparty];
      });

      setSearch("");

      onChange?.(createdCounterparty.id);
    } catch (error) {
      const apiError = normalizeApiError(error);

      setCreateError(apiError.message || "Не удалось создать контрагента.");
    } finally {
      setCreating(false);
    }
  };

  const handleChange = (nextValue, option) => {
    if (nextValue === CREATE_COUNTERPARTY_VALUE) {
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
          ? "Создание контрагента..."
          : createError || "Не найдено"
      }
    />
  );
});

export default CounterpartySelect;
