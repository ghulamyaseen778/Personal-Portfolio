import styles from "./Experience.module.css";
import { motion } from "framer-motion";

const exp = [
  {
    company: "Desk Work Solution",
    role: "Full Stack Developer",
    time: "Sep 2023 - Present",
    desc: "Lead development of scalable web and mobile applications."
  },
  {
    company: "Cubic (Remote)",
    role: "MERN Stack Developer",
    time: "Aug 2023 - Dec 2023",
    desc: "Worked on frontend and backend systems, optimized performance."
  },
  {
    company: "Native Brain",
    role: "Frontend Developer",
    time: "Jan 2023 - Feb 2023",
    desc: "Converted Figma designs into React applications."
  }
];

export default function Experience() {
  return (
    <section className={styles.section} id="experience">
      <h2 className={styles.title}>Experience</h2>

      <div className={styles.timeline}>
        {exp.map((item, i) => (
          <motion.div
            key={i}
            className={styles.item}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className={styles.dot}></div>

            <div className={styles.card}>
              <h3>{item.role}</h3>
              <span>{item.company}</span>
              <small>{item.time}</small>
              <p>{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}