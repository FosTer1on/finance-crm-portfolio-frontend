import { useCallback, useEffect, useRef, useState } from "react";

import { Alert, Button, Empty, Spin, Table, Tabs } from "antd";

import {
  getDebtAdjustments,
  getDebtConversions,
  getDebtNetOffs,
  getDebtPayments,
} from "@/api/debts";

import { normalizeApiError } from "@/api/errors";

import MoneyText from "@/components/finance/MoneyText/MoneyText";

import styles from "./DebtAudit.module.css";

function getCounterpartyName(record) {
  return record?.counterparty?.name ?? record?.debt?.counterparty?.name ?? "—";
}

function getDirectionLabel(direction) {
  if (direction === "THEY_OWE_US") {
    return "Он должен нам";
  }

  if (direction === "WE_OWE_THEM") {
    return "Мы должны ему";
  }

  return direction ?? "—";
}

function getRequestedDate(record) {
  return record?.requested_operation_date ?? record?.operation_date ?? "—";
}

function getEffectiveDate(record) {
  return (
    record?.effective_date ??
    record?.operation_date ??
    record?.requested_operation_date ??
    "—"
  );
}

function PaymentComponents({ components }) {
  if (!Array.isArray(components) || components.length === 0) {
    return "—";
  }

  return (
    <div className={styles.moneyList}>
      {components.map((component, index) => (
        <MoneyText
          key={`${component.currency}-${index}`}
          value={component.amount}
          currency={component.currency}
        />
      ))}
    </div>
  );
}

function AuditTable({ columns, data, loading, error, onRefresh }) {
  if (error && data.length === 0) {
    return (
      <Alert
        type="error"
        showIcon
        message={error}
        action={
          <Button size="small" onClick={onRefresh}>
            Повторить
          </Button>
        }
      />
    );
  }

  return (
    <div className={styles.tableWrap}>
      {error ? (
        <Alert type="error" showIcon message={error} className={styles.alert} />
      ) : null}

      <div className={styles.auditToolbar}>
        <Button size="small" onClick={onRefresh} loading={loading}>
          Обновить
        </Button>
      </div>

      <Spin spinning={loading}>
        {data.length === 0 && !loading ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="История пуста"
          />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={data}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
            }}
            size="small"
            scroll={{ x: 900 }}
          />
        )}
      </Spin>
    </div>
  );
}

