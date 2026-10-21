import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CarritoProvider } from './context/CarritoContext';

import './index.css'; // Tailwind
import './styles/base.css';
import './styles/catalogo.css';
import './styles/publicar.css';
import './styles/panel-vendedor.css';
import './styles/auth.css';
import './styles/perfil.css';
import './styles/bolsa.css';
import './styles/pago.css';
import './styles/footer.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CarritoProvider>
          <App />
        </CarritoProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
