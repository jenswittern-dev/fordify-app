// fordify – Theme-System (brand / dark / clean)
// Lädt vor app.js. Globale Funktionen: themeWechseln, themeLaden.
"use strict";

const STORAGE_KEY_THEME = "fordify_theme";

function themeWechseln(name) {
  const valid = ["brand", "dark", "clean"];
  if (!valid.includes(name)) name = "brand";
  if (name === "brand") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", name);
  }
  const logoImg = document.querySelector(".navbar-brand img");
  if (logoImg) {
    const logoMap = { brand: "img/logo.svg", dark: "img/logo-dark.svg", clean: "img/logo-clean.svg" };
    logoImg.src = logoMap[name] || "img/logo.svg";
  }
  localStorage.setItem(STORAGE_KEY_THEME, name);
}

function themeLaden() {
  const saved = localStorage.getItem(STORAGE_KEY_THEME) || "brand";
  themeWechseln(saved);
}
