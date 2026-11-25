import { useEffect, useRef, useState, type FormEvent } from 'react';
import { api, ApiError } from '../lib/api';
import { clearAdminCredentials, saveAdminCredentials } from '../lib/admin-auth';

type Props = {
  /** Appelé quand les identifiants sont acceptés par le serveur */
  onSuccess: () => void;
  /** Appelé si l'utilisateur ferme la modale (bouton, Échap) */
  onCancel: () => void;
};

/**
 * Modale de connexion au back-office (mode « basic » : dev local / plan B).
 * <dialog> natif : focus piégé dans la modale, Échap pour fermer, fond inerte.
 */
export function LoginModal({ onSuccess, onCancel }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const d = dialog.current;
    if (d && !d.open) d.showModal();
    return () => d?.close();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user.trim() || !pass) {
      setError('Renseigne l’identifiant et le mot de passe.');
      return;
    }
    setPending(true);
    setError('');
    saveAdminCredentials(user.trim(), pass);
    try {
      // Vérifie les identifiants auprès du serveur avant de fermer
      await api('/api/admin/episodes');
      onSuccess();
    } catch (err) {
      clearAdminCredentials();
      const e = err as ApiError;
      setError(e.status === 401 ? 'Identifiant ou mot de passe incorrect.' : e.message);
      setPass('');
    } finally {
      setPending(false);
    }
  };

  return (
    <dialog
      ref={dialog}
      className="login-modal glass"
      aria-labelledby="login-title"
      onCancel={(e) => {
        e.preventDefault(); // Échap : on laisse le parent décider
        onCancel();
      }}
    >
      <form onSubmit={submit} noValidate>
        <div className="login-mark" aria-hidden>LB</div>
        <h2 id="login-title">Espace équipe</h2>
        <p className="login-lead">Connecte-toi pour gérer les épisodes.</p>

        <label className="field">
          <span>Identifiant</span>
          <input
            name="username"
            autoComplete="username"
            value={user}
            onChange={(e) => { setUser(e.target.value); setError(''); }}
            autoFocus
            required
          />
        </label>

        <label className="field">
          <span>Mot de passe</span>
          <div className="field-with-btn">
            <input
              name="password"
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              value={pass}
              onChange={(e) => { setPass(e.target.value); setError(''); }}
              required
            />
            <button type="button" className="field-btn" onClick={() => setShowPass((s) => !s)} aria-pressed={showPass}>
              {showPass ? 'Masquer' : 'Afficher'}
            </button>
          </div>
        </label>

        <p className="login-error" role="alert" aria-live="assertive">{error}</p>

        <div className="login-actions">
          <button type="button" className="btn ghost" onClick={onCancel}>Annuler</button>
          <button type="submit" className="btn" disabled={pending}>
            {pending ? 'Connexion…' : 'Se connecter'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
