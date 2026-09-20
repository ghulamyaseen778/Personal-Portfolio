import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiArrowUpRight } from "react-icons/fi";
import { blogs } from "../blog";
import { categories } from "../blog/types";
import styles from "../components/Blog/Blog.module.css";

export default function BlogPage() {
  const [selected, setSelected] = useState("All");

  const filtered =
    selected === "All"
      ? blogs
      : blogs.filter((blog) => blog.category === selected);

  return (
    <>
      <Helmet>
        <title>Articles & Engineering Notes | Muhammad Ghulam Yaseen</title>
        <meta
          name="description"
          content="Practical articles about VPS deployment, MongoDB, React, backend systems, mobile development and production engineering."
        />
      </Helmet>

      <main className={styles.page}>
        <header className={styles.topbar}>
          <Link to="/" className={styles.back}><FiArrowLeft /> Portfolio</Link>
        </header>

        <section className={styles.blogHero}>
          <span className={styles.subtitle}>Engineering notes</span>
          <h1>Articles built from real deployment and development work.</h1>
          <p>
            Detailed guides for the parts of software engineering that usually become
            difficult only after an application leaves localhost.
          </p>
        </section>

        <div className={styles.categories}>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={selected === category ? styles.active : ""}
              onClick={() => setSelected(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <section className={styles.grid}>
          {filtered.map((blog) => (
            <Link to={"/blog/" + blog.slug} className={styles.card} key={blog.slug}>
              <div className={styles.cardTop}>
                <span>{blog.category}</span>
                <span>{blog.readTime}</span>
              </div>
              <h2>{blog.title}</h2>
              <p>{blog.description}</p>
              <div className={styles.cardFooter}>
                <span>{blog.date}</span>
                <FiArrowUpRight />
              </div>
            </Link>
          ))}
        </section>
      </main>
    </>
  );
}
