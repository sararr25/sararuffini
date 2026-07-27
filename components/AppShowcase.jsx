"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SiteFooter, SiteNav } from "./SiteChrome";

const FALLBACK = {
  hero: {
    title: "Playtribe",
    description: "Playtribe makes it easier to find or create local sports events, meet people who match your energy, and turn showing up into a real community.",
    tags: ["CASE STUDY 04", "Flutter App", "Community Product"],
    image: "/assets/media/app-showcase/playtribe/explore.jpg",
    image_alt: "Playtribe Explore screen showing local sports events",
    image_cta: "FIND YOUR TRIBE",
  },
  design_dna: {
    title: "Design DNA",
    colors: [
      { name: "Sage", value: "#5F6D4C", color: "#5f6d4c" },
      { name: "Cream", value: "#FCF9F0", color: "#fcf9f0" },
      { name: "Coral", value: "#E8664E", color: "#e8664e" },
      { name: "Night", value: "#161511", color: "#161511" },
    ],
    type_samples: [
      { label: "Display (Literata)", value: "Find your people", style: "display" },
      { label: "Heading (Literata)", value: "My events", style: "heading" },
      { label: "Body (Plus Jakarta Sans)", value: "Join a game. Make it a habit.", style: "body" },
    ],
  },
  tech_stack: {
    title: "Tech Stack",
    intro: "A community-first product system designed around spontaneous plans, trusted participation, and low-friction connection.",
    cards: [
      { icon: "smartphone", title: "Mobile", text: "A warm, image-led mobile experience for browsing nearby sports, creating events, and managing your plans.", tags: ["Flutter", "Android", "iOS"], tone: "teal", tilt: "right" },
      { icon: "groups", title: "Community", text: "Events are created by the community, with chat, friends, direct messages, and inclusive participation built into the flow.", tags: ["Find or create", "Chat", "Friends"], tone: "yellow", tilt: "left" },
      { icon: "verified", title: "Trust layer", text: "Reliability scores, attendance confirmation, reporting, and ratings help people feel safer showing up with new players.", tags: ["Reliability", "Ratings", "Supabase"], tone: "pink", tilt: "more" },
    ],
  },
  action: {
    title: "Inside the Action",
    intro: "Explore the product flow from discovery to trust, participation, and community.",
    cta_label: "Explore Project",
    cta_href: "https://playtribeapp.com",
    slides: [
      { title: "Explore", image: "/assets/media/app-showcase/playtribe/explore.jpg", alt: "Playtribe Explore feed with local yoga and beach volleyball events" },
      { title: "Map view", image: "/assets/media/app-showcase/playtribe/map.jpg", alt: "Playtribe map view showing sports events around Copenhagen" },
      { title: "My events", image: "/assets/media/app-showcase/playtribe/events.jpg", alt: "Playtribe My Events screen with upcoming events" },
      { title: "Event detail", image: "/assets/media/app-showcase/playtribe/event-detail.jpg", alt: "Playtribe event detail screen for a yoga event" },
      { title: "Profile", image: "/assets/media/app-showcase/playtribe/profile.jpg", alt: "Playtribe member profile with reliability score" },
    ],
  },
};

function mergeContent(data) {
  return {
    ...FALLBACK,
    ...data,
    hero: { ...FALLBACK.hero, ...(data?.hero || {}) },
    design_dna: { ...FALLBACK.design_dna, ...(data?.design_dna || {}) },
    tech_stack: { ...FALLBACK.tech_stack, ...(data?.tech_stack || {}) },
    action: { ...FALLBACK.action, ...(data?.action || {}) },
  };
}

