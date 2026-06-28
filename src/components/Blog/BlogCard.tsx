import { Link } from "react-router-dom";
import styles from "./Blog.module.css";

export default function BlogCard({ blog }: any) {
  return (
    <Link to={`/blog/${blog.slug}`} className={styles.card}>

      <div className={styles.category}>
        {blog.category}
      </div>

      <h3>{blog.title}</h3>

      <p>{blog.description}</p>

      <div className={styles.meta}>
        <span>{blog.date}</span>
        <span>{blog.readTime}</span>
      </div>

    </Link>
  );
}