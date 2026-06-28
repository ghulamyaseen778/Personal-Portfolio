// import ReadingProgress from "../components/ReadingProgress";
// import TableOfContents from "../components/TableOfContents";

import ReadingProgress from "../blog/components/ReadingProgress";
import TableOfContents from "../blog/components/TableOfContents";
import styles from "../components/Blog/Blog.module.css"

export default function BlogLayout({ children }: any) {
  return (
    <div className="blog-layout">

      <ReadingProgress />

      <div className="container">

        {/* LEFT CONTENT */}
        <div className="content">
          {children}
        </div>

        {/* RIGHT SIDEBAR */}
        {/* <div className="sidebar">
          <TableOfContents />
        </div> */}

      </div>
    </div>
  );
}