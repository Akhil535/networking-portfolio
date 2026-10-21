(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  const themeLabel = document.querySelector('.theme-label');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.classList.add('js-enabled');

  const intro = document.querySelector('#intro-loader');
  const enterIntro = document.querySelector('#intro-enter');
  if (intro) {
    const greeting = document.querySelector('#intro-greeting');
    const hour = new Date().getHours();
    const timeGreeting = hour >= 5 && hour < 12 ? 'Good morning' : hour >= 12 && hour < 17 ? 'Good afternoon' : 'Good evening';
    if (greeting) greeting.textContent = `${timeGreeting}, Akhil.`;
    let introClosed = false;
    let introTimer = 0;
    const closeIntro = () => {
      if (introClosed) return;
      introClosed = true;
      window.clearTimeout(introTimer);
      if (reducedMotion) intro.style.transitionDuration = '0.01ms';
      intro.classList.add('is-leaving');
      window.setTimeout(() => {
        intro.remove();
      }, reducedMotion ? 40 : 620);
    };
    introTimer = window.setTimeout(() => closeIntro(), reducedMotion ? 900 : 1850);
    enterIntro?.addEventListener('click', () => closeIntro());
    intro.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        window.clearTimeout(introTimer);
        closeIntro();
      }
    });
  }

  const setTheme = (theme, persist = true) => {
    root.dataset.theme = theme;
    const light = theme === 'light';
    themeButton?.setAttribute('aria-label', `Switch to ${light ? 'dark' : 'light'} mode`);
    themeButton?.setAttribute('aria-pressed', String(light));
    if (themeLabel) themeLabel.textContent = light ? 'LIGHT' : 'DARK';
    themeMeta?.setAttribute('content', light ? '#eaf2f5' : '#08111b');
    if (!persist) return;
    try { localStorage.setItem('akhil-network-portfolio-theme', theme); } catch (_) { /* Theme still works if storage is unavailable. */ }
  };

  try {
    setTheme(localStorage.getItem('akhil-network-portfolio-theme') === 'light' ? 'light' : 'dark', false);
  } catch (_) {
    setTheme('dark', false);
  }
  themeButton?.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  if (menuButton && nav) {
    const closeMenu = () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      nav.classList.remove('is-open');
    };
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      nav.classList.toggle('is-open', open);
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
    document.addEventListener('click', (event) => {
      if (!nav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
    const desktop = window.matchMedia('(min-width: 1101px)');
    const syncMenu = () => { if (desktop.matches) closeMenu(); };
    if (desktop.addEventListener) desktop.addEventListener('change', syncMenu);
    else desktop.addListener(syncMenu);
  }

  const progress = document.querySelector('.scroll-line span');
  let progressQueued = false;
  const updateProgress = () => {
    if (!progress || progressQueued) return;
    progressQueued = true;
    window.requestAnimationFrame(() => {
      const range = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${range > 0 ? Math.min(100, window.scrollY / range * 100) : 0}%`;
      progressQueued = false;
    });
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();

  const revealItems = [...document.querySelectorAll('.reveal')];
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -28px 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  if ('IntersectionObserver' in window) {
    const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.classList.toggle('is-active', link.hash === `#${entry.target.id}`));
      });
    }, { rootMargin: '-28% 0px -62% 0px' });
    document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));
  }

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const form = document.getElementById('contact-form');
  const formNote = document.getElementById('form-note');
  const emailAddress = document.querySelector('.contact-email')?.getAttribute('href')?.replace(/^mailto:/, '') || 'akhiljithu1999@gmail.com';
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();
    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nReply to: ${email}`);
    if (formNote) formNote.textContent = `Opening your email application to prepare a message for ${emailAddress}.`;
    window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
  });

})();
