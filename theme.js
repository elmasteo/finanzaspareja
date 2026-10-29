// Tema claro/oscuro compartido entre index.html y liquidaciones.html.
// Se carga en el <head> para aplicar el tema antes de pintar y evitar parpadeos.
(function () {
  const root = document.documentElement;

  let guardado = null;
  try { guardado = localStorage.getItem("tema"); } catch (_) {}

  // Por defecto oscuro (como la versión anterior)
  root.classList.toggle("dark", guardado ? guardado === "dark" : true);

  function pintarBoton() {
    const boton = document.getElementById("modoToggle");
    if (!boton) return;
    const oscuro = root.classList.contains("dark");
    boton.textContent = oscuro ? "☀️" : "🌙";
    boton.setAttribute("aria-label", oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
  }

  document.addEventListener("DOMContentLoaded", () => {
    pintarBoton();
    const boton = document.getElementById("modoToggle");
    if (!boton) return;
    boton.addEventListener("click", () => {
      root.classList.toggle("dark");
      try {
        localStorage.setItem("tema", root.classList.contains("dark") ? "dark" : "light");
      } catch (_) {}
      pintarBoton();
      window.dispatchEvent(new Event("tema-cambiado"));
    });
  });
})();