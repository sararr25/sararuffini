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

  const embedUrl = instagramEmbedUrl(url);

  return embedUrl ? (
    <iframe
      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      allowFullScreen
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      src={embedUrl}
      title="Instagram reel"
    />
  ) : (
    <div className="social-reel-placeholder"><span>{placeholderLabel}</span></div>
  );
}

function instagramEmbedUrl(value) {
  try {
    const url = new URL(value.trim());
    const match = url.pathname.match(/^\/(reel|p|tv)\/([^/]+)/i);
    return match ? `https://www.instagram.com/${match[1]}/${match[2]}/embed/captioned/` : "";
  } catch {
    return "";
  }
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
        <div>
          <p className="social-section-label">Selected social work</p>
          <h2 id="social-work-heading">{reels.length} reels, built to be watched.</h2>
        </div>
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
                {reel.reel_url ? (
                  <a
                    className="social-reel-open"
                    href={reel.reel_url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open on Instagram <span aria-hidden="true">↗</span>
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
