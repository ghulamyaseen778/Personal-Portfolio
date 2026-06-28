import styles from "./Skills.module.css";
import { motion } from "framer-motion";

const skills = [
  {
    title: "Frontend Development",
    items: ["React", "Next.js", "TypeScript", "Redux", "Framer Motion"]
  },
  {
    title: "Backend Development",
    items: ["Node.js", "Express", "REST APIs", "GraphQL"]
  },
  {
    title: "Database",
    items: ["MongoDB", "PostgreSQL", "MySQL"]
  },
  {
    title: "Mobile Development",
    items: ["React Native", "Android Apps"]
  },
  {
    title: "Cloud & DevOps",
    items: ["AWS", "Docker", "Vercel", "CI/CD"]
  },
  {
    title: "AI & Tools",
    items: ["OpenAI APIs", "LangChain", "Automation"]
  }
];

export default function Skills() {
  return (
    <section className={styles.section} id="skills">

      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <h2>Technical Expertise</h2>
        <p>Technologies I use to build scalable, modern applications</p>
      </motion.div>

      <div className={styles.grid}>
        {skills.map((group, i) => (
          <motion.div
            key={i}
            className={styles.card}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <h3>{group.title}</h3>

            <div className={styles.tags}>
              {group.items.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

    </section>
  );
}