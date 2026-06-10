import { SiteFooter, SiteNav } from "../../components/SiteChrome";
import pageContent from "../../public/content/pages/social-media.json";

export const metadata = {
  title: pageContent?.seo?.seo_title || "Social Media | Sara Ruffini",
  description: pageContent?.seo?.seo_description || "Social-first creative portfolio with high-retention editing, hooks, and format testing.",
};

const reelAccents = ["bg-[#FF69B4]", "bg-[#3BDEC8]", "bg-[#FFEB3B]", "bg-[#FF6B6B]", "bg-[#7FFF00]"];
const metricTones = ["bg-[#FF69B4]", "bg-[#3BDEC8]", "bg-[#FFEB3B]"];

function SectionTitle({ eyebrow, title, accent = "#3BDEC8" }) {
  return (
    <div className="mb-6 space-y-3">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-black/60">{eyebrow}</p>
      <h2 className="text-3xl font-black uppercase leading-[0.92] tracking-tight text-black md:text-4xl">
        <span className="relative inline-block">
          {title}
          <span className="absolute left-0 -bottom-1 h-3 w-full rounded-full opacity-80" style={{ backgroundColor: accent }} />
        </span>
      </h2>
    </div>
  );
}

function ShadowCard({ className = "", children }) {
  return <div className={`border-2 border-black bg-white shadow-[6px_6px_0_0_#111111] ${className}`}>{children}</div>;
}

