import { useEffect, useState } from "react";

import { Alert, Button, Spin } from "antd";

import { getTarle } from "@/api/dashboard";

import { normalizeApiError } from "@/api/errors";

import DataTable from "@/components/common/DataTable/DataTable";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import TarleProductModal from "../TarleProductModal/TarleProductModal";

import { getResultLabel, getResultTone } from "../../utils/dashboard";

import styles from "./TarleModuleDetails.module.css";

export default function TarleModuleDetails({ date }) {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);

  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getTarle(date)
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

        setError(apiError.message || "Не удалось загрузить TARLE.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [date, reloadKey]);

  const columns = [
    {
      title: "Товар",
      dataIndex: "product",
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
      title: "Результат",
      key: "result",
      align: "right",
      render: (_, row) => {
        const tone = getResultTone(row.result_type);

        return (
          <div className={styles.result}>
            <span>{getResultLabel(row.result_type)}</span>

            <MoneyText value={row.result_amount} currency="UZS" tone={tone} />
          </div>
        );
      },
    },
    {
      title: "Операций",
      dataIndex: "operations_count",
      align: "center",
      width: 80,
    },
    {
      title: "Людей",
      dataIndex: "counterparties_count",
      align: "center",
      width: 70,
    },
    {
      title: "Действие",
      key: "action",
      align: "center",
      width: 90,
      render: (_, row) => (
        <Button
          type="link"
          size="small"
          onClick={() => setSelectedProduct(row.product)}
        >
          Люди
        </Button>
      ),
    },
  ];

  if (loading && !data) {
    return (
      <div className={styles.loading}>
        <Spin />
      </div>
    );
  }

  if (error && !data) {
    return (
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
    );
  }

  return (
    <div className={styles.root}>
      <DataTable
        rowKey={(row) => row.product.id}
        columns={columns}
        dataSource={data?.products ?? []}
        pagination={false}
        size="small"
        scroll={{
          x: 1150,
        }}
        emptyText="Товаров нет"
      />

      <TarleProductModal
        key={selectedProduct ? `${selectedProduct.id}-${date}` : "closed"}
        open={Boolean(selectedProduct)}
        product={selectedProduct}
        date={date}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
