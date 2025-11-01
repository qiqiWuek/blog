(function () {
  const ids  = ["year", "tag", "type"];
  const secs = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
  const tabs = Object.fromEntries(ids.map(id => [id, document.getElementById("tab-" + id)]));

  function activate(which) {
    ids.forEach(id => {
      const active = id === which;
      secs[id]?.classList.toggle("active", active);
      tabs[id]?.classList.toggle("active", active);
    });
  }

  // 只要 hash 是 tag-xxx，就判定为 Tag 视图；否则 year/tag/type 照常
  function current() {
    const h = (location.hash || "#year").slice(1);   // 去掉 '#'
    if (ids.includes(h)) return h;
    if (h.startsWith("tag-")) return "tag";
    return "year";
  }

  // 如果 hash 指向具体标签（#tag-xxx），滚动到该标题
  function scrollToTag() {
    const h = (location.hash || "").slice(1);
    if (!h || !h.startsWith("tag-")) return;
    const el = document.getElementById(h);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  window.addEventListener("hashchange", () => {
    activate(current());
    scrollToTag();
  });

  // 初次加载
  activate(current());
  scrollToTag();
})();