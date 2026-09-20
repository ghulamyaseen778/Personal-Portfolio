import { Helmet } from "react-helmet-async";

export default function SEO() {
  const title = "Muhammad Ghulam Yaseen | Full Stack & Mobile App Developer";
  const description =
    "Portfolio of Muhammad Ghulam Yaseen, a full stack and mobile app developer building React, React Native, Node.js, MongoDB and AI-powered production applications.";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Muhammad Ghulam Yaseen",
    jobTitle: "Full Stack & Mobile App Developer",
    email: "mailto:muhammadyaseen3294@gmail.com",
    sameAs: ["https://github.com/ghulamyaseen778"],
    knowsAbout: [
      "React",
      "React Native",
      "Node.js",
      "MongoDB",
      "REST APIs",
      "Mobile App Development",
      "Artificial Intelligence Integration"
    ]
  };

  return (
    <Helmet>
      <html lang="en" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        name="keywords"
        content="Muhammad Ghulam Yaseen, Ghulam Yaseen developer, full stack developer, React developer, React Native developer, Node.js developer, MERN developer, mobile app developer, Pakistan software developer"
      />
      <meta name="author" content="Muhammad Ghulam Yaseen" />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="theme-color" content="#06080d" />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content="Muhammad Ghulam Yaseen Portfolio" />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
}
