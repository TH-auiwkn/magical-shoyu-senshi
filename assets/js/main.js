(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- seeded random (同じ見た目を毎回再現) ---------- */
  const rng = (seed) => () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  /* ---------- mobile nav ---------- */
  const toggle = $('.nav-toggle');
  const gnav = $('#gnav');
  const closeNav = () => {
    gnav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.addEventListener('click', () => {
    const open = gnav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  gnav.addEventListener('click', (e) => { if (e.target.closest('a')) closeNav(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });

  /* ---------- hero sparkles ---------- */
  const sparkleBox = $('.sparkles');
  if (sparkleBox) {
    const r = rng(7);
    const glyphs = ['✦', '✧', '★', '✦', '♡'];
    const html = [];
    for (let i = 0; i < 34; i++) {
      const size = 10 + r() * 26;
      html.push(
        `<span style="left:${(r() * 100).toFixed(1)}%;top:${(r() * 92).toFixed(1)}%;font-size:${size.toFixed(0)}px;--d:${(2.2 + r() * 3.5).toFixed(2)}s;--delay:${(r() * 5).toFixed(2)}s">${glyphs[i % glyphs.length]}</span>`
      );
    }
    sparkleBox.innerHTML = html.join('');
  }

  /* ---------- soy sauce drips ---------- */
  $$('.drip').forEach((el, idx) => {
    const r = rng(11 + idx * 5);
    const W = 1200;
    const H = 100;
    let x = 0;
    let d = `M0,0 H${W} V8 `;
    const pts = [];
    while (x < W) {
      const w = 26 + r() * 46;          // しずくの幅
      const gap = 30 + r() * 90;        // しずくの間隔
      const len = 26 + r() * 68;        // しずくの長さ
      pts.push({ x, w, gap, len });
      x += w + gap;
    }
    // 右から左へ描く
    let path = '';
    let cx = W;
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      const right = Math.min(p.x + p.w, W);
      const left = p.x;
      const mid = (left + right) / 2;
      const base = 8;
      path += `L${Math.min(cx, right + 14).toFixed(1)},${base} `;
      path += `Q${right.toFixed(1)},${base} ${right.toFixed(1)},${(base + 14).toFixed(1)} `;
      path += `L${right.toFixed(1)},${(p.len - (right - left) / 2).toFixed(1)} `;
      path += `A${((right - left) / 2).toFixed(1)},${((right - left) / 2).toFixed(1)} 0 0 1 ${left.toFixed(1)},${(p.len - (right - left) / 2).toFixed(1)} `;
      path += `L${left.toFixed(1)},${(base + 14).toFixed(1)} `;
      path += `Q${left.toFixed(1)},${base} ${Math.max(left - 14, 0).toFixed(1)},${base} `;
      cx = left - 14;
      void mid;
    }
    d += path + 'L0,8 Z';
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}"/></svg>`;
  });

  /* ---------- scroll reveal ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ---------- 表情集：気分を切り替えても表情は変わらない ---------- */
  const faceImg = $('#faceImg');
  const facePhoto = $('.face-photo');
  const faceMood = $('#faceMood');
  const faceScene = $('#faceScene');
  const faceCount = $('#faceCount');
  let switched = 0;
  $$('.mood').forEach((btn) => {
    btn.setAttribute('aria-pressed', btn.classList.contains('is-active') ? 'true' : 'false');
    btn.addEventListener('click', () => {
      $$('.mood').forEach((b) => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      faceImg.src = `assets/img/${btn.dataset.img}.webp`;
      faceMood.textContent = btn.dataset.mood;
      faceScene.textContent = btn.dataset.scene;
      faceCount.textContent = String(++switched);
      facePhoto.classList.remove('is-switching');
      void facePhoto.offsetWidth; // アニメーションを再生し直す
      facePhoto.classList.add('is-switching');
    });
  });

  /* ---------- 必殺技：技名を叫ぶ ---------- */
  const shout = $('#shout');
  const shoutName = $('#shoutName');
  const shoutDisplayTime = 2400;
  let shoutAudio;
  let shoutTimer = 0;
  const hideShout = () => {
    shout.hidden = true;
    clearTimeout(shoutTimer);
    shoutAudio?.pause();
    shoutAudio = undefined;
  };
  $$('.shout-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      hideShout();
      const { shout: name, shoutAudio: file } = btn.closest('[data-shout]').dataset;
      // 記号の位置で改行して、描き文字らしく2段に組む
      const parts = name.split(/(?<=[☆♡])/);
      shoutName.innerHTML = '';
      parts.forEach((p, i) => {
        const line = document.createElement('span');
        line.textContent = i === parts.length - 1 ? `${p}!!` : p;
        shoutName.appendChild(line);
      });
      void shout.offsetWidth;
      shout.hidden = false;

      const voice = window.shoutVoices?.[file];
      if (!voice) {
        shoutTimer = setTimeout(hideShout, shoutDisplayTime);
        return;
      }

      const audio = new Audio(voice);
      shoutAudio = audio;
      const shownAt = performance.now();
      const closeAfterDisplay = () => {
        if (shoutAudio !== audio) return;
        clearTimeout(shoutTimer);
        const remaining = Math.max(0, shoutDisplayTime - (performance.now() - shownAt));
        shoutTimer = setTimeout(hideShout, remaining);
      };
      audio.addEventListener('ended', closeAfterDisplay, { once: true });
      audio.addEventListener('error', closeAfterDisplay, { once: true });
      audio.play().catch(closeAfterDisplay);
    });
  });
  shout.addEventListener('click', hideShout);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideShout(); });

  /* ---------- 本編：エピソードへのリンク ---------- */
  const openEpisode = (hash) => {
    const episode = document.getElementById(hash.slice(1));
    if (episode?.matches('details.episode')) episode.open = true;
  };
  openEpisode(window.location.hash);
  window.addEventListener('hashchange', () => openEpisode(window.location.hash));
  $$('a[href^="#episode-"]').forEach((link) => {
    link.addEventListener('click', () => openEpisode(link.hash));
  });

  /* ---------- 本編：拡大表示 ---------- */
  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbCount = $('#lbCount');
  const prevPage = $('.lb-prev', lb);
  const nextPage = $('.lb-next', lb);
  let pages = [];
  let current = 0;
  const show = (i) => {
    current = Math.max(0, Math.min(pages.length - 1, i));
    const img = $('img', pages[current]);
    lbImg.src = img.getAttribute('src');
    lbImg.alt = img.alt;
    lbCount.textContent = `${current + 1} / ${pages.length}`;
    prevPage.disabled = current === 0;
    nextPage.disabled = current === pages.length - 1;
  };
  $$('.episode .pages').forEach((pageList) => {
    const episodePages = $$('.page', pageList);
    episodePages.forEach((page, index) => page.addEventListener('click', () => {
      pages = episodePages;
      show(index);
      if (typeof lb.showModal === 'function') lb.showModal();
    }));
  });
  $('.lb-close', lb).addEventListener('click', () => lb.close());
  prevPage.addEventListener('click', () => show(current - 1));
  nextPage.addEventListener('click', () => show(current + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
})();
