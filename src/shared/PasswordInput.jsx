import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Field } from '@/shared/ui/Field';

export function PasswordInput(props) {
  const [visible, setVisible] = useState(false);

  return (
    <Field
      icon={Lock}
      {...props}
      type={visible ? 'text' : 'password'}
      action={
        <button
          type="button"
          className="input-group__action"
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </button>
      }
    />
  );
}
