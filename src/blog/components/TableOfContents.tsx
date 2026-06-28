import { useEffect, useState } from "react";

export default function TableOfContents() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const sections = document.querySelectorAll("h2, h3");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    sections.forEach((section) =>
      observer.observe(section)
    );

    return () => observer.disconnect();
  }, []);

  const headings = Array.from(
    document.querySelectorAll("h2, h3")
  );

  return (
    <div className="toc">
      <h4>Contents</h4>

      {headings.map((h: any, i) => (
        <a
          key={i}
          href={`#${h.id}`}
          className={active === h.id ? "active" : ""}
        >
          {h.innerText}
        </a>
      ))}
    </div>
  );
}