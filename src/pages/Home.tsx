import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowDownRight,
  FiArrowUpRight,
  FiAward,
  FiBox,
  FiBriefcase,
  FiCheck,
  FiCode,
  FiCpu,
  FiDatabase,
  FiGithub,
  FiLayers,
  FiMail,
  FiMapPin,
  FiMenu,
  FiPackage,
  FiServer,
  FiSmartphone,
  FiX,
  FiZap
} from "react-icons/fi";
import SEO from "../components/SEO/SEO";
import { projects } from "../data/projects";
import { certificates } from "../data/certificates";
import styles from "./Home.module.css";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "Expertise", href: "#expertise" },
  { label: "AI", href: "#ai-systems" },
  { label: "Articles", href: "#articles" }
];

const projectTabs = [
  { id: "all", label: "All work" },
  { id: "products", label: "Products" },
  { id: "mobile-apps", label: "Mobile apps" },
  { id: "websites", label: "Websites" }
];

const experience = [
  {
    company: "Desk Work Solution",
    role: "Full Stack Developer",
    period: "Sep 2023 — Present",
    description:
      "Building and maintaining production web and mobile products, backend services, business workflows and third-party integrations."
  },
  {
    company: "Cubic · Remote",
    role: "MERN Stack Developer",
    period: "Aug 2023 — Dec 2023",
    description:
      "Worked across React and Node.js features with a focus on reliable APIs, application performance and maintainable delivery."
  },
  {
    company: "Native Brain",
    role: "Frontend Developer",
    period: "Jan 2023 — Feb 2023",
    description:
      "Translated product designs into responsive React interfaces and reusable frontend components."
  }
];

const expertise = [
  {
    icon: FiCode,
    title: "Frontend Engineering",
    description: "Fast, accessible interfaces with strong component architecture.",
    skills: ["React", "TypeScript", "Redux", "Framer Motion"]
  },
  {
    icon: FiServer,
    title: "Backend & APIs",
    description: "Secure application services, integrations and scalable REST APIs.",
    skills: ["Node.js", "Express", "REST", "Auth"]
  },
  {
    icon: FiSmartphone,
    title: "Mobile Development",
    description: "Production-focused cross-platform experiences and native integrations.",
    skills: ["React Native", "Android", "Native Modules"]
  },
  {
    icon: FiDatabase,
    title: "Data & Architecture",
    description: "Practical data models and systems designed for real workflows.",
    skills: ["MongoDB", "PostgreSQL", "System Design"]
  },
  {
    icon: FiCpu,
    title: "AI Integration",
    description: "AI-assisted features, OCR workflows and intelligent automation.",
    skills: ["Python", "OpenAI APIs", "Automation"]
  },
  {
    icon: FiLayers,
    title: "Delivery & DevOps",
    description: "Deployment-aware engineering with performance and reliability in mind.",
    skills: ["AWS", "Docker", "CI/CD", "Linux"]
  }
];

const developerUtilities = [
  {
    name: "Node.js Backend Template",
    package: "nodejs-templete",
    type: "Public starter",
    description:
      "Reusable Express backend foundation with MongoDB, authentication, uploads and environment configuration.",
    tech: ["Express", "Mongoose", "JWT", "Multer"],
    href: "https://github.com/ghulamyaseen778/nodejs-templete"
  },
  {
    name: "Node Server Starter",
    package: "Server-with-nodejs",
    type: "Public starter",
    description:
      "A compact Node.js + Express + MongoDB server starter for fast API experiments and small services.",
    tech: ["Node.js", "Express", "Mongoose", "CORS"],
    href: "https://github.com/ghulamyaseen778/Server-with-nodejs"
  },
  {
    name: "React + Express CRUD Starter",
    package: "nodejs-post-app",
    type: "Full-stack utility",
    description:
      "A reusable CRUD learning foundation combining React, Redux, Material UI and a Node/Express workflow.",
    tech: ["React", "Redux", "MUI", "Express"],
    href: "https://github.com/ghulamyaseen778/curd-operation-with-expressjs-and-reactjs"
  }
];

