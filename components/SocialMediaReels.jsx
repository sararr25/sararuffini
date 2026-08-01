"use client";

import { useRef } from "react";

function instagramEmbedUrl(value) {
  try {
    const url = new URL(value.trim());
    const match = url.pathname.match(/^\/(reel|p|tv)\/([^/]+)/i);
    return match ? `https://www.instagram.com/${match[1]}/${match[2]}/embed/captioned/` : "";
  } catch {
    return "";
  }
}

function ReelCard({ reel, account, index }) {
  const embedUrl = instagramEmbedUrl(reel.reel_url || "");

  return (
    <article className="social-reel-card">
      <div className="social-reel-frame">
        {embedUrl ? (
          <iframe
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            loading={index < 3 ? "eager" : "lazy"}
            referrerPolicy="strict-origin-when-cross-origin"
            src={embedUrl}
            title={`${account} Instagram reel ${index + 1}`}
          />
        ) : <div className="social-reel-placeholder">Instagram Reel</div>}
        <div className="social-reel-details">
          <strong>{account}</strong>
          <span>{reel.credit}</span>
          <small>Instagram Reel · {String(index + 1).padStart(2, "0")}</small>
        </div>
        <a className="social-reel-open" href={reel.reel_url} rel="noreferrer" target="_blank">
          Watch reel <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}

function ReelCollection({ study }) {
  const viewportRef = useRef(null);
  const reels = study.reels || [];
  const scroll = (direction) => {
    const viewport = viewportRef.current;
    const card = viewport?.querySelector(".social-reel-card");
    viewport?.scrollBy({ left: direction * ((card?.offsetWidth || 255) + 28), behavior: "smooth" });
  };

  return (
    <section className="social-client-section" aria-labelledby={`${study.slug}-heading`}>
      <header className="social-client-heading">
        <div>
          <p className="social-section-label">Selected client</p>
          <h3 id={`${study.slug}-heading`}>{study.account}</h3>
          <p>{study.role}</p>
        </div>
        <div className="drop-arrows" aria-label={`Scroll ${study.account} reels`}>
          <button type="button" aria-label="Scroll left" onClick={() => scroll(-1)}>←</button>
          <button type="button" aria-label="Scroll right" onClick={() => scroll(1)}>→</button>
        </div>
      </header>
      <p className="social-client-summary">{study.summary}</p>
      <div className="social-reels-viewport" ref={viewportRef}>
        <div className="social-reels-track">
          {reels.map((reel, index) => <ReelCard account={study.account} index={index} key={reel.reel_url} reel={reel} />)}
        </div>
      </div>
    </section>
  );
}

export default function SocialMediaReels({ studies }) {
  return (
    <>
      <div className="drops-heading">
        <div>
          <p className="social-section-label">Portfolio</p>
          <h2 id="social-work-heading">Selected reels</h2>
        </div>
        <p className="social-work-count">{studies.reduce((total, study) => total + (study.reels?.length || 0), 0)} pieces of social-first work</p>
      </div>
      <div className="social-client-list">
        {studies.map((study) => <ReelCollection key={study.slug} study={study} />)}
      </div>
    </>
  );
}
