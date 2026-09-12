import styles from "./DualOperationFormLayout.module.css";

export default function DualOperationFormLayout({
  leftTitle,
  left,
  rightTitle,
  right,
}) {
  return (
    <div className={styles.root}>
      <section className={styles.section}>
        {leftTitle && <h3 className={styles.title}>{leftTitle}</h3>}

        {left}
      </section>

      <section className={styles.section}>
        {rightTitle && <h3 className={styles.title}>{rightTitle}</h3>}

        {right}
      </section>
    </div>
  );
}
