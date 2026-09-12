import styles from "./PageToolbar.module.css";

export default function PageToolbar({ title, actions = null, meta = null }) {
  return (
    <div className={styles.root}>
      <div className={styles.main}>
        <h1 className={styles.title}>{title}</h1>

        {meta && <div className={styles.meta}>{meta}</div>}
      </div>

      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
