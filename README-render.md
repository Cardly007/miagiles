# Déploiement sur Render - OnlyJam

Ce guide détaille les étapes pour déployer l'application Fullstack (React + Express + WebSockets + Prisma) sur [Render.com](https://render.com).

## Prérequis
- Un compte sur [Render](https://render.com).
- Le code source hébergé sur un dépôt GitHub ou GitLab.

## Étape 1 : Préparer le code pour la production (PostgreSQL)
Render utilise des bases de données PostgreSQL. SQLite (utilisé en local) n'est pas recommandé en production sur Render car le système de fichiers est réinitialisé à chaque nouveau déploiement.

1. Ouvrez le fichier `prisma/schema.prisma`.
2. Modifiez le bloc `datasource` pour utiliser PostgreSQL au lieu de SQLite :
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Commitez et pushez cette modification sur votre dépôt Git.

## Étape 2 : Créer la base de données sur Render
1. Sur le dashboard Render, cliquez sur **New** > **PostgreSQL**.
2. Donnez un nom à votre base de données (ex: `onlyjam-db`).
3. Choisissez la région la plus proche de vos utilisateurs (ex: Frankfurt ou Paris).
4. Sélectionnez le plan gratuit (Free) ou payant selon vos besoins.
5. Cliquez sur **Create Database**.
6. Une fois créée, descendez dans la page et copiez l'URL de connexion interne (**Internal Database URL**).

## Étape 3 : Créer le Web Service (L'application)
1. Sur le dashboard Render, cliquez sur **New** > **Web Service**.
2. Connectez votre dépôt GitHub/GitLab contenant le code de OnlyJam.
3. Configurez le service comme suit :
   - **Name** : `onlyjam-app`
   - **Environment** : `Node`
   - **Build Command** : `npm install && npx prisma generate && npx prisma db push && npm run build`
   - **Start Command** : `npm start`
4. Dans la section **Environment Variables**, ajoutez les variables suivantes :
   - `NODE_ENV` : `production`
   - `DATABASE_URL` : Collez l'URL de la base de données copiée à l'étape 2.
5. Cliquez sur **Create Web Service**.

## Étape 4 : Déploiement et WebSockets
Render va maintenant construire et déployer votre application. 
- **WebSockets** : Render supporte nativement les WebSockets (Socket.io). Aucune configuration de port supplémentaire n'est requise, tout passe par le port web standard (Render route automatiquement le trafic).
- Une fois le déploiement terminé (statut "Live"), cliquez sur le lien fourni par Render (ex: `https://onlyjam-app.onrender.com`) pour accéder à votre application en ligne !

## Dépannage
- **Erreur Prisma au démarrage** : Assurez-vous que la commande de build contient bien `npx prisma generate` et `npx prisma db push` pour que la structure de la base de données soit créée sur PostgreSQL.
- **Problème de connexion DB** : Vérifiez que votre `DATABASE_URL` est correcte et que le provider dans `schema.prisma` est bien défini sur `"postgresql"`.
