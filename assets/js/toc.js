(function(){
  const headings = document.querySelectorAll('.post-body h3, .post-body h4');
  const list = document.querySelector('#toc .toc-list');
  if(!headings.length || !list) return;

  const slug = s => s.toLowerCase()
    .replace(/<.*?>/g,'')
    .replace(/[^\w\u4e00-\u9fa5\- ]+/g,'')
    .trim().replace(/\s+/g,'-');

  headings.forEach(h => {
    if(!h.id) h.id = slug(h.textContent);
    const a = document.createElement('a');
    a.href = '#'+h.id;
    a.textContent = h.textContent;
    a.className = 'toc-item ' + (h.tagName === 'H4' ? 'lv2' : 'lv1');
    list.appendChild(a);
  });

list.addEventListener('click', (e)=>{
  const link = e.target.closest('a.toc-item');
  if(!link) return;
  e.preventDefault();

  const rawId = link.getAttribute('href').slice(1);
  const safeSel = window.CSS && CSS.escape ? `#${CSS.escape(rawId)}` : `#${rawId}`;
  const target = document.getElementById(rawId) || document.querySelector(safeSel);

  if(target){
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${rawId}`);
  }
});

  const bubble = document.getElementById('toc');
  const toggle = bubble.querySelector('.toc-toggle');
  toggle.addEventListener('click', ()=> bubble.classList.toggle('open'));

  const obs = new IntersectionObserver(entries=>{
    let activeId = null;
    entries.forEach(en => { if(en.isIntersecting) activeId = en.target.id; });
    if(activeId){
      list.querySelectorAll('.toc-item.active').forEach(n=>n.classList.remove('active'));
      const cur = list.querySelector(`.toc-item[href="#${activeId}"]`);
      if(cur) cur.classList.add('active');
    }
  }, { rootMargin: '0px 0px -70% 0px', threshold: [0, 1] });
  headings.forEach(h => obs.observe(h));

    // === 把 TOC 放到横幅底部，并与正文左边缘对齐 ===
    const bubble = document.getElementById('toc');

    function placeTOC(){
      if(!bubble) return;

      // 1) 计算 top：横幅（有图）或无图标题区的“底部 + 12px”
      const hero = document.querySelector('.hero-banner') || document.querySelector('.hero-plain');
      let top = 90; // 兜底
      if (hero){
        const r = hero.getBoundingClientRect();
        // r.bottom 是相对视口的位置；视口顶部就是 0，所以直接用
        top = Math.max(12, r.bottom + 12);
      }
      bubble.style.top = `${Math.round(top)}px`;

      // 2) 计算 left：让卡片左边缘与正文容器（.wrap.post 或 .wrap）的左边缘对齐
      const wrap = document.querySelector('.wrap.post') || document.querySelector('.wrap');
      if (wrap){
        const wr = wrap.getBoundingClientRect();
        // 再往里缩一点，避免贴边太紧；想更靠左就调这个 inset 值
        const inset = 0;
        const left = Math.max(8, wr.left + inset);
        bubble.style.left = `${Math.round(left)}px`;
      }
    }

    // 初次定位 + 视口变化时重算
    window.addEventListener('load', placeTOC);
    window.addEventListener('resize', placeTOC);

    // 页面在“顶部区域”滚动时，横幅高度/布局可能变化，适当重算
    window.addEventListener('scroll', () => {
      if (window.scrollY < 200) placeTOC();
    });
})();