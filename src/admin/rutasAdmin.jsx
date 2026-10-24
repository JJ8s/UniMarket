import { Route } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import BoletaOrden from './pages/BoletaOrden';
import CategoriaEditar from './pages/CategoriaEditar';
import CategoriaNueva from './pages/CategoriaNueva';
import Categorias from './pages/Categorias';
import Dashboard from './pages/Dashboard';
import HistorialCompras from './pages/HistorialCompras';
import Ordenes from './pages/Ordenes';
import PerfilAdmin from './pages/PerfilAdmin';
import ProductoDetalle from './pages/ProductoDetalle';
import ProductoEditar from './pages/ProductoEditar';
import ProductoNuevo from './pages/ProductoNuevo';
import Productos from './pages/Productos';
import ProductosCriticos from './pages/ProductosCriticos';
import Reportes from './pages/Reportes';
import UsuarioDetalle from './pages/UsuarioDetalle';
import UsuarioEditar from './pages/UsuarioEditar';
import UsuarioNuevo from './pages/UsuarioNuevo';
import Usuarios from './pages/Usuarios';

/**
 * Arbol de rutas del panel, equivalente al diagrama de la Figura 10 del anexo.
 * No es un componente: es una funcion que devuelve elementos <Route>, y se
 * llama dentro de <Routes> en App.jsx (React Router exige que los hijos de
 * <Routes> sean <Route>, por eso no se envuelve en otro componente).
 */
export default function rutasAdmin() {
  return (
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<Dashboard />} />

      {/* Ordenes / boletas */}
      <Route path="ordenes" element={<Ordenes />} />
      <Route path="ordenes/:folio" element={<BoletaOrden />} />

      {/* Productos (las rutas fijas "nuevo" y "criticos" van antes de ":id") */}
      <Route path="productos" element={<Productos />} />
      <Route path="productos/nuevo" element={<ProductoNuevo />} />
      <Route path="productos/criticos" element={<ProductosCriticos />} />
      <Route path="productos/:id" element={<ProductoDetalle />} />
      <Route path="productos/:id/editar" element={<ProductoEditar />} />

      {/* Categorias */}
      <Route path="categorias" element={<Categorias />} />
      <Route path="categorias/nueva" element={<CategoriaNueva />} />
      <Route path="categorias/:valor/editar" element={<CategoriaEditar />} />

      {/* Usuarios */}
      <Route path="usuarios" element={<Usuarios />} />
      <Route path="usuarios/nuevo" element={<UsuarioNuevo />} />
      <Route path="usuarios/:correo" element={<UsuarioDetalle />} />
      <Route path="usuarios/:correo/editar" element={<UsuarioEditar />} />
      <Route path="usuarios/:correo/historial" element={<HistorialCompras />} />

      <Route path="reportes" element={<Reportes />} />
      <Route path="perfil" element={<PerfilAdmin />} />
    </Route>
  );
}
