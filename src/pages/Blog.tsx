import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiArrowUpRight } from "react-icons/fi";
import { blogs } from "../blog";
import { categories } from "../blog/types";
import { absoluteUrl, SITE_NAME } from "../config/site";
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
        <html lang="en" />
        <title>Software Engineering Articles, MongoDB, DevOps & React | {SITE_NAME}</title>
        <meta
          name="description"
          content="Practical software engineering articles covering MongoDB backup and recovery, VPS deployment, Nginx load balancing, IPsec, CI/CD, React and production systems."
        />
        <meta
          name="keywords"
          content="MongoDB backup recovery, mongodump mongorestore, MongoDB restore deleted data, VPS deployment, Nginx load balancer, IPsec VPN, GitHub Actions CI/CD, React engineering"
        />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <link rel="canonical" href={absoluteUrl("/blog")} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`Software Engineering Articles | ${SITE_NAME}`} />
        <meta
          property="og:description"
          content="Production-focused engineering guides for MongoDB, DevOps, networking, backend systems and React."
        />
        <meta property="og:url" content={absoluteUrl("/blog")} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Software Engineering Articles",
            url: absoluteUrl("/blog"),
            description:
              "Production-focused software engineering guides covering MongoDB, DevOps, networking, backend systems and React.",
            isPartOf: {
              "@type": "WebSite",
              name: SITE_NAME,
              url: absoluteUrl("/")
            }
          })}
        </script>
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
