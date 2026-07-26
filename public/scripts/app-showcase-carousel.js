(function () {
  var carousel = document.querySelector('[data-showcase-carousel]');
  if (!carousel) return;
  var step = function () { return Math.max(280, carousel.querySelector('.showcase-slide')?.getBoundingClientRect().width || 0) + 28; };
  var move = function (direction) { carousel.scrollBy({ left: direction * step(), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); };
  document.querySelector('[data-carousel-prev]')?.addEventListener('click', function () { move(-1); });
  document.querySelector('[data-carousel-next]')?.addEventListener('click', function () { move(1); });
  carousel.addEventListener('keydown', function (event) { if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); } if (event.key === 'ArrowRight') { event.preventDefault(); move(1); } });
}());
