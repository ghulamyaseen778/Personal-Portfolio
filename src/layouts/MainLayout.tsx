import Cursor from "../components/Cursor/Cursor";
import ScrollProgress from "../components/ScrollProgress/ScrollProgress";
import Aurora from "../components/Background/Aurora";
import useLenis from "../hooks/useLenis";

export default function MainLayout({
  children
}: {
  children: React.ReactNode;
}) {
  useLenis();

  return (
    <>
      <Aurora />
      <Cursor />
      <ScrollProgress />
      {children}
    </>
  );
}