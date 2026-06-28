import { Helmet } from "react-helmet-async";

export default function SEO() {
  return (
    <Helmet>
      <title>Muhammad Ghulam Yaseen | Full Stack Developer</title>

      <meta name="description" content="Full Stack Developer specializing in MERN, AI, scalable systems, and modern web apps." />

      <meta name="keywords" content="Full Stack Developer, React, Node.js, MERN, AI Developer" />

      <meta property="og:title" content="Muhammad Yaseen Portfolio" />
      <meta property="og:description" content="Premium developer portfolio showcasing scalable systems & AI apps." />
    </Helmet>
  );
}