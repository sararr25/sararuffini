import { SiteFooter, SiteNav } from "../../components/SiteChrome";

export const metadata = {
  title: "Social Media Strategy | Sara Ruffini",
  description: "Strategic social media management with growth dashboards, format systems, and repeatable cadence.",
};

const pillars = [
  { id: "01", title: "Technical authority", copy: "Deep dives into process, performance, and educational formats that build trust.", tone: "bg-[#FF6B6B]" },
  { id: "02", title: "Aesthetic rawness", copy: "Behind-the-scenes content that keeps the brand textured, handmade, and real.", tone: "bg-[#3BDEC8]" },
  { id: "03", title: "Community reposts", copy: "Social proof and user-generated moments that keep the channel human and active.", tone: "bg-[#FFEB3B]" },
];

const cadence = [
  ["Instagram stories", "3-5x daily"],
  ["Feed posts", "4x weekly"],
  ["Long-form reels", "2x weekly"],
  ["Threads / notes", "Daily"],
];

const cards = [
  { title: "Strategy system", copy: "A clear content architecture that connects brand goals, hooks, and execution." },
  { title: "Testing layer", copy: "Hook variants, pacing changes, and format shifts are measured before scaling." },
  { title: "Delivery stack", copy: "Production, editing, and publishing stay aligned so the feed never loses rhythm." },
  { title: "Growth focus", copy: "Audience signals drive the next batch of content, not guesswork or generic templates." },
];

function ShadowCard({ className = "", children }) {
  return <div className={`border-2 border-black bg-white shadow-[6px_6px_0_0_#111111] ${className}`}>{children}</div>;
}

function SectionHeading({ eyebrow, title, accent = "#FF6B6B" }) {
  return (
    <div className="mb-6 space-y-3">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-black/60">{eyebrow}</p>
      <h2 className="max-w-3xl text-3xl font-black uppercase leading-[0.92] tracking-[-0.04em] md:text-4xl">
        <span className="relative inline-block">
          {title}
          <span className="absolute left-0 -bottom-1 h-3 w-full rotate-[-1.5deg] rounded-full opacity-80" style={{ backgroundColor: accent }} />
        </span>
      </h2>
    </div>
  );
}

