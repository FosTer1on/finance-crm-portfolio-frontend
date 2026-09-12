import { useMemo, useRef, useState } from "react";

import { Button, Input, Skeleton, Table, Tooltip } from "antd";

import CounterpartySelect from "@/components/finance/CounterpartySelect/CounterpartySelect";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

import DebtManualModal from "./components/DebtManualModal/DebtManualModal";
import DebtTargetPaymentModal from "./components/DebtTargetPaymentModal/DebtTargetPaymentModal";
import DebtSettlementModal from "./components/DebtSettlementModal/DebtSettlementModal";
import DebtNetOffModal from "./components/DebtNetOffModal/DebtNetOffModal";
import DebtConversionModal from "./components/DebtConversionModal/DebtConversionModal";
import DebtForgivenessModal from "./components/DebtForgivenessModal/DebtForgivenessModal";
import DebtAudit from "./components/DebtAudit/DebtAudit";

import { useDebtsPage } from "./hooks/useDebtsPage";

import styles from "./Debts.module.css";

const DIRECTION = {
  THEY_OWE_US: "THEY_OWE_US",
  WE_OWE_THEM: "WE_OWE_THEM",
};

const STATUS_LABELS = {
  OPEN: "Открыт",
  PARTIALLY_PAID: "Частично погашен",
  CLOSED: "Закрыт",
};

const SOURCE_LABELS = {
  MANUAL: "Ручной",
  CLOSE_DAY: "Закрытие дня",
  ASIA: "ASIA",
  MMA: "MMA",
  TARLE: "TARLE",
  CLEARING: "Клиринг",
  NERUDNIK: "Нерудник",
};

function getSourceLabel(source) {
  if (!source) {
    return "—";
  }

  return SOURCE_LABELS[source] ?? source;
}

function getCounterpartyName(summary) {
  return summary?.counterparty?.name ?? "—";
}

function getCurrencySummary(summary, currency) {
  return summary?.[currency] ?? null;
}

function getNetDirectionLabel(direction) {
  if (direction === DIRECTION.THEY_OWE_US) {
    return "Нам должны";
  }

  if (direction === DIRECTION.WE_OWE_THEM) {
    return "Мы должны";
  }

  return "В расчёте";
}

function hasOutstandingAmount(value) {
  if (value == null) {
    return false;
  }

  const normalized = String(value)
    .trim()
    .replace(/^[-+]/, "")
    .replace(/^0+/, "")
    .replace(".", "")
    .replace(/0+$/, "");

  return normalized !== "";
}

function hasMutualDebts(summary) {
  return ["UZS", "USD"].some((currency) => {
    const currencySummary = getCurrencySummary(summary, currency);

    return (
      hasOutstandingAmount(currencySummary?.they_owe_us) &&
      hasOutstandingAmount(currencySummary?.we_owe_them)
    );
  });
}

function isSummaryOutstanding(summary) {
  return ["UZS", "USD"].some((currency) => {
    const currencySummary = getCurrencySummary(summary, currency);

    return (
      hasOutstandingAmount(currencySummary?.they_owe_us) ||
      hasOutstandingAmount(currencySummary?.we_owe_them)
    );
  });
}

function DebtNetValue({ summary, currency }) {
  const currencySummary = getCurrencySummary(summary, currency);

  if (!currencySummary) {
    return <span>—</span>;
  }

  return (
    <span className={styles.netText}>
      <MoneyText value={currencySummary.net_amount} currency={currency} />

      <span className={styles.netDirection}>
        {getNetDirectionLabel(currencySummary.net_direction)}
      </span>
    </span>
  );
}

