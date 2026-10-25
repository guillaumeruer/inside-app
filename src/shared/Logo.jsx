import { Link } from 'react-router';
import logoUrl from '@/assets/logo.svg';
import './Logo.css';

export default function Logo({ size = 'md', to = '/' }) {
  return (
    <Link to={to} className={`logo logo--${size}`}>
      <img src={logoUrl} alt="" className="logo__icon" />
      <span className="logo__name">tulamiou</span>
    </Link>
  );
}
