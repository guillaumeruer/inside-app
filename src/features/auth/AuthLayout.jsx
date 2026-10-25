import illustrationUrl from '@/assets/illustration.svg';
import Logo from '@/shared/Logo';
import './AuthLayout.css';

export default function AuthLayout({ reverse = false, pitch, children }) {
  return (
    <div className={`auth${reverse ? ' auth--reverse' : ''}`}>
      <main className="auth__main">
        <Logo size="lg" />
        {children}
      </main>
      <aside className="auth__panel" aria-hidden="true">
        <img src={illustrationUrl} alt="" className="auth__illustration" />
        <div className="auth__pitch">{pitch}</div>
      </aside>
    </div>
  );
}
