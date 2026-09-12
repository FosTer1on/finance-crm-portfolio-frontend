import { useEffect, useRef, useState } from "react";

import { Alert, Button, Modal, Spin, Table, Tag } from "antd";

import { getCounterpartyDayDetail } from "@/api/dashboard";

import { formatMoney, formatPercent } from "@/utils/money";

import styles from "./CounterpartyDayDetailModal.module.css";

const MODULE_LABELS = {
  ASIA: "ASIA",
  TARLE: "TARLE",
  MMA: "MMA",
  CLEARING: "Взаиморасчёты",
  DEN_XAN_JAMSHID: "DEN XAN",
};

function getDirectionLabel(direction) {
  if (direction === "THEY_OWE_US") {
    return "Нам должны";
  }

  if (direction === "WE_OWE_THEM") {
    return "Мы должны";
  }

  return "Без долга";
}

function ResultAmount({ result }) {
  if (!result) {
    return null;
  }

  const isPositive = result.direction === "THEY_OWE_US";

  const isNegative = result.direction === "WE_OWE_THEM";

  return (
    <div className={styles.result}>
      <span>{getDirectionLabel(result.direction)}</span>

      <strong
        className={
          isPositive
            ? styles.positive
            : isNegative
            ? styles.negative
            : undefined
        }
      >
        {formatMoney(result.amount, "UZS")}
      </strong>
    </div>
  );
}

function EmptyOperations() {
  return <div className={styles.emptyOperations}>Операций нет</div>;
}

function CompanyValue({ company }) {
  return company?.name ?? "—";
}

function CommentValue({ value }) {
  return value || "—";
}

function CommonTable({ columns, operations, rowKeyPrefix, minWidth = 700 }) {
  if (!Array.isArray(operations) || operations.length === 0) {
    return <EmptyOperations />;
  }

  return (
    <Table
      rowKey={(operation) => `${rowKeyPrefix}-${operation.id}`}
      columns={columns}
      dataSource={operations}
      pagination={false}
      size="small"
      scroll={{ x: minWidth }}
    />
  );
}

function AsiaOperations({ operations }) {
  if (!operations) {
    return <EmptyOperations />;
  }

  const incoming = operations.incoming ?? [];
  const outgoing = operations.outgoing ?? [];

  const incomingColumns = [
    {
      title: "Фирма",
      key: "company",
      render: (_, operation) => <CompanyValue company={operation.company} />,
    },
    {
      title: "Сумма",
      key: "amount",
      align: "right",
      render: (_, operation) => formatMoney(operation.amount, "UZS"),
    },
    {
      title: "%",
      key: "percent",
      align: "right",
      width: 80,
      render: (_, operation) => formatPercent(operation.percent),
    },
    {
      title: "Отдать наличкой",
      key: "cash_to_give",
      align: "right",
      render: (_, operation) => formatMoney(operation.cash_to_give, "UZS"),
    },
    {
      title: "Комментарий",
      key: "comment",
      render: (_, operation) => <CommentValue value={operation.comment} />,
    },
  ];

  const outgoingColumns = [
    {
      title: "Фирма",
      key: "company",
      render: (_, operation) => <CompanyValue company={operation.company} />,
    },
    {
      title: "Сумма",
      key: "amount",
      align: "right",
      render: (_, operation) => formatMoney(operation.amount, "UZS"),
    },
    {
      title: "%",
      key: "percent",
      align: "right",
      width: 80,
      render: (_, operation) => formatPercent(operation.percent),
    },
    {
      title: "Получить наличкой",
      key: "cash_to_receive",
      align: "right",
      render: (_, operation) => formatMoney(operation.cash_to_receive, "UZS"),
    },
    {
      title: "Комментарий",
      key: "comment",
      render: (_, operation) => <CommentValue value={operation.comment} />,
    },
  ];

  return (
    <div className={styles.operationGroups}>
      {incoming.length > 0 && (
        <div className={styles.operationGroup}>
          <div className={styles.operationGroupTitle}>Приходы</div>

          <CommonTable
            rowKeyPrefix="asia-incoming"
            columns={incomingColumns}
            operations={incoming}
            minWidth={850}
          />
        </div>
      )}

      {outgoing.length > 0 && (
        <div className={styles.operationGroup}>
          <div className={styles.operationGroupTitle}>Исходы</div>

          <CommonTable
            rowKeyPrefix="asia-outgoing"
            columns={outgoingColumns}
            operations={outgoing}
            minWidth={850}
          />
        </div>
      )}

      {incoming.length === 0 && outgoing.length === 0 && <EmptyOperations />}
    </div>
  );
}

