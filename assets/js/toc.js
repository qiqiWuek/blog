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
})();