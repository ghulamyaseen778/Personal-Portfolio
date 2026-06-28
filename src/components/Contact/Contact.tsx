import styles from "./Contact.module.css";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  FiMail,
  FiPhone,
  FiGithub,
  FiLinkedin,
  FiMessageCircle
} from "react-icons/fi";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      setSuccess(true);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  return (
    <section className={styles.section} id="contact">

      {/* TITLE */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <h2>Let’s Build Something Amazing</h2>
        <p>Have a project? Let’s work together.</p>
      </motion.div>

      {/* GRID */}
      <div className={styles.grid}>

        {/* LEFT SIDE */}
        <motion.div
          className={styles.left}
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
        >

          <h3>Contact Information</h3>

          <div className={styles.item}>
            <FiMail />
            <span>yourname@gmail.com</span>
          </div>

          <div className={styles.item}>
            <FiPhone />
            <span>+92 300 0000000</span>
          </div>

          <div className={styles.item}>
            <FiGithub />
            <span>github.com/yourname</span>
          </div>

          <div className={styles.item}>
            <FiLinkedin />
            <span>linkedin.com/in/yourname</span>
          </div>

          <div className={styles.social}>
            <FiMessageCircle />
            <span>Available for freelance & full-time work</span>
          </div>

        </motion.div>

        {/* RIGHT SIDE */}
        <motion.form
          className={styles.form}
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
        >

          <input
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <textarea
            name="message"
            placeholder="Your Message"
            value={form.message}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>

          {success && (
            <p className={styles.success}>
              ✅ Message sent successfully
            </p>
          )}

        </motion.form>

      </div>
    </section>
  );
}