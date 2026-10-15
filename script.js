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
    if (reducedMotion) intro.querySelector('svg')?.pauseAnimations?.();
    let introClosed = false;
    let introTimer = 0;
    let fallbackRouteStarted = false;
    const fallbackMotions = [...intro.querySelectorAll('.intro-route-motion')];
    let fallbackMotionsRemaining = 0;
    const startFallbackRoute = () => {
      if (fallbackRouteStarted || introClosed || intro.classList.contains('webgl-ready')) return;
      window.clearTimeout(introTimer);
      introTimer = 0;
      fallbackRouteStarted = true;
      const canAnimate = fallbackMotions.length && fallbackMotions.every((motion) => typeof motion.beginElement === 'function');
      if (canAnimate) {
        fallbackMotionsRemaining = fallbackMotions.length;
        fallbackMotions.forEach((motion) => motion.beginElement());
      } else {
        introTimer = window.setTimeout(() => closeIntro(true), 1200);
      }
    };
    fallbackMotions.forEach((motion) => motion.addEventListener('endEvent', () => {
      if (fallbackRouteStarted && !intro.classList.contains('webgl-ready')) {
        fallbackMotionsRemaining -= 1;
        if (fallbackMotionsRemaining <= 0) {
          intro.classList.add('globe-focused');
          intro.dispatchEvent(new Event('intro:focus-ready'));
        }
      }
    }));
    const closeIntro = (focusSettled = false) => {
      if (introClosed) return;
      introClosed = true;
      window.clearTimeout(introTimer);
      const globe = intro.querySelector('.intro-globe')?.getBoundingClientRect();
      const focus = intro.classList.contains('webgl-ready')
        ? globe
        : intro.querySelector('.focus-ring')?.getBoundingClientRect() || globe;
      if (focus) {
        const bounds = intro.getBoundingClientRect();
        intro.style.setProperty('--portal-x', `${((focus.left + focus.width / 2 - bounds.left) / bounds.width) * 100}%`);
        intro.style.setProperty('--portal-y', `${((focus.top + focus.height / 2 - bounds.top) / bounds.height) * 100}%`);
      }
      intro.dispatchEvent(new CustomEvent('intro:zoom', { detail: { focusSettled } }));
      intro.classList.add('is-leaving');
      window.setTimeout(() => {
        intro.dispatchEvent(new Event('intro:dispose'));
        intro.remove();
      }, 1850);
    };
    intro.addEventListener('intro:focus-ready', () => {
      const label = intro.querySelector('.loading-status-label');
      if (label) label.textContent = 'OPENING PORTFOLIO';
      closeIntro(true);
    }, { once: true });
    if (!reducedMotion && window.createIntroGlobe) {
      const loadLibrary = (url) => new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => { script.remove(); resolve(false); };
        document.head.append(script);
      });
      Promise.all([
        loadLibrary('https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.min.js'),
        loadLibrary('https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js')
      ]).then(([threeReady, gsapReady]) => {
        if (!intro.isConnected || introClosed || fallbackRouteStarted) return;
        const globe = threeReady && gsapReady ? window.createIntroGlobe(intro, window.gsap) : null;
        if (!globe) {
          startFallbackRoute();
        } else {
          window.clearTimeout(introTimer);
        }
      });
      introTimer = window.setTimeout(() => startFallbackRoute(), 850);
    } else {
      introTimer = window.setTimeout(() => closeIntro(), 250);
    }
    enterIntro?.addEventListener('click', () => closeIntro());
    intro.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeIntro();
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

  const terminalCommand = document.getElementById('terminal-command');
  const terminalOutput = document.getElementById('terminal-output');
  const terminalToggle = document.getElementById('terminal-toggle');
  const terminalNext = document.getElementById('terminal-next');
  const profileDetails = [
    { command: 'whoami', output: 'Akhil V. | IT Support & ADHICS-aligned' },
    { command: 'experience --current', output: 'MRV Tech Computer | Network & IT Support | Jul 2025 — Present' },
    { command: 'experience --previous', output: 'Athena Global Education | LMS & Application Support' },
    { command: 'focus --network', output: 'DNS · DHCP · IP addressing · LAN/WAN · VPN support' },
    { command: 'audit --impact', output: '50+ facility-level ADHICS assessments supported' },
    { command: 'education --latest', output: 'MCA | Kerala University | 2022 | First Class' },
    { command: 'status --availability', output: 'Available immediately | Abu Dhabi, UAE' }
  ];
  let terminalIndex = 0;
  let terminalPaused = false;
  let terminalTimer = 0;

  const clearTerminalTimer = () => {
    window.clearTimeout(terminalTimer);
    terminalTimer = 0;
  };

  const typeTerminalText = (element, value, speed, done) => {
    let position = 0;
    element.textContent = '';
    const typeNext = () => {
      if (terminalPaused) return;
      position += 1;
      element.textContent = value.slice(0, position);
      if (position < value.length) terminalTimer = window.setTimeout(typeNext, speed);
      else if (done) done();
    };
    typeNext();
  };

  const showProfileDetail = (index) => {
    if (!terminalCommand || !terminalOutput) return;
    clearTerminalTimer();
    terminalIndex = (index + profileDetails.length) % profileDetails.length;
    const detail = profileDetails[terminalIndex];
    if (reducedMotion || terminalPaused) {
      terminalCommand.textContent = detail.command;
      terminalOutput.textContent = detail.output;
      return;
    }
    typeTerminalText(terminalCommand, detail.command, 23, () => {
      terminalTimer = window.setTimeout(() => {
        typeTerminalText(terminalOutput, detail.output, 17, () => {
          terminalTimer = window.setTimeout(() => showProfileDetail(terminalIndex + 1), 2500);
        });
      }, 220);
    });
  };

  if (reducedMotion && terminalToggle) terminalToggle.hidden = true;
  showProfileDetail(0);
  terminalToggle?.addEventListener('click', () => {
    terminalPaused = !terminalPaused;
    terminalToggle.textContent = terminalPaused ? '▶' : 'Ⅱ';
    terminalToggle.setAttribute('aria-label', terminalPaused ? 'Resume automatic profile details' : 'Pause automatic profile details');
    if (terminalPaused) showProfileDetail(terminalIndex);
    else showProfileDetail(terminalIndex);
  });
  terminalNext?.addEventListener('click', () => showProfileDetail(terminalIndex + 1));
})();
