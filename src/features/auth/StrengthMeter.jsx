import './StrengthMeter.css';

export const MIN_PASSWORD_LENGTH = 8;

const LABELS = ['Trop court', 'Faible', 'Moyen', 'Solide', 'Excellent'];

export function getStrength(password) {
  if (!password) return { score: 0, label: '' };
  let score = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return {
    score,
    label: password.length < MIN_PASSWORD_LENGTH ? LABELS[0] : LABELS[score],
  };
}

export function StrengthMeter({ password }) {
  const { score, label } = getStrength(password);

  return (
    <div className="strength" aria-live="polite">
      <div className="strength__bars" aria-hidden="true">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="strength__bar" data-on={score >= n} />
        ))}
      </div>
      {label && <span className="strength__label">Solidité : {label}</span>}
    </div>
  );
}
