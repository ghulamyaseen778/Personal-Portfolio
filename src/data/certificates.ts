export interface Certificate {
  id: number;
  title: string;
  organization: string;
  date: string;
  image: string;
  verify?: string;
  skills: string[];
}

export const certificates: Certificate[] = [
  {
    id: 1,
    title: "React Developer",
    organization: "Meta",
    date: "2024",
    image: "/certificates/react.jpg",
    verify: "https://example.com",
    skills: ["React", "Hooks", "SPA"]
  },
  {
    id: 2,
    title: "Node.js Backend",
    organization: "Coursera",
    date: "2023",
    image: "/certificates/node.jpg",
    verify: "https://example.com",
    skills: ["Node", "Express", "REST"]
  },
  {
    id: 3,
    title: "MongoDB Associate",
    organization: "MongoDB",
    date: "2024",
    image: "/certificates/mongodb.jpg",
    verify: "https://example.com",
    skills: ["MongoDB", "Aggregation"]
  }
];