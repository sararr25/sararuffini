"use client";

import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(DrawSVGPlugin, ScrollSmoother, ScrollTrigger, TextPlugin);

export default function HomepageMotion() {
  useLayoutEffect(() => {
    const page = document.querySelector('[data-cms-page="homepage"]');

    if (!page) {
      return undefined;
    }

    const media = gsap.matchMedia();
    const cleanup = [];
    let started = false;

    const startMotion = () => {
      if (started) {
        return;
      }
      started = true;

      media.add("(prefers-reduced-motion: no-preference)", () => {
        document.documentElement.classList.add("gsap-enhanced");

      const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 0.85,
        smoothTouch: 0,
        effects: true,
        ignoreMobileResize: true,
      });

      const heroTimeline = gsap.timeline({ defaults: { ease: "expo.out" } });
      const faster = page.querySelector(".homepage-text-accent");
      const scribble = page.querySelector(".scribble-underline path");
      const accentText = faster?.textContent?.trim() || "faster";
      const accentIntro = accentText.length > 4 ? accentText.slice(0, -2) : accentText;
      const featuredSubtitle = page.querySelector(".featured-stitch-subtitle")?.textContent?.trim()
        || "Handpicked selections from the cutting room floor";

      heroTimeline
        .from(".homepage-hero-title", {
          yPercent: 34,
          autoAlpha: 0,
          rotate: -1.5,
          duration: 0.75,
          clearProps: "transform,opacity,visibility",
        })
        .from(".homepage-hero-line", {
          clipPath: "inset(0 0 100% 0)",
          yPercent: 24,
          duration: 0.7,
          stagger: 0.1,
          clearProps: "clipPath,transform",
        }, 0.08)
        .fromTo(faster, { text: accentIntro }, {
          text: accentText,
          duration: 0.45,
          ease: "none",
        }, 0.48)
        .fromTo(scribble, { drawSVG: "0%" }, {
          drawSVG: "100%",
          duration: 0.58,
          ease: "power2.inOut",
        }, 0.53)
        .from(".homepage-showreel", {
          y: 70,
          rotateX: 9,
          transformPerspective: 900,
          autoAlpha: 0,
          duration: 0.85,
          clearProps: "transform,opacity,visibility",
        }, 0.35);

      const featuredTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".featured-stitch-section",
          start: "top 76%",
          once: true,
        },
        defaults: { ease: "expo.out" },
      });

      featuredTimeline
        .from(".featured-stitch-title", {
          y: 42,
          rotate: -2,
          autoAlpha: 0,
          duration: 0.62,
          clearProps: "transform,opacity,visibility",
        })
        .fromTo(".featured-stitch-subtitle", {
          text: "Fresh cuts. Big energy.",
          autoAlpha: 0,
        }, {
          text: featuredSubtitle,
          autoAlpha: 1,
          duration: 0.8,
          ease: "none",
        }, 0.18)
        .from(".stitch-sticker", {
          x: () => gsap.utils.random(-110, 110),
          y: () => gsap.utils.random(45, 150),
          scale: 0.45,
          rotation: () => gsap.utils.random(-24, 24),
          autoAlpha: 0,
          duration: 0.82,
          stagger: { each: 0.065, from: "random" },
          clearProps: "opacity,visibility",
        }, 0.28)
        .fromTo(".featured-stitch-doodles path", { drawSVG: "0%" }, {
          drawSVG: "100%",
          duration: 0.72,
          stagger: 0.12,
          ease: "power2.inOut",
        }, 0.52)
        .from(".featured-stitch-sparkle, .stitch-pop, .stitch-dot", {
          scale: 0,
          rotation: -35,
          transformOrigin: "50% 50%",
          duration: 0.5,
          stagger: 0.07,
        }, 0.62);

      gsap.utils.toArray(".stitch-sticker-card").forEach((card, index) => {
        gsap.to(card, {
          y: index % 2 === 0 ? -9 : -13,
          rotation: index % 2 === 0 ? 0.8 : -0.7,
          duration: 3.1 + (index % 3) * 0.55,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.08,
        });
      });

      const aboutCard = page.querySelector(".homepage-about-card");
      if (aboutCard) {
        gsap.from(aboutCard, {
          scrollTrigger: {
            trigger: aboutCard,
            start: "top 84%",
            once: true,
          },
          clipPath: "inset(0 0 100% 0 round 0.5rem)",
          y: 36,
          duration: 0.75,
          ease: "expo.out",
          clearProps: "clipPath,transform",
        });
      }

      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready.then(refresh);
      window.addEventListener("load", refresh, { once: true });
      cleanup.push(() => window.removeEventListener("load", refresh));

        return () => {
          smoother.kill();
        };
      });
    };

    const fallbackTimer = window.setTimeout(startMotion, 2500);
    const handleContentReady = () => {
      window.clearTimeout(fallbackTimer);
      startMotion();
    };

    document.addEventListener("cms:content-applied", handleContentReady, { once: true });
    cleanup.push(() => {
      window.clearTimeout(fallbackTimer);
      document.removeEventListener("cms:content-applied", handleContentReady);
    });

    return () => {
      cleanup.forEach((dispose) => dispose());
      media.revert();
      document.documentElement.classList.remove("gsap-enhanced");
    };
  }, []);

  return null;
}
