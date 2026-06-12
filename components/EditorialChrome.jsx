const links = [
  ["Work", "/pages/projects"],
  ["Process", "/social-media-strategy"],
  ["About", "/pages/about"],
  ["Contact", "/pages/contact"],
];

export function EditorialNav({ active = "Work", hireTone = "cyan" }) {
  return (
    <nav className="editorial-nav">
      <a className="editorial-brand" href="/">Sara Ruffini</a>
      <div className="editorial-nav-links">
        {links.map(([label, href]) => (
          <a className={active === label ? "is-active" : ""} href={href} key={label}>
            {label}
          </a>
        ))}
      </div>
      <a className={`editorial-hire editorial-hire--${hireTone}`} href="/pages/contact">
        Hire me
      </a>
    </nav>
  );
}

export function EditorialFooter() {
  return (
    <footer className="editorial-footer">
      <a className="editorial-footer-brand" href="/">Sara Ruffini</a>
      <div className="editorial-socials">
        <a href="https://www.instagram.com/potuschef/" rel="noreferrer" target="_blank">Instagram</a>
        <a href="https://vimeo.com/" rel="noreferrer" target="_blank">Vimeo</a>
        <a href="https://www.linkedin.com/" rel="noreferrer" target="_blank">LinkedIn</a>
        <a href="mailto:sararuffini@gmail.com">Email</a>
      </div>
      <p>© 2026 Sara Ruffini. Made for the screen.</p>
    </footer>
  );
}
