# Déploiement sur VM Locale avec Docker

Ce guide explique comment démarrer l'application OnlyJam sur une Machine Virtuelle (VM) locale en utilisant Docker et Docker Compose.

## Prérequis

Assurez-vous que les éléments suivants sont installés sur votre VM :
1. **Docker** : [Instructions d'installation](https://docs.docker.com/engine/install/)
2. **Docker Compose** : [Instructions d'installation](https://docs.docker.com/compose/install/)
3. **Git** (pour cloner le projet, si ce n'est pas déjà fait)

## Étapes de démarrage

### 1. Cloner ou transférer le projet
Si vous ne l'avez pas encore fait, récupérez le code source sur votre VM :
```bash
git clone <URL_DE_VOTRE_DEPOT>
cd onlyjam
```
*(Si vous transférez les fichiers manuellement, naviguez simplement dans le dossier du projet).*

### 2. Configurer les variables d'environnement
Copiez le fichier d'exemple pour créer votre fichier de configuration `.env` :
```bash
cp .env.docker.example .env
```
Éditez le fichier `.env` pour y ajouter votre clé API Gemini :
```bash
# Remplacez "your_gemini_api_key_here" par votre vraie clé en éditant le fichier
```

### 3. Lancer l'application
Construisez l'image Docker et démarrez le conteneur en arrière-plan avec Docker Compose :
```bash
docker compose up -d --build
```

### 4. Accéder à l'application
Une fois le conteneur démarré, l'application sera accessible sur les ports **4000** et **4001** de votre VM.

Ouvrez votre navigateur web et naviguez vers l'une des adresses suivantes :
- `http://<IP_DE_VOTRE_VM>:4000`
- `http://<IP_DE_VOTRE_VM>:4001`

*(Si vous êtes directement sur le navigateur de la VM, vous pouvez utiliser `http://localhost:4000`)*

## Gestion du conteneur

Voici quelques commandes utiles pour gérer votre application :

- **Voir les logs en temps réel** :
  ```bash
  docker compose logs -f
  ```

- **Arrêter l'application** :
  ```bash
  docker compose down
  ```

- **Redémarrer l'application** :
  ```bash
  docker compose restart
  ```

## Notes sur la base de données
L'application utilise une base de données SQLite. Grâce aux volumes Docker (`onlyjam-db-data`), les données de votre application (sessions, musiques, etc.) sont sauvegardées et **persisteront** même si vous arrêtez ou supprimez le conteneur avec `docker compose down`.
