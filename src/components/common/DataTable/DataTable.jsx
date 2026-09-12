import { Table } from "antd";

export default function DataTable({
  columns,
  dataSource,
  rowKey = "id",
  loading = false,
  pagination = false,
  size = "middle",
  scroll,
  emptyText = "Нет данных",
  ...props
}) {
  return (
    <Table
      {...props}
      rowKey={rowKey}
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      pagination={pagination}
      size={size}
      scroll={scroll}
      locale={{
        emptyText,
        ...props.locale,
      }}
    />
  );
}
