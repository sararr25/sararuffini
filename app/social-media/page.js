import { SiteFooter, SiteNav } from "../../components/SiteChrome";
import SocialMediaReels from "../../components/SocialMediaReels";
import SocialMediaMotion from "../../components/SocialMediaMotion";
import pageContent from "../../public/content/pages/social-media.json";

const DEFAULT_HEADLINE = "Content creation with a point of view.";
const DEFAULT_DESCRIPTION =
  "I turn expertise, food and real personalities into social-first video. The work lives where strategy, production and sharp editing meet — designed to build a following, not just fill a feed.";
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
  const studies = Array.isArray(pageContent.case_studies) && pageContent.case_studies.length
    ? pageContent.case_studies
    : [{ slug: "reels", account: "Selected work", role: "Content creator", summary: "", reels: DEFAULT_REELS }];
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

        <section className="social-proof" aria-label="Content creation highlights">
          <div className="social-proof-intro">
            <p className="social-section-label">The work behind the feed</p>
            <h2>Strategy when it matters. Hands-on production every time.</h2>
            <p>I work from the early idea through shooting, editing and the publishing rhythm — so the content looks considered and still feels native to the platform.</p>
          </div>
          <dl className="social-proof-stats">
            <div><dt>70K → 113K</dt><dd>@potuschef followers in six months</dd></div>
            <div><dt>~40%</dt><dd>International audience, up from 10%</dd></div>
            <div><dt>2</dt><dd>Brand collaborations: Weber and Mutti</dd></div>
          </dl>
        </section>

        <section className="recent-drops social-work" aria-labelledby="social-work-heading">
          <SocialMediaReels
            studies={studies}
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
