import styles from "./Navbar.module.css";
import { useEffect, useState } from "react";
import { FiDownload, FiMenu, FiX } from "react-icons/fi";

const links = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Experience", href: "#experience" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Certificates", href: "#certificates" },
  { name: "Blog", href: "#blog" },
  // { name: "Contact", href: "#contact" }
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);

  // Scroll effect (glass navbar)
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll spy
  useEffect(() => {
    const sections = document.querySelectorAll("section");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
   
    <header
      className={`${styles.navbar} ${
        scrolled ? styles.scrolled : ""
      }`}
    >
      {/* LOGO */}
      {/* <div className={styles.logo}>
        Yaseen<span>.</span>
      </div> */}

      {/* DESKTOP NAV */}
      <nav className={styles.nav}>
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={
              active === link.href.replace("#", "")
                ? styles.active
                : ""
            }
          >
            {link.name}
          </a>
        ))}
      </nav>

      {/* RIGHT ACTIONS */}
      <div className={styles.actions}>
        <a
          className={styles.resume}
          href="/resume.pdf"
          download
        >
          <FiDownload />
          Resume
        </a>

        <a
          className={styles.cta}
          href="#contact"
        >
          Contact
        </a>

        {/* MOBILE MENU BUTTON */}
        <button
          className={styles.menuBtn}
          onClick={() => setOpen(!open)}
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className={styles.mobileMenu}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
            >
              {link.name}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}