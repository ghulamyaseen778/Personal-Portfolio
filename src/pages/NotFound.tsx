import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found | Muhammad Ghulam Yaseen</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <main style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: "3rem 1.5rem" }}>
        <div style={{ textAlign: "center", maxWidth: 640 }}>
          <p style={{ opacity: 0.7 }}>404</p>
          <h1>Page not found</h1>
          <p>The page may have moved or the URL may be incorrect.</p>
          <Link to="/">Back to portfolio</Link>
        </div>
      </main>
    </>
  );
}