function DebtCounterpartySummary({ summary }) {
  return (
    <div className={styles.summaryTableWrap}>
      <table className={styles.summaryTable}>
        <thead>
          <tr>
            <th>Валюта</th>
            <th>Нам должны</th>
            <th>Мы должны</th>
            <th>Итог</th>
          </tr>
        </thead>

        <tbody>
          {["UZS", "USD"].map((currency) => {
            const currencySummary = getCurrencySummary(summary, currency);

            return (
              <tr key={currency}>
                <td className={styles.summaryCurrency}>{currency}</td>

                <td>
                  <MoneyText
                    value={currencySummary?.they_owe_us ?? "0.00"}
                    currency={currency}
                  />
                </td>

                <td>
                  <MoneyText
                    value={currencySummary?.we_owe_them ?? "0.00"}
                    currency={currency}
                  />
                </td>

                <td>
                  <DebtNetValue summary={summary} currency={currency} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DebtTable({
  title,
  debts,
  loading,
  onPayDebt,
  onConvertDebt,
  onForgiveDebt,
}) {
  const columns = [
    {
      title: "Дата",
      dataIndex: "source_date",
      key: "source_date",
      width: 110,
    },
    {
      title: "Источник",
      dataIndex: "source",
      key: "source",
      width: 130,
      render: (value) => getSourceLabel(value),
    },
    {
      title: "Валюта",
      dataIndex: "currency",
      key: "currency",
      width: 85,
    },
    {
      title: "Изначально",
      dataIndex: "original_amount",
      key: "original_amount",
      width: 150,
      align: "right",
      render: (value, record) => (
        <MoneyText value={value} currency={record.currency} />
      ),
    },
    {
      title: "Остаток",
      dataIndex: "remaining_amount",
      key: "remaining_amount",
      width: 150,
      align: "right",
      render: (value, record) => (
        <MoneyText value={value} currency={record.currency} />
      ),
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (value) => (
        <span className={styles.status}>
          {STATUS_LABELS[value] ?? value ?? "—"}
        </span>
      ),
    },
    {
      title: "Срок",
      dataIndex: "due_date",
      key: "due_date",
      width: 110,
      render: (value) => value || "—",
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      key: "comment",
      width: 220,
      render: (value) => (
        <Tooltip title={value || null}>
          <span className={styles.commentCell}>{value || "—"}</span>
        </Tooltip>
      ),
    },
    {
      title: "Действия",
      key: "actions",
      width: 280,
      fixed: "right",
      render: (_, record) => (
        <div className={styles.actions}>
          <Button size="small" onClick={() => onPayDebt(record)}>
            Погасить
          </Button>

          <Button size="small" onClick={() => onConvertDebt(record)}>
            Конвертировать
          </Button>

          <Button size="small" onClick={() => onForgiveDebt(record)}>
            Списать
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h4 className={styles.debtTableTitle}>{title}</h4>

      <div className={styles.tableWrap}>
        <Table
          rowKey="id"
          size="small"
          loading={loading}
          columns={columns}
          dataSource={debts}
          pagination={false}
          scroll={{ x: 1400 }}
          locale={{
            emptyText: "Нет текущих долгов",
          }}
        />
      </div>
    </div>
  );
}

function DebtCounterpartyWorkspace({
  summary,
  debts,
  loading,
  error,
  onPayDebt,
  onConvertDebt,
  onForgiveDebt,
}) {
  const theyOweUsDebts = useMemo(
    () => debts.filter((debt) => debt.direction === DIRECTION.THEY_OWE_US),
    [debts]
  );

  const weOweThemDebts = useMemo(
    () => debts.filter((debt) => debt.direction === DIRECTION.WE_OWE_THEM),
    [debts]
  );

  if (error) {
    return <div className={styles.errorBox}>{error}</div>;
  }

  if (!loading && theyOweUsDebts.length === 0 && weOweThemDebts.length === 0) {
    return (
      <>
        {summary && <DebtCounterpartySummary summary={summary} />}

        <div className={styles.emptyState}>Сейчас взаиморасчёты закрыты.</div>
      </>
    );
  }

  return (
    <>
      {summary && <DebtCounterpartySummary summary={summary} />}

      <div className={styles.debtTables}>
        <DebtTable
          title="НАМ ДОЛЖНЫ"
          debts={theyOweUsDebts}
          loading={loading}
          onPayDebt={onPayDebt}
          onConvertDebt={onConvertDebt}
          onForgiveDebt={onForgiveDebt}
        />

        <DebtTable
          title="МЫ ДОЛЖНЫ"
          debts={weOweThemDebts}
          loading={loading}
          onPayDebt={onPayDebt}
          onConvertDebt={onConvertDebt}
          onForgiveDebt={onForgiveDebt}
        />
      </div>
    </>
  );
}

function DebtGlobalRegister({
  summary,
  loading,
  search,
  onSearchChange,
  onDetails,
}) {
  const filteredSummary = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return summary.filter((item) => {
      if (!isSummaryOutstanding(item)) {
        return false;
      }

      if (!query) {
        return true;
      }

      return getCounterpartyName(item).toLocaleLowerCase().includes(query);
    });
  }, [summary, search]);

  const columns = [
    {
      title: "Человек",
      key: "counterparty",
      width: 180,
      render: (_, record) => (
        <span className={styles.personCell}>{getCounterpartyName(record)}</span>
      ),
    },
    {
      title: "UZS — Нам должны",
      key: "uzs_they",
      width: 170,
      align: "right",
      render: (_, record) => (
        <MoneyText
          value={getCurrencySummary(record, "UZS")?.they_owe_us ?? "0.00"}
          currency="UZS"
        />
      ),
    },
    {
      title: "UZS — Мы должны",
      key: "uzs_we",
      width: 170,
      align: "right",
      render: (_, record) => (
        <MoneyText
          value={getCurrencySummary(record, "UZS")?.we_owe_them ?? "0.00"}
          currency="UZS"
        />
      ),
    },
    {
      title: "UZS — Итог",
      key: "uzs_net",
      width: 180,
      align: "right",
      render: (_, record) => (
        <div className={styles.registerNet}>
          <MoneyText
            value={getCurrencySummary(record, "UZS")?.net_amount ?? "0.00"}
            currency="UZS"
          />

          <span className={styles.registerNetDirection}>
            {getNetDirectionLabel(
              getCurrencySummary(record, "UZS")?.net_direction
            )}
          </span>
        </div>
      ),
    },
    {
      title: "USD — Нам должны",
      key: "usd_they",
      width: 160,
      align: "right",
      render: (_, record) => (
        <MoneyText
          value={getCurrencySummary(record, "USD")?.they_owe_us ?? "0.00"}
          currency="USD"
        />
      ),
    },
    {
      title: "USD — Мы должны",
      key: "usd_we",
      width: 160,
      align: "right",
      render: (_, record) => (
        <MoneyText
          value={getCurrencySummary(record, "USD")?.we_owe_them ?? "0.00"}
          currency="USD"
        />
      ),
    },
    {
      title: "USD — Итог",
      key: "usd_net",
      width: 170,
      align: "right",
      render: (_, record) => (
        <div className={styles.registerNet}>
          <MoneyText
            value={getCurrencySummary(record, "USD")?.net_amount ?? "0.00"}
            currency="USD"
          />

          <span className={styles.registerNetDirection}>
            {getNetDirectionLabel(
              getCurrencySummary(record, "USD")?.net_direction
            )}
          </span>
        </div>
      ),
    },
    {
      title: "Действия",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Button size="small" onClick={() => onDetails(record.counterparty?.id)}>
          Детальнее
        </Button>
      ),
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Все текущие взаиморасчёты</h3>

        <div className={styles.registerToolbar}>
          <Input
            allowClear
            className={styles.registerSearch}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Поиск по человеку"
          />
        </div>
      </div>

      <div className={styles.sectionBody}>
        <div className={styles.tableWrap}>
          <Table
            rowKey={(record) => record.counterparty?.id}
            size="small"
            loading={loading}
            columns={columns}
            dataSource={filteredSummary}
            pagination={{
              pageSize: 20,
              hideOnSinglePage: true,
            }}
            scroll={{ x: 1320 }}
            locale={{
              emptyText: "Нет текущих взаиморасчётов",
            }}
          />
        </div>
      </div>
    </section>
  );
}

export default function Debts() {
  const {
    cashBalances,
    globalSummary,

    selectedCounterpartyId,
    selectedSummary,
    selectedDebts,

    cashBalancesLoading,
    summaryLoading,
    selectedDebtsLoading,

    cashBalancesError,
    summaryError,
    selectedDebtsError,

    setSelectedCounterpartyId,
    refreshPage,
    refreshAfterMutation,
  } = useDebtsPage();

  const workspaceRef = useRef(null);

  const [registerSearch, setRegisterSearch] = useState("");

  const [manualModalOpen, setManualModalOpen] = useState(false);

  const [targetPaymentDebt, setTargetPaymentDebt] = useState(null);

  const [settlementEntity, setSettlementEntity] = useState(null);

  const [netOffEntity, setNetOffEntity] = useState(null);

  const [conversionDebt, setConversionDebt] = useState(null);

  const [forgivenessDebt, setForgivenessDebt] = useState(null);

  const [auditRefreshKey, setAuditRefreshKey] = useState(0);

  const handleDetails = (counterpartyId) => {
    if (counterpartyId == null) {
      return;
    }

    setSelectedCounterpartyId(counterpartyId);

    requestAnimationFrame(() => {
      workspaceRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const refreshAudit = () => {
    setAuditRefreshKey((value) => value + 1);
  };

  const handleManualDebtSuccess = async () => {
    await refreshAfterMutation({
      cashChanged: false,
    });
  };

  const handleTargetPaymentSuccess = async () => {
    await refreshAfterMutation({
      cashChanged: true,
    });

    refreshAudit();
  };

  const handleSettlementSuccess = async () => {
    await refreshAfterMutation({
      cashChanged: true,
    });

    refreshAudit();
  };

  const handleNetOffSuccess = async () => {
    await refreshAfterMutation({
      cashChanged: false,
    });

    refreshAudit();
  };

  const handleConversionSuccess = async () => {
    await refreshAfterMutation({
      cashChanged: false,
    });

    refreshAudit();
  };

  const handleForgivenessSuccess = async () => {
    await refreshAfterMutation({
      cashChanged: false,
    });

    refreshAudit();
  };

  return (
    <div className={styles.page}>
      <div className={styles.cashSticky}>
        <span className={styles.cashTitle}>Касса</span>

        {cashBalancesLoading ? (
          <Skeleton.Input active size="small" />
        ) : (
          <div className={styles.cashItems}>
            <div className={styles.cashItem}>
              <span className={styles.cashCurrency}>UZS</span>

              <MoneyText
                className={styles.cashAmount}
                value={cashBalances.UZS}
                currency="UZS"
              />
            </div>

            <div className={styles.cashItem}>
              <span className={styles.cashCurrency}>USD</span>

              <MoneyText
                className={styles.cashAmount}
                value={cashBalances.USD}
                currency="USD"
              />
            </div>
          </div>
        )}

        {cashBalancesError && (
          <span className={styles.cashError}>{cashBalancesError}</span>
        )}
      </div>

      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Долги</h1>

          <div className={styles.subtitle}>Взаиморасчёты с людьми</div>
        </div>

        <Button
          onClick={() => {
            void refreshPage();
          }}
        >
          Обновить
        </Button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.selectorBlock}>
          <label className={styles.fieldLabel}>Человек</label>

          <CounterpartySelect
            className={styles.selector}
            value={selectedCounterpartyId}
            onChange={setSelectedCounterpartyId}
            placeholder="Выберите человека"
          />
        </div>

        <Button type="primary" onClick={() => setManualModalOpen(true)}>
          + Ручной долг
        </Button>
      </div>

      <section
        ref={workspaceRef}
        className={`${styles.section} ${styles.workspace}`}
      >
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Взаиморасчёты человека</h3>
        </div>

        <div className={styles.sectionBody}>
          {selectedCounterpartyId == null ? (
            <div className={styles.emptyState}>
              Выберите человека, чтобы посмотреть взаиморасчёты.
            </div>
          ) : (
            <>
              <div className={styles.workspaceHeader}>
                <h2 className={styles.counterpartyName}>
                  {getCounterpartyName(selectedSummary)}
                </h2>

                <div className={styles.actions}>
                  <Button
                    disabled={
                      selectedDebtsLoading ||
                      selectedDebts.length === 0 ||
                      !selectedSummary?.counterparty
                    }
                    onClick={() =>
                      setSettlementEntity({
                        counterparty: {
                          id: selectedSummary.counterparty.id,
                          name: selectedSummary.counterparty.name,
                        },
                        summary: selectedSummary,
                      })
                    }
                  >
                    Погасить
                  </Button>

                  <Tooltip
                    title={
                      hasMutualDebts(selectedSummary)
                        ? null
                        : "Нет встречных обязательств для взаимозачёта"
                    }
                  >
                    <span>
                      <Button
                        disabled={!hasMutualDebts(selectedSummary)}
                        onClick={() =>
                          setNetOffEntity({
                            counterparty: {
                              id: selectedSummary.counterparty.id,
                              name: selectedSummary.counterparty.name,
                            },
                            summary: selectedSummary,
                          })
                        }
                      >
                        Взаимозачёт
                      </Button>
                    </span>
                  </Tooltip>

                  <Button onClick={() => setManualModalOpen(true)}>
                    + Ручной долг
                  </Button>
                </div>
              </div>

              {summaryError && (
                <div className={styles.errorBox}>{summaryError}</div>
              )}

              {summaryLoading && !selectedSummary ? (
                <Skeleton active />
              ) : (
                <DebtCounterpartyWorkspace
                  summary={selectedSummary}
                  debts={selectedDebts}
                  loading={selectedDebtsLoading}
                  error={selectedDebtsError}
                  onPayDebt={setTargetPaymentDebt}
                  onConvertDebt={setConversionDebt}
                  onForgiveDebt={setForgivenessDebt}
                />
              )}
            </>
          )}
        </div>
      </section>

      {summaryError && <div className={styles.errorBox}>{summaryError}</div>}

      <DebtGlobalRegister
        summary={globalSummary}
        loading={summaryLoading}
        search={registerSearch}
        onSearchChange={setRegisterSearch}
        onDetails={handleDetails}
      />

      <DebtAudit refreshKey={auditRefreshKey} />

      {manualModalOpen ? (
        <DebtManualModal
          initialCounterpartyId={selectedCounterpartyId}
          onCancel={() => setManualModalOpen(false)}
          onSuccess={handleManualDebtSuccess}
        />
      ) : null}

      {targetPaymentDebt ? (
        <DebtTargetPaymentModal
          debt={targetPaymentDebt}
          onCancel={() => setTargetPaymentDebt(null)}
          onSuccess={handleTargetPaymentSuccess}
        />
      ) : null}

      {settlementEntity ? (
        <DebtSettlementModal
          counterparty={settlementEntity.counterparty}
          summary={settlementEntity.summary}
          onCancel={() => setSettlementEntity(null)}
          onSuccess={handleSettlementSuccess}
        />
      ) : null}

      {netOffEntity ? (
        <DebtNetOffModal
          counterparty={netOffEntity.counterparty}
          summary={netOffEntity.summary}
          onCancel={() => setNetOffEntity(null)}
          onSuccess={handleNetOffSuccess}
        />
      ) : null}

      {conversionDebt ? (
        <DebtConversionModal
          debt={conversionDebt}
          onCancel={() => setConversionDebt(null)}
          onSuccess={handleConversionSuccess}
        />
      ) : null}

      {forgivenessDebt ? (
        <DebtForgivenessModal
          debt={forgivenessDebt}
          onCancel={() => setForgivenessDebt(null)}
          onSuccess={handleForgivenessSuccess}
        />
      ) : null}
    </div>
  );
}
