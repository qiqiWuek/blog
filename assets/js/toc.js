(function () {
  const headings = document.querySelectorAll('.post-body h3, .post-body h4');
  const list = document.querySelector('#toc .toc-list');
  const bubble = document.getElementById('toc');     // ✅ 只声明一次
  if (!bubble || !list) return;

  // 生成 slug
  const slug = s => s.toLowerCase()
    .replace(/<.*?>/g,'')
    .replace(/[^\w\u4e00-\u9fa5\- ]+/g,'')
    .trim().replace(/\s+/g,'-');

  // 构建目录
  headings.forEach(h => {
    if (!h.id) h.id = slug(h.textContent);
    const a = document.createElement('a');
    a.href = '#'+h.id;
    a.textContent = h.textContent;
    a.className = 'toc-item ' + (h.tagName === 'H4' ? 'lv2' : 'lv1');
    list.appendChild(a);
  });

  // 平滑滚动
  list.addEventListener('click', e => {
    const link = e.target.closest('a.toc-item');
    if (!link) return;
    e.preventDefault();
    const rawId = link.getAttribute('href').slice(1);
    const safeSel = (window.CSS && CSS.escape) ? `#${CSS.escape(rawId)}` : `#${rawId}`;
    const target = document.getElementById(rawId) || document.querySelector(safeSel);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', `#${rawId}`);
    }
  });

  // 折叠
  const toggle = bubble.querySelector('.toc-toggle');
  if (toggle) toggle.addEventListener('click', () => bubble.classList.toggle('open'));

  // 滚动高亮
  if (headings.length) {
    const obs = new IntersectionObserver(entries => {
      let activeId = null;
      entries.forEach(en => { if (en.isIntersecting) activeId = en.target.id; });
      if (activeId) {
        list.querySelectorAll('.toc-item.active').forEach(n => n.classList.remove('active'));
        const cur = list.querySelector(`.toc-item[href="#${activeId}"]`);
        if (cur) cur.classList.add('active');
      }
    }, { rootMargin: '0px 0px -70% 0px', threshold: [0,1] });
    headings.forEach(h => obs.observe(h));
  }

  // === 放到横幅底部，并与正文左缘对齐 ===
  function placeTOC() {
    // 1) top：横幅（有图）或无图标题区的“底部 + 12px”
    const hero = document.querySelector('.hero-banner') || document.querySelector('.hero-plain');
    let top = 90; // fallback
    if (hero) {
      const r = hero.getBoundingClientRect();
      top = Math.max(12, r.bottom + 12);   // fixed 定位 -> 直接用 viewport 的 bottom
    }
    bubble.style.top = `${Math.round(top)}px`;

    // 2) left：与正文容器左边缘齐
    const wrap = document.querySelector('.wrap.post') || document.querySelector('.wrap');
    if (wrap) {
      const wr = wrap.getBoundingClientRect();
      bubble.style.left = `${Math.max(8, Math.round(wr.left))}px`;
    }
  }

  window.addEventListener('load',   placeTOC);
  window.addEventListener('resize', placeTOC);
  window.addEventListener('scroll', () => { if (window.scrollY < 200) placeTOC(); });
})();