import { createBrowserRouter } from "react-router-dom";

import Home from "../pages/Home";
import BlogPage from "../pages/Blog";
import BlogDetail from "../pages/BlogDetails";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },

  {
    path: "/blog",
    element: <BlogPage />
  },

  {
    path: "/blog/:slug",
    element: <BlogDetail />
  }
]);