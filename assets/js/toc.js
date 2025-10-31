(function () {
  // 1) 目标小标题：支持 h3~h6
  const headings = document.querySelectorAll('.post-body h3, .post-body h4, .post-body h5, .post-body h6');
  const bubble   = document.getElementById('toc');
  const list     = bubble ? bubble.querySelector('.toc-list') : null;
  if (!bubble || !list) return;

  // 2) 生成 slug（没 id 的标题补 id）
  const slug = s => s.toLowerCase()
    .replace(/<.*?>/g, '')
    .replace(/[^\w\u4e00-\u9fa5\- ]+/g, '')
    .trim()
    .replace(/\s+/g, '-');

  headings.forEach(h => {
    if (!h.id) h.id = slug(h.textContent);
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    const lv = h.tagName === 'H4' || h.tagName === 'H5' || h.tagName === 'H6' ? 'lv2' : 'lv1';
    a.className = 'toc-item ' + lv;
    list.appendChild(a);
  });

  // 没有小标题则隐藏气泡
  if (!headings.length) { bubble.style.display = 'none'; return; }

  // 3) 点击平滑滚动
  list.addEventListener('click', e => {
    const link = e.target.closest('a.toc-item');
    if (!link) return;
    e.preventDefault();
    const rawId  = link.getAttribute('href').slice(1);
    const safeId = (window.CSS && CSS.escape) ? CSS.escape(rawId) : rawId;
    const target = document.getElementById(rawId) || document.querySelector('#' + safeId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', '#' + rawId);
    }
  });

  // 4) 折叠/展开
  const toggle = bubble.querySelector('.toc-toggle');
  if (toggle) toggle.addEventListener('click', () => bubble.classList.toggle('open'));
  // 默认展开：如需默认折叠，删掉下面这行即可
  bubble.classList.add('open');

  // 5) 滚动高亮
  const obs = new IntersectionObserver(entries => {
    let activeId = null;
    entries.forEach(en => { if (en.isIntersecting) activeId = en.target.id; });
    if (activeId) {
      list.querySelectorAll('.toc-item.active').forEach(n => n.classList.remove('active'));
      const cur = list.querySelector(`.toc-item[href="#${activeId}"]`);
      if (cur) cur.classList.add('active');
    }
  }, { rootMargin: '0px 0px -70% 0px', threshold: [0, 1] });
  headings.forEach(h => obs.observe(h));

  // === 6) 定位到横幅/无图标题下沿，并给目录列表设置“可滚高度” ===
    function placeTOC() {
      const hero = document.querySelector('.hero-banner') || document.querySelector('.hero-plain');
      let top = 90;
      if (hero) top = hero.getBoundingClientRect().bottom + 12;  // 横幅底沿 + 12px
      bubble.style.top  = Math.max(12, Math.round(top)) + 'px';
      bubble.style.left = '12px';                                 // 页面左沿 12px

      // —— 新增：动态列表高度，保证能滚到最后一项
      // 先确保列表本身可滚
      list.style.overflow = 'auto';
      list.style.webkitOverflowScrolling = 'touch';
      // 计算从气泡顶部到视口底部的空间
      const bcr   = bubble.getBoundingClientRect();
      const space = window.innerHeight - bcr.top - 16;            // 留 16px 底部间距
      const maxH  = Math.max(120, space);                         // 至少给 120px
      list.style.maxHeight = maxH + 'px';
    }

    // 初次 + 变化时重算（rAF 轻微节流）
    const raf = cb => (window.requestAnimationFrame ? requestAnimationFrame(cb) : cb());
    const recalc = () => raf(placeTOC);

    window.addEventListener('load',   recalc);
    window.addEventListener('resize', recalc);
    window.addEventListener('scroll', () => { if (window.scrollY < 240) recalc(); });

    // 图片/字体晚加载兜底
    setTimeout(recalc, 300);
    setTimeout(recalc, 1000);
})();