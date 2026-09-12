import { useEffect, useState } from "react";

import { Alert, Button, Modal } from "antd";

import { getClearingCounterparty } from "@/api/dashboard";

import DataTable from "@/components/common/DataTable/DataTable";
import AppLoader from "@/components/common/AppLoader/AppLoader";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import { normalizeApiError } from "@/api/errors";

import { formatPercent } from "@/utils/money";

import {
  getClearingRoleLabel,
  getResultLabel,
  getResultTone,
} from "../../utils/dashboard";

import styles from "./ClearingCounterpartyModal.module.css";

function displayEntity(entity) {
  return entity?.name || "—";
}

export default function ClearingCounterpartyModal({
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

    getClearingCounterparty(counterpartyId, date)
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

        setError(apiError.message || "Не удалось загрузить детали.");
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

  const columns = [
    {
      title: "Роль",
      dataIndex: "role",
      width: 110,
      render: getClearingRoleLabel,
    },
    {
      title: "От кого",
      dataIndex: "from_counterparty",
      width: 140,
      render: displayEntity,
    },
    {
      title: "Фирма отправителя",
      dataIndex: "from_company",
      width: 160,
      render: displayEntity,
    },
    {
      title: "Кому",
      dataIndex: "to_counterparty",
      width: 140,
      render: displayEntity,
    },
    {
      title: "Фирма получателя",
      dataIndex: "to_company",
      width: 160,
      render: displayEntity,
    },
    {
      title: "Сумма",
      dataIndex: "amount",
      align: "right",
      width: 150,
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "% отправителя",
      dataIndex: "from_percent",
      align: "right",
      width: 110,
      render: formatPercent,
    },
    {
      title: "% получателя",
      dataIndex: "to_percent",
      align: "right",
      width: 110,
      render: formatPercent,
    },
    {
      title: "Отдать",
      dataIndex: "cash_to_give",
      align: "right",
      width: 150,
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "Получить",
      dataIndex: "cash_to_receive",
      align: "right",
      width: 150,
      render: (value) => <MoneyText value={value} currency="UZS" />,
    },
    {
      title: "Результат",
      key: "result",
      align: "right",
      width: 180,
      render: (_, operation) => {
        const tone = getResultTone(operation.result_type);

        return (
          <div className={styles.result}>
            <span>{getResultLabel(operation.result_type)}</span>

            <MoneyText
              value={operation.result_amount}
              currency="UZS"
              tone={tone}
            />
          </div>
        );
      },
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      width: 220,
      render: (value) => value || "—",
    },
  ];

  const title = counterparty
    ? `${counterparty.name} — Взаиморасчёты`
    : "Взаиморасчёты";

  return (
    <Modal
      open={open}
      title={title}
      width="92vw"
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
        <div className={styles.loader}>
          <AppLoader />
        </div>
      ) : (
        <DataTable
          rowKey="id"
          columns={columns}
          dataSource={data?.operations ?? []}
          pagination={false}
          size="small"
          scroll={{
            x: 1550,
          }}
          emptyText={"За выбранную дату операций нет"}
        />
      )}
    </Modal>
  );
}