export default function SocialMediaStrategyPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FDF9F0] text-[#111111] selection:bg-[#FF6B6B] selection:text-black">
      <div className="pointer-events-none fixed right-0 top-0 -z-10 h-[28rem] w-[28rem] translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(circle,rgba(255,107,107,0.16)_0%,rgba(59,222,200,0.08)_40%,rgba(253,249,240,0)_72%)] blur-3xl" />
      <div className="pointer-events-none fixed left-0 bottom-0 -z-10 h-[32rem] w-[32rem] -translate-x-1/3 translate-y-1/3 rounded-full bg-[radial-gradient(circle,rgba(255,235,59,0.15)_0%,rgba(255,105,180,0.08)_44%,rgba(253,249,240,0)_72%)] blur-3xl" />

      <SiteNav pageKey="projects" />

      <main className="mx-auto w-full max-w-7xl px-6 py-10 md:px-12 md:py-16">
        <section className="relative">
          <div className="absolute -right-2 -top-2 rotate-2 border-2 border-black bg-[#FFEB3B] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] shadow-[4px_4px_0_0_#111111]">
            Strategy mode: active
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
            <div className="space-y-8">
              <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.92] tracking-[-0.05em] md:text-7xl">
                Digital dominance
                <br />
                through architecture.
              </h1>
              <p className="max-w-2xl border-l-4 border-black bg-white/65 px-4 py-3 text-lg leading-relaxed shadow-[3px_3px_0_0_#111111] md:text-xl">
                Crafting social ecosystems that do more than grow. They resonate, repeat, and create a structure people can actually follow.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <ShadowCard className="bg-[#3BDEC8] p-5">
                <div className="text-xs font-black uppercase tracking-[0.22em] text-black/70">Aggregated growth</div>
                <div className="mt-3 text-4xl font-black uppercase">+142.8%</div>
                <div className="mt-2 text-sm text-black/75">Year over year, across content, retention, and distribution systems.</div>
              </ShadowCard>
              <ShadowCard className="bg-[#FF69B4] p-5">
                <div className="text-xs font-black uppercase tracking-[0.22em] text-black/70">Total reach</div>
                <div className="mt-3 text-4xl font-black uppercase">4.2M</div>
                <div className="mt-2 text-sm text-black/75">Measured across campaign runs and format rollouts.</div>
              </ShadowCard>
              <ShadowCard className="bg-[#FFEB3B] p-5">
                <div className="text-xs font-black uppercase tracking-[0.22em] text-black/70">Velocity</div>
                <div className="mt-3 text-4xl font-black uppercase">Fast</div>
                <div className="mt-2 text-sm text-black/75">A feedback loop built for iteration, not waiting around.</div>
              </ShadowCard>
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <ShadowCard className="p-6 md:p-8">
            <SectionHeading eyebrow="Growth dashboard" title="Real-time feed" accent="#3BDEC8" />
            <div className="rounded-[1.5rem] border-2 border-black bg-[#F8F5EE] p-5 shadow-[4px_4px_0_0_#111111]">
              <div className="mb-5 flex items-end justify-between border-b-2 border-black pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-black/60">Performance snapshot</p>
                  <p className="mt-1 text-2xl font-black uppercase">+142.8% YOY</p>
                </div>
                <div className="flex gap-2">
                  <span className="h-3 w-3 border border-black bg-[#FF6B6B]" />
                  <span className="h-3 w-3 border border-black bg-[#3BDEC8]" />
                  <span className="h-3 w-3 border border-black bg-[#FFEB3B]" />
                </div>
              </div>

              <div className="grid h-64 grid-cols-10 items-end gap-2 rounded-[1rem] border-2 border-black bg-white p-4">
                {[20, 35, 24, 52, 45, 76, 66, 92, 86, 100].map((height) => (
                  <div key={height} className="flex h-full items-end">
                    <div className="w-full border-x-2 border-t-2 border-black bg-[#FF6B6B]" style={{ height: `${height}%` }} />
                  </div>
                ))}
              </div>
            </div>
          </ShadowCard>

          <div className="space-y-6">
            {cards.map((card) => (
              <ShadowCard key={card.title} className="p-5 md:p-6">
                <h3 className="text-lg font-black uppercase tracking-[0.16em]">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-black/75">{card.copy}</p>
              </ShadowCard>
            ))}
          </div>
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <ShadowCard className="overflow-hidden p-6 md:p-8">
            <SectionHeading eyebrow="Content pillars" title="Strategic management" accent="#FF69B4" />
            <div className="space-y-5">
              {pillars.map((pillar) => (
                <div key={pillar.id} className="flex gap-4 rounded-[1.25rem] border-2 border-black bg-[#FDF9F0] p-4 shadow-[3px_3px_0_0_#111111]">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center border-2 border-black ${pillar.tone} text-sm font-black shadow-[3px_3px_0_0_#111111]`}>
                    {pillar.id}
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-[0.14em]">{pillar.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-black/75">{pillar.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </ShadowCard>

          <div className="grid gap-6 sm:grid-cols-2">
            <ShadowCard className="bg-white p-6">
              <div className="text-xs font-black uppercase tracking-[0.24em] text-black/60">Cadence</div>
              <div className="mt-4 space-y-4">
                {cadence.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between border-b border-black/10 pb-2 text-sm font-black uppercase tracking-[0.16em]">
                    <span>{label}</span>
                    <span className="text-[#FF6B6B]">{value}</span>
                  </div>
                ))}
              </div>
            </ShadowCard>

            <ShadowCard className="bg-[#FFEB3B] p-6">
              <div className="text-xs font-black uppercase tracking-[0.24em] text-black/70">Cadence monitor</div>
              <div className="mt-3 text-3xl font-black uppercase leading-[0.92]">Launch, test, adapt, repeat.</div>
              <p className="mt-3 text-sm leading-relaxed text-black/80">The schedule is intentionally simple. Consistency gives the strategy room to compound.</p>
            </ShadowCard>

            <ShadowCard className="bg-[#3BDEC8] p-6 sm:col-span-2">
              <div className="text-xs font-black uppercase tracking-[0.24em] text-black/70">Execution layer</div>
              <div className="mt-3 text-3xl font-black uppercase leading-[0.92]">High-retention hooks, clean edits, fast delivery</div>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/80">Strategy only works when it reaches the feed in a usable form. The process stays close to production so the creative and the analytics can keep talking to each other.</p>
            </ShadowCard>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}