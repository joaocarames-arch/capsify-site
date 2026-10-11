(function () {
  "use strict";

  var dict = window.CAPSIFY_I18N || {};
  var languages = ["en", "pt", "es", "fr", "de", "it", "ru", "zh"];
  var root = document.documentElement;

  function stored() {
    try { return localStorage.getItem("capsify-lang"); } catch (e) { return null; }
  }
  function remember(lang) {
    try { localStorage.setItem("capsify-lang", lang); } catch (e) { /* private mode */ }
  }

  // ?lang=xx wins (shareable links), then the visitor's last pick, then the
  // browser's own languages, then English.
  function initialLanguage() {
    var fromUrl = new URLSearchParams(location.search).get("lang");
    if (fromUrl && dict[fromUrl]) return fromUrl;
    var saved = stored();
    if (saved && dict[saved]) return saved;
    var prefs = navigator.languages || [navigator.language || "en"];
    for (var i = 0; i < prefs.length; i++) {
      var code = String(prefs[i]).toLowerCase().slice(0, 2);
      if (languages.indexOf(code) >= 0) return code;
    }
    return "en";
  }

  function apply(lang) {
    var strings = dict[lang] || dict.en;
    var fallback = dict.en;
    root.lang = lang === "zh" ? "zh-Hans" : lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      el.textContent = strings[key] || fallback[key] || el.textContent;
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      el.innerHTML = strings[key] || fallback[key] || el.innerHTML;
    });
    var titleKey = document.body.getAttribute("data-title");
    if (titleKey) document.title = strings[titleKey] || fallback[titleKey];
    // The widget mock's weather bar: the next days' names, in this language.
    document.querySelectorAll("[data-weekday]").forEach(function (el) {
      var day = new Date();
      day.setDate(day.getDate() + Number(el.getAttribute("data-weekday")));
      try {
        el.textContent = new Intl.DateTimeFormat(root.lang, { weekday: "short" }).format(day);
      } catch (e) {
        el.textContent = "";
      }
    });
    var select = document.getElementById("lang");
    if (select) select.value = lang;
  }

  var lang = initialLanguage();
  apply(lang);

  var select = document.getElementById("lang");
  if (select) {
    select.addEventListener("change", function () {
      lang = select.value;
      remember(lang);
      apply(lang);
    });
  }

  // Sticky nav gains a hairline once the page scrolls.
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Reveal on scroll.
  var targets = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add("in"); });
  }

  // A gentle parallax on the hero phones, pointer-driven on wide screens.
  var phones = document.querySelector(".phones");
  if (phones && window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener("pointermove", function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 14;
      var y = (e.clientY / window.innerHeight - 0.5) * 10;
      phones.style.transform = "translate(" + x + "px," + y + "px)";
    }, { passive: true });
  }
})();
