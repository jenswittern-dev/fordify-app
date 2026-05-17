// fordify – Gemeinsame Utility-Funktionen
"use strict";

function escHtml(s) {
  return (s == null ? '' : String(s))
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escAttr(s) {
  return (s == null ? '' : String(s))
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;');
}

function parseGermanDecimal(str) {
  return parseFloat(String(str || '').replace(/\./g, '').replace(',', '.')) || 0;
}

// Parst ISO-Datum "YYYY-MM-DD" zu Date (lokale Mitternacht).
// Liefert null bei leerem/ungültigem Input — Caller soll explizit prüfen.
function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = String(str).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

// Formatiert Date zu "DD.MM.YYYY". Liefert "" bei null/undefined.
function formatDate(d) {
  if (!d) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

// Formatiert Zahl/Decimal als deutsches EUR-Format mit NBSP vor dem €.
// Hinweis: nutzt Decimal (decimal.min.js) — wird zur Laufzeit aufgelöst.
function formatEUR(val) {
  if (val === null || val === undefined) return "";
  const d = new Decimal(val);
  const parts = d.toFixed(2).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return parts.join(",") + " €";
}
