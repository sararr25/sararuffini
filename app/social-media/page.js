import { SiteFooter, SiteNav } from "../../components/SiteChrome";
import SocialMediaMotion from "../../components/SocialMediaMotion";
import SocialMediaReels from "../../components/SocialMediaReels";
import pageContent from "../../public/content/pages/social-media.json";
import "../../styles/app-tailwind.css";
import "../editorial-pages.css";
import "../../styles/social-media-page.css";

const HERO_REEL = "/assets/media/social-reels/reel-2.jpg";
const HERO_REEL_URL = "https://www.instagram.com/reel/DS5TqO7CCDD/";

export const metadata = {
  title: pageContent?.seo?.seo_title || "Social Media | Sara Ruffini",
  description: pageContent?.seo?.seo_description || "Social media strategy, short-form production and editing by Sara Ruffini.",
};

export default function SocialMediaPage() {
  const studies = Array.isArray(pageContent.case_studies) ? pageContent.case_studies : [];
  const reels = studies.flatMap((study) => (study.reels || []).map((reel) => ({ ...reel, account: study.account })));
  const approachItems = Array.isArray(pageContent.approach_items) ? pageContent.approach_items : [];

  return (
    <div className="editorial-page social-media-page smp-page">
      <SiteNav pageKey="projects" />
      <main>
        <header className="smp-hero">
          <div className="smp-hero__copy">
            <p className="smp-kicker">Content creator · Copenhagen</p>
            <h1>{pageContent.headline || "Short-form work with a point of view."}</h1>
            <p>{pageContent.description}</p>
            <a className="smp-text-link" href="#selected-reels">Explore selected reels <span aria-hidden="true">↓</span></a>
          </div>
          <a className="smp-phone" href={HERO_REEL_URL} rel="noreferrer" target="_blank">
            <span className="smp-phone__tape" aria-hidden="true" />
            <span className="smp-phone__frame">
              <img alt="Preview of a @potuschef Instagram reel" src={HERO_REEL} />
              <span className="smp-phone__play" aria-hidden="true">Play reel ↗</span>
            </span>
            <span className="smp-phone__label">@potuschef · recipe content</span>
          </a>
        </header>

        <section className="smp-proof" aria-labelledby="smp-proof-heading">
          <div className="smp-proof__copy">
            <p className="smp-kicker">From concept to community</p>
            <h2 id="smp-proof-heading">A social feed should feel like a world people want to return to.</h2>
            <p>I work across strategy, production and editing — shaping a recognizable visual rhythm while leaving room for personality, relevance and a strong first second.</p>
          </div>
          <dl className="smp-stats">
            <div><dt>70K → 113K</dt><dd>@potuschef followers in six months</dd></div>
            <div><dt>~40%</dt><dd>International audience, up from 10%</dd></div>
            <div><dt>Weber · Mutti</dt><dd>Brand collaborations supported through content</dd></div>
          </dl>
        </section>

        <div id="selected-reels"><SocialMediaReels reels={reels} /></div>

        <section className="smp-services" aria-labelledby="smp-services-heading">
          <div className="smp-section-heading smp-section-heading--services">
            <div>
              <p className="smp-kicker">What I do</p>
              <h2 id="smp-services-heading">The work behind the reel</h2>
            </div>
          </div>
          <ol>
            {approachItems.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}
          </ol>
        </section>
      </main>
      <SiteFooter />
      <SocialMediaMotion />
    </div>
  );
}
