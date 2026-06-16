"use client";

import { useRef } from "react";

function ReelEmbed({ url, placeholderLabel }) {
  if (!url?.trim()) {
    return (
      <div className="social-reel-placeholder">
        <span>{placeholderLabel}</span>
      </div>
    );
  }

  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={url.trim()}
      data-instgrm-version="14"
    >
      <a href={url.trim()}>View this reel on Instagram</a>
    </blockquote>
  );
}

export default function SocialMediaReels({ reels, placeholderLabel }) {
  const reelsViewportRef = useRef(null);

  function scrollReels(direction) {
    const viewport = reelsViewportRef.current;
    if (!viewport) {
      return;
    }

    const card = viewport.querySelector(".social-reel-card");
    const step = card ? card.offsetWidth + 30 : 285;

    viewport.scrollBy({
      left: direction * step,
      behavior: "smooth",
    });
  }

  return (
    <>
      <div className="drops-heading">
        <h2 id="social-work-heading">Work</h2>
        <div className="drop-arrows" aria-label="Scroll reels">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollReels(-1)}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollReels(1)}
          >
            →
          </button>
        </div>
      </div>

      <div className="social-reels-viewport" ref={reelsViewportRef}>
        <div className="drop-track social-reels-grid">
          {reels.map((reel, index) => (
            <article
              className="drop-wrap social-reel-card"
              key={`${reel.client || "reel"}-${index}`}
            >
              <div className="drop-card social-reel-frame">
                <ReelEmbed
                  url={reel.reel_url}
                  placeholderLabel={placeholderLabel}
                />
                <div className="drop-caption social-reel-details">
                  <strong>{reel.client}</strong>
                  <span>{reel.role}</span>
                  <small>{reel.platform}</small>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
