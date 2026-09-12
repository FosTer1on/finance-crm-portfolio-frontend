import { useEffect, useState } from "react";

import { Alert, Button, Spin } from "antd";

import { getAsia } from "@/api/dashboard";

import { normalizeApiError } from "@/api/errors";

import DataTable from "@/components/common/DataTable/DataTable";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import AsiaCounterpartyModal from "../AsiaCounterpartyModal/AsiaCounterpartyModal";

import {
  getAsiaDirectionLabel,
  getNetDirectionTone,
} from "../../utils/dashboard";

import styles from "./AsiaModuleDetails.module.css";

export default function AsiaModuleDetails({ date }) {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);

  const [selectedCounterparty, setSelectedCounterparty] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getAsia(date)
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

        setError(apiError.message || "Не удалось загрузить ASIA.");
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
            <span>{getAsiaDirectionLabel(row.net_direction)}</span>

            <MoneyText value={row.net_amount} currency="UZS" tone={tone} />
          </div>
        );
      },
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
          x: 760,
        }}
        emptyText="Контрагентов нет"
      />

      <section className={styles.nerudnik}>
        <div className={styles.nerudnikHeading}>НЕРУДНИК</div>

        <div className={styles.nerudnikGrid}>
          <div>
            <span>Общий приход</span>

            <MoneyText
              value={data?.nerudnik?.incoming_total ?? "0"}
              currency="UZS"
            />
          </div>

          <div>
            <span>Разрешённый исход</span>

            <MoneyText
              value={data?.nerudnik?.allowed_outgoing ?? "0"}
              currency="UZS"
            />
          </div>

          <div>
            <span>Общий исход</span>

            <MoneyText
              value={data?.nerudnik?.outgoing_total ?? "0"}
              currency="UZS"
            />
          </div>

          <div>
            <span>Разница</span>

            <MoneyText
              value={data?.nerudnik?.difference ?? "0"}
              currency="UZS"
            />
          </div>

          <div>
            <span>После корректировки</span>

            <MoneyText
              value={data?.nerudnik?.adjusted_amount ?? "0"}
              currency="UZS"
              tone={getNetDirectionTone(data?.nerudnik?.direction)}
            />
          </div>

          <div>
            <span>Итог</span>

            <strong>{getAsiaDirectionLabel(data?.nerudnik?.direction)}</strong>
          </div>
        </div>
      </section>

      <AsiaCounterpartyModal
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
