import { useEffect } from "react";

type OpenGraph = {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
};

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
    document.head.appendChild(el);
    return;
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
}

function upsertLink(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
    document.head.appendChild(el);
    return;
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
}

function upsertJsonLd(id: string, json: unknown) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    document.head.appendChild(el);
  }
  el.text = JSON.stringify(json);
}

export function MetaManager(props: {
  title: string;
  description: string;
  canonicalPath?: string;
  og?: OpenGraph;
  jsonLd?: unknown;
}) {
  const { title, description, canonicalPath, og, jsonLd } = props;

  useEffect(() => {
    document.title = title;

    upsertMeta('meta[name="description"]', { name: "description", content: description });

    const canonicalUrl = canonicalPath ? `${window.location.origin}${canonicalPath}` : window.location.href;
    upsertLink('link[rel="canonical"]', { rel: "canonical", href: canonicalUrl });

    const ogTitle = og?.title ?? title;
    const ogDesc = og?.description ?? description;
    const ogUrl = og?.url ?? canonicalUrl;

    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: ogTitle });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: ogDesc });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: ogUrl });

    if (og?.image) {
      upsertMeta('meta[property="og:image"]', { property: "og:image", content: og.image });
    }

    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: ogTitle });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: ogDesc });
    if (og?.image) upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: og.image });

    if (jsonLd) upsertJsonLd("jsonld-gad-legal", jsonLd);
  }, [title, description, canonicalPath, og?.title, og?.description, og?.url, og?.image, jsonLd]);

  return null;
}
