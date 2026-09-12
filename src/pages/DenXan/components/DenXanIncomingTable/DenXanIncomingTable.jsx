import { Alert, Button } from "antd";

import DataTable from "@/components/common/DataTable/DataTable";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

function renderMoney(value) {
  if (value == null || value === "") {
    return "—";
  }

  return <MoneyText value={value} currency="сум" />;
}

function renderRelatedName(value) {
  if (!value) {
    return "—";
  }

  if (typeof value === "string") {
    return value;
  }

  return value.name || value.code || "—";
}

function formatDecimal(value) {
  if (value == null || value === "") {
    return "—";
  }

  const stringValue = String(value);

  if (!stringValue.includes(".")) {
    return stringValue;
  }

  return stringValue.replace(/0+$/, "").replace(/\.$/, "");
}

export default function DenXanIncomingTable({
  data,
  loading = false,
  error = "",
  onRetry,
  onCancel,
  cancelDisabled = false,
}) {
  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        message="Не удалось загрузить приходы"
        description={error}
        action={
          <Button size="small" loading={loading} onClick={onRetry}>
            Повторить
          </Button>
        }
      />
    );
  }

  const columns = [
    {
      title: "Дистрибьютор",
      dataIndex: "distributor",
      width: 150,
      render: renderRelatedName,
    },
    {
      title: "Счёт",
      dataIndex: "account",
      width: 130,
      render: renderRelatedName,
    },
    {
      title: "Сумма",
      dataIndex: "amount",
      width: 150,
      align: "right",
      render: renderMoney,
    },
    {
      title: "%",
      dataIndex: "percent",
      width: 80,
      align: "right",
      render: (value) => {
        const formatted = formatDecimal(value);

        return formatted === "—" ? "—" : `${formatted}%`;
      },
    },
    {
      title: "Редирект",
      dataIndex: "redirect_amount",
      width: 140,
      align: "right",
      render: (value) =>
        value == null || value === "" || /^0+(?:\.0+)?$/.test(String(value))
          ? "—"
          : renderMoney(value),
    },
    {
      title: "Куда",
      dataIndex: "redirect_target",
      width: 150,
      render: renderRelatedName,
    },
    {
      title: "После редиректа",
      dataIndex: "amount_after_redirect",
      width: 160,
      align: "right",
      render: renderMoney,
    },
    {
      title: "Комиссия редиректа",
      dataIndex: "redirect_debit_fee_amount",
      width: 170,
      align: "right",
      render: renderMoney,
    },
    {
      title: "Влияние на банк",
      dataIndex: "bank_net_effect",
      width: 160,
      align: "right",
      render: renderMoney,
    },
    {
      title: "Жамшиду",
      dataIndex: "cash_to_give_jamshid",
      width: 160,
      align: "right",
      render: renderMoney,
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      width: 220,
      render: (value) => value || "—",
    },
    {
      title: "Действие",
      key: "action",
      width: 100,
      fixed: "right",
      render: (_, operation) => (
        <Button
          type="link"
          danger
          size="small"
          disabled={cancelDisabled}
          onClick={() => onCancel?.(operation)}
        >
          Отменить
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
      emptyText="Приходов за выбранный день нет"
      scroll={{ x: 1820 }}
    />
  );
}
