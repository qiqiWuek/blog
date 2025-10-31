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

    function placeTOC() {
      const hero = document.querySelector('.hero-banner') || document.querySelector('.hero-plain');

      // 计算横幅底部，top 改动保持原逻辑
      let top = 90;
      if (hero) top = hero.getBoundingClientRect().bottom + 12;

      // 固定在页面左沿，不再随正文居中
      const left = 20; // ← 你可以改成 0, 10, 20，看想离屏幕边多近

      bubble.style.top = `${Math.round(top)}px`;
      bubble.style.left = `${left}px`;
    }
  window.addEventListener('load',   placeTOC);
  window.addEventListener('resize', placeTOC);
  window.addEventListener('scroll', () => { if (window.scrollY < 200) placeTOC(); });

})();