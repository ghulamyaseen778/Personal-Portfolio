import { useState, useEffect } from "react";
import AppRouter from "./routes/AppRouter";
import Loader from "./components/Loader/Loader";
import MainLayout from "./layouts/MainLayout";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1800);
  }, []);

  if (loading) return <Loader />;

  return (
    <MainLayout>
      <AppRouter />
    </MainLayout>
  );
}