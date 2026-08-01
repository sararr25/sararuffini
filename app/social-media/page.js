import { SiteFooter, SiteNav } from "../../components/SiteChrome";
import SocialMediaReels from "../../components/SocialMediaReels";
import SocialMediaMotion from "../../components/SocialMediaMotion";
import pageContent from "../../public/content/pages/social-media.json";

const DEFAULT_HEADLINE = "Social content that earns the next second.";
const DEFAULT_DESCRIPTION =
  "I create short-form video for people and brands with something worth stopping for. From the first hook to the final cut, every Reel is built for attention, personality and the way people actually watch.";
const DEFAULT_REELS = [
  {
    client: "Selected client work",
    role: "Concept · shoot · edit",
    platform: "Instagram Reels",
    reel_url: "",
  },
  {
    client: "Selected client work",
    role: "Concept · shoot · edit",
    platform: "Instagram Reels",
    reel_url: "",
  },
  {
    client: "Selected client work",
    role: "Creative edit",
    platform: "Instagram Reels",
    reel_url: "",
  },
  {
    client: "Selected client work",
    role: "Creative edit",
    platform: "Instagram Reels",
    reel_url: "",
  },
];
const DEFAULT_APPROACH_ITEMS = [
  "Concepts and hooks designed for the first three seconds",
  "Shooting, directing and editing — from set to final export",
  "Native formats for Reels, TikTok and Stories",
  "A repeatable content rhythm, not one-off posts",
];
const HERO_IMAGE_URL = "/assets/media/social-media-hero.png";

export const metadata = {
  title: pageContent?.seo?.seo_title || "Social Media | Sara Ruffini",
  description:
    pageContent?.seo?.seo_description ||
    "Short-form video production and editing by Sara Ruffini.",
};

export default function SocialMediaPage() {
  const reels = Array.isArray(pageContent.reels)
    ? pageContent.reels
    : DEFAULT_REELS;
  const approachItems = Array.isArray(pageContent.approach_items)
    ? pageContent.approach_items
    : DEFAULT_APPROACH_ITEMS;
  return (
    <div className="editorial-page social-media-page">
      <SiteNav pageKey="projects" />
      <main>
        <header className="social-hero">
          <div className="social-copy">
            <p className="social-eyebrow">Content creator · social-first video</p>
            <h1>{pageContent.headline || DEFAULT_HEADLINE}</h1>
            <p className="social-intro">
              {pageContent.description || DEFAULT_DESCRIPTION}
            </p>
          </div>
          <div className="phone-stage">
            <div className="phone-dash" aria-hidden="true" />
            <div className="phone-tape" aria-hidden="true" />
            <div className="phone">
              <div className="phone-notch" aria-hidden="true" />
              <div className="phone-screen">
                <img
                  alt="Colorful abstract frame from a short-form video"
                  src={HERO_IMAGE_URL}
                />
              </div>
            </div>
          </div>
        </header>

        <section className="recent-drops social-work" aria-labelledby="social-work-heading">
          <SocialMediaReels
            reels={reels}
            placeholderLabel={
              pageContent.reel_placeholder_label || "Reel coming soon"
            }
          />
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
          <ul className="social-approach-list">
            {approachItems.map((item, index) => (
              <li key={`${item}-${index}`}>
                <span className="social-approach-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p>{item}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
      <SocialMediaMotion />
    </div>
  );
}
