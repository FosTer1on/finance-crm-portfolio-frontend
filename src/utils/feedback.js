import { message } from "antd";

export function showSuccess(content) {
  message.success(content);
}

export function showError(content) {
  message.error(content);
}
