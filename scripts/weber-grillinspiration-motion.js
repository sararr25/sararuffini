(function () {
  function initWeberMotion() {
    var page = document.querySelector('[data-cms-page="weber-grillinspiration"]');
    if (!page || !window.gsap) return;

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    if (ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    page.classList.add("weber-gsap-ready");

    var heroTimeline = gsap.timeline({ defaults: { ease: "expo.out" } });
    heroTimeline
      .from(".weber-kicker span", {
        y: 18,
        rotate: -2,
        duration: 0.5,
        stagger: 0.08,
      })
      .from(".weber-title > span", {
        yPercent: 36,
        rotate: -1.5,
        duration: 0.72,
        stagger: 0.09,
      }, 0.08)
      .from(".weber-hero__summary", {
        y: 24,
        duration: 0.58,
      }, 0.35)
      .from(".weber-hero__meta span", {
        y: 12,
        duration: 0.45,
        stagger: 0.08,
      }, 0.46)
      .from(".weber-hero__media-wrap", {
        y: 42,
        rotate: -1.5,
        duration: 0.8,
      }, 0.18);

    if (ScrollTrigger) {
      gsap.to(".weber-media--hero .weber-media__image", {
        yPercent: -7,
        scale: 1.05,
        ease: "none",
        scrollTrigger: {
          trigger: ".weber-hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      });

      gsap.from(".weber-overview", {
        y: 34,
        autoAlpha: 0,
        duration: 0.7,
        ease: "expo.out",
        scrollTrigger: {
          trigger: ".weber-overview",
          start: "top 82%",
          once: true,
        },
      });

      gsap.from(".weber-video-list__header", {
        y: 26,
        autoAlpha: 0,
        duration: 0.62,
        ease: "expo.out",
        scrollTrigger: {
          trigger: ".weber-video-list",
          start: "top 82%",
          once: true,
        },
      });

      gsap.utils.toArray(".weber-project").forEach(function (project) {
        var media = project.querySelector(".weber-media");
        var copy = project.querySelector(".weber-project__copy");
        var number = project.querySelector(".weber-project__number");

        gsap.from([number, media, copy].filter(Boolean), {
          y: 38,
          autoAlpha: 0,
          rotate: function (index) { return index === 1 ? -0.8 : 0; },
          duration: 0.72,
          stagger: 0.1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: project,
            start: "top 78%",
            once: true,
          },
        });

        if (media) {
          gsap.to(media, {
            y: -16,
            ease: "none",
            scrollTrigger: {
              trigger: project,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          });
        }
      });

      gsap.from(".weber-closing p", {
        y: 24,
        autoAlpha: 0,
        duration: 0.65,
        ease: "expo.out",
        scrollTrigger: {
          trigger: ".weber-closing",
          start: "top 86%",
          once: true,
        },
      });
    }

    window.addEventListener("load", function () {
      if (ScrollTrigger) ScrollTrigger.refresh();
    }, { once: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWeberMotion);
  } else {
    initWeberMotion();
  }
}());
