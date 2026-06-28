import styles from "./Certificates.module.css";
import { motion } from "framer-motion";
import {
  FiAward,
  FiExternalLink,
  FiCalendar,
  FiHash
} from "react-icons/fi";

export default function CertificateCard({ certificate }: any) {
  return (
    <motion.div
      className={styles.card}
      whileHover={{
        y: -8,
        rotateX: 3,
        rotateY: -3
      }}
      transition={{ duration: .25 }}
    >
      <div className={styles.shine}></div>

      <div className={styles.icon}>
        <FiAward />
      </div>

      <h3>{certificate.title}</h3>

      <p className={styles.organization}>
        {certificate.organization}
      </p>

      <div className={styles.meta}>
        <span>
          <FiCalendar />
          {certificate.date}
        </span>

        {certificate.credentialId && (
          <span>
            <FiHash />
            {certificate.credentialId}
          </span>
        )}
      </div>

      <div className={styles.skills}>
        {certificate.skills.map((skill: string) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>

      <a
        href={certificate.verify}
        target="_blank"
        rel="noreferrer"
        className={styles.button}
      >
        Verify Credential
        <FiExternalLink />
      </a>
    </motion.div>
  );
}