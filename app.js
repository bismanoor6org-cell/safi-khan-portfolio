'use strict';
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let motion = !reduced.matches;
  try { const saved = localStorage.getItem('safi-motion'); if (saved !== null) motion = saved === 'on'; } catch {}
  let frame = 0;
  let visible = true;
  let sceneReady = false;
  const motionButton = document.querySelector('.motion-toggle');
  function setMotion(enabled) {
    motion = enabled;
    root.classList.toggle('motion-off', !enabled);
    motionButton.setAttribute('aria-pressed', String(enabled));
    motionButton.querySelector('span').textContent = enabled ? 'on' : 'off';
    document.querySelectorAll('[data-tilt]').forEach(e => e.style.transform = '');
    cancelAnimationFrame(frame);
    if (sceneReady) { draw(); if (enabled && visible) frame = requestAnimationFrame(animate); }
  }
  motionButton.addEventListener('click', () => {
    setMotion(!motion);
    try { localStorage.setItem('safi-motion', motion ? 'on' : 'off'); } catch {}
  });
  reduced.addEventListener('change', event => setMotion(!event.matches));
  setMotion(motion);

  if (motion && 'IntersectionObserver' in window) {
    root.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
    }), { threshold: .08 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  function closeMenu() { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); menu.setAttribute('aria-label', 'Open navigation'); }
  menu.addEventListener('click', () => {
    const isOpen = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(isOpen)); nav.classList.toggle('open', isOpen);
    menu.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  const progress = document.querySelector('.scroll-progress');
  let scrollQueued = false;
  function updateScroll() { const max = document.documentElement.scrollHeight - innerHeight; progress.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%'; scrollQueued = false; }
  addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); } }, { passive: true });
  updateScroll();
  document.querySelector('#year').textContent = new Date().getFullYear();

  const skillData = {
    business: { n: '01', title: 'Opening the right doors.', body: 'Sourcing remote projects, finding leads, and connecting with clients to bring new work opportunities to the company.', tags: ['Lead generation', 'Remote project sourcing', 'Client acquisition', 'Follow-up'] },
    tech: { n: '02', title: 'Understanding what gets built.', body: 'A Computer Science foundation and hands-on development experience help me understand the scope and language of digital projects.', tags: ['React', 'JavaScript', 'TypeScript', 'Redux', 'HTML & CSS', 'Git', 'API integration'] },
    design: { n: '03', title: 'Seeing the bigger picture.', body: 'Experience creating branding, website graphics, wireframes, and prototypes brings a visual perspective to client conversations.', tags: ['Figma', 'UI/UX', 'Photoshop', 'Illustrator', 'CorelDRAW', 'Visual branding'] }
  };
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const panel = document.querySelector('#skill-panel');
  function selectTab(tab) {
    tabs.forEach(t => { const active = t === tab; t.setAttribute('aria-selected', String(active)); t.tabIndex = active ? 0 : -1; });
    const data = skillData[tab.dataset.tab];
    panel.setAttribute('aria-labelledby', tab.id);
    panel.querySelector('.skill-number').textContent = data.n;
    panel.querySelector('h3').textContent = data.title;
    panel.querySelector('p').textContent = data.body;
    const tags = panel.querySelector('.skill-tags'); tags.replaceChildren();
    data.tags.forEach(text => { const el = document.createElement('span'); el.textContent = text; tags.append(el); });
    if (motion) panel.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 350, easing: 'ease-out' });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', e => {
      let next = index;
      if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      else return;
      e.preventDefault(); tabs[next].focus(); selectTab(tabs[next]);
    });
  });
  const projectData = {
    route: { category: 'MOBILE DEVELOPMENT / FINAL YEAR PROJECT', title: 'Route Buddy', intro: 'A ride-sharing and ride-booking mobile application developed as my final year project.', details: ['Built the Android front end with Kotlin.', 'Used Firebase for authentication and real-time data.', 'Integrated Google Maps API for live location tracking.', 'Supported ride booking and sharing with a focus on a clear, responsive interface.'], tags: ['Kotlin', 'Firebase', 'Google Maps API', 'Android'] },
    tashheer: { category: 'GRAPHIC DESIGN / WEBSCARE / MAR–JUL 2023', title: "Tash'heer Digital", intro: 'Graphic design and branding work for Tash\'heer Digital during my time at WebsCare.', details: ['Designed logos and posters for the website and marketing campaigns.', 'Created website graphics to support branding and user experience.', 'Collaborated with the marketing team on digital and print promotional materials.'], tags: ['Visual branding', 'Graphic design', 'Marketing materials'] }
  };
  const dialog = document.querySelector('#project-dialog');
  dialog.setAttribute('aria-labelledby', 'dialog-title');
  document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
    const data = projectData[button.dataset.project];
    document.querySelector('#dialog-category').textContent = data.category;
    document.querySelector('#dialog-title').textContent = data.title;
    document.querySelector('#dialog-intro').textContent = data.intro;
    const details = document.querySelector('#dialog-details'); details.replaceChildren();
    data.details.forEach(text => { const li = document.createElement('li'); li.textContent = text; details.append(li); });
    const tags = document.querySelector('#dialog-tags'); tags.replaceChildren();
    data.tags.forEach(text => { const span = document.createElement('span'); span.textContent = text; tags.append(span); });
    dialog.showModal();
  }));
  document.querySelectorAll('.dialog-close,.dialog-done').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });

  let toastTimer;
  function toast(message) { const el = document.querySelector('.toast'); el.textContent = message; el.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 3300); }
  document.querySelector('.copy-button').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('safi.khan.personal@gmail.com'); toast('Email address copied. Let’s connect.'); }
    catch { toast('Email: safi.khan.personal@gmail.com'); }
  });
  if (matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(el => {
      el.addEventListener('pointermove', e => {
        if (!motion) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(1200px) rotateX(${-y * 5}deg) rotateY(${x * 7}deg)`;
      });
      el.addEventListener('pointerleave', () => el.style.transform = '');
    });
  }

  // Perspective-projected 3D orbital geometry, with depth-aware light and occlusion.
  const canvas = document.querySelector('#scene');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const hero = document.querySelector('.hero');
  let width, height, dpr, time = 0, pointer = { x: 0, y: 0 };
  function resize() { const r = hero.getBoundingClientRect(); width = r.width; height = r.height; dpr = Math.min(devicePixelRatio || 1, 1.7); canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); if (!motion) draw(); }
  function rotate(x, y, z, a, b) { const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b); const yy = y * ca - z * sa, zz = y * sa + z * ca; return [x * cb + zz * sb, yy, -x * sb + zz * cb]; }
  function draw() {
    if (!width) return;
    ctx.clearRect(0, 0, width, height);
    const mobile = width < 541;
    const cx = width * (mobile ? .52 : .755), cy = height * (mobile ? .75 : .48);
    const radius = mobile ? width * .47 : Math.min(width * .255, 390);
    const a = .7 + Math.sin(time * .12) * .3 + pointer.y * .1;
    const b = time * .075 + pointer.x * .16;
    const focal = radius * 4;
    function project(x, y, z) { const p = rotate(x, y, z, a, b); const s = focal / (focal + p[2]); return [cx + p[0] * s, cy + p[1] * s, p[2], s]; }
    const rings = 5;
    for (let j = 0; j < rings; j++) {
      const offset = j / rings * Math.PI;
      const points = [];
      for (let i = 0; i <= 120; i++) { const t = i / 120 * Math.PI * 2; const r = radius * (.94 + j * .015); points.push(project(Math.cos(t) * r, Math.sin(t) * r * Math.cos(offset), Math.sin(t) * r * Math.sin(offset))); }
      for (let i = 1; i < points.length; i++) { const p = points[i], prev = points[i - 1]; const alpha = .055 + Math.max(0, (p[2] + radius) / (radius * 2)) * .19; ctx.strokeStyle = `rgba(201,175,122,${alpha})`; ctx.lineWidth = p[3] * .65; ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); }
      const t = time * (.17 + j * .025) + offset * 2;
      const p = project(Math.cos(t) * radius, Math.sin(t) * radius * Math.cos(offset), Math.sin(t) * radius * Math.sin(offset));
      ctx.fillStyle = 'rgba(220,196,147,.7)'; ctx.shadowColor = '#c9af7a'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(p[0], p[1], j % 2 ? 2.2 : 1.4, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    }
    for (let i = 0; i < 30; i++) { const seed = i * 137.508; const x = ((Math.sin(seed) + 1) / 2) * width; const y = ((Math.cos(seed * .7) + 1) / 2) * height; const alpha = .06 + (Math.sin(time * .4 + i) + 1) * .05; ctx.fillStyle = `rgba(211,190,142,${alpha})`; ctx.beginPath(); ctx.arc(x, y, i % 3 ? .7 : 1.3, 0, Math.PI * 2); ctx.fill(); }
  }
  let last = 0;
  function animate(timestamp) { if (!motion || !visible) return; if (!last) last = timestamp; time += Math.min(timestamp - last, 40) / 1000; last = timestamp; draw(); frame = requestAnimationFrame(animate); }
  hero.addEventListener('pointermove', e => { if (!motion) return; const r = hero.getBoundingClientRect(); pointer = { x: (e.clientX - r.left) / r.width - .5, y: (e.clientY - r.top) / r.height - .5 }; }, { passive: true });
  const sceneObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && !document.hidden; cancelAnimationFrame(frame); last = 0; if (motion && visible) frame = requestAnimationFrame(animate); });
  sceneObserver.observe(hero);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden && hero.getBoundingClientRect().bottom > 0; cancelAnimationFrame(frame); last = 0; if (motion && visible) frame = requestAnimationFrame(animate); });
  new ResizeObserver(resize).observe(hero); resize(); sceneReady = true; draw();
  if (motion) frame = requestAnimationFrame(animate);
})();
