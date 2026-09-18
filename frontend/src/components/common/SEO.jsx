import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const DEFAULT_TITLE = "Sohani Dairy Farm — Healthy Cattle, Honest Service";
const DEFAULT_DESCRIPTION =
  "India's trusted dairy cattle marketplace. Buy & sell certified HF cows, Murrah buffaloes, Sahiwal, Gir, and Tharparkar cows with high milk yield and health verification.";
const DEFAULT_KEYWORDS =
  "dairy farm, cattle for sale, dairy cows, Murrah buffalo, HF cow, Sahiwal cow, Gir cow, Tharparkar cow, milk yield, Jaunpur, Uttar Pradesh, dairy cattle India, dairy livestock suppliers";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&h=630&q=80";
const SITE_NAME = "Sohani Dairy Farm";

/**
 * Sets or creates a meta tag in document head
 */
function setMetaTag(attrName, attrValue, content) {
  if (!content) return;
  let element = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

/**
 * Sets or creates a link tag (e.g., canonical) in document head
 */
function setLinkTag(rel, href) {
  if (!href) return;
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

/**
 * Injects or updates JSON-LD Schema structured data
 */
function setStructuredData(schemaData) {
  const schemaId = "sohani-seo-schema";
  let script = document.getElementById(schemaId);
  if (!schemaData) {
    if (script) script.remove();
    return;
  }
  if (!script) {
    script = document.createElement("script");
    script.id = schemaId;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.text = JSON.stringify(schemaData);
}

/**
 * MetaSEO Component - Manages Page Meta, OpenGraph, Twitter Cards, Canonical URLs & Schema
 */
export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_IMAGE,
  type = "website",
  schema = null,
  exactTitle = false,
}) {
  const location = useLocation();

  useEffect(() => {
    // 1. Title formatting
    const formattedTitle = title
      ? exactTitle
        ? title
        : title.includes(SITE_NAME)
        ? title
        : `${title} | ${SITE_NAME}`
      : DEFAULT_TITLE;

    document.title = formattedTitle;

    // 2. Canonical & Current URL
    const origin = typeof window !== "undefined" ? window.location.origin : "https://sohanidairy.com";
    const currentUrl = `${origin}${location.pathname}${location.search}`;
    setLinkTag("canonical", currentUrl);

    // 3. Standard Meta Tags
    setMetaTag("name", "description", description);
    setMetaTag("name", "keywords", keywords);
    setMetaTag("name", "author", "Sohani Dairy Farm & Livestock Network");
    setMetaTag("name", "robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

    // 4. OpenGraph Tags (Facebook, WhatsApp, LinkedIn)
    setMetaTag("property", "og:type", type);
    setMetaTag("property", "og:title", formattedTitle);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:url", currentUrl);
    setMetaTag("property", "og:site_name", SITE_NAME);
    setMetaTag("property", "og:image", image);
    setMetaTag("property", "og:image:secure_url", image);
    setMetaTag("property", "og:image:alt", formattedTitle);
    setMetaTag("property", "og:locale", "en_IN");

    // 5. Twitter Card Tags
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", formattedTitle);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:image", image);
    setMetaTag("name", "twitter:image:alt", formattedTitle);
    setMetaTag("name", "twitter:site", "@SohaniDairy");
    setMetaTag("name", "twitter:creator", "@SohaniDairy");

    // 6. JSON-LD Schema
    const baseSchema = schema || {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: SITE_NAME,
      image: image,
      description: description,
      url: currentUrl,
      telephone: "+91-8853317611",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Jaunpur",
        addressRegion: "Uttar Pradesh",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: "25.7464",
        longitude: "82.6837",
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "06:00",
        closes: "20:00",
      },
      sameAs: [
        "https://www.facebook.com",
        "https://www.instagram.com",
        "https://www.youtube.com",
      ],
    };

    setStructuredData(baseSchema);

    // Cleanup when component unmounts
    return () => {
      // Keep canonical and default title fallback
    };
  }, [title, description, keywords, image, type, schema, location.pathname, location.search]);

  return null;
}
