# Architecture Technique - OnlyJam V2

Ce document détaille l'architecture de la V2 d'OnlyJam, avec un focus particulier sur la synchronisation audio en temps réel ("Jam Sync") et l'intégration des APIs de plateformes (Audius et YouTube).

## 1. Stack Technique
- **Frontend** : React 19, TypeScript, Tailwind CSS, Vite.
- **Backend** : Node.js (Express 5), Socket.io v4.
- **Base de données** : SQLite gérée via **Prisma ORM v6**.
- **Outils externes** : `yt-dlp` (pour l'extraction des flux audio YouTube).

---

## 2. Le Moteur Audio ("Jam Sync")

L'innovation principale de la V2 d'OnlyJam réside dans sa capacité à synchroniser parfaitement la lecture de musique entre de multiples utilisateurs, qu'ils soient sur ordinateur ou sur mobile (où l'autoplay est souvent restreint).

### 2.1 Le lecteur global (`<audio>`)
Contrairement à la V1 qui créait et détruisait des contextes audio (`AudioContext`) dans la vue du lecteur, la V2 utilise un élément HTML natif `<audio>` géré au niveau global de l'application (`App.tsx`).
- **Avantage :** La musique continue de jouer sans interruption lorsque l'utilisateur navigue entre les différentes vues (Recherche, Chat, Profil, etc.).
- **Compatibilité Mobile :** Les navigateurs mobiles bloquent souvent l'autoplay si le son n'est pas déclenché par une interaction directe de l'utilisateur. Le passage à `<audio>` permet de mieux gérer les erreurs `NotAllowedError` et d'afficher un bouton "Tap to Sync" si nécessaire.

### 2.2 La Synchronisation du Temps (Time Sync)
L'Hôte agit comme le "Maître du Temps".
1. Lorsqu'une musique démarre, le serveur enregistre l'heure exacte dans la base de données (`currentTrackStartTime = now()`).
2. Cet état est diffusé à tous les clients via WebSockets (`track-playing` ou `session-state`).
3. Chaque client calcule le décalage (offset) : `offset = (Date.now() - serverStartTime) / 1000`.
4. Le lecteur audio local est avancé à cette position : `audio.currentTime = offset`.

### 2.3 Gestion de la Pause
Pour éviter que la musique ne reprenne au mauvais endroit après une pause :
1. L'Hôte met en pause : le serveur enregistre l'instant exact dans `pausedAt`.
2. L'Hôte reprend la lecture : le serveur calcule la durée de la pause (`Date.now() - pausedAt`) et **décale** le `currentTrackStartTime` d'autant de temps vers le futur.
3. Les clients recalculent leur offset par rapport à ce nouveau point de départ, garantissant une reprise sans saut.

---

## 3. Intégration des Plateformes Musicales

OnlyJam agit comme un agrégateur unifié pour Audius et YouTube.

### 3.1 La Recherche (Search API)
Le backend expose une route `/api/search?q={query}&platform={audius|youtube}`.
- **Audius** : Le backend fait un proxy direct vers l'API publique d'Audius.
- **YouTube** : Le backend utilise la YouTube Data API v3.
  - *Quota API* : Chaque recherche YouTube coûte cher (100 unités). Pour protéger les quotas, les résultats sont mis en cache en mémoire (Map) pendant 24 heures. Un délai (debounce) de 1000ms est imposé côté frontend avant de déclencher la recherche YouTube.
  - *Durée* : L'API YouTube ne renvoie pas la durée dans les résultats de recherche. Le backend effectue donc un second appel (`videos?part=contentDetails`), parse le format ISO 8601 (`PT3M45S`), et unifie la réponse.

### 3.2 Le Streaming Audio (Le Proxy yt-dlp)
Les navigateurs ne peuvent pas lire directement une vidéo YouTube comme source audio dans une balise `<audio>`.
1. **Audius** : L'URL de stream est directe et ouverte (`https://discoveryprovider.audius.co/.../stream`).
2. **YouTube** : L'utilisation de l'URL brute de la vidéo cause des erreurs `NotSupportedError` et des blocages CORS.
   - **Solution :** Le backend expose la route `/api/stream/youtube/:videoId`.
   - Lorsqu'un client appelle cette URL, le backend Node.js lance un processus enfant (`spawn`) avec **`yt-dlp`**.
   - `yt-dlp` extrait le flux audio de la plus haute qualité (`bestaudio`).
   - Node.js récupère la sortie standard (stdout) de `yt-dlp` et la "pipe" (la diffuse en direct) dans la réponse HTTP (Express) avec le header `Content-Type: audio/webm`.
   - **Résultat :** Pour le frontend React, le son YouTube se comporte exactement comme un fichier MP3/WebM classique hébergé sur notre propre serveur, résolvant instantanément tous les problèmes de format et de CORS.

---

## 4. Persistance et Base de Données
Le projet utilise SQLite pour sa simplicité en développement et déploiement léger.
- **Identité** : `localStorage` est utilisé (`onlyjam_userId`) pour "reconnaître" les utilisateurs au retour sur le site sans avoir besoin de mot de passe.
- **Historique & Social** : Les modèles `JamParticipation` et `Friend` permettent de lister l'historique d'écoute complet et de voir quels amis sont "Live Now".
- **Persistance des sessions** : Le rechargement de page (F5) n'est plus destructif. Le backend renvoie l'état complet du lecteur, du chat, et de la file d'attente via l'événement WS `session-state` dès la reconnexion du socket.