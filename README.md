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

## Build et déploiement

```bash
npm run deploy
```

Le script va :
1. Builder le site en pages statiques
2. Déployer sur le serveur FTP configuré

## Structure

- `lib/openfoodfacts.ts` - Récupération des données Open Food Facts
- `pages/index.tsx` - Page principale avec liste et filtres
- `scripts/deploy.js` - Script de déploiement FTP
- `public/` - Assets statiques

