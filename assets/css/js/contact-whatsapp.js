/**
 * Form "Hubungi Kami" -> WhatsApp admin
 * Nomor admin diatur lewat atribut data-wa-number di <form id="wa-form">
 * (format internasional tanpa +, spasi, atau tanda hubung).
 */
(function () {
  "use strict";

  var form = document.getElementById("wa-form");
  if (!form) return;

  var WA_NUMBER = (form.getAttribute("data-wa-number") || "").replace(/\D/g, "");
  var MAX_MESSAGE = 1000;

  var fields = {
    name: form.querySelector("#wa-name"),
    email: form.querySelector("#wa-email"),
    pkg: form.querySelector("#wa-package"),
    message: form.querySelector("#wa-message")
  };
  var errors = {
    name: form.querySelector("#wa-name-err"),
    email: form.querySelector("#wa-email-err"),
    message: form.querySelector("#wa-message-err")
  };
  var counter = form.querySelector("#wa-count");
  var statusBox = form.querySelector("#wa-status");
  var submitBtn = form.querySelector(".wa-submit");

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function clean(value) {
    return String(value || "")
      .replace(/\r\n?/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function setError(key, text) {
    var input = fields[key];
    var box = errors[key];
    if (!input || !box) return;
    if (text) {
      box.textContent = text;
      box.hidden = false;
      input.classList.add("is-invalid");
      input.setAttribute("aria-invalid", "true");
    } else {
      box.textContent = "";
      box.hidden = true;
      input.classList.remove("is-invalid");
      input.removeAttribute("aria-invalid");
    }
  }

  function validateName() {
    var v = clean(fields.name.value);
    if (v.length < 2) { setError("name", "Nama minimal 2 karakter."); return false; }
    setError("name", "");
    return true;
  }

  function validateEmail() {
    var v = clean(fields.email.value);
    if (v && !EMAIL_RE.test(v)) { setError("email", "Format email belum benar."); return false; }
    setError("email", "");
    return true;
  }

  function validateMessage() {
    var v = clean(fields.message.value);
    if (v.length < 10) { setError("message", "Pesan minimal 10 karakter."); return false; }
    setError("message", "");
    return true;
  }

  function updateCounter() {
    if (counter) counter.textContent = fields.message.value.length + "/" + MAX_MESSAGE;
  }

  function showStatus(html, type) {
    statusBox.className = "form-status " + (type || "");
    statusBox.innerHTML = html;
    statusBox.hidden = false;
  }

  function buildMessage() {
    var lines = [
      "Halo Admin Teh Wasgitel Indonesia, saya ingin bertanya lewat website.",
      "",
      "*Nama:* " + clean(fields.name.value)
    ];
    var email = clean(fields.email.value);
    if (email) lines.push("*Email:* " + email);
    if (fields.pkg.value) lines.push("*Paket diminati:* " + fields.pkg.value);
    lines.push("", "*Pesan:*", clean(fields.message.value));
    return lines.join("\n");
  }

  function openWhatsApp(url) {
    var win = null;
    try { win = window.open(url, "_blank"); } catch (e) { win = null; }
    if (win) {
      try { win.opener = null; } catch (e) { /* abaikan */ }
    } else {
      // Popup diblokir (umum di sebagian browser mobile): pindah halaman langsung.
      window.location.href = url;
    }
  }

  fields.name.addEventListener("blur", validateName);
  fields.email.addEventListener("blur", validateEmail);
  fields.message.addEventListener("blur", validateMessage);
  fields.name.addEventListener("input", function () { if (fields.name.classList.contains("is-invalid")) validateName(); });
  fields.email.addEventListener("input", function () { if (fields.email.classList.contains("is-invalid")) validateEmail(); });
  fields.message.addEventListener("input", function () {
    updateCounter();
    if (fields.message.classList.contains("is-invalid")) validateMessage();
  });
  updateCounter();

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    statusBox.hidden = true;

    if (!/^\d{8,15}$/.test(WA_NUMBER)) {
      showStatus("Nomor WhatsApp admin belum diatur dengan benar.", "is-error");
      return;
    }

    var okName = validateName();
    var okEmail = validateEmail();
    var okMessage = validateMessage();

    if (!(okName && okEmail && okMessage)) {
      var firstInvalid = form.querySelector(".is-invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    var url = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(buildMessage());

    submitBtn.disabled = true;
    openWhatsApp(url);

    showStatus(
      'WhatsApp sedang dibuka. Jika tidak terbuka, <a href="' + url + '" target="_blank" rel="noopener">klik di sini</a>.',
      "is-success"
    );

    window.setTimeout(function () {
      submitBtn.disabled = false;
    }, 1500);
  });
})();
