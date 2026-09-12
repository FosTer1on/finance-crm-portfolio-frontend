import { useEffect, useState } from "react";

import { Alert, Button, Modal, Spin } from "antd";

import { getTarleProduct } from "@/api/dashboard";

import { normalizeApiError } from "@/api/errors";

import DataTable from "@/components/common/DataTable/DataTable";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import TarleCounterpartyModal from "../TarleCounterpartyModal/TarleCounterpartyModal";

import {
  getNetDirectionLabel,
  getNetDirectionTone,
} from "../../utils/dashboard";

import styles from "./TarleProductModal.module.css";

export default function TarleProductModal({ open, product, date, onClose }) {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);

  const [selectedCounterparty, setSelectedCounterparty] = useState(null);

  const productId = product?.id;

  useEffect(() => {
    if (!open || !productId) {
      return undefined;
    }

    let cancelled = false;

    getTarleProduct(productId, date)
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

        setError(apiError.message || "Не удалось загрузить товар TARLE.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, productId, date, reloadKey]);

  const columns = [
    {
      title: "Человек",
      dataIndex: "counterparty",
      render: (value) => value?.name || "—",
    },
    {
      title: "Приход",
      dataIndex: "incoming_amount_total",
      align: "right",
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "Исход",
      dataIndex: "outgoing_amount_total",
      align: "right",
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "Отдать",
      dataIndex: "cash_to_give_total",
      align: "right",
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "Получить",
      dataIndex: "cash_to_receive_total",
      align: "right",
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "Итог",
      key: "net",
      align: "right",
      render: (_, row) => {
        const tone = getNetDirectionTone(row.net_direction);

        return (
          <div className={styles.net}>
            <span>{getNetDirectionLabel(row.net_direction)}</span>

            <MoneyText value={row.net_amount} currency="UZS" tone={tone} />
          </div>
        );
      },
    },
    {
      title: "Приходов",
      dataIndex: "incoming_count",
      align: "center",
      width: 80,
    },
    {
      title: "Исходов",
      dataIndex: "outgoing_count",
      align: "center",
      width: 80,
    },
    {
      title: "Действие",
      key: "action",
      align: "center",
      width: 100,
      render: (_, row) => (
        <Button
          type="link"
          size="small"
          onClick={() => setSelectedCounterparty(row.counterparty)}
        >
          Операции
        </Button>
      ),
    },
  ];

  return (
    <>
      <Modal
        open={open}
        title={product ? `TARLE — ${product.name}` : "TARLE"}
        width="90vw"
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
          <DataTable
            rowKey={(row) => row.counterparty.id}
            columns={columns}
            dataSource={data?.counterparties ?? []}
            pagination={false}
            size="small"
            scroll={{
              x: 1100,
            }}
            emptyText="По товару операций нет"
          />
        )}
      </Modal>

      <TarleCounterpartyModal
        key={
          selectedCounterparty
            ? `${productId}-${selectedCounterparty.id}-${date}`
            : "closed"
        }
        open={Boolean(selectedCounterparty)}
        product={data?.product ?? product}
        counterparty={selectedCounterparty}
        date={date}
        onClose={() => setSelectedCounterparty(null)}
      />
    </>
  );
}
