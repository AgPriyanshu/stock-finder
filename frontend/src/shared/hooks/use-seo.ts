import { useEffect } from "react";

const DEFAULT_TITLE = "Stock Finder";
const DEFAULT_DESCRIPTION =
  "Find dead stock and discounted inventory at local shops near you. Search by product, filter by category and price, and connect with shop owners instantly.";
const DEFAULT_IMAGE = "/web-app-manifest-512x512.png";

interface SeoOptions {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}

const setMeta = (name: string, content: string, property = false) => {
  const attr = property ? "property" : "name";
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
};

export const useSeo = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  noIndex = false,
}: SeoOptions = {}) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | Stock Finder` : DEFAULT_TITLE;
    const prevTitle = document.title;
    document.title = fullTitle;

    setMeta("description", description);
    setMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");

    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:image", image, true);
    setMeta("og:type", "website", true);

    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);

    return () => {
      document.title = prevTitle;
    };
  }, [title, description, image, noIndex]);
};
