import { SiteFooter, SiteNav } from "../../components/SiteChrome";
import pageContent from "../../public/content/pages/algo-approved.json";

export const metadata = {
  title: pageContent?.seo?.seo_title || "Algo Approved | Sara Ruffini",
  description:
    pageContent?.seo?.seo_description ||
    "Social-first creative portfolio that lives on the FYP.",
};

const DEFAULT_REELS = [
  {
    badge: "VIRAL",
    badge_color: "cyan",
    image: "",
    image_alt: "A trendy fashion shoot formatted for a vertical mobile screen",
    title: "Urban Style Co. Drop",
    meta: "2.4M Views | +15% CTR",
    rotation: "rotate-1",
  },
  {
    badge: "NEW",
    badge_color: "pink",
    image: "",
    image_alt: "Retro tech setup with neon lighting styled for a tech review",
    title: "Retro Tech Review",
    meta: "800K Views | Saved x500",
    has_play: true,
    rotation: "rotate-2",
  },
  {
    badge: "",
    badge_color: "",
    image: "",
    image_alt: "Abstract colorful paint or fluid simulation",
    title: "Oddly Satisfying ASMR",
    meta: "4.1M Views | 100% Retention",
    has_tape: true,
    rotation: "rotate-3",
  },
  {
    badge: "",
    badge_color: "",
    image: "",
    image_alt: "A cute pet dog looking at the camera",
    title: "BarkBox Campaign",
    meta: "1.1M Views | Top Performer",
    rotation: "rotate-4",
  },
];

const HERO_PHONE_IMAGE = "/assets/media/algo-approved-hero.png";

const REEL_PLACEHOLDER_IMAGES = [
  "/assets/media/algo-reel-1.jpg",
  "/assets/media/algo-reel-2.jpg",
  "/assets/media/algo-reel-3.jpg",
  "/assets/media/algo-reel-4.jpg",
];

function BadgeColorClass(color) {
  switch (color) {
    case "cyan":
      return "bg-[var(--color-accent-cyan,#3BDEC8)]";
    case "pink":
      return "bg-[var(--color-accent-pink,#FF69B4)]";
    case "yellow":
      return "bg-[var(--color-accent-yellow,#FFEB3B)]";
    case "orange":
      return "bg-[var(--color-accent-orange,#FF6B6B)]";
    default:
      return "bg-[var(--color-accent-cyan,#3BDEC8)]";
  }
}

