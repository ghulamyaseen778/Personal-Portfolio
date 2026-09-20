import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import BlogPage from "../pages/Blog";
import BlogDetail from "../pages/BlogDetails";
import ProjectDetails from "../pages/ProjectDetails";

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/projects/:slug", element: <ProjectDetails /> },
  { path: "/blog", element: <BlogPage /> },
  { path: "/blog/:slug", element: <BlogDetail /> }
]);
