# OnlyJam V2

**OnlyJam** est une plateforme d'écoute musicale collaborative et synchronisée en temps réel, conçue pour connecter les gens à travers des expériences audio partagées (Jams). Avec sa V2, l'application intègre désormais la recherche YouTube, le chat en temps réel, un mode anonyme, et un système social complet.

*Consultez [ARCHITECTURE.md](ARCHITECTURE.md) pour les détails techniques sur la synchronisation audio (Jam Sync) et le proxy yt-dlp.*

## Fonctionnalités Principales (V2)

### 🎵 Streaming Gratuit (Audius & YouTube)
Recherchez et écoutez des milliers de titres.
- Intégration de l'API publique d'Audius.
- **Nouveau :** Recherche via la YouTube Data API v3 avec lecture audio native via `yt-dlp` côté serveur.

### ⚡ Jam Sync (Synchronisation Milliseconde)
- L'hôte contrôle la lecture. Les invités rejoignent le flux exactement à la bonne seconde grâce au décalage temporel serveur/client.
- **Nouveau :** L'audio est désormais global. Vous pouvez naviguer dans l'application (Chat, Profil, Social) sans que la musique ne se coupe !

### 💬 Chat en Temps Réel & Mode Anonyme
- Discutez en direct pendant l'écoute avec le nouveau **Live Chat Overlay** (style Instagram Live sur mobile).
- **Mode Anonyme (Anonymous Music) :** L'hôte peut masquer l'auteur des musiques ajoutées pour faire deviner qui a mis tel ou tel morceau.

### 👥 Système Social et Persistance
- **Profils Utilisateurs :** L'historique complet de vos sessions est sauvegardé.
- **Amis & Live Now :** Ajoutez vos amis et voyez en temps réel s'ils sont en train d'écouter de la musique pour les rejoindre.
- La session entière (file d'attente, chat, lecture) est persistante. Recharger la page ne vous déconnecte plus du Jam.

---

## 🚀 Démarrer le Projet

Vous pouvez lancer OnlyJam de deux manières : avec Docker (recommandé pour inclure toutes les dépendances audio) ou en local (Node.js).

### Prérequis (Variables d'environnement)
Avant de lancer le projet, configurez vos clés d'API.
1. Copiez `.env.example` vers `.env` (ou `.env.docker.example` vers `.env` si vous utilisez Docker).
2. Renseignez votre `YOUTUBE_API_KEY` (obtenue via Google Cloud Console).

### Option 1 : Lancer avec Docker (Recommandé)
Docker installera automatiquement `yt-dlp`, Python, et configurera la base de données.

```bash
docker-compose up --build
```
L'application sera accessible sur `http://localhost:4000` (ou le port défini dans `docker-compose.yml`).

### Option 2 : Lancer en Local (Node.js)

1. **Installer yt-dlp (Requis pour YouTube)**
   Vous devez avoir `python3` et la toute **dernière version** de `yt-dlp` installés. Ne pas utiliser `apt-get install yt-dlp` car la version des dépôts Debian/Ubuntu est souvent obsolète et sera bloquée par YouTube (Erreur 400).
   ```bash
   sudo apt-get update && sudo apt-get install -y python3 wget
   sudo wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp
   sudo chmod a+rx /usr/local/bin/yt-dlp
   ```

2. **Installer les dépendances Node.js**
   ```bash
   npm install
   ```

3. **Initialiser la base de données SQLite**
   (Utilisez strictement Prisma v6 pour éviter les conflits de version)
   ```bash
   npx prisma@6 db push
   npx prisma@6 generate
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:3000`.

---

## 🛠️ Dépannage YouTube (Erreur "Bot" ou 400 Bad Request)

YouTube est très agressif contre les requêtes serveurs et peut bloquer `yt-dlp` avec un message `Sign in to confirm you’re not a bot` ou `ERROR - Precondition check failed`.

Pour contourner ce blocage, vous devez prouver que vous êtes humain en fournissant les **Cookies de votre navigateur** à l'application.

### Comment fournir vos cookies à OnlyJam ?
1. Sur votre navigateur (ordinateur), installez l'extension Chrome ou Firefox nommée **"Get cookies.txt LOCALLY"** ou **"EditThisCookie"**.
2. Connectez-vous à votre compte sur [YouTube.com](https://www.youtube.com).
3. Cliquez sur l'extension et choisissez d'exporter les cookies au format **Netscape** (`cookies.txt`).
4. Placez ce fichier nommé exactement `cookies.txt` à la racine de ce projet (dans le dossier `/app` si vous êtes sous Docker, au même niveau que `package.json`).
5. Redémarrez l'application.

> Le backend (via `server.ts`) détectera automatiquement la présence de `cookies.txt` et l'utilisera avec `yt-dlp` pour autoriser la lecture des musiques.

## Licence
MIT
