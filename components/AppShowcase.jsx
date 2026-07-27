"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SiteFooter, SiteNav } from "./SiteChrome";

const LOGO = "/assets/media/app-showcase/playtribe/logo.png";

const FALLBACK = {
  hero: {
    title: "Playtribe",
    description: "Playtribe is a social sports app for people who want to move more and meet better. It helps you find or create local events, join a game that fits your level and energy, and turn a spontaneous plan into a real community. From yoga by the water to beach volleyball at sunset, Playtribe makes the first step feel easy and showing up feel worthwhile.",
    tags: ["CASE STUDY 04", "Flutter App", "Community Product"],
    benefits: ["Find people to play with", "Create plans that fit your energy", "Build trust beyond the game"],
    image: "/assets/media/app-showcase/playtribe/explore.webp",
    image_alt: "Playtribe Explore screen showing local sports events",
    image_cta: "FIND YOUR TRIBE",
  },
  design_dna: {
    title: "Design DNA",
    logo: LOGO,
    logo_alt: "Playtribe logo",
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
    story: {
      eyebrow: "More than a sports directory",
      title: "A softer way into community",
      intro: "Playtribe is built around a simple truth: finding people to play with should not feel like networking, and joining a new group should not feel intimidating.",
      paragraphs: [
        "The app solves the friction between wanting to be active and having no one to call. People can browse nearby activities, filter by sport and energy, or create the plan they wish existed. The result is a living, community-generated layer of sport around the city.",
        "Participation does not stop at the join button. Event chat, friends, direct messages, weather, calendars, ratings, and a reliability score help a one-off game become a trusted social habit.",
      ],
    },
  },
  tech_stack: {
    title: "How Playtribe Works",
    intro: "A community-first product system designed around spontaneous plans, trusted participation, and low-friction connection.",
    cards: [
      { icon: "search", title: "Find your people", text: "Discover nearby activities by sport, date, location and energy, without needing an existing group to get started.", tags: ["Explore", "Map view", "Filters"], tone: "teal", tilt: "right" },
      { icon: "add_circle", title: "Make the plan", text: "Create an event when the plan you want does not exist yet, then invite people into something that feels easy to join.", tags: ["Create", "Join", "Chat"], tone: "yellow", tilt: "left" },
      { icon: "verified", title: "Build trust", text: "Attendance, ratings and reliability help meeting new people feel safer and turn a one-off game into a social habit.", tags: ["Reliability", "Ratings", "Friends"], tone: "pink", tilt: "more" },
    ],
  },
  action: {
    title: "See Playtribe in motion",
    intro: "From finding an event to becoming part of the community.",
    cta_label: "Visit Playtribe",
    cta_href: "https://playtribeapp.com",
    slides: [
      { title: "Explore", caption: "Find nearby activities and people.", image: "/assets/media/app-showcase/playtribe/explore.webp", alt: "Playtribe Explore feed with local yoga and beach volleyball events" },
      { title: "Map view", caption: "See what is happening around you.", image: "/assets/media/app-showcase/playtribe/map.webp", alt: "Playtribe map view showing sports events around Copenhagen" },
      { title: "Event detail", caption: "Understand the vibe before you join.", image: "/assets/media/app-showcase/playtribe/event-detail.webp", alt: "Playtribe event detail screen for a yoga event" },
      { title: "My events", caption: "Keep every plan in one place.", image: "/assets/media/app-showcase/playtribe/events.webp", alt: "Playtribe My Events screen with upcoming events" },
      { title: "Profile", caption: "Build a reputation by showing up.", image: "/assets/media/app-showcase/playtribe/profile.webp", alt: "Playtribe member profile with reliability score" },
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
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = "https://fonts.googleapis.com/css2?family=Literata:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
    fontLink.dataset.appShowcaseFonts = "true";
    document.head.appendChild(fontLink);
    return () => fontLink.remove();
  }, []);

  useEffect(() => {
    fetch("/content/pages/app-showcase.json", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => data && setContent(mergeContent(data)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll(".app-showcase-reveal");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [content]);

  const slides = content.action.slides?.length ? content.action.slides : FALLBACK.action.slides;
  const techCards = content.tech_stack.cards?.length ? content.tech_stack.cards : FALLBACK.tech_stack.cards;
  const colors = content.design_dna.colors?.length ? content.design_dna.colors : FALLBACK.design_dna.colors;
  const typeSamples = content.design_dna.type_samples?.length ? content.design_dna.type_samples : FALLBACK.design_dna.type_samples;
  const story = content.design_dna.story || FALLBACK.design_dna.story;
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

  function handleCarouselKeyDown(event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveCarousel(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveCarousel(1);
    }
  }

  return (
    <div className="app-showcase-page">
      <SiteNav pageKey="app-showcase" />
      <main>
        <section className="app-showcase-hero">
          <div className="app-showcase-wrap app-showcase-hero__grid">
            <div className="app-showcase-hero__copy app-showcase-reveal">
              <div className="app-showcase-title-wrap">
                <p className="app-showcase-kicker">A social sports app for real life</p>
                <h1>{content.hero.title}</h1>
                <svg aria-hidden="true" className="app-showcase-squiggle" viewBox="0 0 100 50"><path d="M5 25Q25 5 50 25T95 25" /></svg>
              </div>
              <p className="app-showcase-lead">{content.hero.description}</p>
              <div className="app-showcase-hero__actions"><a className="app-showcase-button app-showcase-button--primary" href={content.action.cta_href} target="_blank" rel="noopener noreferrer">Visit Playtribe<span className="material-symbols-outlined">arrow_outward</span></a><a className="app-showcase-button app-showcase-button--secondary" href="#product-flow">See the product flow<span className="material-symbols-outlined">south</span></a></div>
              <ul className="app-showcase-benefits" aria-label="Playtribe benefits">{(content.hero.benefits || FALLBACK.hero.benefits).map((benefit) => <li key={benefit}><span className="material-symbols-outlined">check</span>{benefit}</li>)}</ul>
              <div className="app-showcase-tags">{(content.hero.tags || []).map((tag) => <span key={tag}>{tag}</span>)}</div>
            </div>
            <div className="app-showcase-hero-phone app-showcase-reveal app-showcase-reveal--delay">
              <div className="app-showcase-phone"><div className="app-showcase-phone__screen"><img src={content.hero.image} alt={content.hero.image_alt} fetchPriority="high" decoding="async" /></div></div>
              <svg aria-hidden="true" className="app-showcase-star" viewBox="0 0 100 100"><polygon points="50,5 61,35 95,35 67,55 78,85 50,65 22,85 33,55 5,35 39,35" /></svg>
            </div>
          </div>
        </section>

        <section className="app-showcase-dna">
          <div className="app-showcase-wrap app-showcase-dna__layout">
            <div className="app-showcase-dna__left">
              <h2>{content.design_dna.title}<span className="material-symbols-outlined">palette</span></h2>
              <article className="app-showcase-card app-showcase-logo-card app-showcase-reveal">
                <div><p className="app-showcase-card-label">Brand mark</p><img src={content.design_dna.logo || LOGO} alt={content.design_dna.logo_alt || "Playtribe logo"} /></div>
                <p>The visual identity keeps sport social, warm, and easy to enter.</p>
              </article>
              <article className="app-showcase-card app-showcase-reveal app-showcase-reveal--delay-2"><h3>Palette</h3><div className="app-showcase-colors">{colors.map((swatch) => <div key={`${swatch.name}-${swatch.value}`}><span style={{ backgroundColor: swatch.color }} /><p>{swatch.name}<small>{swatch.value}</small></p></div>)}</div></article>
              <article className="app-showcase-card app-showcase-reveal app-showcase-reveal--delay-3"><h3>Type in the app</h3><div className="app-showcase-type">{typeSamples.map((sample) => <div key={sample.label}><p>{sample.label}</p><strong className={`app-showcase-type--${sample.style}`}>{sample.value}</strong></div>)}</div></article>
            </div>
            <article className="app-showcase-dna__story app-showcase-reveal app-showcase-reveal--delay">
              <p className="app-showcase-kicker">{story.eyebrow}</p>
              <h3>{story.title}</h3>
              <p className="app-showcase-story-intro">{story.intro}</p>
              {(story.paragraphs || []).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </article>
          </div>
        </section>

        <section className="app-showcase-tech" id="product-flow"><div className="app-showcase-wrap"><p className="app-showcase-kicker">How it works</p><h2>{content.tech_stack.title}<span className="material-symbols-outlined">route</span></h2><p className="app-showcase-section-lead">{content.tech_stack.intro}</p><div className="app-showcase-tech__grid">{techCards.map((card) => <article className={`app-showcase-tech-card app-showcase-tech-card--${card.tone || "paper"} app-showcase-tech-card--${card.tilt || "none"} app-showcase-reveal`} key={card.title}><div><span className="material-symbols-outlined">{card.icon}</span><h3>{card.title}</h3></div><p>{card.text}</p><ul>{(card.tags || []).map((tag) => <li key={tag}>{tag}</li>)}</ul></article>)}</div></div></section>

        <section className="app-showcase-action">
          <div className="app-showcase-wrap app-showcase-action__intro"><p className="app-showcase-kicker">From discovery to belonging</p><h2>{content.action.title}</h2><p className="app-showcase-action__lead">{content.action.intro}</p></div>
          <div className="app-showcase-carousel-shell app-showcase-reveal"><button type="button" aria-label="Previous screen" onClick={() => moveCarousel(-1)} className="app-showcase-arrow app-showcase-arrow--prev"><span className="material-symbols-outlined">arrow_back</span></button><div className="app-showcase-carousel" onScroll={updateActiveSlide} onKeyDown={handleCarouselKeyDown} ref={carouselRef} tabIndex="0" role="region" aria-roledescription="carousel" aria-label="Playtribe app screens">{carouselItems.map((slide) => <article className={`app-showcase-carousel__item${activeSlide === slide.index ? " is-active" : ""}`} key={`${slide.title}-${slide.index}`} role="group" aria-roledescription="slide" aria-label={`${slide.title}, screen ${slide.index + 1} of ${carouselItems.length}`}><div className="app-showcase-carousel__phone"><img src={slide.image} alt={slide.alt} loading={slide.index === 0 ? "eager" : "lazy"} decoding="async" /></div><div className="app-showcase-carousel__caption"><strong>{slide.title}</strong><span>{slide.caption}</span></div></article>)}</div><button type="button" aria-label="Next screen" onClick={() => moveCarousel(1)} className="app-showcase-arrow app-showcase-arrow--next"><span className="material-symbols-outlined">arrow_forward</span></button><div className="app-showcase-carousel__status"><span aria-live="polite">{String(activeSlide + 1).padStart(2, "0")} / {String(carouselItems.length).padStart(2, "0")}</span>{carouselItems.map((slide) => <button key={slide.index} type="button" aria-label={`Show ${slide.title}`} aria-current={activeSlide === slide.index ? "true" : undefined} onClick={() => moveCarousel(slide.index - activeSlide)}><span /></button>)}</div></div>
          <div className="app-showcase-action__cta"><a href={content.action.cta_href} target="_blank" rel="noopener noreferrer">{content.action.cta_label}<span className="material-symbols-outlined">arrow_forward</span></a></div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
