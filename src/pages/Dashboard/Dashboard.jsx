import { useEffect, useState } from "react";

import dayjs from "dayjs";
import { Alert, Button, Space } from "antd";

import { getDashboard } from "@/api/dashboard";
import { closeBusinessDay, getSettlementPreview } from "@/api/settlements";

import AppLoader from "@/components/common/AppLoader/AppLoader";
import PageToolbar from "@/components/common/PageToolbar/PageToolbar";
import ConfirmActionModal from "@/components/feedback/ConfirmActionModal/ConfirmActionModal";

import BusinessDatePicker from "@/components/finance/BusinessDatePicker/BusinessDatePicker";
import DayStatus from "@/components/finance/DayStatus/DayStatus";

import { normalizeApiError } from "@/api/errors";
import { toApiDate } from "@/utils/date";
import { showSuccess } from "@/utils/feedback";
import { formatDecimalString } from "@/utils/decimal";

import CurrentBalances from "./components/CurrentBalances/CurrentBalances";
import DashboardTotals from "./components/DashboardTotals/DashboardTotals";
import ModuleSummaryTable from "./components/ModuleSummaryTable/ModuleSummaryTable";
import DailySettlements from "./components/DailySettlements/DailySettlements";
import CounterpartyDayDetailModal from "./components/CounterpartyDayDetailModal/CounterpartyDayDetailModal";

import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const [dashboard, setDashboard] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expandedModule, setExpandedModule] = useState(null);
  const [detailsCounterparty, setDetailsCounterparty] = useState(null);

  const [closeDayOpen, setCloseDayOpen] = useState(false);
  const [closeDayPreview, setCloseDayPreview] = useState(null);
  const [closeDayLoading, setCloseDayLoading] = useState(false);
  const [closeDayError, setCloseDayError] = useState("");

  const date = toApiDate(selectedDate);

  const handleOpenCounterpartyDetails = (counterparty) => {
    setDetailsCounterparty(counterparty);
  };

  useEffect(() => {
    let cancelled = false;

    getDashboard(date)
      .then((data) => {
        if (cancelled) {
          return;
        }

        setDashboard(data);
        setError("");
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }

        const apiError = normalizeApiError(requestError);

        setError(apiError.message || "Не удалось загрузить Dashboard");
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

  const handleDashboardRefresh = () => {
    setReloadKey((current) => current + 1);
  };

  const handleOpenCloseDay = async () => {
    if (dashboard?.day?.status !== "OPEN" || closeDayLoading) {
      return;
    }

    setCloseDayLoading(true);
    setCloseDayError("");

    try {
      const preview = await getSettlementPreview(date);

      setCloseDayPreview(preview);
      setCloseDayOpen(true);
    } catch (requestError) {
      const apiError = normalizeApiError(requestError);

      setError(apiError.message || "Не удалось получить preview закрытия дня");
    } finally {
      setCloseDayLoading(false);
    }
  };

  const handleConfirmCloseDay = async () => {
    if (dashboard?.day?.status !== "OPEN" || closeDayLoading) {
      return;
    }

    setCloseDayLoading(true);
    setCloseDayError("");

    try {
      await closeBusinessDay(date);

      setCloseDayOpen(false);
      setCloseDayPreview(null);
      showSuccess("День успешно закрыт");
      handleDashboardRefresh();
    } catch (requestError) {
      const apiError = normalizeApiError(requestError);

      setCloseDayError(apiError.message || "Не удалось закрыть день");
    } finally {
      setCloseDayLoading(false);
    }
  };

  const handleCancelCloseDay = () => {
    if (closeDayLoading) {
      return;
    }

    setCloseDayOpen(false);
    setCloseDayPreview(null);
    setCloseDayError("");
  };

  const handleDateChange = (value) => {
    if (!value) {
      return;
    }

    setLoading(true);
    setExpandedModule(null);
    setDetailsCounterparty(null);
    setDashboard(null);
    setError("");
    setSelectedDate(value);
  };

  const handleModuleToggle = (moduleCode) => {
    setExpandedModule((current) =>
      current === moduleCode ? null : moduleCode
    );
  };

  if (loading && !dashboard) {
    return <AppLoader />;
  }

  return (
    <div className={styles.page}>
      <PageToolbar
        title="Главная"
        meta={
          dashboard?.day ? <DayStatus status={dashboard.day.status} /> : null
        }
        actions={
          <Space>
            <BusinessDatePicker
              value={selectedDate}
              onChange={handleDateChange}
            />

            {dashboard?.day?.status === "OPEN" && (
              <Button
                danger
                loading={closeDayLoading && !closeDayOpen}
                onClick={handleOpenCloseDay}
              >
                Закрыть день
              </Button>
            )}
          </Space>
        }
      />

      {dashboard?.nerudnik_settings &&
        !dashboard.nerudnik_settings.is_configured && (
          <Alert
            type="warning"
            showIcon
            className={styles.nerudnikWarning}
            message={
              <>
                Проценты Нерудника не введены. Используются{" "}
                {formatDecimalString(
                  dashboard.nerudnik_settings.allowed_deduction_percent
                )}
                % и{" "}
                {formatDecimalString(
                  dashboard.nerudnik_settings.adjustment_percent
                )}
                %.
              </>
            }
          />
        )}

      <div className={styles.page}>
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
                  setError("");
                  setReloadKey((current) => current + 1);
                }}
              >
                Повторить
              </Button>
            }
          />
        )}

        {dashboard && (
          <>
            <CurrentBalances
              cash={dashboard.cash}
              bankAccounts={dashboard.bank_accounts}
            />

            <ModuleSummaryTable
              modules={dashboard.modules}
              expandedModule={expandedModule}
              onToggle={handleModuleToggle}
              date={date}
            />

            <DashboardTotals totals={dashboard.global_totals} />

            <DailySettlements
              settlements={dashboard.daily_settlements}
              onOpenDetails={handleOpenCounterpartyDetails}
            />
          </>
        )}
      </div>

      {detailsCounterparty && (
        <CounterpartyDayDetailModal
          key={`${detailsCounterparty.id}-${date}`}
          open
          counterparty={detailsCounterparty}
          date={date}
          onClose={() => setDetailsCounterparty(null)}
        />
      )}

      <ConfirmActionModal
        open={closeDayOpen}
        title="Закрыть день?"
        confirmText="Закрыть день"
        danger
        loading={closeDayLoading}
        onConfirm={handleConfirmCloseDay}
        onCancel={handleCancelCloseDay}
        description={
          <div>
            <p>После закрытия дня операции за эту дату менять нельзя.</p>
            <p>
              Итоговых контрагентов:{" "}
              {closeDayPreview?.counterparties?.length ?? 0}
            </p>
            {closeDayError && (
              <Alert type="error" showIcon message={closeDayError} />
            )}
          </div>
        }
      />
    </div>
  );
}
