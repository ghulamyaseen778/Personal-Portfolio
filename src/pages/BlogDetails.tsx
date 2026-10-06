import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowUpRight } from "react-icons/fi";
import { blogs } from "../blog";
import { absoluteUrl, AUTHOR_NAME, SITE_NAME } from "../config/site";
import styles from "../components/Blog/Blog.module.css";

function toIsoDate(date: string) {
  const match = date.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/);
  if (!match) return undefined;

  const monthMap: Record<string, string> = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12"
  };

  return `${match[2]}-${monthMap[match[1]]}-01`;
}

export default function BlogDetail() {
  const { slug } = useParams();
  const blog = blogs.find((post) => post.slug === slug);

  if (!blog) {
    return (
      <>
        <Helmet>
          <title>Article Not Found | {SITE_NAME}</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <main className={styles.notFound}>
          <p>Article not found.</p>
          <Link to="/blog">Back to articles</Link>
        </main>
      </>
    );
  }

  const canonicalUrl = absoluteUrl(`/blog/${blog.slug}`);
  const publishedDate = toIsoDate(blog.date);
  const seoTitle = `${blog.title} | ${SITE_NAME}`;
  const keywords = Array.from(
    new Set([
      ...blog.tags,
      blog.category,
      "software engineering",
      "production engineering",
      "technical guide"
    ])
  ).join(", ");

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: blog.title,
    description: blog.description,
    url: canonicalUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: absoluteUrl("/")
    },
    publisher: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: absoluteUrl("/")
    },
    ...(publishedDate ? { datePublished: publishedDate, dateModified: publishedDate } : {}),
    articleSection: blog.category,
    keywords: blog.tags.join(", "),
    inLanguage: "en"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/")
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Articles",
        item: absoluteUrl("/blog")
      },
      {
        "@type": "ListItem",
        position: 3,
        name: blog.title,
        item: canonicalUrl
      }
    ]
  };

  const related = blogs.filter((post) => post.slug !== blog.slug).slice(0, 2);

  return (
    <>
      <Helmet>
        <html lang="en" />
        <title>{seoTitle}</title>
        <meta name="description" content={blog.description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={AUTHOR_NAME} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="article" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.description} />
        <meta property="og:url" content={canonicalUrl} />
        {publishedDate && <meta property="article:published_time" content={publishedDate} />}
        <meta property="article:author" content={AUTHOR_NAME} />
        <meta property="article:section" content={blog.category} />
        {blog.tags.map((tag) => (
          <meta property="article:tag" content={tag} key={tag} />
        ))}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={blog.description} />

        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
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

          <section className={styles.related} aria-labelledby="related-articles">
            <span className={styles.subtitle}>Continue reading</span>
            <h2 id="related-articles" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
              Related articles
            </h2>
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
