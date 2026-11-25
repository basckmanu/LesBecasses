import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useBlocker, useNavigate, useParams } from 'react-router';
import type { AdminEpisode, AdminEpisodeInput, Episode, Tag } from '../../../shared/types';
import { api, useApi, type ApiError } from '../../lib/api';
import { durationToInput, extractYouTubeId, parseDuration, slugify } from '../../lib/form-helpers';
import { formatBytes, formatDate } from '../../lib/format';
import { uploadMp3 } from '../../lib/upload';
import { EpisodeCard } from '../../components/EpisodeCard';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ErrorState, Loading } from '../../components/States';
import { DeleteDialog } from './AdminPage';

type Form = {
  title: string;
  slug: string;
  summary: string;
  season: string;
  episode_number: string;
  duration: string; // "45:00"
  youtube: string; // ID ou lien
  tags: string[];
  audio_key: string;
};

const EMPTY: Form = { title: '', slug: '', summary: '', season: '1', episode_number: '', duration: '', youtube: '', tags: [], audio_key: '' };
type Errors = Partial<Record<keyof Form | 'form', string>>;

const fromEpisode = (e: AdminEpisode): Form => ({
  title: e.title,
  slug: e.slug,
  summary: e.summary,
  season: e.season ? String(e.season) : '',
  episode_number: e.episode_number ? String(e.episode_number) : '',
  duration: durationToInput(e.duration_sec),
  youtube: e.youtube_id ?? '',
  tags: e.tags,
  audio_key: e.audio_key ?? '',
});

