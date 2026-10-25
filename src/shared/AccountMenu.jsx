import { useEffect, useId, useRef, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth.js';

export default function AccountMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelId = useId();

  const firstName = user?.user_metadata?.first_name ?? '';
  const email = user?.email ?? '';
  const initial = (firstName || email || '?').charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  async function handleSignOut() {
    localStorage.removeItem('tulamiou:workspace');
    await signOut();
  }

  return (
    <div className="account-menu" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="avatar"
        aria-label="Mon compte"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        {initial}
      </button>

      {open && (
        <div id={panelId} className="account-menu__panel">
          <div className="account-menu__identity">
            {firstName && <span className="account-menu__name">{firstName}</span>}
            <span className="account-menu__email">{email}</span>
          </div>
          <button type="button" className="account-menu__item" onClick={handleSignOut}>
            <LogOut aria-hidden /> Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