const aiSystems = [
  {
    icon: FiDatabase,
    title: "Document OCR & Data Extraction",
    type: "Vision / OCR pipeline",
    description:
      "Image quality checks, OCR extraction, field normalization and verification-focused backend workflows.",
    stack: ["Python", "OCR", "Image Processing", "REST"]
  },
  {
    icon: FiSmartphone,
    title: "Face Verification & Liveness",
    type: "Mobile AI integration",
    description:
      "React Native camera flows, native SDK bridging, captured-file handling and verification-oriented UX.",
    stack: ["React Native", "Android", "Native SDKs", "Liveness"]
  },
  {
    icon: FiCpu,
    title: "LLM Application Integration",
    type: "Generative AI systems",
    description:
      "Practical AI features built around application context, structured prompts, APIs and automation rather than isolated demos.",
    stack: ["OpenAI APIs", "Node.js", "Python", "Automation"]
  }
];

const articles = [
  {
    category: "DevOps",
    readTime: "18 min read",
    title: "VPS Server Setup From Zero",
    description:
      "Deploy a MERN application on Ubuntu with a deployment user, NVM, PM2, Nginx, MongoDB, DNS and SSL.",
    href: "/blog/vps-server-setup-from-zero"
  },
  {
    category: "Database",
    readTime: "14 min read",
    title: "MongoDB on Ubuntu VPS: Secure Setup",
    description:
      "Install MongoDB, create users, enable RBAC, configure permissions and keep the database private.",
    href: "/blog/mongodb-vps-ubuntu-setup"
  },
  {
    category: "Frontend",
    readTime: "6 min read",
    title: "Building Enterprise React Applications",
    description:
      "A practical structure for React applications that need to stay understandable as features and teams grow.",
    href: "/blog/react-enterprise"
  }
];

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.55, ease: "easeOut" }
};

