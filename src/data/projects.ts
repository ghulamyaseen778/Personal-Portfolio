export interface Project {
  id: number;
  slug: string;
  title: string;
  category: "products" | "mobile-apps" | "websites";
  description: string;
  overview: string;
  challenge: string;
  solution: string;
  role: string;
  year: string;
  tech: string[];
  highlights: string[];
  responsibilities: string[];
  status: string;
}

export const projects: Project[] = [
  {
    id: 1,
    slug: "multi-vendor-pos-system",
    title: "Multi-Vendor POS System",
    category: "products",
    description:
      "A production-focused POS platform with inventory, stock controls, invoice workflows, permissions and operational reporting.",
    overview:
      "A business operations platform designed around day-to-day retail workflows rather than isolated screens. The system connects sales, inventory, permissions and reporting so operational actions remain traceable.",
    challenge:
      "Inventory-heavy products need to stay correct while multiple users are creating invoices, reviewing stock differences and changing business data. The difficult part is protecting consistency without slowing down staff.",
    solution:
      "I structured the application around explicit business states, permission-aware actions and backend validation. Critical stock changes are checked against current data before they are applied, while the UI keeps complex operational flows understandable.",
    role: "Full Stack Development",
    year: "2025 — 2026",
    tech: ["React", "Node.js", "Express", "MongoDB", "Redux", "REST APIs"],
    highlights: [
      "Role and permission aware business workflows",
      "Stock checking, approval and adjustment history",
      "Invoice, pricing and VAT-aware calculations",
      "Operational exports and reporting flows"
    ],
    responsibilities: [
      "Frontend architecture and complex admin workflows",
      "REST API implementation and MongoDB data modelling",
      "Business-rule validation and edge-case handling",
      "Performance, debugging and production support"
    ],
    status: "Production work"
  },
  {
    id: 2,
    slug: "sdk-bazzar-mobile-app",
    title: "SDK Bazzar Mobile App",
    category: "mobile-apps",
    description:
      "A React Native application combining multiple consumer workflows in one mobile experience.",
    overview:
      "A multi-purpose mobile application where different user journeys share one authentication, navigation and API foundation. The product required reusable mobile patterns rather than one-off screens.",
    challenge:
      "Combining several product areas inside a single app can quickly make navigation, state and API handling inconsistent.",
    solution:
      "I used reusable React Native components, clear screen boundaries and shared service patterns so new workflows could be added without duplicating the app foundation.",
    role: "Mobile + Backend Development",
    year: "2024",
    tech: ["React Native", "Node.js", "MongoDB", "REST APIs"],
    highlights: [
      "Cross-platform mobile UI",
      "Shared authentication and navigation patterns",
      "API-driven screens and reusable components",
      "Production-oriented error and loading states"
    ],
    responsibilities: [
      "React Native UI development",
      "Backend API integration",
      "State and navigation structure",
      "Mobile debugging and release support"
    ],
    status: "Delivered"
  },
  {
    id: 3,
    slug: "apparel-complaint-system",
    title: "Apparel Complaint System",
    category: "products",
    description:
      "A workflow application for tracking complaints, ownership, status changes and operational follow-up.",
    overview:
      "A business workflow system built to replace fragmented follow-up with a single traceable complaint lifecycle.",
    challenge:
      "The system needed to make ownership and status visible while keeping a reliable history of actions across teams.",
    solution:
      "I modelled the workflow around explicit statuses, responsible actors and consistent backend transitions, then surfaced that lifecycle through focused dashboards and detail views.",
    role: "Full Stack Development",
    year: "2024 — 2025",
    tech: ["React", "Node.js", "MongoDB", "Redux", "REST APIs"],
    highlights: [
      "Structured complaint lifecycle",
      "Status and ownership visibility",
      "Dashboard and operational views",
      "Reusable frontend and backend patterns"
    ],
    responsibilities: [
      "Workflow modelling",
      "Frontend implementation",
      "API and database work",
      "Production issue resolution"
    ],
    status: "Production work"
  },
  {
    id: 4,
    slug: "corporate-websites",
    title: "Corporate Websites Portfolio",
    category: "websites",
    description:
      "Responsive corporate websites focused on clarity, performance, maintainable content and search-friendly structure.",
    overview:
      "A collection of business-facing web experiences where strong information hierarchy, responsive behavior and performance matter as much as visual polish.",
    challenge:
      "Marketing sites often become visually heavy and difficult to maintain, which can hurt load time, accessibility and SEO.",
    solution:
      "I favor semantic content structure, lightweight components, responsive layouts and restrained motion so the sites stay fast while still feeling premium.",
    role: "Frontend / Full Stack Development",
    year: "2023 — 2026",
    tech: ["React", "Vite", "Next.js", "CSS", "SEO"],
    highlights: [
      "Responsive component systems",
      "SEO-conscious semantic structure",
      "Performance-focused visual implementation",
      "Reusable content and section patterns"
    ],
    responsibilities: [
      "UI implementation",
      "Responsive behavior",
      "Performance optimization",
      "Deployment and maintenance"
    ],
    status: "Multiple deliveries"
  }
];

export const getProjectBySlug = (slug?: string) =>
  projects.find((project) => project.slug === slug);
