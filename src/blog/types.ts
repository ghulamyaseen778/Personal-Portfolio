import type { ReactNode } from "react";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  date: string;
  tags: string[];
  cover?: string;
  featured?: boolean;
  content: ReactNode;
}

export const categories = [
  "All",
  "DevOps",
  "Database",
  "Frontend",
  "Backend",
  "AI"
];
