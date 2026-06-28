export interface Blog {
  id: number;
  title: string;
  description: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
  slug: string;
}

export const blogs: Blog[] = [
  {
    id: 1,
    title: "Building Enterprise React Applications",
    description:
      "Learn scalable architecture, reusable components and best practices for enterprise-grade React applications.",
    category: "Frontend",
    readTime: "6 min read",
    date: "May 2026",
    image: "/blogs/react.jpg",
    slug: "/blog/react-enterprise"
  },
  {
    id: 2,
    title: "Designing High Performance REST APIs",
    description:
      "Authentication, caching, validation and scalable backend architecture using Node.js.",
    category: "Backend",
    readTime: "8 min read",
    date: "Apr 2026",
    image: "/blogs/node.jpg",
    slug: "/blog/rest-api"
  },
  {
    id: 3,
    title: "Building AI Applications with OpenAI",
    description:
      "Integrate LLMs into modern web applications using OpenAI APIs and automation.",
    category: "Artificial Intelligence",
    readTime: "7 min read",
    date: "Mar 2026",
    image: "/blogs/ai.jpg",
    slug: "/blog/openai"
  }
];