# Déploiement Local - OnlyJam

Ce guide vous explique comment configurer et lancer l'application OnlyJam sur votre machine locale pour le développement.

## Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure)
- Git

## Étapes d'installation

### 1. Cloner le projet
Si ce n'est pas déjà fait, clonez le dépôt et placez-vous dans le dossier du projet :
```bash
git clone <votre-repo-url>
cd onlyjam
```

### 2. Installer les dépendances
Installez tous les paquets nécessaires pour le frontend et le backend :
```bash
npm install
```

### 3. Configuration des variables d'environnement
Créez un fichier `.env` à la racine du projet en vous basant sur le fichier d'exemple :
```bash
cp .env.example .env
```
*Note : Par défaut, le projet est configuré pour utiliser une base de données SQLite locale (`file:./dev.db`). Vous n'avez pas besoin de configurer un serveur PostgreSQL complexe pour le développement local.*

### 4. Initialiser la base de données
Générez le client Prisma et créez les tables dans votre base de données SQLite locale :
```bash
npx prisma generate
npx prisma db push
```

### 5. Lancer le serveur de développement
Démarrez le serveur (qui gère à la fois l'API Express, les WebSockets et le frontend Vite en mode middleware) :
```bash
npm run dev
```

### 6. Accéder à l'application
Ouvrez votre navigateur et allez sur : **http://localhost:3000**

---

## Commandes utiles
- `npm run dev` : Lance le serveur de développement avec rechargement à chaud.
- `npx prisma studio` : Ouvre une interface graphique dans votre navigateur pour visualiser et modifier les données de votre base de données locale.
- `npm run build` : Compile le frontend pour la production.
