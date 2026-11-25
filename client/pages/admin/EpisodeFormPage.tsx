import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useBlocker, useNavigate, useParams } from 'react-router';
import type { AdminEpisode, AdminEpisodeInput, Episode, Tag } from '../../../shared/types';
import { api, useApi, type ApiError } from '../../lib/api';
import { durationToInput, parseDuration, slugify } from '../../lib/form-helpers';
import { formatDate } from '../../lib/format';
import { EpisodeCard } from '../../components/EpisodeCard';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ErrorState, Loading } from '../../components/States';
import { DeleteDialog } from './AdminPage';

// CRUD simple : ajouter, modifier, supprimer un épisode.
// À venir : envoi du MP3, vidéo YouTube, publication.

type Form = {
  title: string;
  slug: string;
  summary: string;
  season: string;
  episode_number: string;
  duration: string; // "45:00"
  tags: string[];
  // Pas encore modifiables ici, mais conservés tels quels à l'enregistrement
  audio_key: string | null;
  youtube_id: string | null;
};

const EMPTY: Form = { title: '', slug: '', summary: '', season: '1', episode_number: '', duration: '', tags: [], audio_key: null, youtube_id: null };
type Errors = Partial<Record<keyof Form | 'form', string>>;

const fromEpisode = (e: AdminEpisode): Form => ({
  title: e.title,
  slug: e.slug,
  summary: e.summary,
  season: e.season ? String(e.season) : '',
  episode_number: e.episode_number ? String(e.episode_number) : '',
  duration: durationToInput(e.duration_sec),
  tags: e.tags,
  audio_key: e.audio_key,
  youtube_id: e.youtube_id,
});

/** Vérifie le formulaire et le convertit au format de l'API. */
function toInput(f: Form): { input?: AdminEpisodeInput; errors: Errors } {
  const errors: Errors = {};
  if (!f.title.trim()) errors.title = 'Le titre est obligatoire.';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(f.slug)) errors.slug = 'Minuscules, chiffres et tirets uniquement (ex : ep-012-mon-titre).';
  if (!f.summary.trim()) errors.summary = 'Le résumé est obligatoire.';
  const duration = parseDuration(f.duration);
  if (Number.isNaN(duration)) errors.duration = 'Format attendu : 45:00 ou 1:02:30 (ou un nombre de minutes).';
  if (f.season && !(Number(f.season) > 0)) errors.season = 'Nombre positif.';
  if (f.episode_number && !(Number(f.episode_number) > 0)) errors.episode_number = 'Nombre positif.';
  if (Object.keys(errors).length) return { errors };
  const int = (v: string) => (v.trim() ? Number(v) : null);
  return {
    errors,
    input: {
      title: f.title.trim(),
      slug: f.slug,
      summary: f.summary.trim(),
      season: int(f.season),
      episode_number: int(f.episode_number),
      duration_sec: duration,
      tags: f.tags,
      audio_key: f.audio_key,
      youtube_id: f.youtube_id,
    },
  };
}

