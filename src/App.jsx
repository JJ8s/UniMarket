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
import rutasAdmin from './admin/rutasAdmin';
import { errorConfiguracion, supabaseConfigurado } from './data/supabase';

export default function App() {
  if (errorConfiguracion) {
    return (
      <main className="max-w-xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-3">Revisa la configuración de Supabase</h1>
        <p className="mb-2">{errorConfiguracion}</p>
        <p>Corrige el archivo <code>.env</code> y reinicia <code>npm run dev</code>.</p>
      </main>
    );
  }

  if (!supabaseConfigurado) {
    return (
      <main className="max-w-xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-3">Falta configurar Supabase</h1>
        <p className="mb-2">Crea un archivo <code>.env</code> en la raíz del proyecto con:</p>
        <pre className="bg-gray-100 p-3 rounded text-sm mb-2">{'VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co\nVITE_SUPABASE_ANON_KEY=tu-anon-key'}</pre>
        <p>Luego reinicia <code>npm run dev</code>. Los pasos completos están en el README.</p>
      </main>
    );
  }

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
      </Route>

      {/* Panel de administracion: solo usuarios con rol admin */}
      <Route element={<GuardiaRuta requiereSesion rol="admin" />}>
        {rutasAdmin()}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
