import { useState } from "react";
import ProjectModal from "./ProjectModal";
import styles from "./Projects.module.css";
import { motion } from "framer-motion";

export default function ProjectCard({ project }: any) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div
        layout
        whileHover={{ scale: 1.03 }}
        className={styles.card}
        onClick={() => setOpen(true)}
      >
        <div className={styles.badge}>{project.status}</div>

        <h3>{project.title}</h3>

        <p>{project.description}</p>

        <div className={styles.tech}>
          {project.tech.map((t: string) => (
            <span key={t}>{t}</span>
          ))}
        </div>

        <div className={styles.actions}>
          <button>View Case Study</button>
        </div>
      </motion.div>

      {open && (
        <ProjectModal
          project={project}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}