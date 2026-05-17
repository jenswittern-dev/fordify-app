// fordify – Confirm-Modal-Helper (Bootstrap-Modal statt window.confirm)
// Nutzt #confirmModal / #confirm-modal-text / #confirm-modal-btns aus dem HTML.
// Fallback auf window.confirm wenn diese Elemente nicht existieren.
"use strict";

function fordifyConfirm(message, onOK, { okLabel = 'Löschen', cancelLabel = 'Abbrechen', extraLabel, onExtra } = {}) {
  const textEl = document.getElementById('confirm-modal-text');
  const btnsEl = document.getElementById('confirm-modal-btns');
  if (!textEl || !btnsEl) { if (confirm(message)) onOK(); return; }

  textEl.textContent = message;
  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmModal'));

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn-secondary-app';
  cancelBtn.setAttribute('data-bs-dismiss', 'modal');
  cancelBtn.textContent = cancelLabel;

  const okBtn = document.createElement('button');
  okBtn.className = 'btn-primary-app';
  okBtn.textContent = okLabel;
  okBtn.addEventListener('click', () => { modal.hide(); onOK(); }, { once: true });

  btnsEl.innerHTML = '';
  btnsEl.appendChild(cancelBtn);

  if (extraLabel && onExtra) {
    const extraBtn = document.createElement('button');
    extraBtn.className = 'btn-secondary-app';
    extraBtn.textContent = extraLabel;
    extraBtn.addEventListener('click', () => { modal.hide(); onExtra(); }, { once: true });
    btnsEl.appendChild(extraBtn);
  }

  btnsEl.appendChild(okBtn);
  modal.show();
}
