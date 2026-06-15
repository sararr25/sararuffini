import Script from "next/script";
import { SiteFooter, SiteNav } from "../../components/SiteChrome";
import pageContent from "../../public/content/pages/social-media.json";

const DEFAULT_HEADLINE = "Short-form content, from set to screen.";
const DEFAULT_DESCRIPTION =
  "I shoot and edit short-form video for social — food content, brand storytelling, behind-the-scenes. My work covers the full process: concept, camera, cut. Mostly Instagram Reels, always built around the platform.";
const DEFAULT_REELS = [
  {
    client: "@potuschef",
    role: "Shot & edited",
    platform: "Instagram Reels",
    reel_url: "",
  },
  {
    client: "@potuschef",
    role: "Shot & edited",
    platform: "Instagram Reels",
    reel_url: "",
  },
  {
    client: "Søberg Institute",
    role: "Edited",
    platform: "Instagram Reels",
    reel_url: "",
  },
];
const DEFAULT_APPROACH_ITEMS = [
  "End-to-end production — I shoot and edit",
  "Short-form native formats: Reels, TikTok, Stories",
  "Fast turnaround, content calendar support",
  "Creative direction on set when needed",
];

export const metadata = {
  title: pageContent?.seo?.seo_title || "Social Media | Sara Ruffini",
  description:
    pageContent?.seo?.seo_description ||
    "Short-form video production and editing by Sara Ruffini.",
};

function ReelEmbed({ url, placeholderLabel }) {
  if (!url?.trim()) {
    return (
      <div className="social-reel-placeholder">
        <span>{placeholderLabel}</span>
      </div>
    );
  }

  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={url.trim()}
      data-instgrm-version="14"
    >
      <a href={url.trim()}>View this reel on Instagram</a>
    </blockquote>
  );
}

export default function SocialMediaPage() {
  const reels = Array.isArray(pageContent.reels)
    ? pageContent.reels
    : DEFAULT_REELS;
  const approachItems = Array.isArray(pageContent.approach_items)
    ? pageContent.approach_items
    : DEFAULT_APPROACH_ITEMS;
  const hasEmbeds = reels.some((reel) => reel.reel_url?.trim());

  return (
    <div className="editorial-page social-media-page">
      <SiteNav pageKey="projects" />
      <main className="social-media-main">
        <header className="social-media-hero">
          <h1>{pageContent.headline || DEFAULT_HEADLINE}</h1>
          <p>{pageContent.description || DEFAULT_DESCRIPTION}</p>
        </header>

        <section className="social-work" aria-labelledby="social-work-heading">
          <h2 id="social-work-heading">{pageContent.work_heading || "Work"}</h2>
          <div className="social-reels-grid">
            {reels.map((reel, index) => (
              <article
                className="social-reel-card"
                key={`${reel.client || "reel"}-${index}`}
              >
                <div className="social-reel-frame">
                  <ReelEmbed
                    url={reel.reel_url}
                    placeholderLabel={
                      pageContent.reel_placeholder_label || "Reel coming soon"
                    }
                  />
                </div>
                <div className="social-reel-details">
                  <h3>{reel.client}</h3>
                  <p>{reel.role}</p>
                  <span>{reel.platform}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="social-approach"
          aria-labelledby="social-approach-heading"
        >
          <h2 id="social-approach-heading">
            {pageContent.approach_heading || "What I bring"}
          </h2>
          <ul>
            {approachItems.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
      {hasEmbeds ? (
        <Script
          async
          src="https://www.instagram.com/embed.js"
          strategy="afterInteractive"
        />
      ) : null}
    </div>
  );
}
