import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiCheck,
  FiCode,
  FiLayers,
  FiMail
} from "react-icons/fi";
import { getProjectBySlug, projects } from "../data/projects";
import styles from "./Detail.module.css";

export default function ProjectDetails() {
  const { slug } = useParams();
  const project = getProjectBySlug(slug);

  if (!project) {
    return (
      <main className={styles.notFound}>
        <p>Project not found.</p>
        <Link to="/">Return to portfolio</Link>
      </main>
    );
  }

  const related = projects.filter((item) => item.id !== project.id).slice(0, 2);

  return (
    <>
      <Helmet>
        <title>{project.title} | Muhammad Ghulam Yaseen</title>
        <meta name="description" content={project.description} />
      </Helmet>

      <main className={styles.page}>
        <header className={styles.detailHeader}>
          <Link to="/#work" className={styles.backLink}>
            <FiArrowLeft /> Portfolio
          </Link>
          <a href="mailto:muhammadyaseen3294@gmail.com" className={styles.smallCta}>
            Discuss a project <FiArrowUpRight />
          </a>
        </header>

        <section className={styles.projectHero}>
          <div>
            <span className={styles.kicker}>{project.category.replace("-", " ")} / case study</span>
            <h1>{project.title}</h1>
            <p>{project.overview}</p>
          </div>

          <div className={styles.metaPanel}>
            <div>
              <span>Role</span>
              <strong>{project.role}</strong>
            </div>
            <div>
              <span>Period</span>
              <strong>{project.year}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{project.status}</strong>
            </div>
          </div>
        </section>

        <section className={styles.storyGrid}>
          <article className={styles.storyCard}>
            <span className={styles.cardIcon}><FiLayers /></span>
            <p className={styles.cardLabel}>The challenge</p>
            <h2>Making the workflow reliable under real business pressure.</h2>
            <p>{project.challenge}</p>
          </article>

          <article className={styles.storyCard}>
            <span className={styles.cardIcon}><FiCode /></span>
            <p className={styles.cardLabel}>The solution</p>
            <h2>Architecture that keeps product behavior explicit.</h2>
            <p>{project.solution}</p>
          </article>
        </section>

        <section className={styles.detailSection}>
          <div className={styles.sectionHeading}>
            <span>Selected outcomes</span>
            <h2>What the work includes</h2>
          </div>
          <div className={styles.highlightGrid}>
            {project.highlights.map((highlight) => (
              <div key={highlight} className={styles.highlight}>
                <FiCheck />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.detailSplit}>
          <div>
            <div className={styles.sectionHeading}>
              <span>Responsibilities</span>
              <h2>What I owned</h2>
            </div>
            <ul className={styles.responsibilityList}>
              {project.responsibilities.map((item) => (
                <li key={item}><span />{item}</li>
              ))}
            </ul>
          </div>

          <div className={styles.techPanel}>
            <span className={styles.cardLabel}>Technology</span>
            <div className={styles.techList}>
              {project.tech.map((tech) => <span key={tech}>{tech}</span>)}
            </div>
            <p>
              Technology choices are treated as implementation tools. The product workflow,
              reliability and maintainability come first.
            </p>
          </div>
        </section>

        <section className={styles.relatedSection}>
          <div className={styles.sectionHeading}>
            <span>More work</span>
            <h2>Related projects</h2>
          </div>
          <div className={styles.relatedGrid}>
            {related.map((item) => (
              <Link to={"/projects/" + item.slug} className={styles.relatedCard} key={item.id}>
                <span>{item.category.replace("-", " ")}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <FiArrowUpRight />
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.detailCta}>
          <FiMail />
          <div>
            <span>Have a similar challenge?</span>
            <h2>Let&apos;s talk about the product and the hard parts behind it.</h2>
          </div>
          <a href="mailto:muhammadyaseen3294@gmail.com">
            Email me <FiArrowUpRight />
          </a>
        </section>
      </main>
    </>
  );
}
