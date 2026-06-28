import styles from "./Projects.module.css";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function ProjectModal({ project, onClose }: any) {
  useEffect(() => {
    const closeOnEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", closeOnEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", closeOnEsc);
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modal}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className={styles.modalHeader}>
          <h2>{project.title}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* BODY */}
        <div className={styles.modalBody}>

          <p>{project.description}</p>

          {/* TECH STACK */}
          <div className={styles.modalTech}>
            {project.tech.map((t: string) => (
              <span key={t}>{t}</span>
            ))}
          </div>

          {/* CASE STUDY SECTION */}
          <div className={styles.caseStudy}>
            <h3>Overview</h3>
            <p>
              This project was built as a scalable enterprise-level system
              focusing on performance, architecture, and UX excellence.
            </p>

            <h3>Key Features</h3>
            <ul>
              <li>High-performance architecture</li>
              <li>Scalable backend system</li>
              <li>Modern UI with glassmorphism</li>
              <li>Secure API integration</li>
            </ul>

            <h3>Challenges</h3>
            <p>
              Handling real-time data synchronization and multi-user state
              consistency across distributed systems.
            </p>
          </div>

          {/* ACTIONS */}
          <div className={styles.modalActions}>
            <button className={styles.live}>Live Demo</button>
            <button className={styles.github}>GitHub</button>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}