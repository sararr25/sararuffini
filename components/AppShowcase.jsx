"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SiteFooter, SiteNav } from "./SiteChrome";

gsap.registerPlugin(DrawSVGPlugin, ScrollTrigger);

const LOGO = "/assets/media/app-showcase/playtribe/logo.png";

const FALLBACK = {
  hero: {
    title: "Playtribe",
    description: "Playtribe started from a simple observation: finding people to play with is still surprisingly difficult when you move to a new city, have an irregular schedule, or do not already belong to a sports group. I designed and developed the app as a social layer for local sport, exploring how a digital product could make the first step feel less awkward and a new connection feel more natural.",
    tags: ["CASE STUDY 04", "Flutter App", "Community Product"],
    benefits: ["Product concept and interaction design", "Cross-platform Flutter development", "A trust layer for new connections"],
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
      eyebrow: "The idea behind the product",
      title: "Designing a lower-friction way to meet",
      intro: "The project began with a tension: people want to be more active and social, but the first step is often the hardest one.",
      paragraphs: [
        "I wanted to explore what a sports product could feel like if it started from social confidence rather than performance. The design needed to make a new activity feel approachable, while still giving people enough context to decide if a plan was right for them.",
        "That led to a visual language built around warm surfaces, editorial typography and clear moments of action. The product combines discovery, event creation and community trust into one coherent experience, with the interface doing the work of reducing uncertainty.",
      ],
    },
  },
  tech_stack: {
    eyebrow: "Development & implementation",
    title: "How it was built",
    intro: "The project combined product thinking, interface design and cross-platform development. I worked across the experience from the first product idea to the interaction model and technical implementation.",
    cards: [
      { icon: "code", title: "Frontend", text: "A cross-platform Flutter application with reusable widgets, responsive mobile screens, stateful navigation and interaction patterns shaped around the product flow.", tags: ["Flutter", "Dart", "Riverpod"], tone: "teal", tilt: "right" },
      { icon: "storage", title: "Backend", text: "A Supabase-backed architecture for authentication, profiles, events, chat, realtime updates and secure access to product data.", tags: ["Supabase", "Postgres", "Realtime"], tone: "yellow", tilt: "left" },
      { icon: "palette", title: "Tools & process", text: "The work moved between product definition, UI systems, prototyping, visual assets and release preparation, keeping the design and implementation in conversation.", tags: ["Figma", "VS Code", "GitHub", "Shorebird"], tone: "pink", tilt: "more" },
    ],
  },
  action: {
    title: "A closer look at the interface",
    intro: "A selection of screens showing how the visual system translates into real product decisions.",
    cta_label: "Back to Projects",
    cta_href: "/pages/projects",
    slides: [
      { title: "Explore", caption: "The primary discovery view, balancing density with a calm first impression.", image: "/assets/media/app-showcase/playtribe/explore.webp", alt: "Playtribe Explore feed with local yoga and beach volleyball events" },
      { title: "Map view", caption: "Geographic browsing adds context without taking over the interface.", image: "/assets/media/app-showcase/playtribe/map.webp", alt: "Playtribe map view showing sports events around Copenhagen" },
      { title: "Event detail", caption: "A clear hierarchy turns the decision screen into a readable composition.", image: "/assets/media/app-showcase/playtribe/event-detail.webp", alt: "Playtribe event detail screen for a yoga event" },
      { title: "My events", caption: "A focused overview for managing upcoming and past commitments.", image: "/assets/media/app-showcase/playtribe/events.webp", alt: "Playtribe My Events screen with upcoming events" },
      { title: "Profile", caption: "Trust cues are treated as part of the product’s social identity.", image: "/assets/media/app-showcase/playtribe/profile.webp", alt: "Playtribe member profile with reliability score" },
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
  const pageRef = useRef(null);
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

  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;

    page.querySelectorAll(".app-showcase-reveal").forEach((element) => element.classList.add("is-visible"));

    const media = gsap.matchMedia();
    const scribble = page.querySelector(".app-showcase-title-scribble path");

    // On small touch screens, content should be immediately available rather
    // than depending on a scroll-triggered entrance to become readable.
    media.add("(min-width: 641px) and (prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        const heroTimeline = gsap.timeline({ defaults: { ease: "expo.out" } });

        heroTimeline
          .from(".app-showcase-hero .app-showcase-kicker", {
            y: 12,
            autoAlpha: 0,
            duration: 0.42,
            clearProps: "opacity,visibility,transform",
          })
          .from(".app-showcase-hero h1", {
            y: 28,
            rotate: -1.2,
            autoAlpha: 0,
            duration: 0.72,
            clearProps: "opacity,visibility,transform",
          }, 0.08)
          .fromTo(scribble, {
            drawSVG: "0%",
          }, {
            drawSVG: "100%",
            duration: 0.72,
            ease: "power2.inOut",
          }, 0.48)
          .from(".app-showcase-lead", {
            y: 18,
            autoAlpha: 0,
            duration: 0.56,
            clearProps: "opacity,visibility,transform",
          }, 0.42)
          .from(".app-showcase-button", {
            y: 12,
            autoAlpha: 0,
            duration: 0.38,
            stagger: 0.07,
            clearProps: "opacity,visibility,transform",
          }, 0.58)
          .from(".app-showcase-benefits li", {
            x: -10,
            autoAlpha: 0,
            duration: 0.34,
            stagger: 0.055,
            clearProps: "opacity,visibility,transform",
          }, 0.72)
          .from(".app-showcase-tags span", {
            y: 8,
            autoAlpha: 0,
            duration: 0.32,
            stagger: 0.055,
            clearProps: "opacity,visibility,transform",
          }, 0.82)
          .from(".app-showcase-hero-phone", {
            y: 24,
            rotate: 0.8,
            autoAlpha: 0,
            duration: 0.72,
            clearProps: "opacity,visibility,transform",
          }, 0.3);

        gsap.utils.toArray([
          ".app-showcase-dna__left .app-showcase-card",
          ".app-showcase-dna__story",
          ".app-showcase-tech .app-showcase-kicker",
          ".app-showcase-tech h2",
          ".app-showcase-section-lead",
          ".app-showcase-tech-card",
          ".app-showcase-action__intro",
          ".app-showcase-carousel-shell",
          ".app-showcase-action__cta",
        ].join(", ")).forEach((element, index) => {
          gsap.from(element, {
            y: 26,
            autoAlpha: 0,
            duration: 0.64,
            delay: Math.min((index % 3) * 0.035, 0.1),
            ease: "expo.out",
            clearProps: "opacity,visibility,transform",
            scrollTrigger: {
              trigger: element,
              start: "top 86%",
              once: true,
            },
          });
        });

        gsap.from(".app-showcase-colors span", {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 0.45,
          stagger: 0.045,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".app-showcase-colors",
            start: "top 88%",
            once: true,
          },
        });

        gsap.from(".app-showcase-carousel__item", {
          y: 18,
          autoAlpha: 0,
          duration: 0.52,
          stagger: 0.06,
          ease: "power3.out",
          clearProps: "opacity,visibility,transform",
          scrollTrigger: {
            trigger: ".app-showcase-carousel",
            start: "top 84%",
            once: true,
          },
        });
      }, page);

      return () => ctx.revert();
    });

    media.add("(max-width: 640px), (prefers-reduced-motion: reduce)", () => {
      gsap.set(scribble, { drawSVG: "100%" });
    });

    return () => media.revert();
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
    <div className="app-showcase-page" data-cms-page="projects" ref={pageRef}>
      <SiteNav pageKey="app-showcase" />
      <main>
        <nav className="app-showcase-breadcrumb app-showcase-wrap" aria-label="Breadcrumb">
          <a href="/pages/projects">Projects</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Playtribe</span>
        </nav>
        <section className="app-showcase-hero">
          <div className="app-showcase-wrap app-showcase-hero__grid">
            <div className="app-showcase-hero__copy app-showcase-reveal">
              <div className="app-showcase-title-wrap">
                <p className="app-showcase-kicker">Product design + development case study</p>
                <h1>{content.hero.title}</h1>
                <svg className="app-showcase-title-scribble" viewBox="0 0 320 28" aria-hidden="true" focusable="false">
                  <path d="M5 18C42 7 74 22 114 14C156 5 185 22 226 13C263 5 288 10 315 17" />
                </svg>
              </div>
              <p className="app-showcase-lead">{content.hero.description}</p>
              <div className="app-showcase-hero__actions"><a className="app-showcase-button app-showcase-button--primary" href="#development">Explore the development<span aria-hidden="true" className="app-showcase-symbol">↓</span></a><a className="app-showcase-button app-showcase-button--secondary" href="/pages/projects">Back to projects<span aria-hidden="true" className="app-showcase-symbol">→</span></a></div>
              <ul className="app-showcase-benefits" aria-label="Case study focus">{(content.hero.benefits || FALLBACK.hero.benefits).map((benefit) => <li key={benefit}><span aria-hidden="true" className="app-showcase-symbol">✓</span>{benefit}</li>)}</ul>
              <div className="app-showcase-tags">{(content.hero.tags || []).map((tag) => <span key={tag}>{tag}</span>)}</div>
            </div>
            <div className="app-showcase-hero-phone app-showcase-reveal app-showcase-reveal--delay">
              <div className="app-showcase-phone"><div className="app-showcase-phone__screen"><img src={content.hero.image} alt={content.hero.image_alt} fetchPriority="high" decoding="async" /></div></div>
            </div>
          </div>
        </section>

        <section className="app-showcase-dna">
          <div className="app-showcase-wrap app-showcase-dna__layout">
            <div className="app-showcase-dna__left">
              <h2>{content.design_dna.title}<span aria-hidden="true" className="material-symbols-outlined">palette</span></h2>
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

        <section className="app-showcase-tech" id="development"><div className="app-showcase-wrap"><p className="app-showcase-kicker">{content.tech_stack.eyebrow || "Development & implementation"}</p><h2>{content.tech_stack.title}<span aria-hidden="true" className="material-symbols-outlined">code</span></h2><p className="app-showcase-section-lead">{content.tech_stack.intro}</p><div className="app-showcase-tech__grid">{techCards.map((card) => <article className={`app-showcase-tech-card app-showcase-tech-card--${card.tone || "paper"} app-showcase-tech-card--${card.tilt || "none"} app-showcase-reveal`} key={card.title}><div><span aria-hidden="true" className="material-symbols-outlined">{card.icon}</span><h3>{card.title}</h3></div><p>{card.text}</p><ul>{(card.tags || []).map((tag) => <li key={tag}>{tag}</li>)}</ul></article>)}</div></div></section>

        <section className="app-showcase-action">
          <div className="app-showcase-wrap app-showcase-action__intro"><p className="app-showcase-kicker">Selected interface screens</p><h2>{content.action.title}</h2><p className="app-showcase-action__lead">{content.action.intro}</p></div>
          <div className="app-showcase-carousel-shell app-showcase-reveal"><button type="button" aria-label="Previous screen" onClick={() => moveCarousel(-1)} className="app-showcase-arrow app-showcase-arrow--prev"><span aria-hidden="true" className="app-showcase-symbol">←</span></button><p className="app-showcase-carousel__hint"><span aria-hidden="true" className="app-showcase-symbol">↔</span>Swipe to explore screens</p><div className="app-showcase-carousel" onScroll={updateActiveSlide} onKeyDown={handleCarouselKeyDown} ref={carouselRef} tabIndex="0" role="region" aria-roledescription="carousel" aria-label="Playtribe app screens">{carouselItems.map((slide) => <article className={`app-showcase-carousel__item${activeSlide === slide.index ? " is-active" : ""}`} key={`${slide.title}-${slide.index}`} role="group" aria-roledescription="slide" aria-label={`${slide.title}, screen ${slide.index + 1} of ${carouselItems.length}`}><div className="app-showcase-carousel__phone"><img src={slide.image} alt={slide.alt} loading={slide.index === 0 ? "eager" : "lazy"} decoding="async" /></div><div className="app-showcase-carousel__caption"><strong>{slide.title}</strong><span>{slide.caption}</span></div></article>)}</div><button type="button" aria-label="Next screen" onClick={() => moveCarousel(1)} className="app-showcase-arrow app-showcase-arrow--next"><span aria-hidden="true" className="app-showcase-symbol">→</span></button><div className="app-showcase-carousel__status"><span aria-live="polite">{String(activeSlide + 1).padStart(2, "0")} / {String(carouselItems.length).padStart(2, "0")}</span>{carouselItems.map((slide) => <button key={slide.index} type="button" aria-label={`Show ${slide.title}`} aria-current={activeSlide === slide.index ? "true" : undefined} onClick={() => moveCarousel(slide.index - activeSlide)}><span /></button>)}</div></div>
          <div className="app-showcase-action__cta"><a href={content.action.cta_href}>{content.action.cta_label}<span aria-hidden="true" className="material-symbols-outlined">arrow_forward</span></a></div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
