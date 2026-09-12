import { LockOutlined } from "@ant-design/icons";

import styles from "./DayStatus.module.css";

export default function DayStatus({ status }) {
  const isClosed = status === "CLOSED";

  return (
    <span
      className={[styles.root, isClosed ? styles.closed : styles.open].join(
        " "
      )}
    >
      {isClosed ? (
        <>
          <LockOutlined />
          Закрыт
        </>
      ) : (
        <>
          <span className={styles.dot} aria-hidden="true" />
          Открыт
        </>
      )}
    </span>
  );
}
