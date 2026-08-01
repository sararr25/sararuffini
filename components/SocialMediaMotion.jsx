"use client";

import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SocialMediaMotion() {
  useLayoutEffect(() => {
    const page = document.querySelector(".social-media-page");
    if (!page) return undefined;

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        const compact = window.matchMedia("(max-width: 640px)").matches;
        const distance = compact ? 12 : 26;

        gsap.timeline({ defaults: { ease: "expo.out" } })
          .from(".social-eyebrow", { y: 10, autoAlpha: 0, duration: 0.38 })
          .from(".social-copy h1", { y: distance, rotate: compact ? 0 : -1, autoAlpha: 0, duration: 0.7 }, 0.08)
          .from(".social-intro", { y: 14, autoAlpha: 0, duration: 0.5 }, 0.24)
          .from(".phone-stage", { y: distance, rotate: compact ? 0 : 1, autoAlpha: 0, duration: 0.75 }, 0.16);

        gsap.to(".phone", {
          y: compact ? -6 : -11,
          rotate: compact ? 2 : 4.2,
          duration: 2.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });

        gsap.from(".social-proof-intro, .social-proof-stats", {
          y: compact ? 14 : 28,
          duration: compact ? 0.46 : 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".social-proof", start: "top 78%", once: true },
        });

        gsap.from(".social-proof-stats div", {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 0.45,
          stagger: 0.09,
          ease: "power2.out",
          scrollTrigger: { trigger: ".social-proof-stats", start: "top 82%", once: true },
        });

        gsap.utils.toArray(".social-client-section").forEach((section) => {
          gsap.from(section.querySelector(".social-client-heading"), {
            x: compact ? 10 : 24,
            duration: compact ? 0.4 : 0.56,
            ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 82%", once: true },
          });
        });

        gsap.utils.toArray(".social-reel-card").forEach((card, index) => {
          gsap.from(card, {
            y: compact ? 16 : 34,
            duration: compact ? 0.45 : 0.62,
            delay: Math.min(index * 0.035, 0.2),
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 92%", once: true },
          });
        });

        gsap.from(".social-approach-heading, .social-approach-list li", {
          y: compact ? 12 : 24,
          duration: compact ? 0.42 : 0.58,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: ".social-approach-section", start: "top 78%", once: true },
        });
      }, page);
      return () => context.revert();
    });

    return () => media.revert();
  }, []);

  return null;
}
