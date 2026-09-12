import { useEffect, useState } from "react";

import { Alert, Button, Modal, Spin } from "antd";

import { getTarleProductCounterparty } from "@/api/dashboard";

import { normalizeApiError } from "@/api/errors";

import DataTable from "@/components/common/DataTable/DataTable";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import { formatPercent } from "@/utils/money";

import { getOperationDirectionLabel } from "../../utils/dashboard";

import styles from "./TarleCounterpartyModal.module.css";

export default function TarleCounterpartyModal({
  open,
  product,
  counterparty,
  date,
  onClose,
}) {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);

  const productId = product?.id;

  const counterpartyId = counterparty?.id;

  useEffect(() => {
    if (!open || !productId || !counterpartyId) {
      return undefined;
    }

    let cancelled = false;

    getTarleProductCounterparty(productId, counterpartyId, date)
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

        setError(apiError.message || "Не удалось загрузить операции TARLE.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, productId, counterpartyId, date, reloadKey]);

  const columns = [
    {
      title: "Тип",
      dataIndex: "direction",
      width: 90,
      render: getOperationDirectionLabel,
    },
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
      width: 90,
      render: formatPercent,
    },
    {
      title: "После %",
      dataIndex: "amount_after_percent",
      align: "right",
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "Отдать",
      dataIndex: "cash_to_give",
      align: "right",
      render: (value) =>
        value == null ? "—" : <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "Получить",
      dataIndex: "cash_to_receive",
      align: "right",
      render: (value) =>
        value == null ? "—" : <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      render: (value) => value || "—",
    },
  ];

  return (
    <Modal
      open={open}
      title={
        product && counterparty
          ? `${product.name} — ${counterparty.name}`
          : "TARLE"
      }
      width="90vw"
      footer={null}
      onCancel={onClose}
      destroyOnHidden
    >
      <div className={styles.meta}>
        {date}

        {data && <span>Операций: {data.operations_count ?? 0}</span>}
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
        <DataTable
          rowKey={(row) => `${row.direction}-${row.id}`}
          columns={columns}
          dataSource={data?.operations ?? []}
          pagination={false}
          size="small"
          scroll={{
            x: 1200,
          }}
          emptyText="Операций нет"
        />
      )}
    </Modal>
  );
}
