import { useEffect } from 'react';

/**
 * Cada pagina HTML original tenia su propia clase en <body>
 * (auth-body, perfil-body, bg-surface...). En una SPA el <body> es uno
 * solo, asi que cada pagina agrega su clase al montarse y la quita al
 * desmontarse.
 */
export default function useBodyClass(clases) {
  useEffect(() => {
    const lista = clases.split(' ').filter(Boolean);
    document.body.classList.add(...lista);
    return () => document.body.classList.remove(...lista);
  }, [clases]);
}
