// import { blogs } from "../blog";
import { Link } from "react-router-dom";
import { blogs } from "../../blog";

export default function BlogNavigation({ currentSlug }: any) {
  const index = blogs.findIndex(
    (b) => b.slug === currentSlug
  );

  const prev = blogs[index - 1];
  const next = blogs[index + 1];

  return (
    <div className="nav">

      {prev && (
        <Link to={`/blog/${prev.slug}`}>
          ← {prev.title}
        </Link>
      )}

      {next && (
        <Link to={`/blog/${next.slug}`}>
          {next.title} →
        </Link>
      )}

    </div>
  );
}