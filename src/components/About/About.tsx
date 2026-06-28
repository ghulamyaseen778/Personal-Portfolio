import styles from "./About.module.css";
import { motion } from "framer-motion";

export default function About() {
  return (
    <section className={styles.section} id="about">

      {/* TITLE */}
      <motion.h2
        className={styles.title}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        About Me
      </motion.h2>

      <div className={styles.grid}>

        {/* LEFT - STORY */}
        <motion.div
          className={styles.left}
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
        >
          <p>
            I am a <b>Full Stack Developer</b> specializing in building
            scalable, high-performance web applications, mobile apps,
            and AI-powered systems.
          </p>

          <p>
            I work with modern technologies like MERN stack, React Native,
            Node.js, and Python to deliver production-grade solutions.
            My focus is clean architecture, performance, and premium UI/UX.
          </p>

          <p>
            I believe in writing clean code, building scalable systems,
            and creating digital experiences that feel alive.
          </p>
        </motion.div>

        {/* RIGHT - STATS */}
        <motion.div
          className={styles.right}
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
        >

          <div className={styles.card}>
            <h3>
              {/* <CountUp end={3} duration={2} />+ */}
            </h3>
            <p>Years Experience</p>
          </div>

          <div className={styles.card}>
            <h3>
              {/* <CountUp end={20} duration={2} />+ */}
            </h3>
            <p>Projects Completed</p>
          </div>

          <div className={styles.card}>
            <h3>
              {/* <CountUp end={10} duration={2} />+ */}
            </h3>
            <p>Technologies</p>
          </div>

          <div className={styles.card}>
            <h3>
              {/* <CountUp end={5} duration={2} />+ */}
            </h3>
            <p>Enterprise Systems</p>
          </div>

        </motion.div>

      </div>

    </section>
  );
}