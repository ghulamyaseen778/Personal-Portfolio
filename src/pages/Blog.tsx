import { useState } from "react";
import { blogs } from "../blog";
import BlogCard from "../components/Blog/BlogCard";
import styles from "../components/Blog/Blog.module.css";

const categories = ["All", "Frontend", "Backend", "AI"];

export default function BlogPage() {
  const [selected, setSelected] = useState("All");

  const filtered =
    selected === "All"
      ? blogs
      : blogs.filter((b) => b.category === selected);

  return (
    <div className={styles.page}>

      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.titleBox}>
          <div className={styles.subtitle}>BLOG</div>

          <h1 className={styles.title}>
            Articles & Insights
          </h1>

          <p className={styles.desc}>
            Thoughts on software engineering, architecture, AI and modern full-stack development.
          </p>
        </div>
      </div>

      {/* CATEGORIES */}
      <div className={styles.categories}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={selected === cat ? styles.active : ""}
            onClick={() => setSelected(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className={styles.grid}>
        {filtered.map((b) => (
          <BlogCard key={b.slug} blog={b} />
        ))}
      </div>

    </div>
  );
}