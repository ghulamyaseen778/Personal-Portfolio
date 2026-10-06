import { Navigate, createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import BlogPage from "../pages/Blog";
import BlogDetail from "../pages/BlogDetails";
import ProjectDetails from "../pages/ProjectDetails";
import NotFound from "../pages/NotFound";

const mongodbBackupCanonical = "/blog/mongodb-automated-backup-recovery";

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/projects/:slug", element: <ProjectDetails /> },
  { path: "/blog", element: <BlogPage /> },

  // Search-friendly aliases and old links redirect to one canonical article URL.
  { path: "/blog/mongodb-backup", element: <Navigate to={mongodbBackupCanonical} replace /> },
  { path: "/blog/mongodb-backup-recovery", element: <Navigate to={mongodbBackupCanonical} replace /> },
  { path: "/blog/mongodb-backup-and-restore", element: <Navigate to={mongodbBackupCanonical} replace /> },
  { path: "/blog/mongodb-restore-deleted-data", element: <Navigate to={mongodbBackupCanonical} replace /> },
  { path: "/blog/mongodump-mongorestore", element: <Navigate to={mongodbBackupCanonical} replace /> },

  { path: "/blog/:slug", element: <BlogDetail /> },
  { path: "*", element: <NotFound /> }
]);
