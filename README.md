# Whey Protein.fr

Site statique listant toutes les whey protéines et protéines en poudre depuis Open Food Facts.

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Build et déploiement

```bash
npm run deploy
```

Le script va :
1. Builder le site en pages statiques (génère le dossier `out/`)
2. Déployer sur le serveur FTP configuré

## Setup GitHub

1. Créez un nouveau repository sur GitHub
2. Ajoutez le remote :
   ```bash
   git remote add origin https://github.com/VOTRE_USERNAME/whey-protein.fr.git
   git branch -M main
   git push -u origin main
   ```

3. Pour le déploiement automatique via GitHub Actions, configurez les secrets dans les paramètres du repo :
   - `FTP_HOST`: 89.117.169.72
   - `FTP_USER`: u679468784
   - `FTP_PASSWORD`: (votre mot de passe FTP)

## Structure

- `lib/openfoodfacts.ts` - Récupération des données Open Food Facts
- `pages/index.tsx` - Page principale avec liste et filtres
- `scripts/deploy.js` - Script de déploiement FTP
- `public/` - Assets statiques
- `.github/workflows/deploy.yml` - Workflow GitHub Actions pour déploiement automatique

## Fonctionnalités

- Liste de tous les produits whey/protéines en poudre depuis Open Food Facts
- Affichage en grille responsive (4 colonnes sur desktop)
- Filtres en sidebar :
  - Recherche par nom
  - Filtre par quantité de protéines (g/100g)
  - Filtre par marque
  - Filtre par Nutri-Score
- Données stockées dans les attributs `data-*` pour filtrage côté client
- Pages statiques générées au build pour performance optimale