function MmaOperations({ operations }) {
  if (!operations) {
    return <EmptyOperations />;
  }

  const incoming = operations.incoming ?? [];
  const outgoing = operations.outgoing ?? [];

  const incomingColumns = [
    {
      title: "Фирма",
      key: "company",
      render: (_, operation) => <CompanyValue company={operation.company} />,
    },
    {
      title: "Счёт",
      key: "account",
      render: (_, operation) => operation.account?.name ?? "—",
    },
    {
      title: "Сумма",
      key: "amount",
      align: "right",
      render: (_, operation) => formatMoney(operation.amount, "UZS"),
    },
    {
      title: "%",
      key: "percent",
      align: "right",
      width: 80,
      render: (_, operation) => formatPercent(operation.percent),
    },
    {
      title: "Отдать наличкой",
      key: "cash_to_give",
      align: "right",
      render: (_, operation) => formatMoney(operation.cash_to_give, "UZS"),
    },
    {
      title: "Комментарий",
      key: "comment",
      render: (_, operation) => <CommentValue value={operation.comment} />,
    },
  ];

  const outgoingColumns = [
    {
      title: "Фирма",
      key: "company",
      render: (_, operation) => <CompanyValue company={operation.company} />,
    },
    {
      title: "Счёт",
      key: "account",
      render: (_, operation) => operation.account?.name ?? "—",
    },
    {
      title: "Сумма",
      key: "amount",
      align: "right",
      render: (_, operation) => formatMoney(operation.amount, "UZS"),
    },
    {
      title: "%",
      key: "percent",
      align: "right",
      width: 80,
      render: (_, operation) => formatPercent(operation.percent),
    },
    {
      title: "Получить наличкой",
      key: "cash_to_receive",
      align: "right",
      render: (_, operation) => formatMoney(operation.cash_to_receive, "UZS"),
    },
    {
      title: "Комментарий",
      key: "comment",
      render: (_, operation) => <CommentValue value={operation.comment} />,
    },
  ];

  return (
    <div className={styles.operationGroups}>
      {incoming.length > 0 && (
        <div className={styles.operationGroup}>
          <div className={styles.operationGroupTitle}>Приходы</div>

          <CommonTable
            rowKeyPrefix="mma-incoming"
            columns={incomingColumns}
            operations={incoming}
            minWidth={950}
          />
        </div>
      )}

      {outgoing.length > 0 && (
        <div className={styles.operationGroup}>
          <div className={styles.operationGroupTitle}>Исходы</div>

          <CommonTable
            rowKeyPrefix="mma-outgoing"
            columns={outgoingColumns}
            operations={outgoing}
            minWidth={950}
          />
        </div>
      )}

      {incoming.length === 0 && outgoing.length === 0 && <EmptyOperations />}
    </div>
  );
}

function TarleOperations({ operations }) {
  const rows = operations?.operations ?? [];

  const columns = [
    {
      title: "Операция",
      key: "direction",
      width: 100,
      render: (_, operation) =>
        operation.direction === "INCOMING" ? "Приход" : "Исход",
    },
    {
      title: "Товар",
      key: "product",
      render: (_, operation) => operation.product?.name ?? "—",
    },
    {
      title: "Фирма",
      key: "company",
      render: (_, operation) => <CompanyValue company={operation.company} />,
    },
    {
      title: "Сумма",
      key: "amount",
      align: "right",
      render: (_, operation) => formatMoney(operation.amount, "UZS"),
    },
    {
      title: "%",
      key: "percent",
      align: "right",
      width: 80,
      render: (_, operation) => formatPercent(operation.percent),
    },
    {
      title: "Наличка",
      key: "cash",
      align: "right",
      render: (_, operation) =>
        formatMoney(
          operation.direction === "INCOMING"
            ? operation.cash_to_give
            : operation.cash_to_receive,
          "UZS"
        ),
    },
    {
      title: "Комментарий",
      key: "comment",
      render: (_, operation) => <CommentValue value={operation.comment} />,
    },
  ];

  return (
    <CommonTable
      rowKeyPrefix="tarle"
      columns={columns}
      operations={rows}
      minWidth={950}
    />
  );
}

function getClearingRoleLabel(role) {
  if (role === "FROM") {
    return "От нас";
  }

  if (role === "TO") {
    return "К нам";
  }

  if (role === "BOTH") {
    return "Обе стороны";
  }

  return "—";
}

function ClearingOperations({ operations }) {
  const rows = operations?.operations ?? [];

  const columns = [
    {
      title: "Роль",
      key: "role",
      width: 110,
      render: (_, operation) => getClearingRoleLabel(operation.role),
    },
    {
      title: "От кого",
      key: "from_counterparty",
      render: (_, operation) => operation.from_counterparty?.name ?? "—",
    },
    {
      title: "Фирма отправителя",
      key: "from_company",
      render: (_, operation) => (
        <CompanyValue company={operation.from_company} />
      ),
    },
    {
      title: "Кому",
      key: "to_counterparty",
      render: (_, operation) => operation.to_counterparty?.name ?? "—",
    },
    {
      title: "Фирма получателя",
      key: "to_company",
      render: (_, operation) => <CompanyValue company={operation.to_company} />,
    },
    {
      title: "Сумма",
      key: "amount",
      align: "right",
      render: (_, operation) => formatMoney(operation.amount, "UZS"),
    },
    {
      title: "% от",
      key: "from_percent",
      align: "right",
      width: 80,
      render: (_, operation) => formatPercent(operation.from_percent),
    },
    {
      title: "% кому",
      key: "to_percent",
      align: "right",
      width: 80,
      render: (_, operation) => formatPercent(operation.to_percent),
    },
    {
      title: "Комментарий",
      key: "comment",
      render: (_, operation) => <CommentValue value={operation.comment} />,
    },
  ];

  return (
    <CommonTable
      rowKeyPrefix="clearing"
      columns={columns}
      operations={rows}
      minWidth={1250}
    />
  );
}

