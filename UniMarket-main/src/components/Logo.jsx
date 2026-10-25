import { Link } from 'react-router-dom';

/** Logo de UniMarket que lleva al inicio. Se usa en todas las paginas y en el footer. */
export default function Logo({ className, imgClassName, imgStyle }) {
  return (
    <Link to="/" className={className}>
      <img src="/img/logo.png" alt="UniMarket" className={imgClassName} style={imgStyle} />
    </Link>
  );
}
