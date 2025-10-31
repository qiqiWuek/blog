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
    const lv = (h.tagName === 'H4' || h.tagName === 'H5' || h.tagName === 'H6') ? 'lv2' : 'lv1';
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

  // 4) 折叠/展开（默认：收起成小圆）
  const toggle = bubble.querySelector('.toc-toggle');
  function setOpen(open){
    bubble.classList.toggle('open',      open);
    bubble.classList.toggle('collapsed', !open);
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
    // 展开时动态计算列表最大高度，保证能滚到底
    if (open) {
      const bcr = bubble.getBoundingClientRect();
      list.style.maxHeight = Math.max(120, window.innerHeight - bcr.top - 16) + 'px';
      list.style.overflow = 'auto';
      list.style.webkitOverflowScrolling = 'touch';
    }
  }
  setOpen(false); // 初始为小圆点
  if (toggle) toggle.addEventListener('click', () => setOpen(!bubble.classList.contains('open')));

  // 点击外部或按 ESC 收起
  document.addEventListener('click', (e)=>{
    if (!bubble.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape') setOpen(false);
  });

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

  // 6) 放到横幅底沿 + 页面左沿；并在展开/收起/窗口变化时重算
  function placeTOC() {
    const hero = document.querySelector('.hero-banner') || document.querySelector('.hero-plain');
    let top = 90;
    if (hero) top = hero.getBoundingClientRect().bottom + 12;
    bubble.style.top  = Math.max(12, Math.round(top)) + 'px';
    bubble.style.left = '12px';

    // 若当前是展开态，同步刷新列表高度
    if (bubble.classList.contains('open')) {
      const bcr = bubble.getBoundingClientRect();
      list.style.maxHeight = Math.max(120, window.innerHeight - bcr.top - 16) + 'px';
    }
  }
  const raf = cb => window.requestAnimationFrame ? requestAnimationFrame(cb) : cb();
  const recalc = () => raf(placeTOC);
  window.addEventListener('load',   recalc);
  window.addEventListener('resize', recalc);
  window.addEventListener('scroll', () => { if (window.scrollY < 240) recalc(); });
  setTimeout(recalc, 300);
})();