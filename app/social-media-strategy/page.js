import { SiteFooter, SiteNav } from "../../components/SiteChrome";
import pageContent from "../../public/content/pages/social-media-strategy.json";
import "../../styles/app-tailwind.css";
import "../editorial-pages.css";

export const metadata = {
  title: pageContent?.seo?.seo_title || "Social Media Strategy | Sara Ruffini",
  description: pageContent?.seo?.seo_description || "Strategic social media management.",
};

const fallbackReels = [
  {
    title: "Restaurant reel",
    badge: "Viral",
    instagram_url: "https://www.instagram.com/reel/DWy7X9UCIyu/",
    cover_image: "",
  },
  {
    title: "In cucina con uno sconosciuto",
    badge: "Format originale",
    instagram_url: "https://www.instagram.com/reel/DTTCNXmCIlm/",
    cover_image: "",
  },
  {
    title: "Technique series",
    badge: "Kitchen Roots",
    instagram_url: "https://www.instagram.com/reel/DXHjIxmiNSM/",
    cover_image: "",
  },
  {
    title: "Copenhagen dinner",
    badge: "Pop-up event",
    instagram_url: "https://www.instagram.com/reel/DZK0fyWoPBe/",
    cover_image: "",
  },
];

function instagramEmbedUrl(value) {
  if (!value) return "";

  try {
    const url = new URL(value);
    if (!/(^|\.)instagram\.com$/i.test(url.hostname)) return "";

    const match = url.pathname.match(/^\/(reel|p|tv)\/([^/]+)/i);
    return match ? `https://www.instagram.com/${match[1]}/${match[2]}/embed/captioned/` : "";
  } catch {
    return "";
  }
}

export default function SocialMediaStrategyPage() {
  const hero = pageContent.hero || {};
  const pillars = pageContent.pillars || [];
  const cadence = pageContent.cadence || [];
  const dashboard = pageContent.dashboard || {};
  const reactionProtocol = pageContent.reaction_protocol || {};
  const strategyNotes = Array.isArray(pageContent.strategy_notes) ? pageContent.strategy_notes : [];
  const caseStudy = pageContent.case_study || {};
  const barValues = pageContent.dashboard_bars || {};
  const bars = Array.from({ length: 10 }, (_, index) => {
    const rawValue = Array.isArray(barValues) ? barValues[index] : barValues[`bar_${index + 1}`];
    return Math.min(100, Math.max(0, Number(rawValue) || 0));
  });
  const reels = Array.isArray(pageContent.reels) && pageContent.reels.length ? pageContent.reels : fallbackReels;

  return (
    <div className="editorial-page">
      <SiteNav pageKey="projects" />
      <main className="strategy-main">
        <header className="strategy-hero">
          <div className="sticker strategy-sticker">{hero.badge_text || "Strategy mode: active"}</div>
          <h1>
            {hero.title_line_1 || "From 70K to 113K"}
            <br />
            <span className="strategy-underline">{hero.title_line_2 || "— and from Italy to Denmark."}</span>
          </h1>
          <p>{hero.intro_text}</p>
        </header>

        <section className="growth-grid">
          <div className="growth-chart">
            <div className="metric-header">
              <div><small>{dashboard.snapshot_label || "Aggregated growth"}</small><strong>{dashboard.snapshot_value || "+142.8% YOY"}</strong></div>
              <div className="metric-dots"><i /><i /><i /></div>
            </div>
            <div className="bars">{bars.map((height, index) => <div className="bar" key={index} style={{ height: `${height}%` }} />)}</div>
          </div>
          <div className="stats-stack">
            <div className="stat-card"><span>{dashboard.reach_label || "Total reach"}</span><strong>{dashboard.reach_value || "4.2M"}</strong></div>
            <div className="stat-card"><span>{dashboard.engagement_label || "Engagement rate"}</span><strong>{dashboard.engagement_value || "8.4%"}</strong></div>
            <div className="stat-card"><span>{dashboard.velocity_label || "Viral velocity"}</span><strong>{dashboard.velocity_value || "Fast"}</strong></div>
          </div>
        </section>

        <section>
          <div className="section-rule"><h2>{pageContent.strategy_section_title || "Social Media Strategy — @potuschef"}</h2></div>
          <div className="management-grid">
            <div className="window-card">
              <div className="window-bar"><span>PILLARS.CFG</span><span>− □ ×</span></div>
              <div className="pillar-list">
                {pillars.map((pillar) => <div className="pillar" key={pillar.id}><span className="pillar-id">{pillar.id}</span><div><h3>{pillar.title}</h3><p>{pillar.copy}</p></div></div>)}
              </div>
            </div>
            <div className="cadence-card">
              <span className="sticker">Cadence_monitor</span>
              <h3>Cadence</h3>
              {cadence.map((item) => <div className="cadence-row" key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}
              <div className="cadence-art" />
            </div>
            <div className="notes-stack">
              <div className="reaction">
                <h3>{reactionProtocol.title || "Reaction Protocol"}</h3>
                <p>{reactionProtocol.copy}</p>
                <strong className="label">{reactionProtocol.note || "⚡ Response time: < 15 mins"}</strong>
              </div>
              <div className="strategy-notes">
                <h3>Strategy_notes</h3>
                {strategyNotes.map((note) => <p key={note}>☒ {note}</p>)}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="section-rule"><h2>Reel Showcase</h2></div>
          <div className="reel-grid">
            {reels.map((reel, index) => {
              const embedUrl = instagramEmbedUrl(reel.instagram_url);
              const coverImage = reel.cover_image || "";

              return (
                <article className="reel-card" key={`${reel.title}-${index}`}>
                  {reel.badge ? <span className="sticker">{reel.badge}</span> : null}
                  <div className="reel-media">
                    {embedUrl ? (
                      <iframe
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        src={embedUrl}
                        title={`Instagram Reel: ${reel.title || `Reel ${index + 1}`}`}
                      />
                    ) : coverImage ? (
                      <img alt={reel.title || `Reel ${index + 1}`} src={coverImage} />
                      ) : (
                        <div className="reel-media-placeholder"><span>Instagram Reel</span><b>▷</b></div>
                      )}
                  </div>
                  <a className="reel-card-link" href={reel.instagram_url || "#"} rel="noreferrer" target={reel.instagram_url ? "_blank" : undefined}>
                    <div className="reel-meta"><span>{reel.title || `Reel ${index + 1}`}</span><span>▷</span></div>
                  </a>
                </article>
              );
            })}
          </div>
        </section>

        <section className="project-exe">
          <div className="project-image">
            <span className="sticker">{caseStudy.label || "Case_study: @potuschef"}</span>
            {caseStudy.image ? (
              <img alt={caseStudy.image_alt || "@potuschef social media case study"} src={caseStudy.image} />
            ) : (
              <div className="project-image-placeholder">@potuschef</div>
            )}
          </div>
          <div className="project-copy">
            <h2>{caseStudy.title || "Project.EXE"}</h2>
            <p className="quote">{caseStudy.quote}</p>
            <div className="project-tags">
              {(caseStudy.tags || []).map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            <p>{caseStudy.copy}</p>
            <a className="project-link" href={caseStudy.cta_url || "https://www.instagram.com/potuschef/"} rel="noreferrer" target="_blank">
              {caseStudy.cta_label || "View @potuschef on Instagram"}
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
