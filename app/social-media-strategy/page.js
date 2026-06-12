import { SiteFooter, SiteNav } from "../../components/SiteChrome";
import pageContent from "../../public/content/pages/social-media-strategy.json";

export const metadata = {
  title: pageContent?.seo?.seo_title || "Social Media Strategy | Sara Ruffini",
  description: pageContent?.seo?.seo_description || "Strategic social media management.",
};

const reelImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC3QNHfbuLeH5h7r5XoPkTaf4Jwoy8wwnpO8lZK7RrRkp-2_E4kZLahCWIsfyRI-XKAePSnLvdKC0L8xbUei5n8d1czUxGMz7Uh6DXjWbFaF2AquyA9mbfs7yD-0OPz8X2dLpoDoXICcxyW3ZqjvJX_ZEP9aBcVSzIgzYNe0bwcZu9MR5gkCwaoyv7bggfLllIUUGsNIjwI7iz68-N4D64JIs4bsr8IkpuIAP6tfMDEjmnO9Sp8DZeIeVBuXi4uqgev8zzdveW1CBSh",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAvEy-Mxn3gVE-hHGv1VSXeUGKvtd7KH4AczPqh8G_cza9NIf5MeleJ-qsn9qOD-5LUJwsLsaecobEkUVLLNcUVWSywLU2IbgBDnaheLNeq4J1Lj3eEV7XBF29jq90-zJQd-YTJyD8qI6lq_bvWs9esnL-HJyrY6ShlBRSB9vqiNh9wW2z0JMl3OhmWlvoSN2pBgqMU0xGrbhFURe4Oc9TaWkSZ1GfrLKWlURDjWM010k4nCLBxO5emBQt3_DjrTeCE6jGenvsME5ge",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCui_wFRBVAUCqDCxSnmig5himIXmBCItt_G86MpY7ligpCH-u3zwWrDorEF-qEMfbM7yQ7BuCO0OB_dqqizyzXT0BhaO9evDP3b2zQ-yywIMqjgdRoiIoekG2c20spiIwGTt6rpgWx78ByIQ4fqQohTTVMU4a04ozAVUndd4v6cFsiI4xj5LTR5il-4YU4kJNJe8tnZaU9tj37W80cc_1TOiHTex7kLeShhTb8rcMv1odCxH1vwKOrZJsC2q_CfDBIjY7eZSEnCNjS",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCKqruyC8UL3I7iTWmsFneFt3syWR9YELcMRSb1u7Xlojgd2MxTDCUsCdDSS_kWgbCkcXxdsg6ghQ9-znKjd_zu-fQaxDVmzqjPuNwPPNR2rdU2vd2MOeo9dmndyVhS24Vk6FoXgWNjnz3NkGOfScbChE7tyi89JwbPM6J310Q5JsmBTRqHsoAHtBIomQ7YNJrbI2d50ND-2MfzYdWNb1hkFaLAJnJHhm17j5MEhux91Sd-FWLvB3ra6Tlp3uiq2Wb_THz-kHvUAslP",
];
const reelNames = ["Streetwear Drop", "Vlog Series 02", "Retro Tech", "Urban Style"];
const reelBadges = ["Viral", "700K+ views", "New", ""];

export default function SocialMediaStrategyPage() {
  const hero = pageContent.hero || {};
  const pillars = pageContent.pillars || [];
  const cadence = pageContent.cadence || [];
  const bars = pageContent.dashboard_bars || [];

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
              <div><small>Aggregated growth</small><strong>{pageContent.dashboard?.snapshot_value || "+142.8% YOY"}</strong></div>
              <div className="metric-dots"><i /><i /><i /></div>
            </div>
            <div className="bars">{bars.map((height, index) => <div className="bar" key={index} style={{ height: `${height}%` }} />)}</div>
          </div>
          <div className="stats-stack">
            <div className="stat-card"><span>Total reach</span><strong>4.2M</strong></div>
            <div className="stat-card"><span>Engagement rate</span><strong>8.4%</strong></div>
            <div className="stat-card"><span>Viral velocity</span><strong>Fast</strong></div>
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
              <a className="download-strategy" href="#project-exe">Download full strategy PDF</a>
            </div>
          </div>
        </section>

        <section>
          <div className="section-rule"><h2>Reel Showcase</h2></div>
          <div className="reel-grid">
            {reelImages.map((image, index) => <article className="reel-card" key={image}>{reelBadges[index] ? <span className="sticker">{reelBadges[index]}</span> : null}<img alt="" src={image} /><div className="reel-meta"><span>{reelNames[index]}</span><span>▷</span></div></article>)}
          </div>
        </section>

        <section className="project-exe" id="project-exe">
          <div className="project-image">
            <span className="sticker">Case_study: 003</span>
            <img alt="Project EXE workstation" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-5bLs656zBRdyqwu0MHGvR0wbPWBPStsXC10ZF-QxZ_SCk_dRJFnXnZRT5snIDkHtBdXopV_emnUedbnnyVY2xFX9VQwbAbBIx3G0zbKz_tRZjFdrtfueflNBU2b2Luc_2PAQe4bivaF64SaU_1ZOlDV_kn2TCvPMc72gghKOFzErqfUy24Me9DFWPyuzn4bB3W1VDTip1RHsCCvUiMpwDxcjHn4XHgeFf82-jUXPdsl7wZWBuPxmwU9Yk36xh0wYozbbl9RGIsRx" />
          </div>
          <div className="project-copy">
            <h2>Project.EXE</h2>
            <p className="quote">“Redefining the digital interface for a new generation of technical creators.”</p>
            <div className="project-tags"><span>Branding</span><span>Social Strategy</span><span>Web3</span></div>
            <p>Project EXE was a complete overhaul of a legacy tech brand&apos;s social presence. We shifted from corporate beige to a technical-brutalist aesthetic, resulting in a 400% increase in comment-section sentiment quality.</p>
            <a className="project-link" href="/pages/projects">View live case study</a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
