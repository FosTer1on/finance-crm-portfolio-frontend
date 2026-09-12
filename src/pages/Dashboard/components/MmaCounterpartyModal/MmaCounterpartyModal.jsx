import { useEffect, useState } from "react";

import { Alert, Button, Modal, Spin } from "antd";

import { getMmaCounterparty } from "@/api/dashboard";

import { normalizeApiError } from "@/api/errors";

import DataTable from "@/components/common/DataTable/DataTable";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import { formatPercent } from "@/utils/money";

import styles from "./MmaCounterpartyModal.module.css";

function entityName(entity) {
  return entity?.name || "—";
}

function accountName(account) {
  if (!account) {
    return "—";
  }

  return account.name || account.code || "—";
}

export default function MmaCounterpartyModal({
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

    getMmaCounterparty(counterpartyId, date)
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

        setError(apiError.message || "Не удалось загрузить операции MMA.");
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

  const incomingColumns = [
    {
      title: "Источник",
      dataIndex: "source",
      width: 110,
      render: (value) => value || "—",
    },
    {
      title: "Фирма",
      dataIndex: "company",
      width: 150,
      render: entityName,
    },
    {
      title: "Счёт",
      dataIndex: "account",
      width: 150,
      render: accountName,
    },
    {
      title: "Сумма",
      dataIndex: "amount",
      align: "right",
      width: 150,
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "%",
      dataIndex: "percent",
      align: "right",
      width: 90,
      render: formatPercent,
    },
    {
      title: "Отдать наличкой",
      dataIndex: "cash_to_give",
      align: "right",
      width: 160,
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      width: 220,
      render: (value) => value || "—",
    },
  ];

  const outgoingColumns = [
    {
      title: "Фирма",
      dataIndex: "company",
      width: 150,
      render: entityName,
    },
    {
      title: "Счёт",
      dataIndex: "account",
      width: 150,
      render: accountName,
    },
    {
      title: "Сумма",
      dataIndex: "amount",
      align: "right",
      width: 150,
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "%",
      dataIndex: "percent",
      align: "right",
      width: 90,
      render: formatPercent,
    },
    {
      title: "Получить наличкой",
      dataIndex: "cash_to_receive",
      align: "right",
      width: 160,
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "Комиссия банка",
      dataIndex: "debit_fee_amount",
      align: "right",
      width: 150,
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "Списание со счёта",
      dataIndex: "total_account_debit",
      align: "right",
      width: 165,
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      width: 220,
      render: (value) => value || "—",
    },
  ];

  return (
    <Modal
      open={open}
      title={counterparty ? `${counterparty.name} — MMA` : "MMA"}
      width="92vw"
      footer={null}
      onCancel={onClose}
      destroyOnHidden
    >
      <div className={styles.meta}>
        <span>{date}</span>

        {data && (
          <span>
            Приходов: {data.incoming_count ?? 0}
            {" · "}
            Исходов: {data.outgoing_count ?? 0}
          </span>
        )}
      </div>

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
              columns={incomingColumns}
              dataSource={data?.incoming ?? []}
              pagination={false}
              size="small"
              scroll={{
                x: 1050,
              }}
              emptyText="Приходов нет"
            />
          </section>

          <section>
            <h3 className={styles.title}>Исходы</h3>

            <DataTable
              rowKey="id"
              columns={outgoingColumns}
              dataSource={data?.outgoing ?? []}
              pagination={false}
              size="small"
              scroll={{
                x: 1300,
              }}
              emptyText="Исходов нет"
            />
          </section>
        </div>
      )}
    </Modal>
  );
}
