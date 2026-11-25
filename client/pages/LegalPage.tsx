// MAQUETTE : structure obligatoire (LCEN). Contenu réel à fournir par Infra 3 / la Com.
export function LegalPage() {
  return (
    <article className="prose">
      <h1>Mentions légales</h1>

      <h2>Éditeur du site</h2>
      <p>[Nom de l'association ou de la personne] — [adresse] — contact@exemple.fr</p>

      <h2>Directeur de la publication</h2>
      <p>[Nom du directeur ou de la directrice de la publication]</p>

      <h2>Hébergeur</h2>
      <p>Cloudflare, Inc. — 101 Townsend St, San Francisco, CA 94107, États-Unis.</p>

      <h2>Données personnelles et cookies</h2>
      <p>
        Ce site ne crée pas de compte utilisateur et n'utilise pas de cookies publicitaires. La mesure d'audience
        (Cloudflare Web Analytics) fonctionne sans cookies. Les vidéos YouTube ne sont chargées qu'à votre demande.
      </p>
    </article>
  );
}
