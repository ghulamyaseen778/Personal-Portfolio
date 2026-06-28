import { useEffect, useState } from "react";
import styles from "./Cursor.module.css";

export default function Cursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    const addHover = () => setHover(true);
    const removeHover = () => setHover(false);

    window.addEventListener("mousemove", move);

    const hoverTargets = document.querySelectorAll("a, button");

    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", addHover);
      el.addEventListener("mouseleave", removeHover);
    });

    return () => {
      window.removeEventListener("mousemove", move);
    };
  }, []);

  return (
    <div
      className={`${styles.cursor} ${hover ? styles.hover : ""}`}
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`
      }}
    />
  );
}