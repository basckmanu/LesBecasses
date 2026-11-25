// Prépare l'environnement local : .dev.vars, base D1 locale (migrations + seed).
// Peut être relancé sans risque.
import { copyFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const run = (cmd) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
};

if (!existsSync('.dev.vars')) {
  copyFileSync('.dev.vars.example', '.dev.vars');
  console.log('.dev.vars créé depuis .dev.vars.example');
} else {
  console.log('.dev.vars déjà présent, conservé');
}

run('npx wrangler d1 migrations apply podcast-db --local');
run('npx wrangler d1 execute podcast-db --local --file=database/seed.sql');

console.log('\nPrêt. Lance `npm run server` puis `npm run dev` (ou `npm start` pour les deux).');
