export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  cover: string;
  readTime: string;
  date: string;
  tags: string[];
  featured?: boolean;
  content: React.ReactNode;
}

export const categories = [
  "All",
  "Frontend",
  "Backend",
  "AI",
  "DevOps",
  "Database"
];