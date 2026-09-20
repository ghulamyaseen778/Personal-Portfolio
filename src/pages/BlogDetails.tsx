import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowUpRight } from "react-icons/fi";
import { blogs } from "../blog";
import styles from "../components/Blog/Blog.module.css";

export default function BlogDetail() {
  const { slug } = useParams();
  const blog = blogs.find((post) => post.slug === slug);

  if (!blog) {
    return (
      <main className={styles.notFound}>
        <p>Article not found.</p>
        <Link to="/blog">Back to articles</Link>
      </main>
    );
  }

  const related = blogs.filter((post) => post.slug !== blog.slug).slice(0, 2);

  return (
    <>
      <Helmet>
        <title>{blog.title} | Ghulam Yaseen</title>
        <meta name="description" content={blog.description} />
        <meta name="author" content="Muhammad Ghulam Yaseen" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.description} />
      </Helmet>

      <main className={styles.articlePage}>
        <header className={styles.topbar}>
          <Link to="/blog" className={styles.back}><FiArrowLeft /> All articles</Link>
          <Link to="/" className={styles.back}>Portfolio <FiArrowUpRight /></Link>
        </header>

        <article className={styles.articleWrapper}>
          <header className={styles.articleHeader}>
            <div className={styles.articleMeta}>
              <span>{blog.category}</span>
              <span>{blog.date}</span>
              <span>{blog.readTime}</span>
            </div>
            <h1>{blog.title}</h1>
            <p>{blog.description}</p>
            <div className={styles.tags}>
              {blog.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          </header>

          <div className={styles.content}>
            {blog.content}
          </div>

          <section className={styles.related}>
            <span className={styles.subtitle}>Continue reading</span>
            <div className={styles.relatedGrid}>
              {related.map((post) => (
                <Link to={"/blog/" + post.slug} key={post.slug} className={styles.relatedCard}>
                  <span>{post.category}</span>
                  <h3>{post.title}</h3>
                  <FiArrowUpRight />
                </Link>
              ))}
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
