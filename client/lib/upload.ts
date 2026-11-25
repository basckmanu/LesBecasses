import { adminAuthHeader } from './admin-auth';

// Envoi d'un MP3 vers R2 via le Worker (plan B du document : PUT /api/admin/uploads/:key,
// le Worker streame le fichier vers R2). Fonctionne en local sans clés S3.
// XMLHttpRequest plutôt que fetch : c'est le seul moyen simple d'avoir la progression d'envoi.

export type UploadResult = { key: string; size?: number; alreadyThere?: boolean };

export function uploadMp3(file: File, key: string, onProgress: (ratio: number) => void): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `/api/admin/uploads/${encodeURIComponent(key)}`);
    xhr.setRequestHeader('Content-Type', 'audio/mpeg');
    for (const [k, v] of Object.entries(adminAuthHeader())) xhr.setRequestHeader(k, v);

    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onerror = () => reject(new Error("L'envoi a échoué (connexion perdue ?)"));
    xhr.onload = () => {
      let data: { error?: string; size?: number } = {};
      try {
        data = JSON.parse(xhr.responseText || '{}');
      } catch {
        /* réponse non JSON */
      }
      if (xhr.status === 201) resolve({ key, size: data.size });
      // Un fichier porte déjà ce nom : on le réutilise
      else if (xhr.status === 409) resolve({ key, alreadyThere: true });
      else reject(new Error(data.error ?? `Envoi refusé (erreur ${xhr.status})`));
    };
    xhr.send(file);
  });
}
