import styles from "./Certificates.module.css";
import { certificates } from "../../data/certificates";
import CertificateCard from "./CertificateCard";

export default function Certificates() {
  return (
    <section
      id="certificates"
      className={styles.section}
    >
      <span className={styles.label}>
        PROFESSIONAL ACHIEVEMENTS
      </span>

      <h2 className={styles.heading}>
        Certifications
      </h2>

      <p className={styles.description}>
        Industry-recognized certifications that validate my
        expertise in software engineering, cloud technologies,
        scalable architecture, AI integration and modern
        application development.
      </p>

      <div className={styles.grid}>
        {certificates.map((certificate) => (
          <CertificateCard
            key={certificate.id}
            certificate={certificate}
          />
        ))}
      </div>
    </section>
  );
}