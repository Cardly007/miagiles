# Cahier de Test - OnlyJam V2

Ce document liste les scénarios de test pour valider les nouvelles fonctionnalités (F1 à F6) développées pour la V2 d'OnlyJam.

## F1 — Synchronisation Audio (Correctif Critique)
- [ ] **Test de lecture hôte** : En tant qu'hôte, lancer un titre de la file d'attente. Vérifier que la lecture démarre en moins de 3 secondes sans téléchargement complet.
- [ ] **Test de connexion invité** : En tant qu'invité, rejoindre une session où l'hôte joue déjà un titre depuis plus de 10 secondes. Vérifier que l'audio démarre au bon moment (synchronisé avec l'hôte à +/- 2s).
- [ ] **Test pause/reprise** : L'hôte met en pause. Les invités doivent aussi être en pause. L'hôte reprend la lecture, tout le monde doit reprendre de manière synchronisée.
- [ ] **Test de positionnement (Seek)** : L'hôte avance manuellement dans le morceau (seek). La position de lecture de tous les invités doit être mise à jour pour refléter ce changement.
- [ ] **Test mobile** : Lancer un Jam sur un appareil mobile, vérifier que la lecture démarre et ne crash pas l'onglet.

## F2 — Chat en Temps Réel
- [ ] **Envoi de message** : Taper et envoyer un message depuis l'input du chat. Il doit apparaître instantanément.
- [ ] **Réception en temps réel** : Un invité doit recevoir les messages envoyés par l'hôte et les autres invités.
- [ ] **Historique du chat** : Quitter la session et la rejoindre de nouveau. Vérifier que les derniers messages (max 50) s'affichent correctement.
- [ ] **Modération** : L'hôte clique sur le bouton de suppression d'un message. Le message doit être masqué/supprimé pour tous les participants en temps réel.

## F3 — Rooms Publiques & Découverte
- [ ] **Création publique** : Créer un nouveau Jam public. Vérifier qu'il apparaît dans l'onglet "Discover".
- [ ] **Compteur d'auditeurs** : Dans l'onglet "Discover", vérifier que le nombre de participants s'incrémente/décrémente en temps réel quand des utilisateurs rejoignent ou quittent.
- [ ] **Rejoindre depuis Discover** : Cliquer sur la carte d'une session publique dans "Discover" et vérifier l'entrée réussie dans le Jam sans code d'invitation.
- [ ] **Sessions privées** : Si le Jam est créé ou modifié en "privé", il ne doit pas apparaître dans la liste "Discover".

## F4 — Profils Utilisateurs Complets
- [ ] **Création de compte** : Lors de la première visite, un utilisateur crée son profil (onboarding). Son ID et ses informations doivent persister (simulé via `localStorage`).
- [ ] **Historique d'écoute** : Après avoir participé à un Jam, quitter et se rendre sur son profil. Le Jam doit apparaître dans l'historique d'écoute avec le bon rôle et la date.
- [ ] **Fermeture navigateur** : Fermer l'onglet ou le navigateur, rouvrir l'application. Vérifier que l'utilisateur est toujours connecté et ne repasse pas par l'onboarding.

## F5 — Notifications Temps Réel
- [ ] **Toast d'ajout de titre** : Un invité ajoute un titre. Tous les participants doivent voir un toast "🎵 [User] a ajouté [Titre]".
- [ ] **Toast de nouvel auditeur** : Un nouvel utilisateur rejoint la session. L'hôte doit recevoir une notification "👤 [User] a rejoint le Jam".
- [ ] **Centre de notifications** : Ouvrir l'historique (icône cloche) et vérifier que les dernières notifications y sont listées.
- [ ] **Queue de notifications** : Déclencher plusieurs événements simultanément. Les toasts doivent s'afficher en file d'attente sans se superposer (FIFO).

## F6 — Historique & Persistance de Session
- [ ] **Persistance de l'état (Refresh)** : En tant que participant à un Jam, recharger complètement la page (F5). La session doit être restaurée (morceau en cours, position de lecture, file d'attente) sans être coupée.
- [ ] **Persistance de la Queue** : Ajouter un titre à la file. Recharger la page. Le titre doit toujours être dans la file d'attente (la DB est source de vérité).
- [ ] **Pause persistante** : L'hôte met la session en pause. Un nouvel invité rejoint la session : sa lecture doit être en pause.
