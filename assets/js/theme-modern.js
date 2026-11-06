/**
 * Teh Wasgitel Indonesia — Clean theme helper
 * Sengaja minimal: animasi scroll sudah ditangani AOS, jadi di sini
 * hanya memastikan class "scrolled" pada body ikut sinkron.
 */
(function () {
  "use strict";
  var toggle = function () {
    document.body.classList.toggle("scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
})();
