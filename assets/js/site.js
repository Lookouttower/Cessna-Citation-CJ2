
document.addEventListener("DOMContentLoaded", function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const navInner = document.querySelector(".nav .nav-inner");
  const detachedToggle = document.querySelector("body > .nav-toggle");
  if (navInner && detachedToggle) navInner.appendChild(detachedToggle);

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal, .stats-bar, .cap-grid, .rev-grid, .tiers-grid, .tax-grid, .gallery-grid-v11, .partner-grid, .hours-list-grid, .summary-grid").forEach((el) => io.observe(el));

  const parseNum = (t) => { const m = t.match(/([\d.]+)/); return m ? parseFloat(m[1]) : null; };
  const statObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const finalText = el.dataset.final || el.textContent || "";
      if (!el.dataset.final) el.dataset.final = finalText;
      const num = parseNum(finalText);
      if (num == null || reduced) { el.textContent = finalText; statObs.unobserve(el); return; }
      const dur = 1400, start = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - start) / dur), eased = 1 - Math.pow(1 - p, 3), cur = num * eased;
        el.textContent = finalText.replace(/([\d.]+)/, () => finalText.includes(".") ? cur.toFixed(2) : Math.round(cur).toString());
        if (p < 1) requestAnimationFrame(step); else el.textContent = finalText;
      };
      requestAnimationFrame(step); statObs.unobserve(el);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll(".stat-num").forEach((s) => statObs.observe(s));

  document.querySelectorAll(".rev-bar > div").forEach((bar) => {
    const w = bar.style.width;
    if (w) bar.style.setProperty("--w", w);
    const grid = bar.closest(".rev-grid");
    if (grid) {
      const check = () => grid.classList.contains("visible") ? bar.classList.add("animated") : requestAnimationFrame(check);
      check();
    }
  });

  const nav = document.querySelector(".nav");
  const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 30);
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  const links = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const sectionMap = new Map();
  links.forEach((a) => sectionMap.set(a.getAttribute("href").slice(1), a));
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const link = sectionMap.get(e.target.id);
      if (link && e.isIntersecting) { links.forEach((l) => l.classList.remove("is-active")); link.classList.add("is-active"); }
    });
  }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
  sectionMap.forEach((_, id) => { const s = document.getElementById(id); if (s) sectionObs.observe(s); });

  const toggle = document.querySelector(".nav-toggle"), drawer = document.querySelector(".mobile-drawer"), backdrop = document.querySelector(".drawer-backdrop");
  const setMenu = (open) => {
    toggle && toggle.classList.toggle("open", open); drawer && drawer.classList.toggle("open", open); backdrop && backdrop.classList.toggle("open", open);
    toggle && toggle.setAttribute("aria-expanded", String(open)); document.body.style.overflow = open ? "hidden" : "";
  };
  toggle && toggle.addEventListener("click", () => setMenu(!(drawer && drawer.classList.contains("open"))));
  backdrop && backdrop.addEventListener("click", () => setMenu(false));
  drawer && drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  const cards = Array.from(document.querySelectorAll(".gallery-grid-v11 .gallery-card"));
  const lightbox = document.getElementById("galleryLightbox"), lbImg = lightbox && lightbox.querySelector("img");
  const closeBtn = document.querySelector(".gallery-close"), prevBtn = document.querySelector(".gallery-nav.prev"), nextBtn = document.querySelector(".gallery-nav.next");
  let currentIdx = -1;
  const openAt = (i) => {
    if (!lightbox || !lbImg || !cards[i]) return;
    currentIdx = i; const c = cards[i]; lbImg.src = c.dataset.full || ""; lbImg.alt = c.getAttribute("aria-label") || "Aircraft gallery image";
    lightbox.classList.add("open"); lightbox.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; document.body.classList.add("lb-open");
  };
  const close = () => { if (!lightbox) return; lightbox.classList.remove("open"); lightbox.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; document.body.classList.remove("lb-open"); currentIdx = -1; };
  const shift = (d) => { if (currentIdx >= 0) openAt((currentIdx + d + cards.length) % cards.length); };
  cards.forEach((card, i) => card.addEventListener("click", (e) => { e.preventDefault(); openAt(i); }));
  closeBtn && closeBtn.addEventListener("click", close); prevBtn && prevBtn.addEventListener("click", () => shift(-1)); nextBtn && nextBtn.addEventListener("click", () => shift(1));
  lightbox && lightbox.addEventListener("click", (e) => { if (e.target === lightbox) close(); });
  document.addEventListener("keydown", (e) => { if (!lightbox || !lightbox.classList.contains("open")) return; if (e.key === "Escape") close(); else if (e.key === "ArrowLeft") shift(-1); else if (e.key === "ArrowRight") shift(1); });

  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const href = a.getAttribute("href") || ""; if (href.length < 2) return; const target = document.querySelector(href); if (!target) return;
    e.preventDefault(); const y = target.getBoundingClientRect().top + window.scrollY - ((nav && nav.offsetHeight) || 80) + 1;
    window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
  }));
});
