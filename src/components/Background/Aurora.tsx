import styles from "./Background.module.css";

export default function Aurora() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.blob1}></div>
      <div className={styles.blob2}></div>
      <div className={styles.blob3}></div>
      <div className={styles.noise}></div>
    </div>
  );
}