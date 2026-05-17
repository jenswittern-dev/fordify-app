// fordify – Print / PDF (Popup-Window mit Inline-HTML)
// Lädt nach app.js (greift auf rendereVorschau, state, fordifyAuth zu).
"use strict";

function getFordifyBranding() {
  const plan = (typeof fordifyAuth !== 'undefined' && fordifyAuth.plan) || 'free';
  if (plan === 'business') return '';
  if (plan === 'pro') {
    return `<div style="margin-top:2rem;text-align:center;font-family:sans-serif;">
      <p style="margin:0;font-size:0.72rem;color:#94a3b8;">Erstellt mit <a href="https://fordify.de" style="color:#94a3b8;">fordify.de</a></p>
    </div>`;
  }
  return `<div style="margin-top:2.5rem;padding-top:1.25rem;border-top:2px solid #1e3a8a;text-align:center;font-family:sans-serif;">
    <p style="margin:0 0 0.3rem;font-size:0.9rem;font-weight:700;color:#1e3a8a;letter-spacing:0.01em;">Erstellt mit fordify</p>
    <p style="margin:0;font-size:0.8rem;color:#64748b;">
      Professionelle Forderungsaufstellungen nach § 367 BGB kostenlos erstellen und als PDF exportieren
      &nbsp;·&nbsp; <strong style="color:#1e3a8a;">fordify.de</strong>
    </p>
  </div>`;
}

function drucken() {
  rendereVorschau();
  const vorschauEl = document.getElementById("vorschau-inhalt");
  if (!vorschauEl) { window.print(); return; }

  // no-print-Elemente entfernen
  const tmp = document.createElement("div");
  tmp.innerHTML = vorschauEl.innerHTML;
  tmp.querySelectorAll(".no-print").forEach(el => el.remove());
  const cleanHtml = tmp.innerHTML;

  const origin = window.location.origin;
  const parteien = [state.fall.mandant, state.fall.gegner].filter(Boolean).join(" ./. ");
  const druckTitel = escHtml("Forderungsaufstellung" + (parteien ? " – " + parteien : "") + " – " + new Date().toLocaleDateString("de-DE"));
  const fordifyBranding = getFordifyBranding();

  const fullHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>${druckTitel}</title>
  <link rel="stylesheet" href="${origin}/css/bootstrap.min.css">
  <link rel="stylesheet" href="${origin}/css/app.css">
  <style>body{margin:2rem}@media print{body{margin:0}}</style>
</head>
<body>
  <div class="content-card">${cleanHtml}</div>
  ${fordifyBranding}
  <script>window.onload=function(){setTimeout(function(){window.print();},400);}<\/script>
</body>
</html>`;

  const popup = window.open("", "_blank", "width=960,height=750");
  if (!popup) { window.print(); return; }  // Popup-Blocker: Fallback
  popup.document.write(fullHtml);
  popup.document.close();
}
