import { useEffect } from 'react';

export default function useBodyClass(clases) {
  useEffect(() => {
    const lista = clases.split(' ').filter(Boolean);
    document.body.classList.add(...lista);
    return () => document.body.classList.remove(...lista);
  }, [clases]);
}