/** Vérifie le formulaire et le convertit au format de l'API. */
function toInput(f: Form): { input?: AdminEpisodeInput; errors: Errors } {
  const errors: Errors = {};
  if (!f.title.trim()) errors.title = 'Le titre est obligatoire.';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(f.slug)) errors.slug = 'Minuscules, chiffres et tirets uniquement (ex : ep-012-mon-titre).';
  if (!f.summary.trim()) errors.summary = 'Le résumé est obligatoire.';
  const duration = parseDuration(f.duration);
  if (Number.isNaN(duration)) errors.duration = 'Format attendu : 45:00 ou 1:02:30 (ou un nombre de minutes).';
  const youtube = extractYouTubeId(f.youtube);
  if (f.youtube.trim() && !youtube) errors.youtube = 'Colle le lien de la vidéo YouTube ou son ID (11 caractères).';
  const int = (v: string) => (v.trim() ? Number(v) : null);
  if (f.season && !(Number(f.season) > 0)) errors.season = 'Nombre positif.';
  if (f.episode_number && !(Number(f.episode_number) > 0)) errors.episode_number = 'Nombre positif.';
  if (Object.keys(errors).length) return { errors };
  return {
    errors,
    input: {
      title: f.title.trim(),
      slug: f.slug,
      summary: f.summary.trim(),
      season: int(f.season),
      episode_number: int(f.episode_number),
      duration_sec: duration,
      youtube_id: youtube,
      audio_key: f.audio_key || null,
      tags: f.tags,
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
  const [saved, setSaved] = useState<Form>(EMPTY); // dernière version enregistrée (pour détecter les modifications)
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState<'save' | 'publish' | 'delete' | null>(null);
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
    setErrors((e) => ({ ...e, [key]: undefined, form: undefined }));
    setNotice('');
  };

  /** Enregistre ; renvoie l'id de l'épisode (créé ou existant), ou null en cas d'erreur. */
  const save = async (): Promise<number | null> => {
    const { input, errors: errs } = toInput(form);
    if (!input) {
      setErrors(errs);
      return null;
    }
    try {
      if (isNew) {
        const { id: newId } = await api<{ id: number }>('/api/admin/episodes', { method: 'POST', body: JSON.stringify(input) });
        setSaved(form);
        return newId;
      }
      await api(`/api/admin/episodes/${id}`, { method: 'PUT', body: JSON.stringify(input) });
      setSaved(form);
      return Number(id);
    } catch (e) {
      const err = e as ApiError & { field?: string };
      setErrors({ form: err.message });
      return null;
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy('save');
    const savedId = await save();
    setBusy(null);
    if (savedId === null) return;
    if (isNew) navigate(`/admin/episodes/${savedId}`, { replace: true, state: { created: true } });
    else setNotice('Modifications enregistrées.');
  };

  const status = existing.data?.status ?? 'draft';

  const togglePublish = async () => {
    setBusy('publish');
    setNotice('');
    // Enregistre d'abord les modifications en cours
    if (dirty && (await save()) === null) return setBusy(null);
    try {
      await api(`/api/admin/episodes/${id}/${status === 'published' ? 'unpublish' : 'publish'}`, { method: 'POST' });
      existing.reload();
      setNotice(status === 'published' ? 'Épisode repassé en brouillon : il n’est plus visible sur le site.' : 'Épisode publié : il est en ligne et dans le flux RSS.');
    } catch (e) {
      setErrors({ form: (e as ApiError).message });
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

  const allTags = [...(tagsApi.data ?? []), ...extraTags.filter((t) => !tagsApi.data?.some((x) => x.slug === t.slug))];

  // Aperçu en direct : la carte telle qu'elle apparaîtra sur le site
  const preview: Episode = {
    slug: form.slug || 'apercu',
    title: form.title || 'Titre de l’épisode',
    summary: form.summary,
    published_at: existing.data?.published_at ?? new Date().toISOString(),
    youtube_id: extractYouTubeId(form.youtube),
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
            <Field
              label="Adresse de la page"
              hint={`lesbecasses.fr/episodes/${form.slug || '…'}`}
              error={errors.slug}
            >
              <input
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set('slug', slugify(e.target.value.replace(/\s/g, '-')) + (e.target.value.endsWith('-') ? '-' : ''));
                }}
              />
            </Field>
            <Field label="Résumé" hint="Affiché sur le site, dans Spotify / Apple et sur Google." error={errors.summary}>
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

          <Section title="Audio et vidéo">
            <AudioUpload
              slug={form.slug}
              audioKey={form.audio_key}
              audioBytes={existing.data?.audio_key === form.audio_key ? existing.data?.audio_bytes ?? null : null}
              onUploaded={(key, durationSec) => {
                set('audio_key', key);
                if (durationSec && !form.duration) set('duration', durationToInput(Math.round(durationSec)));
              }}
              onRemove={() => set('audio_key', '')}
            />
            <Field label="Vidéo YouTube" hint="Colle le lien de la vidéo (ou son ID)." error={errors.youtube}>
              <input value={form.youtube} onChange={(e) => set('youtube', e.target.value)} placeholder="https://www.youtube.com/watch?v=…" />
            </Field>
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
                {busy === 'save' ? 'Enregistrement…' : isNew ? 'Créer le brouillon' : dirty ? 'Enregistrer' : 'Enregistré ✓'}
              </button>
              {!isNew && (
                <button type="button" className="btn secondary" disabled={!!busy} onClick={togglePublish}>
                  {busy === 'publish' ? 'Un instant…' : status === 'published' ? 'Dépublier' : dirty ? 'Enregistrer et publier' : 'Publier'}
                </button>
              )}
              {!isNew && status === 'published' && (
                <Link className="btn ghost" to={`/episodes/${saved.slug}`} target="_blank">Voir sur le site ↗</Link>
              )}
              {!isNew && (
                <button type="button" className="btn danger ghost-danger" disabled={!!busy} onClick={() => setAskDelete(true)}>
                  Supprimer l’épisode
                </button>
              )}
            </div>
            {isNew && <p className="meta">Un nouvel épisode est toujours créé en brouillon : tu pourras le publier ensuite.</p>}
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

/** Envoi du MP3 (glisser-déposer ou choix du fichier), avec barre de progression. */
function AudioUpload(props: {
  slug: string;
  audioKey: string;
  audioBytes: number | null;
  onUploaded: (key: string, durationSec?: number) => void;
  onRemove: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [drag, setDrag] = useState(false);

  const handle = async (file: File | undefined) => {
    setError('');
    setInfo('');
    if (!file) return;
    if (file.type !== 'audio/mpeg' && !file.name.toLowerCase().endsWith('.mp3')) return setError('Seuls les fichiers MP3 sont acceptés.');
    if (!props.slug) return setError('Renseigne d’abord le titre (le fichier est nommé d’après l’adresse de la page).');
    if (file.size > 100 * 1024 * 1024) return setError('Fichier trop lourd (100 Mo maximum).');

    // Durée lue directement dans le fichier, pour pré-remplir le champ « Durée »
    const durationSec = await new Promise<number | undefined>((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      audio.preload = 'metadata';
      audio.onloadedmetadata = () => { resolve(Number.isFinite(audio.duration) ? audio.duration : undefined); URL.revokeObjectURL(url); };
      audio.onerror = () => { resolve(undefined); URL.revokeObjectURL(url); };
      audio.src = url;
    });

    setProgress(0);
    try {
      const res = await uploadMp3(file, `${props.slug}.mp3`, setProgress);
      props.onUploaded(res.key, durationSec);
      setInfo('Fichier envoyé ✓ — pense à enregistrer.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="field">
      <span>Fichier audio (MP3)</span>
      {props.audioKey && progress === null ? (
        <div className="audio-file">
          <span className="audio-icon" aria-hidden>♪</span>
          <div>
            <strong>{props.audioKey}</strong>
            <small className="field-hint">{props.audioBytes ? formatBytes(props.audioBytes) : 'Prêt à être publié'}</small>
          </div>
          <button type="button" className="btn ghost small" onClick={() => input.current?.click()}>Remplacer</button>
          <button type="button" className="btn ghost small" onClick={props.onRemove}>Retirer</button>
        </div>
      ) : (
        <button
          type="button"
          className={`dropzone ${drag ? 'is-drag' : ''}`}
          onClick={() => input.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
          disabled={progress !== null}
        >
          {progress !== null ? (
            <>
              <span>Envoi en cours… {Math.round(progress * 100)} %</span>
              <span className="progress"><span style={{ width: `${progress * 100}%` }} /></span>
            </>
          ) : (
            <>
              <strong>Glisse ton MP3 ici</strong>
              <span>ou clique pour choisir un fichier (100 Mo max)</span>
            </>
          )}
        </button>
      )}
      <input ref={input} type="file" accept="audio/mpeg,.mp3" hidden onChange={(e) => { handle(e.target.files?.[0]); e.target.value = ''; }} />
      {error && <small className="field-error">{error}</small>}
      {info && <small className="field-hint">{info}</small>}
    </div>
  );
}
