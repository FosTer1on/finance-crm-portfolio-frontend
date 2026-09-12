import { Spin } from "antd";

import styles from "./AppLoader.module.css";

export default function AppLoader() {
  return (
    <div className={styles.root}>
      <Spin size="large" />
    </div>
  );
}
