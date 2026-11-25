// MAQUETTE : textes factices, à remplacer par ceux de la Com.
export function AboutPage() {
  return (
    <article className="prose">
      <h1>À propos</h1>
      <p>
        Les Bécasses, c'est une bande d'amies qui a décidé de transformer ses discussions de canapé en podcast. Plaid
        sur les genoux, tasse à la main : on parle de tout, on n'est d'accord sur rien, et c'est précisément ce qui
        nous plaît.
      </p>
      <p>
        Pourquoi « Les Bécasses » ? Parce que c'est un joli oiseau des sous-bois, discret et un peu têtu… et parce
        qu'on assume de dire parfois des bêtises.
      </p>

      <h2>Notre histoire</h2>
      <ul className="timeline">
        <li>
          <strong>Printemps 2026</strong>
          L'idée naît autour d'une table, après un débat de trois heures sur un sujet sans importance.
        </li>
        <li>
          <strong>Été 2026</strong>
          Premier micro, premiers enregistrements ratés, premier épisode publié.
        </li>
        <li>
          <strong>Automne 2026</strong>
          Lancement du site, de la chaîne YouTube et arrivée sur Spotify et Apple Podcasts.
        </li>
      </ul>

      <h2>Nous contacter</h2>
      <p>
        Une idée de sujet, une envie de venir en invité·e ? Écrivez-nous à <a href="mailto:contact@exemple.fr">contact@exemple.fr</a>.
      </p>
    </article>
  );
}
