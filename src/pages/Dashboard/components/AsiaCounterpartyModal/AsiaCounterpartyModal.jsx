import { useEffect, useState } from "react";

import { Alert, Button, Modal, Spin } from "antd";

import { getAsiaCounterparty } from "@/api/dashboard";

import { normalizeApiError } from "@/api/errors";

import DataTable from "@/components/common/DataTable/DataTable";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import { formatPercent } from "@/utils/money";

import styles from "./AsiaCounterpartyModal.module.css";

function buildIncomingColumns() {
  return [
    {
      title: "Фирма",
      dataIndex: "company",
      render: (value) => value?.name || "—",
    },
    {
      title: "Сумма",
      dataIndex: "amount",
      align: "right",
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "%",
      dataIndex: "percent",
      align: "right",
      width: 100,
      render: formatPercent,
    },
    {
      title: "Отдать наличкой",
      dataIndex: "cash_to_give",
      align: "right",
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      render: (value) => value || "—",
    },
  ];
}

function buildOutgoingColumns() {
  return [
    {
      title: "Фирма",
      dataIndex: "company",
      render: (value) => value?.name || "—",
    },
    {
      title: "Сумма",
      dataIndex: "amount",
      align: "right",
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "%",
      dataIndex: "percent",
      align: "right",
      width: 100,
      render: formatPercent,
    },
    {
      title: "Получить наличкой",
      dataIndex: "cash_to_receive",
      align: "right",
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      render: (value) => value || "—",
    },
  ];
}

export default function AsiaCounterpartyModal({
  open,
  counterparty,
  date,
  onClose,
}) {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);

  const counterpartyId = counterparty?.id;

  useEffect(() => {
    if (!open || !counterpartyId) {
      return undefined;
    }

    let cancelled = false;

    getAsiaCounterparty(counterpartyId, date)
      .then((response) => {
        if (cancelled) {
          return;
        }

        setData(response);
        setError("");
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }

        const apiError = normalizeApiError(requestError);

        setError(apiError.message || "Не удалось загрузить операции ASIA.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, counterpartyId, date, reloadKey]);

  return (
    <Modal
      open={open}
      title={counterparty ? `${counterparty.name} — ASIA` : "ASIA"}
      width="88vw"
      footer={null}
      onCancel={onClose}
      destroyOnHidden
    >
      <div className={styles.date}>{date}</div>

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          action={
            <Button
              size="small"
              onClick={() => {
                setLoading(true);

                setReloadKey((current) => current + 1);
              }}
            >
              Повторить
            </Button>
          }
        />
      )}

      {loading && !data ? (
        <div className={styles.loading}>
          <Spin />
        </div>
      ) : (
        <div className={styles.tables}>
          <section>
            <h3 className={styles.title}>Приходы</h3>

            <DataTable
              rowKey="id"
              columns={buildIncomingColumns()}
              dataSource={data?.incoming ?? []}
              pagination={false}
              size="small"
              emptyText="Приходов нет"
              scroll={{
                x: 800,
              }}
            />
          </section>

          <section>
            <h3 className={styles.title}>Исходы</h3>

            <DataTable
              rowKey="id"
              columns={buildOutgoingColumns()}
              dataSource={data?.outgoing ?? []}
              pagination={false}
              size="small"
              emptyText="Исходов нет"
              scroll={{
                x: 800,
              }}
            />
          </section>
        </div>
      )}
    </Modal>
  );
}
