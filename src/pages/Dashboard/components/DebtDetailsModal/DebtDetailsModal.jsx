import { useEffect, useState } from "react";

import { Alert, Button, Modal, Spin } from "antd";

import { getOpenDebts } from "@/api/debts";
import { normalizeApiError } from "@/api/errors";

import DataTable from "@/components/common/DataTable/DataTable";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import DebtPaymentModal from "../DebtPaymentModal/DebtPaymentModal";

import { formatDate } from "@/utils/date";

import styles from "./DebtDetailsModal.module.css";

const SOURCE_LABELS = {
  MANUAL: "Ручной",
  ASIA: "ASIA",
  TARLE: "TARLE",
  MMA: "MMA",
  CLEARING: "Взаиморасчёты",
  NERUDNIK: "Нерудник",
  CLOSE_DAY: "Закрытие дня",
};

function DebtGroup({ title, debts, tone, onPay }) {
  const columns = [
    {
      title: "Дата",
      dataIndex: "source_date",
      key: "source_date",
      width: 110,
      render: (value) => formatDate(value),
    },
    {
      title: "Остаток",
      dataIndex: "remaining_amount",
      key: "remaining_amount",
      align: "right",
      width: 190,
      render: (value, record) => (
        <MoneyText
          value={value ?? "0"}
          currency={record.currency}
          tone={tone}
        />
      ),
    },
    {
      title: "Источник",
      dataIndex: "source",
      key: "source",
      width: 150,
      render: (value) => SOURCE_LABELS[value] ?? value ?? "—",
    },
    {
      title: "Срок",
      dataIndex: "due_date",
      key: "due_date",
      width: 110,
      render: (value) => formatDate(value),
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      key: "comment",
      render: (value) => value || "—",
    },
    {
      title: "Действие",
      key: "action",
      align: "center",
      width: 120,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => onPay(record)}>
          Погасить
        </Button>
      ),
    },
  ];

  return (
    <section className={styles.group}>
      <div className={styles.groupHeader}>
        <span>{title}</span>

        <span className={styles.groupCount}>{debts.length}</span>
      </div>

      <DataTable
        columns={columns}
        dataSource={debts}
        rowKey="id"
        pagination={false}
        size="small"
        scroll={{
          x: 760,
        }}
        emptyText="Актуальных долгов нет"
      />
    </section>
  );
}

export default function DebtDetailsModal({
  open,
  counterparty,
  onClose,
  onDashboardRefresh,
}) {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const counterpartyId = counterparty?.id;

  useEffect(() => {
    if (!open || !counterpartyId) {
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const data = await getOpenDebts({
          counterpartyId,
        });

        if (cancelled) {
          return;
        }

        setDebts(Array.isArray(data) ? data : []);
        setError("");
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        const apiError = normalizeApiError(requestError);

        setDebts([]);
        setError(apiError.message || "Не удалось загрузить актуальные долги");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const timeoutId = window.setTimeout(() => {
      if (cancelled) {
        return;
      }

      setDebts([]);
      setError("");
      setLoading(true);

      load();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [open, counterpartyId, reloadKey]);

  const theyOweUs = debts.filter((debt) => debt.direction === "THEY_OWE_US");

  const weOweThem = debts.filter((debt) => debt.direction === "WE_OWE_THEM");

  return (
    <>
      <Modal
        open={open}
        title={`${counterparty?.name ?? "Контрагент"} — актуальные долги`}
        onCancel={onClose}
        width={980}
        destroyOnHidden
        footer={<Button onClick={onClose}>Закрыть</Button>}
      >
        <div className={styles.content}>
          {loading && (
            <div className={styles.loading}>
              <Spin size="small" />
              <span>Загрузка долгов...</span>
            </div>
          )}

          {!loading && error && <Alert type="error" showIcon message={error} />}

          {!loading && !error && (
            <>
              <DebtGroup
                title="МЫ ДОЛЖНЫ ЕМУ"
                debts={weOweThem}
                tone="negative"
                onPay={setSelectedDebt}
              />

              <DebtGroup
                title="ОН ДОЛЖЕН НАМ"
                debts={theyOweUs}
                tone="positive"
                onPay={setSelectedDebt}
              />
            </>
          )}
        </div>
      </Modal>

      <DebtPaymentModal
        open={Boolean(selectedDebt)}
        debt={selectedDebt}
        onClose={() => setSelectedDebt(null)}
        onSuccess={() => {
          setReloadKey((current) => current + 1);
          onDashboardRefresh?.();
        }}
      />
    </>
  );
}
