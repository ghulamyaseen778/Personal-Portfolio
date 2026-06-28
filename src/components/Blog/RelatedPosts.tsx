// import { blogs } from "../blog";
import { blogs } from "../../blog";
import BlogCard from "./BlogCard";

export default function RelatedPosts({ category }: any) {
  const related = blogs
    .filter((b) => b.category === category)
    .slice(0, 3);

  return (
    <div className="related">

      <h3>Related Articles</h3>

      <div className="grid" style={{marginTop:20}}>
        {related.map((b) => (
          <BlogCard key={b.slug} blog={b} />
        ))}
      </div>

    </div>
  );
}