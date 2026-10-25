import { Navigate, Route, Routes } from 'react-router-dom';
import GuardiaRuta from './components/GuardiaRuta';
import Catalogo from './pages/Catalogo';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Publicar from './pages/Publicar';
import PanelVendedor from './pages/PanelVendedor';
import Bolsa from './pages/Bolsa';
import Pago from './pages/Pago';
import Pedidos from './pages/Pedidos';
import Perfil from './pages/Perfil';
import QuienesSomos from './pages/QuienesSomos';
import rutasAdmin from './admin/rutasAdmin';

export default function App() {
  return (
    <Routes>
      <Route element={<GuardiaRuta requiereSesion={false} />}>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Route>

      <Route element={<GuardiaRuta requiereSesion />}>
        <Route path="/" element={<Catalogo />} />
        <Route path="/publicar" element={<Publicar />} />
        <Route path="/panel-vendedor" element={<PanelVendedor />} />
        <Route path="/bolsa" element={<Bolsa />} />
        <Route path="/pago" element={<Pago />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/quienes-somos" element={<QuienesSomos />} />
      </Route>

      {/* Panel de administracion: solo usuarios con rol admin */}
      <Route element={<GuardiaRuta requiereSesion rol="admin" />}>
        {rutasAdmin()}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
