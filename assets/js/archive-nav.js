(function () {
  const ids = ["year", "tag", "type"];
  const secs = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
  const tabs = Object.fromEntries(ids.map(id => [id, document.getElementById("tab-" + id)]));

  function activate(which) {
    ids.forEach(id => {
      const active = id === which;
      secs[id].classList.toggle("active", active);
      tabs[id].classList.toggle("active", active);
    });
  }

  function current() {
    const h = (location.hash || "#year").replace("#", "");
    return ids.includes(h) ? h : "year";
  }

  window.addEventListener("hashchange", () => activate(current()));
  activate(current());
})();