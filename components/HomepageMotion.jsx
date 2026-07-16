"use client";

import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin, ScrollSmoother, ScrollTrigger, TextPlugin);

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
          start: "top 82%",
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
        .from(".featured-scroll-hint", {
          x: -24,
          autoAlpha: 0,
          duration: 0.55,
          clearProps: "transform,opacity,visibility",
        }, 0.35);

      const featuredSection = page.querySelector(".featured-stitch-section");
      const featuredStage = page.querySelector(".featured-stitch-stage");
      const featuredTrack = page.querySelector(".featured-stitch-track");
      const motionRoute = page.querySelector(".featured-motion-route");
      const motionRouteShadow = page.querySelector(".featured-motion-route-shadow");
      const motionEcho = page.querySelector(".featured-motion-echo");
      const playhead = page.querySelector(".featured-playhead");

      if (featuredSection && featuredStage && featuredTrack && motionRoute && playhead) {
        const getTravel = () => Math.max(0, featuredTrack.scrollWidth - featuredStage.clientWidth);
        const getScrollDistance = () => Math.max(
          getTravel() * 0.82,
          window.innerHeight * 1.45,
        );

        const horizontalTimeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: featuredSection,
            start: "top top",
            end: () => `+=${getScrollDistance()}`,
            scrub: 0.7,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        horizontalTimeline
          .to(featuredTrack, {
            x: () => -getTravel(),
            duration: 1,
          }, 0)
          .fromTo([motionRouteShadow, motionRoute], {
            drawSVG: "0%",
          }, {
            drawSVG: "100%",
            duration: 1,
          }, 0)
          .fromTo(motionEcho, {
            drawSVG: "0% 0%",
          }, {
            drawSVG: "20% 100%",
            duration: 1,
          }, 0)
          .to(playhead, {
            motionPath: {
              path: motionRoute,
              align: motionRoute,
              alignOrigin: [0.5, 0.5],
              autoRotate: true,
            },
            duration: 1,
          }, 0)
          .fromTo(".featured-svg-node > *", {
            drawSVG: "0%",
          }, {
            drawSVG: "100%",
            duration: 0.68,
            stagger: 0.035,
          }, 0.08)
          .to(".featured-svg-node", {
            rotation: (index) => index % 2 === 0 ? 190 : -150,
            transformOrigin: "50% 50%",
            duration: 1,
            stagger: 0.04,
          }, 0);

        gsap.utils.toArray(".featured-stitch-track .stitch-sticker").forEach((card, index) => {
          gsap.to(card, {
            keyframes: [
              { scale: 1.075, duration: 0.5, ease: "power2.out" },
              { scale: 0.9, duration: 0.5, ease: "power2.in" },
            ],
            scrollTrigger: {
              trigger: card,
              containerAnimation: horizontalTimeline,
              start: "left 84%",
              end: "right 16%",
              scrub: true,
            },
          });

          const label = card.querySelector(".stitch-label");
          if (label) {
            gsap.to(label, {
              y: index % 2 === 0 ? -11 : 11,
              rotation: index % 2 === 0 ? 5 : -5,
              scrollTrigger: {
                trigger: card,
                containerAnimation: horizontalTimeline,
                start: "left 80%",
                end: "right 20%",
                scrub: true,
              },
            });
          }
        });
      }

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

      if (window.location.hash) {
        const hashTarget = document.getElementById(window.location.hash.slice(1));
        if (hashTarget) {
          window.requestAnimationFrame(() => {
            smoother.scrollTo(hashTarget, false, "top top");
          });
        }
      }

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
