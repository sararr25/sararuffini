"use client";

import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SocialMediaMotion() {
  useLayoutEffect(() => {
    const page = document.querySelector(".smp-page");
    if (!page) return undefined;

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        const compact = window.matchMedia("(max-width: 540px)").matches;
        const distance = compact ? 14 : 30;

        gsap.timeline({ defaults: { ease: "expo.out" } })
          .from(".smp-hero__copy .smp-kicker", { y: 10, autoAlpha: 0, duration: .35 })
          .from(".smp-hero h1", { y: distance, autoAlpha: 0, duration: .74 }, .08)
          .from(".smp-hero__copy > p:not(.smp-kicker), .smp-text-link", { y: 16, autoAlpha: 0, duration: .48, stagger: .08 }, .25)
          .from(".smp-phone", { y: distance, rotate: compact ? 0 : 1.5, autoAlpha: 0, duration: .76 }, .18);

        gsap.from(".smp-phone__frame img", {
          scale: 1.16,
          duration: 1.1,
          ease: "power3.out",
        });

        gsap.from(".smp-proof__copy, .smp-stats", {
          y: distance,
          duration: .66,
          stagger: .12,
          ease: "power3.out",
          scrollTrigger: { trigger: ".smp-proof", start: "top 78%", once: true },
        });

        gsap.from(".smp-section-heading", {
          y: 20,
          duration: .5,
          ease: "power3.out",
          scrollTrigger: { trigger: ".smp-reels", start: "top 82%", once: true },
        });

        gsap.utils.toArray(".smp-reel").forEach((reel, index) => {
          gsap.from(reel, {
            y: compact ? 16 : 36,
            duration: compact ? .4 : .58,
            delay: Math.min(index * .045, .22),
            ease: "power3.out",
            scrollTrigger: { trigger: reel, start: "top 92%", once: true },
          });
        });

        gsap.from(".smp-services li", {
          x: compact ? 12 : 24,
          duration: .48,
          stagger: .08,
          ease: "power3.out",
          scrollTrigger: { trigger: ".smp-services", start: "top 78%", once: true },
        });
      }, page);
      return () => context.revert();
    });

    return () => media.revert();
  }, []);

  return null;
}
