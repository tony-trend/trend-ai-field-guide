/* Trend Field Guide — minimal page behaviors
   Keep this intentionally small. No frameworks, no build step.
   Adds: scroll progress bar, sticky-header state, nav section highlight,
   subtle reveal-on-scroll for key elements. */

(() => {
  const doc = document.documentElement;
  const body = document.body;

  /* ------- Scroll progress bar ------- */
  const progress = document.getElementById('progress');
  const updateProgress = () => {
    const h = doc.scrollHeight - doc.clientHeight;
    const p = h > 0 ? (window.scrollY / h) * 100 : 0;
    progress.style.width = p + '%';
  };

  /* ------- Sticky header state ------- */
  const header = document.getElementById('header');
  const updateHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  /* ------- Nav section highlight ------- */
  const navLinks = Array.from(document.querySelectorAll('.site-nav a'));
  const targets = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  let activeIndex = -1;
  const setActive = (idx) => {
    if (idx === activeIndex) return;
    navLinks.forEach(l => l.classList.remove('is-active'));
    if (idx >= 0 && navLinks[idx]) navLinks[idx].classList.add('is-active');
    activeIndex = idx;
  };

  const updateActiveNav = () => {
    if (!targets.length) return;
    const scrollMidline = window.scrollY + window.innerHeight * 0.22;
    let current = -1;
    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      if (t.offsetTop <= scrollMidline) current = i;
    }
    setActive(current);
  };

  /* ------- Reveal on scroll (respects reduced-motion) ------- */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced && 'IntersectionObserver' in window) {
    const revealSelector = [
      '.hero .display', '.hero .lede', '.hero .meta-row', '.stack-diagram',
      '.toc-list',
      '.section-head', '.layers', '.compare', '.callout', '.media',
      '.flow', '.split', '.spectrum', '.cards',
      '.table-wrap', '.aside', '.use-grid', '.risk-list',
      '.split-panel', '.pullquote', '.now-next',
      '.principle', '.glossary'
    ].join(',');
    const revealEls = document.querySelectorAll(revealSelector);
    revealEls.forEach(el => el.classList.add('reveal'));

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    revealEls.forEach(el => io.observe(el));
  }

  /* ------- rAF batching for scroll handlers ------- */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateProgress();
      updateHeader();
      updateActiveNav();
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ------- Glossary: close siblings when one opens (nicer UX) ------- */
  const glossaryDetails = document.querySelectorAll('.glossary-item details');
  glossaryDetails.forEach(d => {
    d.addEventListener('toggle', () => {
      if (!d.open) return;
      glossaryDetails.forEach(other => {
        if (other !== d && other.open) other.open = false;
      });
    });
  });

  /* ------- Click-to-play video embeds -------
     Keeps YouTube's scripts out of the page until someone engages.
     Replaces the branded thumbnail with a nocookie iframe + autoplay. */
  const mediaFrames = document.querySelectorAll('.media-frame[data-video-id]');
  mediaFrames.forEach(frame => {
    const play = () => {
      const id = frame.dataset.videoId;
      const title = frame.dataset.videoTitle || 'Embedded video';
      if (!id) return;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
      iframe.title = title;
      iframe.loading = 'lazy';
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      iframe.setAttribute('allowfullscreen', '');
      frame.innerHTML = '';
      frame.appendChild(iframe);
      // Neutralize button semantics now that the video is playing
      frame.removeAttribute('role');
      frame.removeAttribute('tabindex');
      frame.removeAttribute('aria-label');
      frame.style.cursor = 'default';
      frame.classList.add('is-playing');
    };
    frame.addEventListener('click', play);
    frame.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        play();
      }
    });
  });

  /* ------- Stack-node preview popover -------
     Grokipedia blocks iframe embedding, so we show a short curated
     summary in a fixed-position modal with a button to open the full page. */
  const preview = document.getElementById('preview');
  if (preview) {
    const previewTerm = document.getElementById('preview-term');
    const previewSummary = document.getElementById('preview-summary');
    const previewLink = document.getElementById('preview-link');
    const previewClose = preview.querySelector('.preview-close');
    const previewScrim = preview.querySelector('.preview-scrim');

    const isOpen = () => preview.dataset.open === 'true';

    const openPreview = ({ term, summary, url }) => {
      previewTerm.textContent = term;
      previewSummary.textContent = summary;
      previewLink.href = url;
      preview.dataset.open = 'true';
      preview.setAttribute('aria-hidden', 'false');
      try { previewClose?.focus({ preventScroll: true }); } catch {}
    };

    const closePreview = () => {
      preview.dataset.open = 'false';
      preview.setAttribute('aria-hidden', 'true');
    };

    previewScrim?.addEventListener('click', closePreview);
    previewClose?.addEventListener('click', closePreview);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) closePreview();
    });

    document.querySelectorAll('.stack-node__link, .layer__link').forEach(link => {
      link.addEventListener('click', (e) => {
        // Let users open in a new tab with modifier keys / middle click
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
        const term = link.dataset.previewTerm;
        const summary = link.dataset.previewSummary;
        if (!term || !summary) return; // no data — fall through to default nav
        e.preventDefault();
        openPreview({ term, summary, url: link.href });
      });
    });
  }
})();
