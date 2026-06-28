import { useState } from "react";
import { blogs } from "../../blog";
import { categories } from "../../blog/types";
import BlogCard from "./BlogCard";
import styles from "./Blog.module.css";

export default function BlogPage() {
  const [active, setActive] = useState("All");

  const filtered =
    active === "All"
      ? blogs
      : blogs.filter((b) => b.category === active);

  return (
    <div className={styles.page} id="blog">

      {/* HEADER */}
      <div className={styles.header}>

        <div className={styles.titleBox}>
          <div className={styles.subtitle}>ARTICLES</div>

          <h1 className={styles.title}>
            Articles & Insights
          </h1>

          <p className={styles.desc}>
            Thoughts on software engineering, AI, backend systems and architecture.
          </p>
        </div>

      </div>

      {/* CATEGORIES */}
      <div className={styles.categories}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={active === cat ? styles.active : ""}
            onClick={() => setActive(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className={styles.grid}>
        {filtered.map((blog) => (
          <BlogCard key={blog.slug} blog={blog} />
        ))}
      </div>

    </div>
  );
}