export default function AppShowcase() {
  const [content, setContent] = useState(FALLBACK);
  const carouselRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    fetch("/content/pages/app-showcase.json", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => data && setContent(mergeContent(data)))
      .catch(() => {});
  }, []);

  const slides = content.action.slides?.length ? content.action.slides : FALLBACK.action.slides;
  const techCards = content.tech_stack.cards?.length ? content.tech_stack.cards : FALLBACK.tech_stack.cards;
  const colors = content.design_dna.colors?.length ? content.design_dna.colors : FALLBACK.design_dna.colors;
  const typeSamples = content.design_dna.type_samples?.length ? content.design_dna.type_samples : FALLBACK.design_dna.type_samples;

  const carouselItems = useMemo(() => slides.map((slide, index) => ({ ...slide, index })), [slides]);

  function updateActiveSlide() {
    const viewport = carouselRef.current;
    if (!viewport) return;
    const center = viewport.scrollLeft + viewport.clientWidth / 2;
    let closest = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    [...viewport.children].forEach((item, index) => {
      const distance = Math.abs(item.offsetLeft + item.offsetWidth / 2 - center);
      if (distance < closestDistance) { closest = index; closestDistance = distance; }
    });
    setActiveSlide(closest);
  }

  function moveCarousel(direction) {
    const viewport = carouselRef.current;
    if (!viewport) return;
    const nextIndex = Math.max(0, Math.min(slides.length - 1, activeSlide + direction));
    viewport.children[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }

  return (
    <div className="app-showcase-page">
      <SiteNav pageKey="app-showcase" />
      <main>
        <section className="app-showcase-hero">
          <div className="app-showcase-wrap app-showcase-hero__grid">
            <div className="app-showcase-hero__copy">
              <div className="app-showcase-title-wrap">
                <h1>{content.hero.title}</h1>
                <svg aria-hidden="true" className="app-showcase-squiggle" viewBox="0 0 100 50"><path d="M5 25Q25 5 50 25T95 25" /></svg>
              </div>
              <p className="app-showcase-lead">{content.hero.description}</p>
              <div className="app-showcase-tags">
                {(content.hero.tags || []).map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </div>
            <div className="app-showcase-phone-stage">
              <div className="app-showcase-phone"><div className="app-showcase-phone__screen"><div className="app-showcase-phone__island" /><img src={content.hero.image} alt={content.hero.image_alt} /><span>{content.hero.image_cta}</span></div></div>
              <svg aria-hidden="true" className="app-showcase-star" viewBox="0 0 100 100"><polygon points="50,5 61,35 95,35 67,55 78,85 50,65 22,85 33,55 5,35 39,35" /></svg>
            </div>
          </div>
        </section>

        <section className="app-showcase-dna"><div className="app-showcase-wrap"><h2>{content.design_dna.title}<span className="material-symbols-outlined">palette</span></h2><div className="app-showcase-dna__grid"><article className="app-showcase-card"><h3>Colors</h3><div className="app-showcase-colors">{colors.map((swatch) => <div key={`${swatch.name}-${swatch.value}`}><span style={{ backgroundColor: swatch.color }} /><p>{swatch.name}<small>{swatch.value}</small></p></div>)}</div></article><article className="app-showcase-card"><h3>Typography</h3><div className="app-showcase-type">{typeSamples.map((sample) => <div key={sample.label}><p>{sample.label}</p><strong className={`app-showcase-type--${sample.style}`}>{sample.value}</strong></div>)}</div></article></div></div></section>

        <section className="app-showcase-tech"><div className="app-showcase-wrap"><h2>{content.tech_stack.title}<span className="material-symbols-outlined">terminal</span></h2><p className="app-showcase-section-lead">{content.tech_stack.intro}</p><div className="app-showcase-tech__grid">{techCards.map((card) => <article className={`app-showcase-tech-card app-showcase-tech-card--${card.tone || "paper"} app-showcase-tech-card--${card.tilt || "none"}`} key={card.title}><div><span className="material-symbols-outlined">{card.icon}</span><h3>{card.title}</h3></div><p>{card.text}</p><ul>{(card.tags || []).map((tag) => <li key={tag}>{tag}</li>)}</ul></article>)}</div></div></section>

        <section className="app-showcase-action"><div className="app-showcase-wrap"><h2>{content.action.title}</h2><p className="app-showcase-action__lead">{content.action.intro}</p></div><div className="app-showcase-carousel-shell"><button type="button" aria-label="Previous screen" onClick={() => moveCarousel(-1)} className="app-showcase-arrow app-showcase-arrow--prev"><span className="material-symbols-outlined">arrow_back</span></button><div className="app-showcase-carousel" onScroll={updateActiveSlide} ref={carouselRef} tabIndex="0" aria-label="Playtribe screens">{carouselItems.map((slide) => <article className={`app-showcase-carousel__item${activeSlide === slide.index ? " is-active" : ""}`} key={`${slide.title}-${slide.index}`}><div><div className="app-showcase-carousel__island" /><img src={slide.image} alt={slide.alt} /></div><p>{slide.title}</p></article>)}</div><button type="button" aria-label="Next screen" onClick={() => moveCarousel(1)} className="app-showcase-arrow app-showcase-arrow--next"><span className="material-symbols-outlined">arrow_forward</span></button></div><div className="app-showcase-action__cta"><a href={content.action.cta_href} target="_blank" rel="noopener noreferrer">{content.action.cta_label}<span className="material-symbols-outlined">arrow_forward</span></a></div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
