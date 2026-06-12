import { SiteFooter, SiteNav } from "../../components/SiteChrome";
import pageContent from "../../public/content/pages/social-media-strategy.json";

export const metadata = {
  title: pageContent?.seo?.seo_title || "Social Media Strategy | Sara Ruffini",
  description: pageContent?.seo?.seo_description || "Strategic social media management.",
};

const fallbackReels = [
  {
    title: "Streetwear Drop",
    badge: "Viral",
    instagram_url: "",
    cover_image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC3QNHfbuLeH5h7r5XoPkTaf4Jwoy8wwnpO8lZK7RrRkp-2_E4kZLahCWIsfyRI-XKAePSnLvdKC0L8xbUei5n8d1czUxGMz7Uh6DXjWbFaF2AquyA9mbfs7yD-0OPz8X2dLpoDoXICcxyW3ZqjvJX_ZEP9aBcVSzIgzYNe0bwcZu9MR5gkCwaoyv7bggfLllIUUGsNIjwI7iz68-N4D64JIs4bsr8IkpuIAP6tfMDEjmnO9Sp8DZeIeVBuXi4uqgev8zzdveW1CBSh",
  },
  {
    title: "Vlog Series 02",
    badge: "700K+ views",
    instagram_url: "",
    cover_image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAvEy-Mxn3gVE-hHGv1VSXeUGKvtd7KH4AczPqh8G_cza9NIf5MeleJ-qsn9qOD-5LUJwsLsaecobEkUVLLNcUVWSywLU2IbgBDnaheLNeq4J1Lj3eEV7XBF29jq90-zJQd-YTJyD8qI6lq_bvWs9esnL-HJyrY6ShlBRSB9vqiNh9wW2z0JMl3OhmWlvoSN2pBgqMU0xGrbhFURe4Oc9TaWkSZ1GfrLKWlURDjWM010k4nCLBxO5emBQt3_DjrTeCE6jGenvsME5ge",
  },
  {
    title: "Retro Tech",
    badge: "New",
    instagram_url: "",
    cover_image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCui_wFRBVAUCqDCxSnmig5himIXmBCItt_G86MpY7ligpCH-u3zwWrDorEF-qEMfbM7yQ7BuCO0OB_dqqizyzXT0BhaO9evDP3b2zQ-yywIMqjgdRoiIoekG2c20spiIwGTt6rpgWx78ByIQ4fqQohTTVMU4a04ozAVUndd4v6cFsiI4xj5LTR5il-4YU4kJNJe8tnZaU9tj37W80cc_1TOiHTex7kLeShhTb8rcMv1odCxH1vwKOrZJsC2q_CfDBIjY7eZSEnCNjS",
  },
  {
    title: "Urban Style",
    badge: "",
    instagram_url: "",
    cover_image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCKqruyC8UL3I7iTWmsFneFt3syWR9YELcMRSb1u7Xlojgd2MxTDCUsCdDSS_kWgbCkcXxdsg6ghQ9-znKjd_zu-fQaxDVmzqjPuNwPPNR2rdU2vd2MOeo9dmndyVhS24Vk6FoXgWNjnz3NkGOfScbChE7tyi89JwbPM6J310Q5JsmBTRqHsoAHtBIomQ7YNJrbI2d50ND-2MfzYdWNb1hkFaLAJnJHhm17j5MEhux91Sd-FWLvB3ra6Tlp3uiq2Wb_THz-kHvUAslP",
  },
];

function instagramEmbedUrl(value) {
  if (!value) return "";

  try {
    const url = new URL(value);
    if (!/(^|\.)instagram\.com$/i.test(url.hostname)) return "";

    const match = url.pathname.match(/^\/(reel|p|tv)\/([^/]+)/i);
    return match ? `https://www.instagram.com/${match[1]}/${match[2]}/embed/` : "";
  } catch {
    return "";
  }
}

export default function SocialMediaStrategyPage() {
  const hero = pageContent.hero || {};
  const pillars = pageContent.pillars || [];
  const cadence = pageContent.cadence || [];
  const dashboard = pageContent.dashboard || {};
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
          <h1>{hero.title_line_1?.split(" ").map((word, index) => (
            <span className={word.toLowerCase() === "dominance" ? "strategy-underline" : ""} key={word}>{word}{index === 1 ? <br /> : " "}</span>
          ))}{hero.title_line_2}</h1>
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
          <div className="section-rule"><h2>Strategic Management</h2></div>
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
              <div className="reaction"><h3>Reaction Protocol</h3><p>Manual engagement within the first 60 minutes of every post. No bots, just human interaction.</p><strong className="label">⚡ Response time: &lt; 15 mins</strong></div>
              <div className="strategy-notes"><h3>Strategy_notes</h3><p>☒ Identify 10 micro-influencers per week</p><p>☒ Bi-weekly analytics auditing</p><p>☒ Active DM nurturing for leads</p></div>
            </div>
          </div>
        </section>

        <section>
          <div className="section-rule"><h2>Reel Showcase</h2></div>
          <div className="reel-grid">
            {reels.map((reel, index) => {
              const embedUrl = instagramEmbedUrl(reel.instagram_url);
              const coverImage = reel.cover_image || fallbackReels[index % fallbackReels.length].cover_image;

              return (
                <article className="reel-card" key={`${reel.title}-${index}`}>
                  {reel.badge ? <span className="sticker">{reel.badge}</span> : null}
                  <div className="reel-media">
                    {embedUrl ? (
                      <iframe
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                        src={embedUrl}
                        title={`Instagram Reel: ${reel.title || `Reel ${index + 1}`}`}
                      />
                    ) : (
                      <img alt={reel.title || `Reel ${index + 1}`} src={coverImage} />
                    )}
                  </div>
                  <div className="reel-meta"><span>{reel.title || `Reel ${index + 1}`}</span><span>▷</span></div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
