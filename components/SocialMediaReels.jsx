"use client";

import { useRef } from "react";

function ReelCard({ reel, index }) {
  return (
    <a
      className={`smp-reel smp-reel--${(index % 4) + 1}`}
      href={reel.reel_url}
      rel="noreferrer"
      target="_blank"
    >
      <img alt={`${reel.account} reel preview`} loading="eager" src={reel.poster} />
      <span className="smp-reel__shade" aria-hidden="true" />
      <span className="smp-reel__play" aria-hidden="true">↗</span>
      <span className="smp-reel__meta">
        <small>{reel.account}</small>
        <strong>{reel.credit}</strong>
      </span>
    </a>
  );
}

export default function SocialMediaReels({ reels }) {
  const galleryRef = useRef(null);
  const scroll = (direction) => {
    const gallery = galleryRef.current;
    gallery?.scrollBy({ left: direction * Math.max(gallery.clientWidth * 0.72, 280), behavior: "smooth" });
  };

  return (
    <section className="smp-reels" aria-labelledby="smp-reels-heading">
      <header className="smp-section-heading">
        <div>
          <p className="smp-kicker">A selection of recent work</p>
          <h2 id="smp-reels-heading">Selected reels</h2>
        </div>
        <div className="smp-gallery-controls" aria-label="Browse selected reels">
          <button aria-label="Previous reels" onClick={() => scroll(-1)} type="button">←</button>
          <button aria-label="Next reels" onClick={() => scroll(1)} type="button">→</button>
        </div>
      </header>
      <div className="smp-gallery" ref={galleryRef}>
        <div className="smp-gallery__grid">
          {reels.map((reel, index) => <ReelCard index={index} key={reel.reel_url} reel={reel} />)}
        </div>
      </div>
    </section>
  );
}
