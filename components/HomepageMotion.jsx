"use client";

import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(Draggable, DrawSVGPlugin, MotionPathPlugin, ScrollSmoother, ScrollTrigger, SplitText, TextPlugin);

export default function HomepageMotion() {
  useLayoutEffect(() => {
    const page = document.querySelector('[data-cms-page="homepage"]');

    if (!page) {
      return undefined;
    }

    const media = gsap.matchMedia();
    const cleanup = [];
    let started = false;
    const previousScrollRestoration = window.history.scrollRestoration;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
      cleanup.push(() => {
        window.history.scrollRestoration = previousScrollRestoration;
      });
    }

    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }

    const startMotion = () => {
      if (started) {
        return;
      }
      started = true;

      media.add("(prefers-reduced-motion: no-preference)", () => {
        document.documentElement.classList.add("gsap-enhanced");
        ScrollTrigger.clearScrollMemory("manual");

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
        }, 0.53);

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

      const aboutCard = page.querySelector(".about-story-card");
      const aboutCopy = page.querySelector("[data-about-copy]");
      const aboutCta = page.querySelector("[data-about-cta]");
      const aboutCtaArrow = aboutCta?.querySelector(".about-cta-arrow");
      const remixRail = page.querySelector("[data-about-rail]");
      const remixPlayhead = page.querySelector("[data-about-playhead]");
      let aboutSplit;
      let remixDraggable;
      let remixAutoplay;
      let remixRestart;
      let removeAboutListeners = () => {};

      if (aboutCard && aboutCopy && remixRail && remixPlayhead) {
        aboutSplit = SplitText.create(aboutCopy, {
          type: "words",
          wordsClass: "about-copy-word",
        });

        const keywords = [
          aboutCopy.querySelector(".text-primary"),
          aboutCopy.querySelector(".text-pink-500"),
          aboutCopy.querySelector(".text-yellow-500"),
        ].filter(Boolean);
        const keywordNames = ["Heart", "Creativity", "Storytelling"];
        let activeKeyword = -1;

        const remixCopy = () => {
          gsap.fromTo(aboutSplit.words, {
            yPercent: (index) => index % 2 === 0 ? 42 : -34,
            rotation: (index) => index % 3 === 0 ? -3 : 2,
            autoAlpha: 0.2,
          }, {
            yPercent: 0,
            rotation: 0,
            autoAlpha: 1,
            duration: 0.52,
            stagger: 0.018,
            ease: "expo.out",
            overwrite: true,
          });
        };

        const activateKeyword = (index) => {
          const nextIndex = Math.max(0, Math.min(keywords.length - 1, index));
          if (nextIndex === activeKeyword || !keywords[nextIndex]) {
            return;
          }
          activeKeyword = nextIndex;

          remixPlayhead.setAttribute("aria-valuenow", String(nextIndex));
          remixPlayhead.setAttribute("aria-label", `Creative timeline: ${keywordNames[nextIndex]}`);
          gsap.to(keywords, {
            y: 0,
            scale: 1,
            rotation: 0,
            duration: 0.22,
            ease: "power2.out",
            overwrite: true,
          });
          gsap.timeline()
            .to(keywords[nextIndex], {
              y: -7,
              scale: 1.11,
              rotation: nextIndex === 1 ? 2 : -2,
              duration: 0.28,
              ease: "expo.out",
            })
            .to(keywords[nextIndex], {
              y: 0,
              scale: 1,
              rotation: 0,
              duration: 0.42,
              ease: "power2.out",
            });
        };

        const getMaxX = () => Math.max(0, remixRail.clientWidth - remixPlayhead.offsetWidth);
        const updateFromPosition = (x) => {
          const progress = getMaxX() ? gsap.utils.clamp(0, 1, x / getMaxX()) : 0;
          activateKeyword(Math.min(2, Math.floor(progress * 3)));
        };

        const startRemixAutoplay = () => {
          remixAutoplay?.kill();
          const currentX = Number(gsap.getProperty(remixPlayhead, "x")) || 0;
          const destination = currentX > getMaxX() / 2 ? 0 : getMaxX();
          remixAutoplay = gsap.to(remixPlayhead, {
            x: destination,
            duration: 4.8,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            onUpdate: () => updateFromPosition(Number(gsap.getProperty(remixPlayhead, "x")) || 0),
          });
        };

        [remixDraggable] = Draggable.create(remixPlayhead, {
          type: "x",
          bounds: { minX: 0, maxX: getMaxX() },
          cursor: "grab",
          activeCursor: "grabbing",
          onPress() {
            remixAutoplay?.kill();
            remixRestart?.kill();
          },
          onDrag() {
            updateFromPosition(this.x);
          },
          onRelease() {
            remixRestart = gsap.delayedCall(0.8, startRemixAutoplay);
          },
        });

        const handleAboutPointer = () => remixCopy();
        const handleCtaEnter = () => {
          remixCopy();
          gsap.to(aboutCtaArrow, { x: 10, duration: 0.25, ease: "expo.out" });
        };
        const handleCtaLeave = () => {
          gsap.to(aboutCtaArrow, { x: 0, duration: 0.32, ease: "expo.out" });
        };
        const handlePlayheadKeydown = (event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
            return;
          }
          event.preventDefault();
          remixAutoplay?.kill();
          remixRestart?.kill();
          const direction = event.key === "ArrowRight" ? 1 : -1;
          const nextIndex = gsap.utils.clamp(0, 2, activeKeyword + direction);
          activateKeyword(nextIndex);
          gsap.to(remixPlayhead, {
            x: getMaxX() * (nextIndex / 2),
            duration: 0.38,
            ease: "expo.out",
          });
          remixRestart = gsap.delayedCall(1.4, startRemixAutoplay);
        };
        const handleRemixResize = () => {
          const progress = activeKeyword < 0 ? 0 : activeKeyword / 2;
          remixDraggable.applyBounds({ minX: 0, maxX: getMaxX() });
          gsap.set(remixPlayhead, { x: getMaxX() * progress });
          startRemixAutoplay();
        };

        aboutCard.addEventListener("pointerenter", handleAboutPointer);
        aboutCta?.addEventListener("focus", handleCtaEnter);
        aboutCta?.addEventListener("pointerenter", handleCtaEnter);
        aboutCta?.addEventListener("pointerleave", handleCtaLeave);
        remixPlayhead.addEventListener("keydown", handlePlayheadKeydown);
        window.addEventListener("resize", handleRemixResize);

        removeAboutListeners = () => {
          aboutCard.removeEventListener("pointerenter", handleAboutPointer);
          aboutCta?.removeEventListener("focus", handleCtaEnter);
          aboutCta?.removeEventListener("pointerenter", handleCtaEnter);
          aboutCta?.removeEventListener("pointerleave", handleCtaLeave);
          remixPlayhead.removeEventListener("keydown", handlePlayheadKeydown);
          window.removeEventListener("resize", handleRemixResize);
        };

        activateKeyword(0);
        startRemixAutoplay();
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
          removeAboutListeners();
          remixRestart?.kill();
          remixAutoplay?.kill();
          remixDraggable?.kill();
          aboutSplit?.revert();
          smoother.kill();
        };
      });
    };

    const fallbackTimer = window.setTimeout(startMotion, 450);
    const handleContentReady = () => {
      window.clearTimeout(fallbackTimer);
      startMotion();
    };
    const handleWindowLoad = () => {
      window.clearTimeout(fallbackTimer);
      startMotion();
    };

    document.addEventListener("cms:content-applied", handleContentReady, { once: true });
    window.addEventListener("load", handleWindowLoad, { once: true });
    cleanup.push(() => {
      window.clearTimeout(fallbackTimer);
      document.removeEventListener("cms:content-applied", handleContentReady);
      window.removeEventListener("load", handleWindowLoad);
    });

    return () => {
      cleanup.forEach((dispose) => dispose());
      media.revert();
      document.documentElement.classList.remove("gsap-enhanced");
    };
  }, []);

  return null;
}
