import { useParams } from "react-router-dom";
import { blogs } from "../blog";
import BlogLayout from "../layouts/BlogLayout";
import RelatedPosts from "../components/Blog/RelatedPosts";
import BlogNavigation from "../components/Blog/BlogNavigation";
import styles from "../components/Blog/Blog.module.css";

export default function BlogDetail() {
  const { slug } = useParams();

  const blog = blogs.find((b) => b.slug === slug);

  if (!blog) {
    return (
      <div style={{ padding: "120px", color: "white" }}>
        Not Found
      </div>
    );
  }

  return (
    <BlogLayout>

      <article className={styles.articleWrapper}>

        {/* COVER */}
        <img
          src={blog.cover}
          className={styles.cover}
          alt={blog.title}
        />

        {/* META */}
        <div className={styles.meta}>
          <span>{blog.category}</span>
          <span>•</span>
          <span>{blog.date}</span>
          <span>•</span>
          <span>{blog.readTime}</span>
        </div>

        {/* TITLE */}
        <h1 className={styles.title}>
          {blog.title}
        </h1>

        {/* DESCRIPTION */}
        <p className={styles.desc}>
          {blog.description}
        </p>

        {/* CONTENT */}
        <div className={styles.content}>
          {blog.content}
        </div>

        {/* NAVIGATION */}
        <div className={styles.sectionGap}>
          <BlogNavigation currentSlug={slug!} />
        </div>

        {/* RELATED */}
        <div className={styles.sectionGap}>
          <RelatedPosts category={blog.category} />
        </div>

      </article>

    </BlogLayout>
  );
}