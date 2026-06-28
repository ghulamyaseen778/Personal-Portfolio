import SEO from "../components/SEO/SEO";
import Hero from "../components/Hero/Hero";
import About from "../components/About/About";
import Experience from "../components/Experience/Experience";
import Skills from "../components/Skills/Skills";
import Projects from "../components/Projects/Projects";
import Contact from "../components/Contact/Contact";
import Navbar from "../components/Navbar/Navbar";
import Certificates from "../components/Certificates/Certificates";
import Blog from "../components/Blog/Blog";

export default function Home() {
  return (
    <>
    {/* <Navbar/> */}
      <SEO />
      <Hero />
      <About />
      <Experience />
      <Skills />
      <Projects />
      <Certificates />
      <Blog />
      <Contact />
    </>
  );
}