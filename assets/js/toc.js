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
  /* 外层气泡：不滚动、不显示滚动条 */
  .toc-bubble{
    position: fixed;
    top: 90px;              /* JS 会覆盖 */
    left: 8px;              /* 先兜底写死在最左 */
    z-index: 1000;
    width: 160px;           /* ← 比现在窄一半，按需调 150~180 */
    padding: 10px 12px;
    background: rgba(255,255,255,.85);
    backdrop-filter: blur(8px);
    border: 1px solid #ddd;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,.12);
    max-height: none;       /* ← 不限制高度 */
    overflow: visible;      /* ← 关键：不要让外层滚动 */
  }

  /* 列表本身滚动 */
  .toc-bubble .toc-list{
    display: none;
    margin-top: 6px; padding: 4px 0;
    overflow: auto;                    /* ← 只让列表滚动 */
    max-height: calc(100vh - 170px);   /* 视口内滚完即可 */
    overscroll-behavior: contain;
  }
  .toc-bubble.open .toc-list{ display:block; }

  /* 更紧凑一点的行距，窄卡片更好看 */
  .toc-item{ display:block; padding:4px 6px; border-radius:8px; color:#333; text-decoration:none; font-size:.9rem; line-height:1.35; }
  .toc-item.lv2{ padding-left:14px; opacity:.9; }
  .toc-item:hover{ background:#f2f2f2; }
  .toc-item.active{ background:#e9eef6; color:#1f3b77; }

  /* 只给列表定制滚动条 */
  .toc-list::-webkit-scrollbar{ width:6px; }
  .toc-list::-webkit-scrollbar-thumb{ background:#d0d0d0; border-radius:8px; }

  @media (max-width:900px){ .toc-bubble{ display:none; } }
})();