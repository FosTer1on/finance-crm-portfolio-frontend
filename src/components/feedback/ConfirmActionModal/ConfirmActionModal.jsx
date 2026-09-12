import { Modal } from "antd";

export default function ConfirmActionModal({
  open,
  title = "Подтверждение",
  description,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      title={title}
      okText={confirmText}
      cancelText={cancelText}
      okButtonProps={{
        danger,
      }}
      confirmLoading={loading}
      onOk={onConfirm}
      onCancel={onCancel}
      destroyOnHidden
    >
      {description}
    </Modal>
  );
}