export default function AlgoApprovedPage() {
  const hero = pageContent.hero || {};
  const drops = pageContent.drops || {};
  const reels = Array.isArray(drops.reels) && drops.reels.length ? drops.reels : DEFAULT_REELS;

  return (
    <div className="editorial-page" data-cms-page="algo-approved">
      <SiteNav pageKey="projects" />
      <main>
        {/* Hero Section */}
        <header className="algo-hero">
          <div className="algo-grid-bg" aria-hidden="true" />
          <div className="algo-glow-pink" aria-hidden="true" />
          <div className="algo-glow-yellow" aria-hidden="true" />

          <div className="algo-hero__content">
            {/* Copy side */}
            <div className="algo-hero__copy">
              {hero.sticker_text ? (
                <div className="algo-hero__sticker algo-sticker-hover" style={{ background: "var(--color-accent-yellow, #FFEB3B)" }}>
                  {hero.sticker_icon ? (
                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                      {hero.sticker_icon}
                    </span>
                  ) : null}
                  {hero.sticker_text}
                </div>
              ) : null}

              <h1 className="algo-hero__title">
                <span className="algo-tape-title" aria-hidden="true" />
                {hero.title_line_1 || "THE"}
                <br />
                <span className="algo-glitch-text" style={{ display: "inline-block" }}>
                  <span className="algo-scribble">{hero.scribble_word || hero.title_line_2 || "ALGO"}</span>
                  <br />
                  {hero.title_line_3 || "APPROVED"}
                </span>
                <br />
                {hero.title_line_4 || "PORTFOLIO"}
              </h1>

              {hero.intro_text ? (
                <p className="algo-hero__intro">{hero.intro_text}</p>
              ) : null}

              <div className="algo-hero__actions">
                {hero.cta_primary_label ? (
                  <button className="algo-btn algo-btn--primary">
                    {hero.cta_primary_label}
                    {hero.cta_primary_icon ? (
                      <span className="material-symbols-outlined">{hero.cta_primary_icon}</span>
                    ) : null}
                  </button>
                ) : null}
                {hero.cta_secondary_label ? (
                  <button className="algo-btn algo-btn--secondary">
                    {hero.cta_secondary_label}
                  </button>
                ) : null}
              </div>
            </div>

            {/* Phone mockup side */}
            <div className="algo-hero__mockup">
              <div className="algo-floating-sticker algo-sticker-hover" style={{ background: "var(--color-accent-pink, #FF69B4)" }}>
                <span>{hero.floating_sticker_value || "1.2M"}</span>
                <span>{hero.floating_sticker_label || "Views"}</span>
              </div>

              <div className="algo-phone">
                <div className="algo-phone__frame" />
                <div className="algo-phone__screen">
                  <img
                    alt={hero.phone_image_alt || "Hero Reel Placeholder"}
                    className="algo-scroll-hint-img"
                    src={hero.phone_image || HERO_PHONE_IMAGE}
                  />
                  <div className="algo-phone__ui">
                    <div className="algo-phone__ui-item">
                      <span className="material-symbols-outlined algo-phone__ui-icon">favorite</span>
                      <span className="algo-phone__ui-count">{hero.phone_ui_likes || "124K"}</span>
                    </div>
                    <div className="algo-phone__ui-item">
                      <span className="material-symbols-outlined algo-phone__ui-icon">chat_bubble</span>
                      <span className="algo-phone__ui-count">{hero.phone_ui_comments || "1.2K"}</span>
                    </div>
                    <div className="algo-phone__ui-item">
                      <span className="material-symbols-outlined algo-phone__ui-icon">share</span>
                      <span className="algo-phone__ui-count">{hero.phone_ui_shares || "800"}</span>
                    </div>
                  </div>
                  <div className="algo-phone__caption">
                    <p className="algo-phone__caption-author">
                      {hero.phone_caption_author || "@sararuffini_creative"}
                    </p>
                    <p className="algo-phone__caption-text">
                      {hero.phone_caption_text || "How we shot the latest viral campaign for Brand X"}
                    </p>
                  </div>
                </div>
                <div className="algo-phone__notch" aria-hidden="true" />
              </div>

              <div className="algo-dashed-circle" aria-hidden="true" />
              <div className="algo-tape-hero" aria-hidden="true" />
            </div>
          </div>
        </header>

        {/* Recent Drops Section */}
        <section className="algo-drops" aria-labelledby="algo-drops-heading">
          <div className="algo-drops__header">
            <div>
              <h2 className="algo-drops__title" id="algo-drops-heading">
                {drops.title || "Recent"}{" "}
                <span className="algo-scribble algo-scribble-yellow">
                  {drops.scribble_word || "Drops"}
                </span>
              </h2>
              <p className="algo-drops__subtitle">
                {drops.subtitle || "High-performing social creative designed for maximum retention."}
              </p>
            </div>
            <div className="algo-drops__arrows">
              <button className="algo-drops__arrow" aria-label="Previous">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <button className="algo-drops__arrow algo-drops__arrow--active" aria-label="Next">
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>

          <div className="algo-drops__viewport algo-no-scrollbar">
            <div className="algo-drops__track">
              {reels.map((reel, index) => {
                const rotationClass =
                  reel.rotation === "rotate-1"
                    ? "algo-reel-card--rotate-1"
                    : reel.rotation === "rotate-2"
                    ? "algo-reel-card--rotate-2"
                    : reel.rotation === "rotate-3"
                    ? "algo-reel-card--rotate-3"
                    : reel.rotation === "rotate-4"
                    ? "algo-reel-card--rotate-4"
                    : "";

                const captionRotationClass =
                  reel.rotation === "rotate-1"
                    ? "algo-reel-caption--rotate-1"
                    : reel.rotation === "rotate-2"
                    ? "algo-reel-caption--rotate-2"
                    : reel.rotation === "rotate-3"
                    ? "algo-reel-caption--rotate-3"
                    : reel.rotation === "rotate-4"
                    ? "algo-reel-caption--rotate-4"
                    : "";

                const badgePosition =
                  index % 2 === 0
                    ? "algo-reel-badge--right"
                    : "algo-reel-badge--left";

                const reelImage = reel.image || REEL_PLACEHOLDER_IMAGES[index] || "";

                return (
                  <article
                    className={`algo-reel-card ${rotationClass} algo-tilt-card`}
                    key={`${reel.title || index}-${index}`}
                  >
                    {reel.badge ? (
                      <div
                        className={`algo-reel-badge ${badgePosition} algo-sticker-hover ${BadgeColorClass(reel.badge_color)}`}
                      >
                        {reel.badge}
                      </div>
                    ) : null}
                    <div className="algo-reel-frame">
                      {reelImage ? (
                        <img alt={reel.image_alt || reel.title || `Reel ${index + 1}`} src={reelImage} />
                      ) : null}
                      <div className="algo-reel-gradient" />
                      {reel.has_play ? (
                        <div className="algo-reel-play">
                          <span className="material-symbols-outlined algo-reel-play-icon">play_arrow</span>
                        </div>
                      ) : null}
                      {reel.has_tape ? (
                        <div className="algo-reel-tape" aria-hidden="true" />
                      ) : null}
                      <div className={`algo-reel-caption ${captionRotationClass}`}>
                        <p className="algo-reel-caption-title">{reel.title || `Reel ${index + 1}`}</p>
                        <p className="algo-reel-caption-meta">{reel.meta || ""}</p>
                      </div>
                    </div>
                  </article>
                );
              })}

              {/* View All Card */}
              <div className="algo-view-all">
                <button className="algo-view-all-btn">
                  <div className="algo-view-all-icon">
                    <span className="material-symbols-outlined">add</span>
                  </div>
                  <span className="algo-view-all-label">
                    {drops.view_all_label || "View All Work"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
