// ===== PAGE LOAD + SCROLL REVEAL + MICRO MOTION =====

document.addEventListener("DOMContentLoaded", () => {

  // ===== PAGE LOAD FADE IN =====
  const page = document.querySelector(".page");
  const nav = document.querySelector(".nav-inner");

  // ==== NEWSLETTER height match numbers box ====
  const numbersBox = document.querySelector('.numbers-box');
  const newsletterEl = document.querySelector('.newsletter');
  function syncNewsletterHeight() {
    if (numbersBox && newsletterEl) {
      newsletterEl.style.minHeight = numbersBox.offsetHeight + 'px';
    }
  }
  syncNewsletterHeight();
  window.addEventListener('resize', syncNewsletterHeight);

  requestAnimationFrame(() => {
    page?.classList.add("is-ready");
    nav?.classList.add("is-ready");
  });

  // ===== SCROLL REVEAL =====
  const revealElements = document.querySelectorAll(
    ".top-gallery-row img, .info-card, .testimonial-card, .p-item, .newsletter, .latest-projects h2"
  );

  revealElements.forEach(el => el.classList.add("reveal"));

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  revealElements.forEach(el => observer.observe(el));

  // ===== NUMBER COUNT ANIMATION =====
  const numbers = document.querySelectorAll(".number-value");

  const numberObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = +el.dataset.target;
      const duration = 1600;
      const startTime = performance.now();

      function animate(time) {
        const progress = Math.min((time - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(animate);
      }

      requestAnimationFrame(animate);
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });

  numbers.forEach(n => numberObserver.observe(n));

});

// ===== SIMPLE AUTO CAROUSEL =====
const track = document.getElementById("carousel-track");

if (track) {
  let position = 0;

  function animate() {
    position -= 0.5;
    if (Math.abs(position) >= track.scrollWidth / 2) {
      position = 0;
    }
    track.style.transform = `translateX(${position}px)`;
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

const numbersBox = document.querySelector('.numbers-box');
const newsletterEl = document.querySelector('.newsletter');
if (numbersBox && newsletterEl) {
  const h = numbersBox.offsetHeight;
  newsletterEl.style.minHeight = h + 'px';
}
