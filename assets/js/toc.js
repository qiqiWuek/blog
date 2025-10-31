(function () {
  // —— 目标：抓取正文里的 h3~h6 生成 TOC（默认收成小圆点），
  //    定位在横幅底沿 + 页面左沿；展开后列表高度精确计算，能滚到最后一项。

  const bubble  = document.getElementById('toc');
  if (!bubble) return;

  const list    = bubble.querySelector('.toc-list');
  const toggle  = bubble.querySelector('.toc-toggle');
  if (!list || !toggle) return;

  // 1) 收集标题
  const headings = Array.from(
    document.querySelectorAll('.post-body h3, .post-body h4, .post-body h5, .post-body h6')
  );
  if (!headings.length) { bubble.style.display = 'none'; return; }

  // 2) slug 生成（确保唯一）
  const seen = new Map();
  const slug = s => {
    let base = String(s).toLowerCase()
      .replace(/<.*?>/g, '')
      .replace(/[^\w\u4e00-\u9fa5\- ]+/g, '')
      .trim()
      .replace(/\s+/g, '-');
    if (!base) base = 'section';
    let k = base, i = 2;
    while (seen.has(k)) k = `${base}-${i++}`;
    seen.set(k, true);
    return k;
  };

  // 3) 构建目录项
  headings.forEach(h => {
    if (!h.id) h.id = slug(h.textContent || h.innerText || 'section');
    const a = document.createElement('a');
    a.href = `#${h.id}`;
    a.textContent = h.textContent;
    a.className = 'toc-item ' + ((/H[456]/).test(h.tagName) ? 'lv2' : 'lv1');
    list.appendChild(a);
  });

  // 4) 点击平滑滚动
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

  // 5) 折叠/展开（默认收起为小圆）
  function computeListMaxHeight() {
    // 精确扣除：气泡 padding + 按钮高度 + 列表上下 margin + 底部预留
    const bcr   = bubble.getBoundingClientRect();
    const bs    = getComputedStyle(bubble);
    const ls    = getComputedStyle(list);
    const padV  = parseFloat(bs.paddingTop) + parseFloat(bs.paddingBottom);
    const headH = (toggle.getBoundingClientRect().height) || 0;
    const mV    = parseFloat(ls.marginTop) + parseFloat(ls.marginBottom);
    const gap   = 16;
    return Math.max(120, window.innerHeight - bcr.top - padV - headH - mV - gap);
  }

  function setOpen(open){
    bubble.classList.toggle('open',      open);
    bubble.classList.toggle('collapsed', !open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      list.style.maxHeight = computeListMaxHeight() + 'px';
      list.style.overflow = 'auto';
      list.style.webkitOverflowScrolling = 'touch';
      list.style.paddingBottom = '6px'; // 防止最后一项被圆角裁掉
    }
  }

  setOpen(false); // 默认小圆
  toggle.addEventListener('click', () => setOpen(!bubble.classList.contains('open')));
  document.addEventListener('click', e => { if (!bubble.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });

  // 6) 滚动高亮
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

  // 7) 定位：横幅/无图标题的底沿 + 页面左沿
  function placeTOC() {
    const hero = document.querySelector('.hero-banner') || document.querySelector('.hero-plain');
    let top = 90;
    if (hero) top = hero.getBoundingClientRect().bottom + 12;
    bubble.style.top  = Math.max(12, Math.round(top)) + 'px';
    bubble.style.left = '12px';
    if (bubble.classList.contains('open')) {
      // 展开状态下同步刷新高度，确保能滚到最后一项
      list.style.maxHeight = computeListMaxHeight() + 'px';
    }
  }

  const raf = cb => (window.requestAnimationFrame ? requestAnimationFrame(cb) : cb());
  const recalc = () => raf(placeTOC);

  window.addEventListener('load',   recalc);
  window.addEventListener('resize', recalc);
  window.addEventListener('scroll', () => { if (window.scrollY < 240) recalc(); });
  setTimeout(recalc, 300);   // 图片横幅晚加载时再校准一次
  setTimeout(recalc, 1200);  // 再保险一次
})();