# Cylentic — Document de Référence du Projet

**Rédigé :** Mars 2026  
**Usage :** Personnel + transmission à tout développeur rejoignant le projet

---

## Sommaire

1. [Le problème que résout Cylentic](#1-le-problème-que-résout-examsecure)
2. [Les acteurs de la plateforme](#2-les-acteurs-de-la-plateforme)
3. [Fonctionnement global — vue d'ensemble](#3-fonctionnement-global--vue-densemble)
4. [Flux détaillé — Parcours étudiant](#4-flux-détaillé--parcours-étudiant)
5. [Flux détaillé — Parcours professeur](#5-flux-détaillé--parcours-professeur)
6. [Flux détaillé — Parcours Admin Établissement](#6-flux-détaillé--parcours-admin-établissement)
7. [Sécurité — Dispositif anti-triche](#7-sécurité--dispositif-anti-triche)
8. [L'IDE intégré](#8-lide-intégré)
9. [Correction automatique](#9-correction-automatique)
10. [Module QCM](#10-module-qcm)
11. [Architecture technique](#11-architecture-technique)
12. [Modèle économique](#12-modèle-économique)
13. [Ce qui est prévu mais pas dans le MVP](#13-ce-qui-est-prévu-mais-pas-dans-le-mvp)
14. [Points de vigilance](#14-points-de-vigilance)

---

## 1. Le problème que résout Cylentic

Dans les filières informatiques, les étudiants utilisent des outils d'IA (ChatGPT, Copilot, etc.) pour répondre à leurs devoirs de programmation. Les professeurs ne peuvent pas le détecter, et certains renoncent donc à donner des devoirs sur ordinateur. C'est une régression pédagogique.

**Cylentic** est une plateforme web qui permet à un étudiant de coder un examen directement dans le navigateur, sans pouvoir en sortir ni utiliser une aide extérieure, et dont le code est corrigé automatiquement.

---

## 2. Les acteurs de la plateforme

La plateforme compte 4 types d'utilisateurs, chacun avec son propre espace et ses propres droits. Le rôle est déduit automatiquement par le système à partir du format de l'identifiant — **l'utilisateur ne sélectionne pas son rôle manuellement.**

| Acteur | Rôle | Ce qu'il peut faire |
|--------|------|---------------------|
| Super Admin | Administrateur global de la plateforme | Gérer tous les établissements, plans tarifaires, accès global à tout l'écosystème de la plateforme |
| Admin Établissement | Responsable d'une école sur la plateforme | Créer/gérer l'espace école, ajouter profs et étudiants, configurer les paramètres |
| Professeur | Crée et surveille les examens | Créer examens et QCM, définir tests unitaires, voir résultats, corriger manuellement |
| Étudiant | Compose les examens | Se connecter avec code d'examen, coder, soumettre, recevoir confirmation de soumission |

> **Note :** Le surveillant physique en salle n'a pas de compte sur la plateforme. Son rôle est uniquement humain : surveiller les comportements suspects (téléphone, communication entre étudiants) et noter manuellement les incidents physiques avec leur heure.

---

## 3. Fonctionnement global — vue d'ensemble

Voici le flux complet de la vie d'un examen sur la plateforme :

| Étape | Description |
|-------|-------------|
| **Étape 1** | L'admin crée l'espace de l'établissement et enregistre les profs et étudiants (saisie manuelle ou import CSV). Chaque utilisateur reçoit un identifiant généré automatiquement. |
| **Étape 2** | Le professeur se connecte, crée un examen : énoncé, langage (Python pour le MVP), durée, date/heure de début, délai d'accès après démarrage, tests unitaires. |
| **Étape 3** | La plateforme génère un code d'examen unique aléatoire (format 8 caractères alphanumériques, ex : `K7BX-29QR`). Le prof/surveillant remet ce code aux étudiants avant le début. |
| **Étape 4** | L'étudiant tape l'URL de la plateforme, saisit son identifiant, mot de passe et le code d'examen. Il est redirigé vers une page de consignes de sécurité puis une salle d'attente. |
| **Étape 5** | Au top départ (heure configurée par le prof), tous les étudiants sont automatiquement redirigés vers la page de composition avec l'IDE intégré et le timer. |
| **Étape 6** | L'étudiant code, exécute son code pour tester, puis soumet. La plateforme exécute les tests unitaires dans le sandbox et calcule le score. |
| **Étape 7** | Le professeur accède aux résultats quand il le souhaite : code soumis par chaque étudiant, score, journal des incidents, heure de soumission. Il peut ajouter une correction manuelle. |

---

## 4. Flux détaillé — Parcours étudiant

### 4.1 Création et activation du compte étudiant

À la rentrée, l'admin de l'établissement crée les comptes de tous les nouveaux étudiants. Pour chaque étudiant, les informations suivantes sont saisies :

| Champ | Obligatoire ? | Notes |
|-------|--------------|-------|
| Nom | Oui | |
| Prénom | Oui | |
| Classe / Promotion | Oui | Ex : L2 INFO, BTS SIO 2ème année |
| Numéro matricule / INE | Oui | |
| Email | Oui | Utilisé pour l'envoi des identifiants et l'activation du compte |

La plateforme génère automatiquement un identifiant unique. Le format permet au système de déduire le rôle automatiquement :

| Type d'utilisateur | Format d'identifiant | Exemple |
|--------------------|---------------------|---------|
| Étudiant | `ETU-AAAA-XXXX` | `ETU-2025-0042` |
| Professeur | `PROF-XXXX` | `PROF-0012` |
| Admin Établissement | `ADM-XXXX` | `ADM-0003` |

**Flux d'activation du compte (MVP)**

1. L'admin crée les comptes → la plateforme génère les identifiants.
2. Un bouton permet d'envoyer en masse les identifiants + mot de passe par défaut (`1234`) par email à tous les étudiants.
3. L'étudiant reçoit son email, se connecte et change son mot de passe.
4. Si l'étudiant n'a pas activé son compte avant le jour de l'examen, le mot de passe par défaut (`1234`) reste fonctionnel — une bannière lui rappelle de personnaliser son mot de passe.

---

### 4.2 Connexion le jour de l'examen

Le surveillant (ou le professeur) remet le code d'examen aux étudiants avant le début officiel — typiquement 15 à 20 minutes avant — pour leur laisser le temps de se connecter.

**Format du code d'examen**

- 8 caractères alphanumériques, format `XXXX-XXXX` (ex : `K7BX-29QR`)
- Caractères ambigus exclus : `0/O`, `1/I/l` — pour faciliter la lecture et la saisie orale
- Unique par examen — un nouvel examen génère toujours un nouveau code aléatoire
- Le code expire automatiquement à la fin de l'examen
- Délai d'accès configurable par le prof après démarrage (ex : 15 min pour les retardataires)
- Maximum 5 tentatives de saisie incorrecte avant blocage temporaire (protection anti-brute force)

**Page de connexion**

L'étudiant accède à l'URL et saisit trois champs :

- Son identifiant (ex : `ETU-2025-0042`)
- Son mot de passe
- Le code de l'examen (ex : `K7BX-29QR`)

Le système déduit automatiquement le rôle depuis le format de l'identifiant. Il n'y a pas de sélection manuelle du rôle.

---

### 4.3 Page de consignes de sécurité

Après connexion réussie, l'étudiant arrive sur une page de consignes. Cette page a deux objectifs : informer l'étudiant des règles et activer les mécanismes de sécurité du navigateur.

**Ce qui est affiché à l'étudiant**

- Obligation d'utiliser Chrome, Edge ou Opera
- Obligation d'activer le plein écran via un bouton unique « Activer le plein écran et continuer »
- Rappel de fermer tous les autres onglets ouverts
- Rappel que toute sortie du plein écran sera enregistrée comme incident

**Ce qui n'est PAS affiché à l'étudiant**

> Le mécanisme de blocage du presse-papier externe n'est pas mentionné à l'étudiant. Il n'a pas besoin de savoir que ce mécanisme existe — l'objectif est qu'il ne puisse pas contourner ce qu'il ne connaît pas.

**Comportement si le plein écran est refusé**

- Si l'étudiant refuse, la plateforme reste bloquée sur la page de consignes.
- Si le navigateur bloque techniquement la Fullscreen API, un message s'affiche : *« Votre navigateur ne supporte pas cette fonctionnalité. Contactez votre professeur. »*

---

### 4.4 Salle d'attente — avant le début de l'examen

Une fois les consignes validées et le plein écran activé, l'étudiant entre dans la salle d'attente. Cette page permet de distribuer le code à l'avance sans que les étudiants voient l'énoncé avant l'heure officielle.

- Un compte à rebours affiche le temps restant avant le début
- L'énoncé est totalement masqué — l'étudiant ne voit que le timer
- La plateforme enregistre automatiquement l'heure de connexion → **liste de présence numérique automatique**
- Quand le compte à rebours atteint 0, tous les étudiants connectés sont automatiquement redirigés vers la page de composition

---

### 4.5 Page de composition — pendant l'examen

La page de composition est le cœur de l'expérience étudiant. L'interface est inspirée de freeCodeCamp : énoncé d'un côté, éditeur de l'autre.

- Énoncé affiché en permanence dans un panel latéral
- **Monaco Editor** (base de VS Code) pour la saisie du code — coloration syntaxique, indentation automatique
- Timer (compte à rebours) visible en permanence — à 0, soumission automatique du code en cours
- Bouton **« Exécuter »** : le code est envoyé au sandbox Judge0, exécuté dans un Docker isolé
- Bouton **« Soumettre »** avec confirmation (« Êtes-vous sûr ? ») pour éviter les soumissions accidentelles
- Navigation libre entre exercices via un menu latéral

---

### 4.6 Soumission et confirmation

- Après soumission (manuelle ou automatique), l'étudiant voit : *« Votre examen a été soumis avec succès. »*
- **Aucun score n'est affiché immédiatement** — le résultat est communiqué par le professeur
- La plateforme exécute en arrière-plan tous les tests unitaires et calcule la note automatiquement

---

### 4.7 Liste de présence numérique automatique

Au moment de la connexion de chaque étudiant, la plateforme enregistre :

- L'identifiant de l'étudiant
- L'heure exacte de connexion
- L'adresse IP de la machine utilisée

Cette liste est accessible dans le tableau de bord du professeur et peut être comparée à la feuille de présence physique.

---

### 4.8 Protection contre la double soumission — variable `isCompleted`

Chaque participation est associée à une variable `isCompleted` en base de données, liée à la combinaison étudiant + examen.

| État | Valeur | Déclencheur | Conséquence |
|------|--------|-------------|-------------|
| Pas encore connecté | `false` | L'étudiant ne s'est pas encore connecté | Accès normal avec le code d'examen |
| En cours | `false` | L'étudiant entre dans la salle d'attente | Accès à l'examen autorisé |
| Soumis | `true` | Soumission manuelle, expiration du timer, ou expulsion | Toute tentative de reconnexion est bloquée |

Si un étudiant dont `isCompleted = true` tente de se reconnecter, la plateforme affiche : *« Vous avez déjà soumis cet examen. Votre copie a bien été enregistrée. »*

---

## 5. Flux détaillé — Parcours professeur

### 5.1 Création et activation du compte professeur

Le compte professeur est créé par l'admin de l'établissement. La procédure d'activation est identique à celle d'un étudiant.

- L'admin ajoute le prof : nom, prénom, email, matières enseignées (optionnel)
- La plateforme génère un identifiant unique au format `PROF-XXXX` (ex : `PROF-0012`)
- Le prof reçoit ses identifiants par email avec le mot de passe par défaut (`1234`)
- Il configure son mot de passe personnel à sa première connexion

---

### 5.2 Connexion à la plateforme

La connexion du professeur est plus simple que celle de l'étudiant — il n'y a pas de code d'examen.

- Le prof saisit son identifiant (`PROF-XXXX`) et son mot de passe
- Il est redirigé directement vers son espace — pas de code d'examen, pas de page de consignes, pas de plein écran forcé
- Le prof accède à son espace depuis n'importe quel appareil et navigateur

---

### 5.3 Espace professeur — vue d'ensemble

L'espace professeur est un tableau de bord central. À l'arrivée, le prof voit :

- La liste de tous ses examens (passés, en cours, à venir, brouillons)
- Le statut de chaque examen : `Brouillon` / `Publié` / `En cours` / `Terminé`
- Un bouton **« Créer un nouvel examen »**
- Un bouton **« Dupliquer »** sur chaque examen existant

> L'historique de tous les examens est conservé indéfiniment. Un prof peut dupliquer un examen de l'année précédente, le modifier et le republier sans repartir de zéro.

---

### 5.4 Création d'un examen — champs généraux

L'examen est d'abord sauvegardé en **brouillon** — le code d'accès n'est généré qu'au moment de la publication.

| Champ | Obligatoire ? | Détails |
|-------|--------------|---------|
| Nom de l'examen | Oui | Ex : « Examen final – Algorithmique L2 » |
| Date et heure de début | Oui | Date + heure exacte du démarrage automatique |
| Durée totale | Oui | En minutes — timer global pour tous les exercices |
| Classes autorisées | Oui | Sélection depuis la BDD de l'établissement |
| Délai d'accès après démarrage | Oui | Durée pendant laquelle le code reste valide après le début |
| Mode de correction global | Non | Automatique (tests unitaires) ou Manuel |

> **Brouillon vs Publié :** En brouillon, aucun code n'est généré et aucun étudiant ne peut accéder à l'examen. À la publication, le code est généré. Une fois l'examen démarré, toute modification est bloquée.

---

### 5.5 Contenu d'un examen — structure

Un examen est un conteneur flexible. Il peut contenir, dans n'importe quelle combinaison :

| Type de contenu | Quantité | Description |
|----------------|----------|-------------|
| Exercice(s) de code | 1 à N | Chaque exercice est indépendant, avec son propre énoncé, mode de correction et points |
| Questions QCM | 1 à M | Regroupées dans un bloc QCM, corrigées automatiquement |
| Mixte (code + QCM) | Libre | Un examen peut contenir les deux types dans la même session |

> **Navigation libre pour l'étudiant :** l'étudiant voit tous les exercices dans un menu latéral et peut passer de l'un à l'autre dans l'ordre qu'il souhaite, comme dans un examen papier classique.

---

### 5.6 Création d'un exercice de code

| Champ | Obligatoire ? | Détails |
|-------|--------------|---------|
| Titre de l'exercice | Oui | Ex : « Exercice 1 — Tri à bulles » |
| Énoncé / Contexte | Oui | Champ texte riche — contexte, consignes, exemples, contraintes |
| Langage | Oui | Python (MVP) — Java, C, C++ en Phase 1 post-MVP |
| Points attribués | Oui | Nombre de points que vaut cet exercice dans la note finale |
| Mode de correction | Oui | Automatique (tests unitaires) ou Manuel |
| Tests unitaires | Si automatique | Paires entrée → sortie attendue |

**Mode de correction — comparatif**

| | Mode Automatique | Mode Manuel |
|--|-----------------|-------------|
| **Tests unitaires** | Définis par le prof | Aucun |
| **Score calculé par** | La plateforme (% tests passés) | Le prof (saisie manuelle) |
| **Exécution du code pendant l'examen** | Oui | Oui |
| **Modification du score après correction** | Oui — le prof peut ajuster | N/A |
| **Cas d'usage typique** | Exercices avec résultat attendu précis | Exercices ouverts ou créatifs |

> Même en mode Manuel, le bouton « Exécuter » reste disponible pour l'étudiant pendant l'examen.

---

### 5.7 Création des questions QCM

| Champ par question | Obligatoire ? | Détails |
|--------------------|--------------|---------|
| Intitulé de la question | Oui | Le texte de la question |
| Choix de réponses | Oui | Minimum 2 choix |
| Bonne(s) réponse(s) | Oui | Le prof coche la ou les bonnes réponses |
| Type de réponse | Oui | Réponse unique ou Réponses multiples (par question) |
| Points attribués | Oui | Chaque question peut valoir un nombre de points différent |

**Options globales du bloc QCM**

- Mélange aléatoire des questions (ordre différent par étudiant)
- Mélange aléatoire des réponses (ordre des choix mélangé par question)
- Aperçu avant publication

> **Post-MVP (Phase 1) :** explication de la bonne réponse par question, questions obligatoires vs optionnelles, timer par question.

---

### 5.8 Publication de l'examen et génération du code

Une fois l'examen vérifié, le prof clique sur **« Publier l'examen »** :

- La plateforme génère un code d'accès unique au format `XXXX-XXXX`
- Le code est affiché dans l'interface du prof — il peut le copier ou l'imprimer
- **Mode Présentation :** un bouton « Afficher le code en grand » projette le code en très grand format (style affichage aéroport), conçu pour être projeté sur un vidéoprojecteur en salle
- L'examen passe du statut `Brouillon` à `Publié`
- Les modifications restent possibles jusqu'au démarrage officiel

> Une fois l'examen démarré et des étudiants en train de composer, toute modification est définitivement bloquée (énoncé, tests unitaires, durée).

---

### 5.9 Suivi en temps réel pendant l'examen

Le prof n'est pas obligé d'être connecté pendant l'examen — tout est enregistré côté serveur. S'il est connecté, il voit en temps réel :

| Statut étudiant | Signification | Action possible |
|-----------------|--------------|-----------------|
| En attente | Connecté dans la salle d'attente | Aucune |
| En cours | En train de composer | Voir les incidents en temps réel |
| Soumis | A cliqué sur Soumettre ou timer expiré | Accéder aux résultats |
| Exclu — incident | Expulsé suite au 2ème incident de sécurité | Voir le journal d'incidents |
| Absent | Jamais connecté | Vérifier la liste de présence |

---

### 5.10 Correction et résultats après l'examen

Pour chaque étudiant, le prof dispose d'une vue détaillée :

| Information | Détails |
|-------------|---------|
| Code soumis | Lisible avec coloration syntaxique, par exercice |
| Résultats tests unitaires | Liste des tests passés / échoués avec entrée, sortie attendue et sortie obtenue |
| Score automatique | Pourcentage de tests passés — modifiable par le prof |
| Note manuelle | Champ de saisie libre avec commentaire |
| Score final | Somme pondérée de tous les exercices |
| Journal des incidents | Chronologie complète : type, heure, durée |
| Heure de soumission | Heure exacte de soumission ou expiration |
| Présence numérique | Heure de connexion, IP, durée en salle d'attente |

> Le score n'est jamais affiché à l'étudiant automatiquement. C'est le professeur qui décide quand et comment communiquer les résultats.

---

## 6. Flux détaillé — Parcours Admin Établissement

L'admin de l'établissement est le pivot entre la plateforme et l'école. Il ne crée pas d'examens — c'est le rôle exclusif des professeurs.

### 6.1 Création du compte établissement

Depuis la page d'accueil, un bouton **« Créer un espace pour mon établissement »** est accessible. L'admin remplit un formulaire en deux blocs.

**Bloc 1 — Informations sur l'établissement**

| Champ | Obligatoire ? | Notes |
|-------|--------------|-------|
| Nom officiel | Oui | Ex : Université Aube Nouvelle de Ouagadougou |
| Sigle / Abréviation | Oui | Ex : `UANO` — utilisé dans les identifiants générés |
| Type d'établissement | Oui | Université publique / privée / École d'ingénieurs / BTS / Lycée technique / Autre |
| Pays | Oui | Liste déroulante |
| Ville | Oui | Saisie libre |
| Fuseau horaire | Oui | Critique — détermine l'heure réelle de début des examens |
| Email officiel | Oui | Pour les communications importantes |
| Numéro de téléphone | Oui | Contact de secours |

**Bloc 2 — Informations sur l'administrateur**

| Champ | Obligatoire ? | Notes |
|-------|--------------|-------|
| Nom et prénom | Oui | |
| Fonction dans l'établissement | Oui | Ex : Directeur des études, DSI, Responsable pédagogique |
| Email professionnel | Oui | Reçoit les alertes critiques |
| Mot de passe | Oui | Choisi directement à la création — pas de mot de passe par défaut |

> Un établissement peut avoir au maximum **2 administrateurs**. Le premier admin peut inviter un second depuis son espace. Les deux ont les mêmes droits.

---

### 6.2 Choix du plan tarifaire à l'inscription

Après avoir rempli les informations, l'admin choisit son plan tarifaire. Les 4 plans sont affichés avec leurs limites.

> **MVP — Simulation du paiement :** aucun paiement réel n'est traité. À la validation, une bannière s'affiche : *« Paiement en cours d'intégration — votre compte est activé en mode Pro gratuitement pendant 30 jours. »* La facturation réelle sera intégrée en Phase 2.

---

### 6.3 Gestion des classes — référentiel

Avant d'enregistrer des étudiants, l'admin crée le référentiel des classes.

- Chaque classe est créée avec : nom (ex : L1 INFO, L2 INFO), filière, niveau
- Une classe peut être modifiée ou archivée (données historiques conservées)
- À chaque rentrée, l'admin peut faire une **promotion en masse** : tous les étudiants de L1 INFO passent automatiquement en L2 INFO

---

### 6.4 Gestion des années académiques

- L'admin crée une nouvelle année académique à chaque rentrée (ex : `2025-2026`)
- Il effectue la promotion en masse des étudiants vers leur nouvelle classe
- L'année précédente est archivée — résultats, incidents et statistiques restent consultables

---

### 6.5 Enregistrement des étudiants — 3 mécanismes

**Mécanisme 1 — Import CSV** *(recommandé pour les grandes promotions)*

| Colonne CSV | Obligatoire ? | Notes |
|-------------|--------------|-------|
| nom | Oui | |
| prenom | Oui | |
| classe | Oui | Doit correspondre exactement à une classe du référentiel |
| Matricule / INE | Oui | Numéro matricule officiel |
| email | Oui | Utilisé pour l'envoi des identifiants |

- Les lignes incomplètes ou mal formatées sont rejetées avec un rapport d'erreurs
- Les lignes valides sont importées, les identifiants générés automatiquement

**Mécanisme 2 — Saisie manuelle**

- Mêmes champs que le CSV, saisis via un formulaire
- Utile pour un étudiant isolé en cours d'année (inscription tardive)

**Mécanisme 3 — Identifiant avec marque établissement**

| Type | Format | Exemple |
|------|--------|---------|
| Étudiant | `ETU-[SIGLE]-[ANNÉE]-[NUMÉRO]` | `ETU-UANO-2025-0042` |
| Professeur | `PROF-[SIGLE]-[NUMÉRO]` | `PROF-UANO-0012` |
| Admin | `ADM-[SIGLE]-[NUMÉRO]` | `ADM-UANO-0001` |

> L'identifiant est unique globalement. Il n'y a pas d'auto-inscription — tout passe par l'admin.

---

### 6.6 Enregistrement et gestion des professeurs

| Champ | Obligatoire ? | Notes |
|-------|--------------|-------|
| Nom et prénom | Oui | |
| Email professionnel | Oui | Pour l'envoi des identifiants et notifications |
| Matières enseignées | Non | Informatif |
| Fonction | Non | Ex : Professeur, Maître de conférences |

---

### 6.7 Actions de l'admin sur les comptes

| Action | Étudiants | Professeurs |
|--------|-----------|-------------|
| Ajouter | CSV ou manuel | Manuel |
| Modifier les infos | ✓ | ✓ |
| Désactiver le compte | Étudiant exclu / abandonné | Prof qui quitte l'établissement |
| Réactiver le compte | ✓ | ✓ |
| Réinitialiser le mot de passe | ✓ | ✓ |
| Envoyer les identifiants par email | En masse ou individuellement | Individuellement |
| Voir les examens créés | N/A | Métadonnées uniquement |
| Filtrer / rechercher | Par classe, statut, année | Par statut |

> Un compte désactivé ne peut plus se connecter. Il n'est **jamais supprimé définitivement** — toutes les données historiques restent consultables.

---

### 6.8 Tableau de bord et statistiques admin

- Nombre d'examens passés ce mois / cette année
- Taux de participation moyen
- Nombre total d'incidents de sécurité détectés
- Profs les plus actifs
- Consommation du plan (étudiants actifs / limite, examens ce mois / limite)
- Répartition des examens par type (code / QCM / mixte) et par langage

> L'admin voit uniquement les **métadonnées** des examens — jamais le contenu des questions ni les copies des étudiants.

---

### 6.9 Journal d'activité admin

Toutes les actions des administrateurs sont enregistrées avec horodatage :

- Ajout d'un utilisateur (nom, classe, date)
- Import CSV (fichier, lignes importées / rejetées, date)
- Modification d'un compte (champ modifié, ancienne → nouvelle valeur)
- Désactivation / Réactivation d'un compte
- Réinitialisation de mot de passe
- Ajout / modification d'un second admin
- Changement de plan tarifaire

---

### 6.10 Notifications critiques reçues par l'admin

L'admin reçoit des emails automatiques dans les situations suivantes :

- Limite du plan tarifaire approchée (80% puis 100%)
- Nombre anormal d'incidents de sécurité sur un examen
- Ajout d'un second administrateur — alerte de sécurité
- Tentative de connexion répétée avec un identifiant inexistant (brute-force potentiel)

---

## 7. Sécurité — Dispositif anti-triche

La sécurité est le cœur du projet. Elle repose sur **6 mécanismes complémentaires** qui fonctionnent ensemble dans le navigateur. Tous les mécanismes actifs côté navigateur continuent de fonctionner même en cas de coupure réseau.

### 7.1 Plein écran forcé

Fullscreen API du navigateur. Dès que l'étudiant entre dans la zone d'examen, la page passe en plein écran. Toute sortie du plein écran est traitée comme un incident.

### 7.2 Détection de changement d'onglet

Page Visibility API. Détecte quand l'onglet perd le focus.

- **1er incident :** popup d'avertissement + enregistrement avec horodatage
- **2ème incident :** fermeture automatique de l'examen, code sauvegardé et soumis, prof notifié

Le nombre d'incidents avant fermeture est configurable par le prof.

### 7.3 Blocage + log du presse-papier externe

Tout contenu copié **avant** d'entrer dans la zone d'examen ne peut pas être collé. Le mécanisme intercepte l'événement `paste` et vérifie l'origine du contenu. Le copier-coller **interne** à l'éditeur reste totalement fonctionnel.

Ce mécanisme n'est pas mentionné à l'étudiant. En plus du blocage, le contenu que l'étudiant a tenté de coller est enregistré et visible dans le rapport du prof.

### 7.4 Désactivation des raccourcis navigateur

Raccourcis désactivés :

- `Ctrl+T` (nouvel onglet)
- `Ctrl+W` (fermer onglet)
- `Alt+Tab` (capturé)
- `F12` (outils développeur)
- Clic droit

### 7.5 Journal d'incidents

Chaque événement de sécurité est enregistré en base de données avec l'heure exacte et le type.

Types d'incidents : sortie plein écran, changement d'onglet, fermeture de session, incident réseau.

Le prof voit ce rapport à côté du code — il peut servir de preuve disciplinaire.

### 7.6 Sauvegarde automatique

Le code est sauvegardé toutes les **30 secondes** côté serveur ET localement (`localStorage`). Même si l'examen se ferme brutalement, le code n'est pas perdu.

---

## 8. L'IDE intégré

L'étudiant n'utilise aucun éditeur externe. Tout se passe dans le navigateur. L'interface est inspirée de freeCodeCamp : énoncé à gauche, éditeur à droite.

| Composant | Technologie | Détails |
|-----------|------------|---------|
| Éditeur de code | Monaco Editor (base de VS Code) | Coloration syntaxique, indentation automatique. Python (MVP), Java/C/C++ (post-MVP) |
| Exécution du code | Image Python officielle dans Docker | Code exécuté côté serveur dans un container isolé, sans réseau, avec limites mémoire et temps |
| Énoncé | Panel latéral Next.js (React) | Affiché en permanence pendant la saisie |
| Timer | Côté serveur (Redis) | Compte à rebours permanent — continue même en cas de coupure réseau |
| Soumission | Bouton avec confirmation | Dialogue « Êtes-vous sûr ? » pour éviter les soumissions accidentelles |

> L'exécution du code se fait côté serveur dans un container Docker basé sur l'image Python officielle. L'étudiant ne peut pas exécuter de code malveillant sur sa machine ni accéder à des ressources réseau depuis le sandbox.

---

## 9. Correction automatique

Le professeur définit des **tests unitaires** au moment de la création de l'examen. Un test unitaire est une paire : **entrée + sortie attendue**.

Exemple pour un exercice « écrire une fonction qui retourne la somme de deux entiers » :

| Entrée | Sortie attendue |
|--------|----------------|
| `somme(2, 3)` | `5` |
| `somme(0, 0)` | `0` |
| `somme(-1, 5)` | `4` |

Après soumission, la plateforme exécute le code de l'étudiant avec chacune de ces entrées et compare la sortie obtenue à la sortie attendue. Le score est le **pourcentage de tests passés**. Le professeur peut ajouter une note manuelle complémentaire (qualité du code, commentaires, structure).

---

## 10. Module QCM

> Module QCM complet prévu en **Phase 1 post-MVP**.

- **Création :** le prof rédige questions, choix de réponses, indique la ou les bonnes réponses
- **Options :** mélange aléatoire des questions et des réponses, durée limitée par question ou pour tout le QCM
- **Correction :** automatique — score en pourcentage
- **Sécurité :** tous les mécanismes anti-triche s'appliquent également aux QCM

---

## 11. Architecture technique

Application web classique avec une couche d'exécution de code isolée. Déploiement MVP sur VPS avec Docker Compose.

| Composant | Technologie | Pourquoi |
|-----------|------------|----------|
| Frontend + Backend | Next.js (React + API Routes) | Framework full-stack unifié — pages, API et SSR dans un seul projet, simplifie le déploiement |
| IDE intégré | Monaco Editor | Gratuit, base de VS Code, coloration multi-langages |
| Exécution du code | Image Python officielle (3.11.15-alpine) dans Docker | Container isolé, sans réseau, avec limites mémoire et temps — simple à maintenir et à faire évoluer |
| Base de données | MySQL via WampServer | Fiable, bien documenté, facilement installable en local pour le développement |
| ORM | Prisma | Schéma déclaratif, migrations automatiques, typage fort avec TypeScript |
| Sessions / Temps réel | Redis | Sessions actives, alertes temps réel, timer côté serveur |
| Authentification | JWT | Standard, sans état, sécurisé |
| Sauvegarde locale | localStorage (navigateur) | Continuité en cas de coupure réseau |

> **Next.js** permet de gérer le frontend (React) et le backend (API Routes) dans un seul projet, ce qui simplifie considérablement la structure du code et le déploiement. **Prisma** fait le lien entre le code TypeScript et MySQL — le schéma de base de données est défini une seule fois et les migrations sont générées automatiquement. L'exécution du code étudiant se fait dans un container Docker basé sur l'image Python officielle, lancé à la volée pour chaque soumission : isolation totale, sans accès réseau, avec un timeout et une limite mémoire.

---

## 12. Modèle économique

Modèle **Freemium** : version gratuite volontairement limitée pour forcer la conversion vers un plan payant.

| Plan | Limites | Prix mensuel |
|------|---------|--------------|
| Gratuit | 1 prof, 10 étudiants max, 3 examens/mois | Gratuit |
| Starter | 5 profs, 100 étudiants, examens illimités, rapports | 15 000 – 25 000 FCFA |
| Pro | 20 profs, 500 étudiants, toutes fonctionnalités, support | 50 000 – 80 000 FCFA |
| Enterprise | Illimité, hébergement dédié possible, SLA, formation | Sur devis |

**Stratégie d'entrée :** offrir le plan Pro gratuitement à 3-5 universités partenaires pour créer des cas d'usage réels et du bouche-à-oreille.

---

## 13. Ce qui est prévu mais pas dans le MVP

Le MVP se concentre sur **Python uniquement** et les fonctionnalités core.

### Acteur prévu post-MVP — Super Admin

| Acteur | Rôle | Ce qu'il peut faire |
|--------|------|---------------------|
| Super Admin | Administrateur global de la plateforme | Gérer tous les établissements, tous les plans tarifaires, accès global à tout l'écosystème de la plateforme — création/suspension d'établissements, pilotage des souscriptions, tableau de bord global, gestion des feedbacks |

> Le Super Admin n'appartient à aucun établissement. Il a une vue transversale sur l'ensemble de la plateforme. Son compte est créé directement en base de données lors du déploiement initial — il n'est pas accessible via le formulaire d'inscription public.

### Fonctionnalités prévues

| Fonctionnalité | Priorité |
|----------------|----------|
| Super Admin — espace de gestion globale | Phase 1 |
| Support Java, C, C++ | Phase 1 |
| Export PDF / Excel des résultats / CSV | Phase 1 |
| Module QCM complet (options avancées) | Phase 1 |
| Lien d'activation de compte par email (token unique) | Phase 1 |
| Timer par exercice (en plus du timer global) | Phase 1 |
| Explication de la bonne réponse par question QCM | Phase 1 |
| Facturation en ligne et gestion des abonnements | Phase 2 |
| Onboarding guidé pour les nouveaux établissements | Phase 2 |
| API publique pour intégration (Moodle, etc.) | Phase 3 |
| Interface numérique pour le surveillant (registre de salle) | Phase 3 |
---

## 14. Points de vigilance

> **Compatibilité navigateur** — Les APIs utilisées (Fullscreen, Page Visibility, Clipboard) fonctionnent sur Chrome, Firefox et Edge récents. Pas sur les navigateurs mobiles. Chrome ou Edge sont les navigateurs officiels recommandés. L'examen doit se faire sur ordinateur.

> **Scalabilité du sandbox** — L'exécution de code consomme des ressources serveur. Si 100 étudiants soumettent en même temps, il faut gérer 100 exécutions simultanées. Prévoir une file d'attente (queue) et dimensionner le serveur en conséquence.

> **Déconnexion du prof pendant l'examen** — L'examen continue côté serveur indépendamment de la connexion du prof — les étudiants ne sont pas impactés. Le prof retrouve toutes les informations (incidents, statuts, soumissions) intactes à sa reconnexion. Il n'est pas obligé d'être connecté pendant l'examen.
