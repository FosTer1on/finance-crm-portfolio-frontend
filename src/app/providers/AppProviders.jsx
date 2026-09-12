import { ConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";

import dayjs from "dayjs";
import "dayjs/locale/ru";

dayjs.locale("ru");

const theme = {
  token: {
    borderRadius: 6,
    fontSize: 14,
    controlHeight: 34,
  },
};

export default function AppProviders({ children }) {
  return (
    <ConfigProvider locale={ruRU} theme={theme}>
      {children}
    </ConfigProvider>
  );
}
