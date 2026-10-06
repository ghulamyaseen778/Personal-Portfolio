export const SITE_URL = (
  import.meta.env.VITE_SITE_URL ||
  "https://ghulamyaseen.site"
).replace(/\/+$/, "");

export const SITE_NAME = "Muhammad Ghulam Yaseen";
export const SITE_TITLE = "Muhammad Ghulam Yaseen | Full Stack & Mobile App Developer";
export const AUTHOR_NAME = "Muhammad Ghulam Yaseen";

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}
