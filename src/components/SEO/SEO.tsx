import { Helmet } from "react-helmet-async";
import { absoluteUrl, AUTHOR_NAME, SITE_NAME, SITE_TITLE } from "../../config/site";

export default function SEO() {
  const description =
    "Portfolio of Muhammad Ghulam Yaseen, a full stack and mobile app developer building React, React Native, Node.js, MongoDB, DevOps and AI-powered production applications.";
  const canonicalUrl = absoluteUrl("/");

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: AUTHOR_NAME,
    url: canonicalUrl,
    jobTitle: "Full Stack & Mobile App Developer",
    sameAs: ["https://github.com/ghulamyaseen778"],
    knowsAbout: [
      "React",
      "React Native",
      "Node.js",
      "MongoDB",
      "MongoDB Backup and Recovery",
      "REST APIs",
      "DevOps",
      "Nginx",
      "IPsec",
      "CI/CD",
      "Mobile App Development",
      "Artificial Intelligence Integration"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: canonicalUrl,
    description,
    inLanguage: "en"
  };

  return (
    <Helmet>
      <html lang="en" />
      <title>{SITE_TITLE}</title>
      <meta name="description" content={description} />
      <meta
        name="keywords"
        content="Muhammad Ghulam Yaseen, Ghulam Yaseen developer, full stack developer, React developer, React Native developer, Node.js developer, MongoDB developer, DevOps engineer, MERN developer, mobile app developer, Pakistan software developer"
      />
      <meta name="author" content={AUTHOR_NAME} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="theme-color" content="#06080d" />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={SITE_TITLE} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={canonicalUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={SITE_TITLE} />
      <meta name="twitter:description" content={description} />

      <script type="application/ld+json">{JSON.stringify(personSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
    </Helmet>
  );
}
