// ============================================================
// interfaz.js - Componentes de interfaz reutilizables (POO)
// ============================================================
// Este archivo junta clases de UI que se usan en mas de una
// pagina (index.html y publicar.html), para no repetir el mismo
// codigo dos veces.
//
// Nota de estilo: los comentarios de este archivo van sin tildes
// a proposito. El texto que ve el usuario (labels, mensajes) si
// mantiene tildes normales.

/**
 * Menu desplegable de perfil que aparece en el header.
 * Se encarga de: pintar nombre/usuario/correo, abrir y cerrar
 * el menu (click en el boton, click afuera, tecla Escape).
 */
class MenuPerfil {
  /**
   * @param {string} idBoton - id del boton que abre/cierra el menu
   * @param {string} idMenu - id del contenedor del menu desplegable
   * @param {Object} usuario - datos a mostrar: nombre, nombreUsuario, correo
   */
  constructor(idBoton, idMenu, usuario) {
    this.boton = document.getElementById(idBoton);
    this.menu = document.getElementById(idMenu);
    this.usuario = usuario || {};
  }

  /** Pinta los datos del usuario y engancha los eventos. */
  inicializar() {
    if (!this.boton || !this.menu) return;

    const elementoNombre = document.getElementById('profile-name');
    const elementoUsuario = document.getElementById('profile-username');
    const elementoCorreo = document.getElementById('profile-email');
    if (elementoNombre) elementoNombre.textContent = this.usuario.nombre || 'Usuario';
    if (elementoUsuario) elementoUsuario.textContent = this.usuario.nombreUsuario || '';
    if (elementoCorreo) elementoCorreo.textContent = this.usuario.correo || '';

    this.boton.addEventListener('click', (evento) => {
      evento.stopPropagation(); // que el listener de "click afuera" no lo cierre de inmediato
      this.menu.classList.toggle('hidden');
    });

    document.addEventListener('click', (evento) => {
      if (!this.menu.classList.contains('hidden') && !this.menu.contains(evento.target)) {
        this.cerrar();
      }
    });

    document.addEventListener('keydown', (evento) => {
      if (evento.key === 'Escape') this.cerrar();
    });

    // "Salir de la sesion": borra la sesion guardada (ver datos.js) y
    // vuelve a la pantalla de login.
    const botonSalir = document.getElementById('logout-link');
    if (botonSalir) {
      botonSalir.addEventListener('click', (evento) => {
        evento.preventDefault();
        if (typeof cerrarSesion === 'function') cerrarSesion();
        window.location.href = 'login.html';
      });
    }
  }

  /** Cierra el menu si esta abierto. */
  cerrar() {
    if (this.menu) this.menu.classList.add('hidden');
  }
}

window.MenuPerfil = MenuPerfil;
