import { Alert, Button, Tag } from "antd";

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

function renderExpenseType(value) {
  if (value === "OTHER") {
    return <Tag>Прочее</Tag>;
  }

  if (value === "REDIRECT_DEBIT_FEE") {
    return <Tag>Комиссия редиректа</Tag>;
  }

  if (value === "OUTGOING_DEBIT_FEE") {
    return <Tag>Комиссия исхода</Tag>;
  }

  return value || "—";
}

function renderSource(expense) {
  if (expense.related_incoming_id) {
    return `Приход #${expense.related_incoming_id}`;
  }

  if (expense.related_outgoing_id) {
    return `Исход #${expense.related_outgoing_id}`;
  }

  return "—";
}

export default function DenXanExpenseTable({
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
        message="Не удалось загрузить расходы"
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
      title: "Тип",
      dataIndex: "expense_type",
      width: 190,
      render: renderExpenseType,
    },
    {
      title: "Источник",
      key: "source",
      width: 140,
      render: (_, expense) => renderSource(expense),
    },
    {
      title: "Счёт",
      dataIndex: "account",
      width: 160,
      render: renderRelatedName,
    },
    {
      title: "Сумма",
      dataIndex: "amount",
      width: 180,
      align: "right",
      render: renderMoney,
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      width: 280,
      render: (value) => value || "—",
    },
    {
      title: "Действие",
      key: "action",
      width: 110,
      fixed: "right",
      render: (_, expense) => {
        const canCancel = expense.expense_type === "OTHER";

        if (!canCancel) {
          return "—";
        }

        return (
          <Button
            type="link"
            danger
            size="small"
            disabled={cancelDisabled}
            onClick={() => onCancel?.(expense)}
          >
            Отменить
          </Button>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
      emptyText="Расходов за выбранный день нет"
      scroll={{ x: 950 }}
    />
  );
}
