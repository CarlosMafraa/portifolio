/* Carlos Mafra — portfólio. JS mínimo: tema, menu mobile, ano no rodapé. */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---- tema claro/escuro ---- */
  var toggle = document.querySelector(".theme-toggle");

  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function syncToggle() {
    if (!toggle) return;
    var dark = currentTheme() === "dark";
    toggle.setAttribute("aria-pressed", String(dark));
    var label = toggle.querySelector(".theme-toggle__label");
    if (label) label.textContent = dark ? "Claro" : "Escuro";
  }

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("cm-theme", theme); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#000000" : "#fbfbfa");
    syncToggle();
  }

  if (toggle) {
    syncToggle();
    toggle.addEventListener("click", function () {
      setTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  }

  /* Acompanha o SO enquanto o usuário não escolher manualmente */
  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", function (e) {
    var stored;
    try { stored = localStorage.getItem("cm-theme"); } catch (err) {}
    if (stored !== "light" && stored !== "dark") {
      root.setAttribute("data-theme", e.matches ? "dark" : "light");
      syncToggle();
    }
  });

  /* ---- menu mobile ---- */
  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav-primary");

  function closeNav() {
    if (!header) return;
    header.classList.remove("is-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Abrir menu");
    }
  }

  if (navToggle && header) {
    navToggle.addEventListener("click", function () {
      var open = header.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });
  }

  if (nav) {
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeNav();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  /* ---- ano no rodapé (se houver marcador) ---- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = String(new Date().getFullYear());

  /* ---- mapa mental de habilidades (markmap-view + d3) ---- */
  var MM_COLORS = [
    "#3b82c4", "#3fa66a", "#8f6fd0", "#d98634",
    "#d95f8e", "#2fa3ad", "#c9524a", "#8a8f98"
  ];
  var MM_OPTS = {
    color: MM_COLORS,
    colorFreezeLevel: 2,
    maxWidth: 300,
    spacingHorizontal: 64,
    spacingVertical: 8,
    paddingX: 16,
    fitRatio: 0.92,
    duration: 250
  };

  // parser mínimo do outline (#, ##, ###, "- ", "  - ")
  function parseOutline(md) {
    var out = md.replace(/^﻿/, "").replace(/^\s*---\n[\s\S]*?\n---\s*/, "");
    var lines = out.split("\n");
    var rootNode = null;
    var stack = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].replace(/\s+$/, "");
      if (!line.trim()) continue;
      var h = line.match(/^(#{1,6})\s+(.+)$/);
      var b = line.match(/^(\s*)-\s+(.+)$/);
      var level, text;
      if (h) { level = h[1].length; text = h[2]; }
      else if (b) { level = 4 + Math.floor(b[1].length / 2); text = b[2]; }
      else continue;
      var node = { content: escapeHtml(text.trim()), children: [], payload: {} };
      if (level === 1 && !rootNode) { rootNode = node; stack = [{ node: node, level: 1 }]; continue; }
      if (!rootNode) continue;
      while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
      (stack.length ? stack[stack.length - 1].node : rootNode).children.push(node);
      stack.push({ node: node, level: level });
    }
    return rootNode;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function applyLevel(node, level, depth) {
    node.payload = node.payload || {};
    node.payload.fold = depth >= level ? 1 : 0;
    for (var i = 0; i < (node.children || []).length; i++) {
      applyLevel(node.children[i], level, depth + 1);
    }
  }

  function initSkillMap() {
    var host = document.querySelector(".skillmap");
    var mk = window.markmap;
    if (!host || !mk || !mk.Markmap || !window.d3) return;
    var tpl = host.querySelector('script[type="text/template"]');
    if (!tpl) return;
    var rootNode = parseOutline(tpl.textContent || "");
    if (!rootNode) return;

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    host.insertBefore(svg, host.firstChild);

    var opts = mk.deriveOptions ? mk.deriveOptions(MM_OPTS) : MM_OPTS;
    var mm = mk.Markmap.create(svg, opts);

    var DEFAULT_LEVEL = 2;
    function render(level) {
      applyLevel(rootNode, level, 0);
      Promise.resolve(mm.setData(rootNode)).then(function () { mm.fit(); });
    }
    render(DEFAULT_LEVEL);

    var ctrl = document.querySelector(".skillmap-ctrl");
    if (ctrl) {
      var levelBtns = ctrl.querySelectorAll("[data-mm-level]");
      ctrl.addEventListener("click", function (e) {
        var btn = e.target.closest("button");
        if (!btn) return;
        if (btn.hasAttribute("data-mm-fit")) { mm.fit(); return; }
        var lvl = parseInt(btn.getAttribute("data-mm-level"), 10);
        if (isNaN(lvl)) return;
        for (var i = 0; i < levelBtns.length; i++) {
          levelBtns[i].setAttribute("aria-pressed", String(levelBtns[i] === btn));
        }
        render(lvl);
      });
    }

    // reenquadra quando volta a ficar visível ou a janela muda
    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { mm.fit(); }, 200);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSkillMap);
  } else {
    initSkillMap();
  }
})();
