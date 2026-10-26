import { Link } from 'react-router-dom';

export default function Logo({ className, imgClassName, imgStyle }) {
  return (
    <Link to="/" className={className}>
      <img src="/img/logo.png" alt="UniMarket" className={imgClassName} style={imgStyle} />
    </Link>
  );
}
