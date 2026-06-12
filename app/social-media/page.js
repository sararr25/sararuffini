import { EditorialFooter, EditorialNav } from "../../components/EditorialChrome";
import pageContent from "../../public/content/pages/social-media.json";

export const metadata = {
  title: pageContent?.seo?.seo_title || "Social Media | Sara Ruffini",
  description: pageContent?.seo?.seo_description || "Social-first creative portfolio.",
};

const drops = [
  {
    title: "Urban Style Co. Drop",
    meta: "2.4M Views | +15% CTR",
    badge: "Viral",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCKqruyC8UL3I7iTWmsFneFt3syWR9YELcMRSb1u7Xlojgd2MxTDCUsCdDSS_kWgbCkcXxdsg6ghQ9-znKjd_zu-fQaxDVmzqjPuNwPPNR2rdU2vd2MOeo9dmndyVhS24Vk6FoXgWNjnz3NkGOfScbChE7tyi89JwbPM6J310Q5JsmBTRqHsoAHtBIomQ7YNJrbI2d50ND-2MfzYdWNb1hkFaLAJnJHhm17j5MEhux91Sd-FWLvB3ra6Tlp3uiq2Wb_THz-kHvUAslP",
  },
  {
    title: "Retro Tech Review",
    meta: "800K Views | Saved x500",
    badge: "New",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCui_wFRBVAUCqDCxSnmig5himIXmBCItt_G86MpY7ligpCH-u3zwWrDorEF-qEMfbM7yQ7BuCO0OB_dqqizyzXT0BhaO9evDP3b2zQ-yywIMqjgdRoiIoekG2c20spiIwGTt6rpgWx78ByIQ4fqQohTTVMU4a04ozAVUndd4v6cFsiI4xj5LTR5il-4YU4kJNJe8tnZaU9tj37W80cc_1TOiHTex7kLeShhTb8rcMv1odCxH1vwKOrZJsC2q_CfDBIjY7eZSEnCNjS",
  },
  {
    title: "Oddly Satisfying ASMR",
    meta: "4.1M Views | 100% Retention",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCj2DmqeXvXksMpmAcc7W1htDue5zbksTZavSG1kbmPVIeFpQkZYgPcPxI10DKl9rPd5YUFzg9XdFarbBxrBsESAl1t9bnvSESwsQZyvORWehVZ8mJcKlDVy5PMGyhqof2vvwaXvHGdNbFqQdk9uZZ4cVKjtO7Syi0F3FDnRLRwesoQ7IQ3X_y2-kNfbx9qkGwiXxEbUT9tr2_KVL4LxdAsracFek686IPDMOyLFKI2ayFiad4pqBN0w-tyhVz7YA8DqhlIEuGaWJJQ",
  },
  {
    title: "BarkBox Campaign",
    meta: "1.1M Views | Top Performer",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBpb6SHY5pkpU-Z4jNCH8DU_MmfpVjy8VUzJerAEqO42dev7BZ2AIppVfs58evwC9VI8HYq5iKYWZPMKCOsgui2AvkPxxFRPcTYFfW3oZS8pHXjGc2j5wHgNB6nh07dvg0JarOHPF28BaOP2ZUI6MQ1sQkvNLmUdQYizFGTrW4quIw0ONz4bQSOr4Dk4nCrukUzzZZszqZ8AY0YA87nvPzu0yVX3xRKP5NCHMneUMVMSIi0zLNYGQRw-XN1dp39G1BdHcuQVJi1ujOS",
  },
];

export default function SocialMediaPage() {
  const hero = pageContent.hero || {};

  return (
    <div className="editorial-page">
      <EditorialNav active="Work" />
      <main>
        <header className="social-hero">
          <div className="social-copy">
            <div className="sticker"><span aria-hidden="true">♨</span>{hero.badge_text || "For you page vibes"}</div>
            <h1>
              {hero.title_line_1 || "The"}<br />
              <span className="scribble">{hero.title_highlight || "Algo"}</span><br />
              {hero.title_line_2 || "Approved Portfolio"}
            </h1>
            <p className="social-intro">{hero.intro_text}</p>
            <div className="hero-actions">
              <a className="neo-button primary" href={hero.primary_cta_url}>{hero.primary_cta_label}　▷</a>
              <a className="neo-button" href="#recent-drops">{hero.secondary_cta_label}</a>
            </div>
          </div>

          <div className="phone-stage" aria-label="Social reel phone mockup">
            <div className="phone-dash" />
            <div className="phone-tape" />
            <div className="phone">
              <div className="phone-notch" />
              <div className="phone-screen">
                <div className="phone-icons">
                  <span><b>♡</b>124K</span>
                  <span><b>□</b>1.2K</span>
                  <span><b>⌯</b>800</span>
                </div>
                <div className="phone-caption">
                  <strong>@sararuffini_creative</strong>
                  How we shot the latest viral campaign for Brand X #bts #creative
                </div>
              </div>
            </div>
            <div className="sticker phone-stat"><strong>{hero.hero_stat_value || "1.2M"}</strong><small>{hero.hero_stat_label || "Views"}</small></div>
          </div>
        </header>

        <section className="recent-drops" id="recent-drops">
          <div className="drops-heading">
            <div>
              <h2>Recent <span className="scribble">Drops</span></h2>
              <p>High-performing social creative designed for maximum retention.</p>
            </div>
            <div className="drop-arrows" aria-hidden="true"><span>←</span><span>→</span></div>
          </div>
          <div className="drop-track">
            {drops.map((drop) => (
              <article className="drop-wrap" key={drop.title}>
                {drop.badge ? <span className="drop-badge">{drop.badge}</span> : null}
                <div className="drop-card">
                  <img alt="" src={drop.image} />
                  <div className="drop-caption"><strong>{drop.title}</strong><span>{drop.meta}</span></div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <EditorialFooter />
    </div>
  );
}
