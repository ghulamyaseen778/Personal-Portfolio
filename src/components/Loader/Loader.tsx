import { motion } from "framer-motion";
import styles from "./Loader.module.css";

export default function Loader() {
  return (
    <motion.div
      className={styles.loader}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 1.5, duration: 0.8 }}
    >
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        Muhammad Yaseen
      </motion.h1>
    </motion.div>
  );
}