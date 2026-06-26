import { getCookie, setCookie } from "/js/cookie.js";

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("lang-selector");
  const COOKIE_NAME = "lang";

  function getLangFromURL() {
    return window.location.pathname.startsWith("/ja") ? "ja" : "en";
  }

  function getLangFromCookie() {
    const val = getCookie(COOKIE_NAME);
    return val === "en" || val === "ja" ? val : null;
  }

  function getCurrentLang() {
    return getLangFromURL();
  }

  function updateLabel(lang) {
    if (btn) btn.textContent = lang.toUpperCase();
  }

  function setLang(next) {
    setCookie(COOKIE_NAME, next, 365);

    const path = window.location.pathname;
    const newPath = path.replace(/^\/(en|ja)/, `/${next}`);

    window.location.pathname = newPath;
  }

  updateLabel(getCurrentLang());

  btn?.addEventListener("click", () => {
    const current = getCurrentLang();
    const next = current === "en" ? "ja" : "en";

    setLang(next);
  });
});

