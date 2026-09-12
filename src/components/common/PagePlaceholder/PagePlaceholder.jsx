import { Typography } from "antd";

import PageToolbar from "@/components/common/PageToolbar/PageToolbar";

import styles from "./PagePlaceholder.module.css";

const { Text } = Typography;

export default function PagePlaceholder({
  title,
  description = "Раздел будет реализован " + "на следующем этапе.",
}) {
  return (
    <div className={styles.root}>
      <PageToolbar title={title} />

      <div className={styles.content}>
        <Text type="secondary">{description}</Text>
      </div>
    </div>
  );
}