/** Création (/admin/episodes/new) et modification (/admin/episodes/:id) d'un épisode. */
export function EpisodeFormPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();

  const existing = useApi<AdminEpisode>(isNew ? null : `/api/admin/episodes/${id}`);
  const tagsApi = useApi<Tag[]>('/api/tags');

  const [form, setForm] = useState<Form>(EMPTY);
  const [saved, setSaved] = useState<Form>(EMPTY); // dernière version enregistrée (détection des modifications)
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState<'save' | 'delete' | null>(null);
  const [askDelete, setAskDelete] = useState(false);
  const [extraTags, setExtraTags] = useState<Tag[]>([]);

  // Pré-remplit le formulaire en modification
  const loadedFor = useRef<string | null>(null);
  useEffect(() => {
    if (existing.data && loadedFor.current !== id) {
      loadedFor.current = id ?? null;
      const f = fromEpisode(existing.data);
      setForm(f);
      setSaved(f);
    }
  }, [existing.data, id]);

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);

  // Prévient avant de quitter la page avec des modifications non enregistrées
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && !busy && currentLocation.pathname !== nextLocation.pathname);
  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => dirty && e.preventDefault();
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [dirty]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      // En création, l'adresse suit le titre tant qu'on ne l'a pas modifiée à la main
      if (key === 'title' && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
    // Efface l'erreur du champ modifié (et celle de l'adresse quand elle suit le titre)
    setErrors((e) => ({ ...e, [key]: undefined, ...(key === 'title' && !slugTouched ? { slug: undefined } : {}), form: undefined }));
    setNotice('');
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { input, errors: errs } = toInput(form);
    if (!input) return setErrors(errs);

    setBusy('save');
    try {
      if (isNew) {
        await api('/api/admin/episodes', { method: 'POST', body: JSON.stringify(input) });
        setSaved(form);
        navigate('/admin', { state: { flash: `« ${input.title} » a été ajouté.` } });
      } else {
        await api(`/api/admin/episodes/${id}`, { method: 'PUT', body: JSON.stringify(input) });
        setSaved(form);
        setNotice('Modifications enregistrées.');
      }
    } catch (err) {
      const e = err as ApiError;
      setErrors({ form: e.message });
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    setBusy('delete');
    try {
      await api(`/api/admin/episodes/${id}`, { method: 'DELETE' });
      setSaved(form); // plus rien à protéger
      navigate('/admin', { state: { flash: `« ${form.title} » a été supprimé.` } });
    } catch (e) {
      setErrors({ form: (e as ApiError).message });
      setAskDelete(false);
      setBusy(null);
    }
  };

  if (!isNew && existing.loading && !existing.data) return <Loading />;
  if (!isNew && existing.error) return <ErrorState error={existing.error} onRetry={existing.reload} />;

  const status = existing.data?.status ?? 'draft';
  const allTags = [...(tagsApi.data ?? []), ...extraTags.filter((t) => !tagsApi.data?.some((x) => x.slug === t.slug))];

  // Aperçu en direct : la carte telle qu'elle apparaîtra sur le site
  const preview: Episode = {
    slug: form.slug || 'apercu',
    title: form.title || 'Titre de l’épisode',
    summary: form.summary,
    published_at: existing.data?.published_at ?? new Date().toISOString(),
    youtube_id: null,
    audio_url: null,
    duration_sec: parseDuration(form.duration) || null,
    season: Number(form.season) || null,
    episode_number: Number(form.episode_number) || null,
    tags: allTags.filter((t) => form.tags.includes(t.slug)),
  };

  return (
    <>
      <div className="breadcrumb">
        <Link to="/admin">Épisodes</Link> / {isNew ? 'Nouvel épisode' : form.title || 'Modifier'}
      </div>

      <div className="admin-head">
        <h1>{isNew ? 'Nouvel épisode' : 'Modifier l’épisode'}</h1>
        {!isNew && (
          <span className={`badge ${status}`}>{status === 'published' ? `Publié le ${formatDate(existing.data?.published_at ?? null)}` : 'Brouillon'}</span>
        )}
      </div>

      <form className="episode-form" onSubmit={onSubmit} noValidate>
        <div className="form-main">
          <Section title="L’essentiel">
            <Field label="Titre" error={errors.title}>
              <input value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={200} autoFocus={isNew} />
            </Field>
            <Field label="Adresse de la page" hint={`/episodes/${form.slug || '…'}`} error={errors.slug}>
              <input
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  // Tolère un tiret final pendant la frappe ; tout le reste est normalisé
                  const v = e.target.value.toLowerCase().replace(/\s/g, '-');
                  set('slug', slugify(v) + (v.endsWith('-') ? '-' : ''));
                }}
              />
            </Field>
            <Field label="Résumé" hint="Affiché sur le site et sur Google." error={errors.summary}>
              <textarea rows={5} value={form.summary} onChange={(e) => set('summary', e.target.value)} maxLength={4000} />
            </Field>
            <div className="field-row">
              <Field label="Saison" error={errors.season}>
                <input inputMode="numeric" value={form.season} onChange={(e) => set('season', e.target.value.replace(/\D/g, ''))} />
              </Field>
              <Field label="N° d’épisode" error={errors.episode_number}>
                <input inputMode="numeric" value={form.episode_number} onChange={(e) => set('episode_number', e.target.value.replace(/\D/g, ''))} />
              </Field>
              <Field label="Durée" hint="ex : 45:00" error={errors.duration}>
                <input value={form.duration} onChange={(e) => set('duration', e.target.value)} placeholder="45:00" />
              </Field>
            </div>
          </Section>

          <Section title="Thèmes">
            <TagPicker
              tags={allTags}
              selected={form.tags}
              onChange={(tags) => set('tags', tags)}
              onCreated={(t) => setExtraTags((x) => [...x, t])}
            />
          </Section>
        </div>

        <aside className="form-side">
          <div className="form-sticky">
            <p className="side-label">Aperçu sur le site</p>
            <div className="preview-card">
              <EpisodeCard episode={preview} />
            </div>

            {errors.form && <p className="flash error" role="alert">{errors.form}</p>}
            {notice && <p className="flash ok" role="status">{notice}</p>}

            <div className="form-actions">
              <button type="submit" className="btn" disabled={!!busy || (!isNew && !dirty)}>
                {busy === 'save' ? 'Enregistrement…' : isNew ? 'Ajouter l’épisode' : dirty ? 'Enregistrer' : 'Enregistré ✓'}
              </button>
              <Link className="btn ghost" to="/admin">{isNew ? 'Annuler' : 'Retour à la liste'}</Link>
              {!isNew && (
                <button type="button" className="btn ghost-danger" disabled={!!busy} onClick={() => setAskDelete(true)}>
                  Supprimer l’épisode
                </button>
              )}
            </div>
          </div>
        </aside>
      </form>

      {askDelete && (
        <DeleteDialog row={{ title: form.title, status }} pending={busy === 'delete'} onConfirm={remove} onCancel={() => setAskDelete(false)} />
      )}

      {blocker.state === 'blocked' && (
        <ConfirmDialog
          title="Quitter sans enregistrer ?"
          confirmLabel="Quitter"
          tone="danger"
          onConfirm={() => blocker.proceed()}
          onCancel={() => blocker.reset()}
        >
          <p>Tes modifications ne sont pas enregistrées et seront perdues.</p>
        </ConfirmDialog>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="form-section glass">
      <legend>{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className={`field ${error ? 'has-error' : ''}`}>
      <span>{label}</span>
      {children}
      {error ? <small className="field-error">{error}</small> : hint ? <small className="field-hint">{hint}</small> : null}
    </label>
  );
}

/** Sélection des thèmes (puces) + création d'un nouveau thème. */
function TagPicker(props: { tags: Tag[]; selected: string[]; onChange: (s: string[]) => void; onCreated: (t: Tag) => void }) {
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const toggle = (slug: string) =>
    props.onChange(props.selected.includes(slug) ? props.selected.filter((s) => s !== slug) : [...props.selected, slug]);

  const create = async () => {
    if (!label.trim()) return;
    setPending(true);
    setError('');
    try {
      const tag = await api<Tag>('/api/admin/tags', { method: 'POST', body: JSON.stringify({ label: label.trim() }) });
      props.onCreated(tag);
      if (!props.selected.includes(tag.slug)) props.onChange([...props.selected, tag.slug]);
      setLabel('');
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="tag-picker">
      <div className="chips" role="group" aria-label="Thèmes de l'épisode">
        {props.tags.map((t) => (
          <button
            type="button"
            key={t.slug}
            className={`chip filter ${props.selected.includes(t.slug) ? 'active' : ''}`}
            aria-pressed={props.selected.includes(t.slug)}
            onClick={() => toggle(t.slug)}
          >
            {props.selected.includes(t.slug) ? '✓ ' : ''}{t.label}
          </button>
        ))}
      </div>
      <div className="inline-create">
        <input
          value={label}
          onChange={(e) => { setLabel(e.target.value); setError(''); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              create();
            }
          }}
          placeholder="Nouveau thème…"
          aria-label="Nom du nouveau thème"
          maxLength={40}
        />
        <button type="button" className="btn secondary small" onClick={create} disabled={pending || !label.trim()}>
          {pending ? '…' : '+ Ajouter'}
        </button>
      </div>
      {error && <small className="field-error">{error}</small>}
    </div>
  );
}
