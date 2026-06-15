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
    <div className="editorial-page">
      <SiteNav pageKey="projects" />
      <main>
        <header className="social-hero">
          <div className="social-copy">
            <h1>{pageContent.headline || DEFAULT_HEADLINE}</h1>
            <p className="social-intro">
              {pageContent.description || DEFAULT_DESCRIPTION}
            </p>
          </div>
        </header>

        <section className="recent-drops social-work" aria-labelledby="social-work-heading">
          <div className="drops-heading">
            <h2 id="social-work-heading">{pageContent.work_heading || "Work"}</h2>
          </div>
          <div className="drop-track social-reels-grid">
            {reels.map((reel, index) => (
              <article
                className="drop-wrap social-reel-card"
                key={`${reel.client || "reel"}-${index}`}
              >
                <div className="drop-card social-reel-frame">
                  <ReelEmbed
                    url={reel.reel_url}
                    placeholderLabel={
                      pageContent.reel_placeholder_label || "Reel coming soon"
                    }
                  />
                  <div className="drop-caption social-reel-details">
                    <strong>{reel.client}</strong>
                    <span>{reel.role}</span>
                    <small>{reel.platform}</small>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="social-approach-section"
          aria-labelledby="social-approach-heading"
        >
          <div className="social-approach-heading">
            <h2 id="social-approach-heading">
              {pageContent.approach_heading || "What I bring"}
            </h2>
          </div>
          <div className="social-approach-grid">
            {approachItems.map((item, index) => (
              <div className="social-approach-item" key={`${item}-${index}`}>
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
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