function DenXanOperations({ operations }) {
  const rows = operations?.operations ?? [];

  const columns = [
    {
      title: "Дистрибьютор",
      key: "distributor",
      render: (_, operation) => operation.distributor?.name ?? "—",
    },
    {
      title: "Счёт",
      key: "account",
      render: (_, operation) => operation.account?.name ?? "—",
    },
    {
      title: "Сумма",
      key: "amount",
      align: "right",
      render: (_, operation) => formatMoney(operation.amount, "UZS"),
    },
    {
      title: "%",
      key: "percent",
      align: "right",
      width: 80,
      render: (_, operation) => formatPercent(operation.percent),
    },
    {
      title: "Редирект",
      key: "redirect_amount",
      align: "right",
      render: (_, operation) => formatMoney(operation.redirect_amount, "UZS"),
    },
    {
      title: "Отдать Жамшиду",
      key: "cash_to_give_jamshid",
      align: "right",
      render: (_, operation) =>
        formatMoney(operation.cash_to_give_jamshid, "UZS"),
    },
    {
      title: "Комментарий",
      key: "comment",
      render: (_, operation) => <CommentValue value={operation.comment} />,
    },
  ];

  return (
    <CommonTable
      rowKeyPrefix="den-xan"
      columns={columns}
      operations={rows}
      minWidth={1000}
    />
  );
}

function ModuleOperations({ moduleCode, operations }) {
  if (moduleCode === "ASIA") {
    return <AsiaOperations operations={operations} />;
  }

  if (moduleCode === "MMA") {
    return <MmaOperations operations={operations} />;
  }

  if (moduleCode === "TARLE") {
    return <TarleOperations operations={operations} />;
  }

  if (moduleCode === "CLEARING") {
    return <ClearingOperations operations={operations} />;
  }

  if (moduleCode === "DEN_XAN_JAMSHID") {
    return <DenXanOperations operations={operations} />;
  }

  return <EmptyOperations />;
}

export default function CounterpartyDayDetailModal({
  open,
  counterparty,
  date,
  onClose,
}) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!open || !counterparty?.id || !date) {
      return undefined;
    }

    let cancelled = false;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    async function loadInitialDetail() {
      try {
        const data = await getCounterpartyDayDetail(counterparty.id, date);

        if (!cancelled && requestId === requestIdRef.current) {
          setDetail(data);
        }
      } catch {
        if (!cancelled && requestId === requestIdRef.current) {
          setError("Не удалось загрузить детализацию");
        }
      } finally {
        if (!cancelled && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }

    loadInitialDetail();

    return () => {
      cancelled = true;

      if (requestId === requestIdRef.current) {
        requestIdRef.current += 1;
      }
    };
  }, [open, counterparty?.id, date]);

  async function handleRetry() {
    if (!open || !counterparty?.id || !date) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setError("");
    setLoading(true);

    try {
      const data = await getCounterpartyDayDetail(counterparty.id, date);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setDetail(data);
    } catch {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setError("Не удалось загрузить детализацию");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1100}
      destroyOnHidden
      title={
        <div className={styles.modalTitle}>
          <span>{counterparty?.name ?? "Контрагент"}</span>

          {detail && (
            <Tag>{detail.is_closed ? "День закрыт" : "День открыт"}</Tag>
          )}
        </div>
      }
    >
      <Spin spinning={loading}>
        {error && (
          <Alert
            type="error"
            showIcon
            message="Не удалось загрузить детализацию"
            className={styles.alert}
            action={
              <Button size="small" onClick={handleRetry} disabled={loading}>
                Повторить
              </Button>
            }
          />
        )}

        {!error && detail && (
          <div className={styles.content}>
            <div className={styles.date}>{detail.operation_date}</div>

            <div className={styles.modules}>
              {detail.modules.map((module) => (
                <section key={module.module} className={styles.module}>
                  <div className={styles.moduleHeader}>
                    <strong>
                      {module.label ||
                        MODULE_LABELS[module.module] ||
                        module.module}
                    </strong>

                    <ResultAmount result={module.result} />
                  </div>

                  <ModuleOperations
                    moduleCode={module.module}
                    operations={module.operations}
                  />
                </section>
              ))}
            </div>

            {detail.modules.length === 0 && (
              <div className={styles.empty}>За выбранный день операций нет</div>
            )}

            <div className={styles.total}>
              <span>ИТОГ ЗА ДЕНЬ</span>

              <ResultAmount result={detail.total} />
            </div>
          </div>
        )}
      </Spin>
    </Modal>
  );
}