export default function SocialMediaPage() {
  const hero = pageContent?.hero || {};
  const reels = Array.isArray(pageContent?.reels) ? pageContent.reels : [];
  const metrics = Array.isArray(pageContent?.metrics) ? pageContent.metrics : [];
  const formatCards = Array.isArray(pageContent?.format_cards) ? pageContent.format_cards : [];
  const postRhythm = Array.isArray(pageContent?.post_rhythm) ? pageContent.post_rhythm : [];
  const hookLab = pageContent?.hook_lab || {};
  const audienceNote = pageContent?.audience_note || {};

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FDF9F0] text-[#111111] selection:bg-[#3BDEC8] selection:text-black">
      <div className="pointer-events-none fixed right-0 top-0 -z-10 h-[32rem] w-[32rem] translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(circle,rgba(255,105,180,0.18)_0%,rgba(59,222,200,0.08)_42%,rgba(253,249,240,0)_72%)] blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-0 -z-10 h-[34rem] w-[34rem] -translate-x-1/3 translate-y-1/3 rounded-full bg-[radial-gradient(circle,rgba(255,235,59,0.18)_0%,rgba(255,107,107,0.08)_40%,rgba(253,249,240,0)_74%)] blur-3xl" />

      <SiteNav pageKey="projects" />

      <main className="mx-auto w-full max-w-7xl px-6 py-10 md:px-12 md:py-16">
        <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <div className="inline-flex -rotate-3 items-center gap-2 border-2 border-black bg-[#FFEB3B] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] shadow-[4px_4px_0_0_#111111]">
              <span className="text-sm">{hero.badge_emoji || "🔥"}</span>
              {hero.badge_text || "For you page vibes"}
            </div>

            <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.92] tracking-[-0.05em] md:text-7xl">
              {hero.title_line_1 || "The"} <span className="relative inline-block">{hero.title_highlight || "Algo"}<span className="absolute left-0 bottom-2 h-3 w-full -rotate-2 rounded-full bg-[#3BDEC8]/80" /></span>
              <br />
              {hero.title_line_2 || "Approved Portfolio"}
            </h1>

            <p className="max-w-xl border-l-4 border-black bg-white/60 px-4 py-3 text-lg leading-relaxed shadow-[3px_3px_0_0_#111111] md:text-xl">
              {hero.intro_text || "Stop scrolling. Start converting. I create social-first creative that lives on the FYP and actually gets engagement."}
            </p>

            <div className="flex flex-wrap gap-4">
              <a href={hero.primary_cta_url || "https://www.instagram.com/potuschef/"} rel="noreferrer" target="_blank" className="inline-flex items-center gap-2 border-2 border-black bg-[#3BDEC8] px-6 py-4 text-sm font-black uppercase tracking-[0.22em] shadow-[6px_6px_0_0_#111111] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5">
                {hero.primary_cta_label || "View Showreel"}
                <span aria-hidden="true">↗</span>
              </a>
              <a href={hero.secondary_cta_url || "#metrics"} className="inline-flex items-center gap-2 border-2 border-black bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.22em] shadow-[6px_6px_0_0_#111111] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5">
                {hero.secondary_cta_label || "Stats & Analytics"}
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[420px]">
            <div className="absolute -right-2 top-8 z-20 rounded-full border-2 border-black bg-[#FF69B4] px-4 py-3 text-center text-sm font-black uppercase shadow-[4px_4px_0_0_#111111]">
              <div className="text-xl leading-none">{hero.hero_stat_value || "1.2M"}</div>
              <div className="tracking-[0.18em]">{hero.hero_stat_label || "Views"}</div>
            </div>

            <div className="rotate-2 rounded-[2.5rem] border-4 border-black bg-black p-3 shadow-[10px_10px_0_0_#111111] transition-transform duration-300 hover:rotate-0">
              <div className="overflow-hidden rounded-[2rem] bg-[#0b0b0b] p-4 text-white">
                <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/60">
                  <span>{hero.hero_feed_label || "Creative feed"}</span>
                  <span>{hero.hero_feed_count || "05 reels"}</span>
                </div>

                <div className="space-y-3">
                  {reels.map((reel, index) => (
                    <div key={reel.title} className="flex items-center gap-4 rounded-[1.5rem] border-2 border-white/15 bg-white/5 p-3">
                      <div className={`flex h-20 w-16 shrink-0 items-end justify-center rounded-[1.1rem] border-2 border-black ${reelAccents[index % reelAccents.length]} text-[10px] font-black uppercase tracking-[0.18em] text-black shadow-[4px_4px_0_0_#111111]`}>
                        {reel.label || `Reel ${String(index + 1).padStart(2, "0")}`}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black uppercase tracking-[0.18em]">{reel.title}</p>
                        <p className="mt-1 text-sm text-white/70">{reel.note}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {metrics.map((metric, index) => (
                    <div key={metric.label} className={`rounded-2xl border-2 border-black ${metricTones[index % metricTones.length]} px-3 py-4 text-center text-black shadow-[3px_3px_0_0_#111111]`}>
                      <div className="text-xl font-black uppercase leading-none">{metric.value}</div>
                      <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em]">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="metrics" className="mt-20 grid gap-6 md:grid-cols-3">
          {metrics.map((metric, index) => (
            <ShadowCard key={metric.label} className={`${metricTones[index % metricTones.length]} p-6`}>
              <div className="text-xs font-black uppercase tracking-[0.22em] text-black/70">{metric.label}</div>
              <div className="mt-3 text-4xl font-black uppercase">{metric.value}</div>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-black/75">{metric.description || "Social creative tuned for hooks, pacing, and repeatable engagement patterns."}</p>
            </ShadowCard>
          ))}
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <ShadowCard className="relative overflow-hidden p-6 md:p-8">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#FF69B4]/20 blur-2xl" />
            <SectionTitle eyebrow={pageContent?.format_section?.eyebrow || "Format system"} title={pageContent?.format_section?.title || "Content engine"} accent="#FF69B4" />
            <div className="space-y-4">
              {formatCards.map((card) => (
                <div key={card.title} className="rounded-2xl border-2 border-black bg-[#FDF9F0] p-4 shadow-[3px_3px_0_0_#111111]">
                  <h3 className="text-lg font-black uppercase tracking-[0.14em]">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-black/75">{card.copy}</p>
                </div>
              ))}
            </div>
          </ShadowCard>

          <div className="grid gap-6 sm:grid-cols-2">
            <ShadowCard className="bg-[#3BDEC8] p-6">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-black/70">{hookLab.eyebrow || "Hook lab"}</div>
              <div className="mt-3 text-3xl font-black uppercase leading-[0.92]">{hookLab.title || "Split testing different hooks"}</div>
              <p className="mt-3 text-sm leading-relaxed text-black/80">{hookLab.copy || "Fast iteration, stronger opening seconds, and a feed that rewards momentum."}</p>
            </ShadowCard>

            <ShadowCard className="bg-white p-6">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-black/60">{pageContent?.post_rhythm_title || "Post rhythm"}</div>
              <div className="mt-4 space-y-3 text-sm font-bold uppercase tracking-[0.16em] text-black/80">
                {postRhythm.map((item, index) => (
                  <div key={`${item.label}-${index}`} className={`flex items-center justify-between ${index !== postRhythm.length - 1 ? "border-b border-black/10 pb-2" : ""}`}>
                    <span>{item.label}</span><span>{item.value}</span>
                  </div>
                ))}
              </div>
            </ShadowCard>

            <ShadowCard className="bg-[#FFEB3B] p-6 sm:col-span-2">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-black/70">{audienceNote.eyebrow || "Audience note"}</div>
              <div className="mt-3 text-3xl font-black uppercase leading-[0.92]">{audienceNote.title || "Organic production, high retention hooks, sharp edits"}</div>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/80">{audienceNote.copy || "The goal is simple: keep the work feeling human and tactile while making the structure strong enough to travel across the feed."}</p>
            </ShadowCard>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}