import logoUrl from '../assets/logo.svg';
import illustrationUrl from '../assets/illustration.svg';

export default function AuthLayout({ reverse = false, pitch, children }) {
    return (
        <div className={`auth${reverse ? ' auth--reverse' : ''}`}>
            <main className="auth__main">
                <a href="/" className="brand">
                    <img src={logoUrl} alt="" />
                    <span className="brand__name">Tulamiou</span>
                </a>
                {children}
            </main>
            <aside className="auth__panel" aria-hidden="true">
                <img src={illustrationUrl} alt="" className="auth__illustration" />
                <div className="auth__pitch">{pitch}</div>
            </aside>
        </div>
    );
}