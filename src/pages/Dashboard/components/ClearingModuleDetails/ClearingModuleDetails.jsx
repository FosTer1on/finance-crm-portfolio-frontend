import { useEffect, useState } from "react";

import { Alert, Button, Spin } from "antd";

import { getClearing } from "@/api/dashboard";

import { normalizeApiError } from "@/api/errors";

import DataTable from "@/components/common/DataTable/DataTable";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import ClearingCounterpartyModal from "../ClearingCounterpartyModal/ClearingCounterpartyModal";

import {
  getNetDirectionLabel,
  getNetDirectionTone,
} from "../../utils/dashboard";

import styles from "./ClearingModuleDetails.module.css";

export default function ClearingModuleDetails({ date }) {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);

  const [selectedCounterparty, setSelectedCounterparty] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getClearing(date)
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

        setError(apiError.message || "Не удалось загрузить взаиморасчёты.");
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
      title: "Человек",
      dataIndex: "counterparty",
      key: "counterparty",
      render: (value) => value?.name || "—",
    },
    {
      title: "Получить",
      dataIndex: "cash_to_receive_total",
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
      title: "Операций",
      dataIndex: "operations_count",
      align: "center",
      width: 90,
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
          Детали
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
        rowKey={(row) => row.counterparty.id}
        columns={columns}
        dataSource={data?.counterparties ?? []}
        pagination={false}
        size="small"
        scroll={{
          x: 850,
        }}
        emptyText={"За выбранную дату операций нет"}
      />

      <ClearingCounterpartyModal
        key={
          selectedCounterparty ? `${selectedCounterparty.id}-${date}` : "closed"
        }
        open={Boolean(selectedCounterparty)}
        counterparty={selectedCounterparty}
        date={date}
        onClose={() => setSelectedCounterparty(null)}
      />
    </div>
  );
}