export default function DebtAudit({ refreshKey = 0 }) {
  const [activeTab, setActiveTab] = useState("payments");

  const [payments, setPayments] = useState([]);

  const [netOffs, setNetOffs] = useState([]);

  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const [netOffsLoading, setNetOffsLoading] = useState(false);

  const [paymentsError, setPaymentsError] = useState("");

  const [netOffsError, setNetOffsError] = useState("");

  const [conversions, setConversions] = useState([]);

  const [adjustments, setAdjustments] = useState([]);

  const [conversionsLoading, setConversionsLoading] = useState(false);

  const [adjustmentsLoading, setAdjustmentsLoading] = useState(false);

  const [conversionsError, setConversionsError] = useState("");

  const [adjustmentsError, setAdjustmentsError] = useState("");

  const conversionsRequestIdRef = useRef(0);

  const adjustmentsRequestIdRef = useRef(0);

  const paymentsRequestIdRef = useRef(0);
  const netOffsRequestIdRef = useRef(0);

  const loadPayments = useCallback(async () => {
    const requestId = ++paymentsRequestIdRef.current;

    setPaymentsLoading(true);
    setPaymentsError("");

    try {
      const data = await getDebtPayments();

      if (requestId !== paymentsRequestIdRef.current) {
        return;
      }

      setPayments(Array.isArray(data) ? data : data?.results ?? []);
    } catch (requestError) {
      if (requestId !== paymentsRequestIdRef.current) {
        return;
      }

      const normalized = normalizeApiError(requestError);

      setPaymentsError(
        normalized.message || "Не удалось загрузить историю погашений."
      );
    } finally {
      if (requestId === paymentsRequestIdRef.current) {
        setPaymentsLoading(false);
      }
    }
  }, []);

  const loadNetOffs = useCallback(async () => {
    const requestId = ++netOffsRequestIdRef.current;

    setNetOffsLoading(true);
    setNetOffsError("");

    try {
      const data = await getDebtNetOffs();

      if (requestId !== netOffsRequestIdRef.current) {
        return;
      }

      setNetOffs(Array.isArray(data) ? data : data?.results ?? []);
    } catch (requestError) {
      if (requestId !== netOffsRequestIdRef.current) {
        return;
      }

      const normalized = normalizeApiError(requestError);

      setNetOffsError(
        normalized.message || "Не удалось загрузить историю взаимозачётов."
      );
    } finally {
      if (requestId === netOffsRequestIdRef.current) {
        setNetOffsLoading(false);
      }
    }
  }, []);

  const loadConversions = useCallback(async () => {
    const requestId = ++conversionsRequestIdRef.current;

    setConversionsLoading(true);
    setConversionsError("");

    try {
      const data = await getDebtConversions();

      if (requestId !== conversionsRequestIdRef.current) {
        return;
      }

      setConversions(Array.isArray(data) ? data : data?.results ?? []);
    } catch (requestError) {
      if (requestId !== conversionsRequestIdRef.current) {
        return;
      }

      const normalized = normalizeApiError(requestError);

      setConversionsError(
        normalized.message || "Не удалось загрузить историю конвертаций."
      );
    } finally {
      if (requestId === conversionsRequestIdRef.current) {
        setConversionsLoading(false);
      }
    }
  }, []);

  const loadAdjustments = useCallback(async () => {
    const requestId = ++adjustmentsRequestIdRef.current;

    setAdjustmentsLoading(true);
    setAdjustmentsError("");

    try {
      const data = await getDebtAdjustments();

      if (requestId !== adjustmentsRequestIdRef.current) {
        return;
      }

      setAdjustments(Array.isArray(data) ? data : data?.results ?? []);
    } catch (requestError) {
      if (requestId !== adjustmentsRequestIdRef.current) {
        return;
      }

      const normalized = normalizeApiError(requestError);

      setAdjustmentsError(
        normalized.message || "Не удалось загрузить историю списаний."
      );
    } finally {
      if (requestId === adjustmentsRequestIdRef.current) {
        setAdjustmentsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      await Promise.resolve();

      if (cancelled) {
        return;
      }

      if (activeTab === "payments") {
        await loadPayments();
      } else if (activeTab === "net-offs") {
        await loadNetOffs();
      } else if (activeTab === "conversions") {
        await loadConversions();
      } else if (activeTab === "adjustments") {
        await loadAdjustments();
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [
    activeTab,
    refreshKey,
    loadPayments,
    loadNetOffs,
    loadConversions,
    loadAdjustments,
  ]);

  const paymentColumns = [
    {
      title: "Запрошенная дата",
      key: "requested_date",
      width: 145,
      render: (_, record) => getRequestedDate(record),
    },
    {
      title: "Фактическая дата",
      key: "effective_date",
      width: 145,
      render: (_, record) => getEffectiveDate(record),
    },
    {
      title: "Человек",
      key: "counterparty",
      render: (_, record) => getCounterpartyName(record),
    },
    {
      title: "Направление",
      dataIndex: "direction",
      key: "direction",
      render: getDirectionLabel,
    },
    {
      title: "Физически",
      key: "components",
      render: (_, record) => (
        <PaymentComponents components={record.components} />
      ),
    },
    {
      title: "Курс",
      dataIndex: "uzs_per_usd",
      key: "uzs_per_usd",
      render: (value) => value || "—",
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      key: "comment",
      render: (value) => value || "—",
    },
  ];

  const netOffColumns = [
    {
      title: "Запрошенная дата",
      key: "requested_date",
      width: 145,
      render: (_, record) => getRequestedDate(record),
    },
    {
      title: "Фактическая дата",
      key: "effective_date",
      width: 145,
      render: (_, record) => getEffectiveDate(record),
    },
    {
      title: "Человек",
      key: "counterparty",
      render: (_, record) => getCounterpartyName(record),
    },
    {
      title: "Сумма",
      key: "amount",
      render: (_, record) => (
        <MoneyText value={record.amount} currency={record.currency} />
      ),
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      key: "comment",
      render: (value) => value || "—",
    },
  ];

  const conversionColumns = [
    {
      title: "Дата",
      key: "date",
      width: 120,
      render: (_, record) => getEffectiveDate(record),
    },
    {
      title: "Человек",
      key: "counterparty",
      render: (_, record) => getCounterpartyName(record),
    },
    {
      title: "Исходный Debt",
      dataIndex: "source_debt_id",
      key: "source_debt_id",
      width: 130,
      render: (value) => (value != null ? `#${value}` : "—"),
    },
    {
      title: "Новый Debt",
      dataIndex: "target_debt_id",
      key: "target_debt_id",
      width: 120,
      render: (value) => (value != null ? `#${value}` : "—"),
    },
    {
      title: "Из",
      key: "from_amount",
      render: (_, record) =>
        record.from_currency ? (
          <MoneyText
            value={record.from_amount}
            currency={record.from_currency}
          />
        ) : (
          "—"
        ),
    },
    {
      title: "В",
      key: "to_amount",
      render: (_, record) =>
        record.to_currency ? (
          <MoneyText value={record.to_amount} currency={record.to_currency} />
        ) : (
          "—"
        ),
    },
    {
      title: "Курс",
      dataIndex: "uzs_per_usd",
      key: "uzs_per_usd",
      render: (value) => value || "—",
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      key: "comment",
      render: (value) => value || "—",
    },
  ];

  const adjustmentColumns = [
    {
      title: "Дата",
      key: "date",
      width: 120,
      render: (_, record) => getEffectiveDate(record),
    },
    {
      title: "Человек",
      key: "counterparty",
      render: (_, record) => getCounterpartyName(record),
    },
    {
      title: "Направление",
      dataIndex: "direction",
      key: "direction",
      render: getDirectionLabel,
    },
    {
      title: "Debt",
      dataIndex: "debt_entry_id",
      key: "debt_entry_id",
      width: 90,
      render: (value) => (value != null ? `#${value}` : "—"),
    },
    {
      title: "Списано",
      key: "amount",
      render: (_, record) => (
        <MoneyText value={record.amount} currency={record.currency} />
      ),
    },
    {
      title: "Причина",
      dataIndex: "comment",
      key: "comment",
      render: (value) => value || "—",
    },
  ];

  const items = [
    {
      key: "payments",
      label: "Погашения",
      children: (
        <AuditTable
          columns={paymentColumns}
          data={payments}
          loading={paymentsLoading}
          error={paymentsError}
          onRefresh={loadPayments}
        />
      ),
    },
    {
      key: "net-offs",
      label: "Взаимозачёты",
      children: (
        <AuditTable
          columns={netOffColumns}
          data={netOffs}
          loading={netOffsLoading}
          error={netOffsError}
          onRefresh={loadNetOffs}
        />
      ),
    },
    {
      key: "conversions",
      label: "Конвертации",
      children: (
        <AuditTable
          columns={conversionColumns}
          data={conversions}
          loading={conversionsLoading}
          error={conversionsError}
          onRefresh={loadConversions}
        />
      ),
    },
    {
      key: "adjustments",
      label: "Списания",
      children: (
        <AuditTable
          columns={adjustmentColumns}
          data={adjustments}
          loading={adjustmentsLoading}
          error={adjustmentsError}
          onRefresh={loadAdjustments}
        />
      ),
    },
  ];

  return (
    <section className={styles.audit}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>История операций</h2>

          <div className={styles.subtitle}>
            Аудит выполненных операций по долгам
          </div>
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
    </section>
  );
}
