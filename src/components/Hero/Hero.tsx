import styles from "./Hero.module.css";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FiDownload,
  FiGithub,
  FiArrowRight
} from "react-icons/fi";

const roles = [
  "Full Stack Developer",
  "React Specialist",
  "Node.js Engineer",
  "AI Integrator",
  "Backend Architect",
  "MERN Expert",
  "Problem Solver"
];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % roles.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.hero} id="home">
      {/* Background Glow */}
      <div className={styles.bgGlow}></div>

      <div className={styles.container}>

        {/* LEFT SIDE */}
        <div className={styles.left}>

          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={styles.subtitle}
          >
            Hello, I'm
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={styles.title}
          >
            Muhammad Ghulam Yaseen
          </motion.h1>

          <motion.div
            className={styles.role}
            key={roles[index]}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {roles[index]}
          </motion.div>

          <p className={styles.desc}>
            I build scalable full-stack applications, AI-powered systems,
            and modern digital experiences with clean architecture and premium UI.
          </p>

          {/* CTA Buttons */}
          <div className={styles.buttons}>

            <button className={styles.primary}>
              View Projects <FiArrowRight />
            </button>

            {/* <button className={styles.secondary}>
              <FiDownload /> Resume
            </button> */}

            <button className={styles.ghost}>
              <FiGithub /> GitHub
            </button>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className={styles.right}>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className={styles.card}
          >

            <div className={styles.glassTop}>
              <span>Live Developer Workspace</span>
            </div>

            <div className={styles.code}>
              <p><span>const</span> developer = &#123;</p>
              <p>  name: "Muhammad Yaseen",</p>
              <p>  stack: ["React", "Node", "AI"],</p>
              <p>  passion: "Building scalable systems",</p>
              <p>&#125;</p>
            </div>

            <div className={styles.status}>
              <span className={styles.dot}></span>
              Available for work
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}