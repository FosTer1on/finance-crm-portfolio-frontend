import { Alert, Button } from "antd";

import DataTable from "@/components/common/DataTable/DataTable";
import MoneyText from "@/components/finance/MoneyText/MoneyText";

function renderMoney(value) {
  if (value == null || value === "") {
    return "—";
  }

  return <MoneyText value={value} currency="сум" />;
}

function renderDistributor(value) {
  if (!value) {
    return "—";
  }

  if (typeof value === "string") {
    return value;
  }

  return value.name || value.code || "—";
}

export default function DenXanDistributorSummary({
  data,
  loading = false,
  error = "",
  onRetry,
}) {
  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        message="Не удалось загрузить сводку по дистрибьюторам"
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
      width: 180,
      fixed: "left",
      render: renderDistributor,
    },
    {
      title: "Приход",
      dataIndex: "incoming_amount_total",
      width: 160,
      align: "right",
      render: renderMoney,
    },
    {
      title: "Редирект",
      dataIndex: "redirect_amount_total",
      width: 150,
      align: "right",
      render: renderMoney,
    },
    {
      title: "Комиссия редиректа",
      dataIndex: "redirect_debit_fee_total",
      width: 170,
      align: "right",
      render: renderMoney,
    },
    {
      title: "После редиректа",
      dataIndex: "amount_after_redirect_total",
      width: 170,
      align: "right",
      render: renderMoney,
    },
    {
      title: "Чистое движение",
      dataIndex: "bank_net_effect_total",
      width: 170,
      align: "right",
      render: renderMoney,
    },
    {
      title: "Отдать Джамшиду",
      dataIndex: "cash_to_give_jamshid_total",
      width: 170,
      align: "right",
      render: renderMoney,
    },
    {
      title: "Операций",
      dataIndex: "operations_count",
      width: 100,
      align: "right",
      render: (value) => value ?? 0,
    },
  ];

  return (
    <DataTable
      columns={columns}
      dataSource={data}
      rowKey={(row) => row.distributor?.id ?? row.distributor?.code}
      loading={loading}
      pagination={false}
      emptyText="По дистрибьюторам данных нет"
      scroll={{ x: 1270 }}
    />
  );
}
