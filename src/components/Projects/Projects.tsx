import { useEffect, useState } from "react";
import styles from "./Projects.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "../../data/projects";
import ProjectCard from "./ProjectCard";

const categories = [
  "all",
  "websites",
  "mobile-apps",
  "products",
  "personal-products"
];

export default function Projects() {
  const [active, setActive] = useState("all");

  // 🔥 URL Deep Linking Support
  useEffect(() => {
    const hash = window.location.hash.replace("#projects/", "");
    if (hash) setActive(hash);
  }, []);

  const filtered =
    active === "all"
      ? projects
      : projects.filter((p) => p.category === active);

  return (
    <section className={styles.section} id="projects">

      <h2 className={styles.title}>Featured Projects</h2>

      {/* FILTERS */}
      <div className={styles.filters}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={active === cat ? styles.active : ""}
            onClick={() => {
              setActive(cat);
              window.location.hash = `projects/${cat}`;
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GRID */}
      <motion.div layout className={styles.grid}>
        <AnimatePresence>
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </AnimatePresence>
      </motion.div>

    </section>
  );
}