export default function Home() {
  const [activeProjectTab, setActiveProjectTab] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredProjects = useMemo(() => {
    if (activeProjectTab === "all") return projects;
    return projects.filter((project) => project.category === activeProjectTab);
  }, [activeProjectTab]);

  return (
    <>
      <SEO />

      <div className={styles.pageShell}>
        <div className={styles.ambientOne} aria-hidden="true" />
        <div className={styles.ambientTwo} aria-hidden="true" />
        <div className={styles.gridTexture} aria-hidden="true" />

        <header className={styles.header}>
          <a className={styles.brand} href="#home" aria-label="Go to top">
            <span className={styles.brandMark}>GY</span>
            <span className={styles.brandText}>Ghulam Yaseen</span>
          </a>

          <nav className={styles.desktopNav} aria-label="Primary navigation">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>{link.label}</a>
            ))}
          </nav>

          <div className={styles.headerActions}>
            <a className={styles.headerContact} href="#contact">
              Let&apos;s talk <FiArrowUpRight />
            </a>
            <button
              className={styles.menuButton}
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>

          <AnimatePresence>
            {menuOpen && (
              <motion.nav
                className={styles.mobileNav}
                aria-label="Mobile navigation"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                {navLinks.map((link) => (
                  <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                    {link.label}
                  </a>
                ))}
                <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
              </motion.nav>
            )}
          </AnimatePresence>
        </header>

        <main>
          <section className={styles.hero} id="home">
            <div className={styles.heroCopy}>
              <motion.div
                className={styles.availability}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                <span /> Available for selected opportunities
              </motion.div>

              <motion.p
                className={styles.eyebrow}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.45 }}
              >
                Full Stack · Mobile · AI Integration
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14, duration: 0.65 }}
              >
                I build digital products that feel
                <span> clear, fast and production-ready.</span>
              </motion.h1>

              <motion.p
                className={styles.heroLead}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.55 }}
              >
                I&apos;m Muhammad Ghulam Yaseen, a full stack and mobile developer focused
                on scalable applications, thoughtful interfaces, dependable APIs and
                practical AI-powered workflows.
              </motion.p>

              <motion.div
                className={styles.heroButtons}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.55 }}
              >
                <a className={styles.primaryButton} href="#work">
                  Explore my work <FiArrowDownRight />
                </a>
                <a
                  className={styles.secondaryButton}
                  href="https://github.com/ghulamyaseen778"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FiGithub /> GitHub
                </a>
              </motion.div>

              <motion.div
                className={styles.heroMeta}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.42, duration: 0.6 }}
              >
                <div><strong>3+ years</strong><span>Professional development</span></div>
                <div><strong>Web + Mobile</strong><span>End-to-end product delivery</span></div>
                <div><strong>Pakistan</strong><span>Remote collaboration ready</span></div>
              </motion.div>
            </div>

            <motion.div
              className={styles.heroVisual}
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.7 }}
            >
              <div className={styles.visualGlow} aria-hidden="true" />
              <div className={styles.workspaceCard}>
                <div className={styles.workspaceTopbar}>
                  <div className={styles.windowDots} aria-hidden="true"><span /><span /><span /></div>
                  <span>developer.ts</span>
                  <span className={styles.workspaceStatus}>online</span>
                </div>
                <div className={styles.codeBlock} aria-label="Developer profile code snippet">
                  <p><span className={styles.codePurple}>const</span> developer = &#123;</p>
                  <p>&nbsp;&nbsp;name: <span className={styles.codeGreen}>&quot;Ghulam Yaseen&quot;</span>,</p>
                  <p>&nbsp;&nbsp;focus: [</p>
                  <p>&nbsp;&nbsp;&nbsp;&nbsp;<span className={styles.codeGreen}>&quot;full-stack&quot;</span>, <span className={styles.codeGreen}>&quot;mobile&quot;</span>,</p>
                  <p>&nbsp;&nbsp;&nbsp;&nbsp;<span className={styles.codeGreen}>&quot;AI integration&quot;</span></p>
                  <p>&nbsp;&nbsp;],</p>
                  <p>&nbsp;&nbsp;mindset: <span className={styles.codeGreen}>&quot;ship with quality&quot;</span></p>
                  <p>&#125;;</p>
                </div>
                <div className={styles.systemRow}>
                  <span><FiZap /> Product-minded</span>
                  <span><FiCheck /> Production-focused</span>
                </div>
              </div>
              <div className={styles.floatingChip + " " + styles.chipOne}>React Native</div>
              <div className={styles.floatingChip + " " + styles.chipTwo}>Node.js</div>
              <div className={styles.floatingChip + " " + styles.chipThree}>MongoDB</div>
            </motion.div>
          </section>

          <section className={styles.section} id="about">
            <motion.div className={styles.sectionIntro} {...reveal}>
              <span className={styles.sectionIndex}>01 / About</span>
              <h2>Engineering with product context, not just code.</h2>
            </motion.div>

            <div className={styles.aboutGrid}>
              <motion.div className={styles.aboutStory} {...reveal}>
                <p className={styles.largeCopy}>
                  I work across frontend, backend and mobile development, which helps me
                  make technical decisions with the full product lifecycle in view.
                </p>
                <p>
                  My approach is practical: understand the workflow, simplify the hard
                  parts, build a maintainable foundation and polish the details users
                  actually feel. I enjoy products where reliability, integrations and UX
                  all matter at the same time.
                </p>
                <p>
                  I&apos;m especially comfortable with React, React Native, Node.js, MongoDB,
                  API integrations, authentication flows and production troubleshooting.
                </p>
              </motion.div>

              <motion.div className={styles.aboutPanel} {...reveal}>
                <span className={styles.panelLabel}>How I work</span>
                {[
                  "Start with the real user and business flow",
                  "Keep architecture understandable and scalable",
                  "Treat edge cases and error states as product features",
                  "Optimize motion, accessibility and performance together"
                ].map((item) => (
                  <div className={styles.principle} key={item}>
                    <span><FiCheck /></span>
                    <p>{item}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </section>

          <section className={styles.section} id="certifications">
            <motion.div className={styles.sectionIntro} {...reveal}>
              <span className={styles.sectionIndex}>02 / Certifications</span>
              <h2>Continuous learning, backed by structured credentials.</h2>
              <p>A concise view of the certifications currently listed in my portfolio.</p>
            </motion.div>

            <div className={styles.certificateGrid}>
              {certificates.map((certificate, index) => (
                <motion.article
                  className={styles.certificateCard}
                  key={certificate.id}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.45 }}
                >
                  <div className={styles.certificateIcon}><FiAward /></div>
                  <div className={styles.certificateNumber}>0{index + 1}</div>
                  <h3>{certificate.title}</h3>
                  <p>{certificate.organization}</p>
                  <span className={styles.certificateDate}>{certificate.date}</span>
                  <div className={styles.tagRow}>
                    {certificate.skills.map((skill) => <span key={skill}>{skill}</span>)}
                  </div>
                </motion.article>
              ))}
            </div>
          </section>

          <section className={styles.section} id="work">
            <motion.div className={styles.sectionIntro} {...reveal}>
              <span className={styles.sectionIndex}>03 / Projects & Products</span>
              <h2>Selected work across products, mobile and web.</h2>
              <p>Filter the portfolio, then open any card for a full case-study page.</p>
            </motion.div>

            <div className={styles.tabList} role="tablist" aria-label="Project filters">
              {projectTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeProjectTab === tab.id}
                  className={activeProjectTab === tab.id ? styles.activeTab : ""}
                  onClick={() => setActiveProjectTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <motion.div layout className={styles.projectGrid}>
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, index) => (
                  <motion.a
                    href={"/projects/" + project.slug}
                    layout
                    className={styles.projectCard}
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.97, y: 18 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, y: 12 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                  >
                    <div className={styles.projectTopline}>
                      <span className={styles.projectType}>{project.category.replace("-", " ")}</span>
                      <span className={styles.projectStatus}><i /> {project.status}</span>
                    </div>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className={styles.tagRow}>
                      {project.tech.slice(0, 5).map((tech) => <span key={tech}>{tech}</span>)}
                    </div>
                    <div className={styles.projectFooter}>
                      <span>Open case study</span>
                      <FiArrowUpRight />
                    </div>
                  </motion.a>
                ))}
              </AnimatePresence>
            </motion.div>
          </section>

          <section className={styles.section} id="experience">
            <motion.div className={styles.sectionIntro} {...reveal}>
              <span className={styles.sectionIndex}>04 / Experience</span>
              <h2>Experience shaped by shipping real software.</h2>
            </motion.div>

            <div className={styles.timeline}>
              {experience.map((item, index) => (
                <motion.article
                  className={styles.timelineItem}
                  key={item.company + item.role}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: index * 0.08, duration: 0.45 }}
                >
                  <div className={styles.timelineMarker}><span>{String(index + 1).padStart(2, "0")}</span></div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeading}>
                      <div><h3>{item.role}</h3><p>{item.company}</p></div>
                      <span>{item.period}</span>
                    </div>
                    <p className={styles.timelineDescription}>{item.description}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>

          <section className={styles.section} id="expertise">
            <motion.div className={styles.sectionIntro} {...reveal}>
              <span className={styles.sectionIndex}>05 / Expertise</span>
              <h2>A full-stack toolkit built around delivery.</h2>
              <p>Broad enough to own features end-to-end, focused enough to care about the details.</p>
            </motion.div>

            <div className={styles.expertiseGrid}>
              {expertise.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.article
                    className={styles.expertiseCard}
                    key={item.title}
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06, duration: 0.45 }}
                  >
                    <div className={styles.expertiseIcon}><Icon /></div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <div className={styles.tagRow}>
                      {item.skills.map((skill) => <span key={skill}>{skill}</span>)}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>

          <section className={styles.section} id="packages">
            <motion.div className={styles.sectionIntro} {...reveal}>
              <span className={styles.sectionIndex}>06 / NPM Packages & Utilities</span>
              <h2>Reusable code, starters and modules.</h2>
              <p>
                A dedicated home for package-ready developer tooling. I only show public repository
                links here; npm registry links can be added when a utility is published there.
              </p>
            </motion.div>

            <div className={styles.utilityGrid}>
              {developerUtilities.map((item, index) => (
                <motion.a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.utilityCard}
                  key={item.name}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07, duration: 0.45 }}
                >
                  <div className={styles.utilityTop}>
                    <span className={styles.utilityIcon}><FiPackage /></span>
                    <span>{item.type}</span>
                  </div>
                  <p className={styles.packageName}>npm / github · {item.package}</p>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div className={styles.tagRow}>
                    {item.tech.map((tech) => <span key={tech}>{tech}</span>)}
                  </div>
                  <div className={styles.utilityFooter}>
                    <span>View repository</span><FiArrowUpRight />
                  </div>
                </motion.a>
              ))}
            </div>
          </section>

          <section className={styles.section} id="ai-systems">
            <motion.div className={styles.sectionIntro} {...reveal}>
              <span className={styles.sectionIndex}>07 / AI Models & Systems</span>
              <h2>AI that is connected to real application workflows.</h2>
              <p>
                My focus is the system around the model: input quality, validation, APIs, mobile UX,
                fallbacks and production behavior.
              </p>
            </motion.div>

            <div className={styles.aiGrid}>
              {aiSystems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.article
                    className={styles.aiCard}
                    key={item.title}
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.07, duration: 0.45 }}
                  >
                    <div className={styles.aiVisual}>
                      <Icon />
                      <div className={styles.aiOrbit}><span /><span /><span /></div>
                    </div>
                    <span className={styles.aiType}>{item.type}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <div className={styles.tagRow}>
                      {item.stack.map((tech) => <span key={tech}>{tech}</span>)}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>

          <section className={styles.section} id="articles">
            <motion.div className={styles.sectionIntroRow} {...reveal}>
              <div className={styles.sectionIntro}>
                <span className={styles.sectionIndex}>08 / Articles</span>
                <h2>Notes from building, debugging and shipping.</h2>
                <p>Long-form deployment and engineering guides with commands you can actually use.</p>
              </div>
              <a className={styles.viewAllLink} href="/blog">All articles <FiArrowUpRight /></a>
            </motion.div>

            <div className={styles.articleGrid}>
              {articles.map((article, index) => (
                <motion.a
                  className={styles.articleCard}
                  href={article.href}
                  key={article.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07, duration: 0.45 }}
                >
                  <div className={styles.articleMeta}><span>{article.category}</span><span>{article.readTime}</span></div>
                  <h3>{article.title}</h3>
                  <p>{article.description}</p>
                  <div className={styles.articleArrow}><FiArrowUpRight /></div>
                </motion.a>
              ))}
            </div>
          </section>

          <section className={styles.contactSection} id="contact">
            <motion.div className={styles.contactCard} {...reveal}>
              <div className={styles.contactCopy}>
                <span className={styles.sectionIndex}>09 / Contact</span>
                <h2>Have a product, role or technical problem worth discussing?</h2>
                <p>No contact form. Reach me directly by email or GitHub and I&apos;ll respond through the channel you choose.</p>
              </div>

              <div className={styles.contactLinks}>
                <a href="mailto:muhammadyaseen3294@gmail.com" className={styles.contactLink}>
                  <span className={styles.contactIcon}><FiMail /></span>
                  <span><small>Email</small><strong>muhammadyaseen3294@gmail.com</strong></span>
                  <FiArrowUpRight />
                </a>
                <a
                  href="https://github.com/ghulamyaseen778"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.contactLink}
                >
                  <span className={styles.contactIcon}><FiGithub /></span>
                  <span><small>GitHub</small><strong>@ghulamyaseen778</strong></span>
                  <FiArrowUpRight />
                </a>
                <div className={styles.contactLink}>
                  <span className={styles.contactIcon}><FiMapPin /></span>
                  <span><small>Location</small><strong>Pakistan · Remote-friendly</strong></span>
                  <FiBriefcase />
                </div>
              </div>
            </motion.div>
          </section>
        </main>

        <footer className={styles.footer}>
          <p>© 2026 Muhammad Ghulam Yaseen. Built with React and attention to detail.</p>
          <a href="#home">Back to top <FiArrowUpRight /></a>
        </footer>
      </div>
    </>
  );
}
