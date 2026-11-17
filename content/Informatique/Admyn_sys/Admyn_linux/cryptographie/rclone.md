---
title: "Rclone"
date: 1794925189
tags: ["Informatique", "Admyn_sys"]
categories: ["Informatique"]
themes: ["Informatique"]
draft: false
---

# ☁️ **Guide Complet : rclone**

*Synchronisation et gestion de fichiers dans le cloud*

* * *

## 📌 **Sommaire**

1.  [☁️ Configuration](#configuration)
2.  [📂 Commandes de Base](#commandes-base)
3.  [🔄 Workflow Complet](#workflow)
4.  [⚙️ Options Avancées](#options-avancees)
5.  [🔐 Chiffrement avec rclone crypt](#chiffrement)
6.  [⚠️ Bonnes Pratiques](#bonnes-pratiques)
7.  [📊 Tableaux Récapitulatifs](#tableaux)

–

## ☁️  1. Configuration

### 🔹 **Configurer un nouveau remote**

```bash
rclone config
```

→ **Étapes** :

1.  Taper `n` pour créer un **nouveau remote**. Donner un nom (ex: `gdrive`).
2.  Choisir le **type de stockage** (ex: `Google Drive`, `Amazon S3`, `Dropbox`, `Local`).
3.  Suivre les instructions pour **authentifier** rclone avec ton service cloud.

- Pour Google Drive, Dropbox, etc. : une **page web s’ouvre** pour autoriser l’accès.
- Pour les services comme S3 : entrer ta **clé d’accès** et ton **secret**.

* * *

### 🔹 **Lister les remotes configurés**

```bash
rclone listremotes
```

→ Affiche la liste de tous tes remotes configurés.

* * *

### 🔹 **Supprimer un remote**

```bash
rclone config delete nom_du_remote
```

→ Supprime le remote `nom_du_remote` de ta configuration.

* * *

### 🔹 **Éditer un remote**

```bash
rclone config edit
```

→ Ouvre ton éditeur de texte par défaut pour modifier manuellement le fichier de configuration (`~/.config/rclone/rclone.conf`).

* * *

## 📂  2. Commandes de Base

### 🔹 **Lister les fichiers d’un remote**

```bash
# Lister les dossiers (format simple)
rclone lsd remote:chemin/

# Lister les fichiers et dossiers (format détaillé)
rclone ls remote:chemin/

# Lister les fichiers avec leur taille
rclone lsl remote:chemin/
```

* * *

### 🔹 **Copier des fichiers**

```bash
# Copier un fichier local vers le cloud
rclone copy /chemin/local/fichier.txt remote:chemin/dans/le/cloud/

# Copier un dossier local vers le cloud
rclone copy /chemin/local/dossier/ remote:chemin/dans/le/cloud/

# Copier du cloud vers local
rclone copy remote:chemin/fichier.txt /chemin/local/
```

→ `**copy**` : Copie les fichiers **sans supprimer** les fichiers existants.

* * *

### 🔹 **Synchroniser des dossiers**

```bash
# Synchroniser un dossier local vers le cloud (⚠️ supprime les fichiers dans le cloud qui ne sont pas dans le dossier local)
rclone sync /chemin/local/dossier/ remote:chemin/dans/le/cloud/

# Synchroniser du cloud vers local
rclone sync remote:chemin/dans/le/cloud/ /chemin/local/dossier/
```

→ **⚠️ Attention** : `sync` **supprime** les fichiers dans la destination qui ne sont pas dans la source.

* * *

### 🔹 **Supprimer des fichiers**

```bash
# Supprimer un fichier dans le cloud
rclone delete remote:chemin/fichier.txt

# Supprimer un dossier et son contenu
rclone purge remote:chemin/dossier/
```

* * *

### 🔹 **Créer un dossier**

```bash
rclone mkdir remote:chemin/vers/nouveau_dossier
```

* * *

## 🔄  3. Workflow Complet

### 📌 **Scénario** :

Christian veut synchroniser son dossier `~/Documents/Projet` avec **Google Drive**.

* * *

### **Étape 1 : Configurer le remote Google Drive**

```bash
# Lancer la configuration
rclone config
```

→ **Étapes** :

1.  Taper `n` pour créer un nouveau remote.
2.  Donner un nom (ex: `gdrive`).
3.  Choisir le type `Google Drive`.
4.  Laisser les options par défaut (appuyer sur Entrée).
5.  Un lien s’affiche : **ouvrir ce lien dans ton navigateur** et autoriser l’accès.
6.  Copier le **code d’autorisation** et le coller dans le terminal.

* * *

### **Étape 2 : Vérifier la configuration**

```bash
# Lister les remotes
rclone listremotes
# → Doit afficher : gdrive:

# Lister le contenu de Google Drive
rclone lsd gdrive:
```

* * *

### **Étape 3 : Synchroniser le dossier local vers Google Drive**

```bash
# Synchroniser (sans supprimer)
rclone copy ~/Documents/Projet/ gdrive:Backup/Projet/

# Vérifier que tout est bien synchronisé
rclone ls gdrive:Backup/Projet/
```

* * *

### **Étape 4 : Mettre à jour les fichiers**

```bash
# Ajouter un nouveau fichier localement
echo "Nouveau fichier" > ~/Documents/Projet/nouveau.txt

# Resynchroniser
rclone copy ~/Documents/Projet/ gdrive:Backup/Projet/
```

* * *

### **Étape 5 : Récupérer les fichiers depuis un autre appareil**

```bash
# 5.1 Installer rclone sur le nouvel appareil
# (Voir section Installation)

# 5.2 Copier la configuration (optionnel)
# Copier ~/.config/rclone/rclone.conf depuis l'ancien appareil

# 5.3 Configurer le remote (si non copié)
rclone config

# 5.4 Synchroniser depuis Google Drive vers le nouvel appareil
mkdir ~/Documents/Projet_récupéré
rclone copy gdrive:Backup/Projet/ ~/Documents/Projet_récupéré/
```

* * *

### **Étape 6 : Supprimer un fichier dans le cloud**

```bash
# Supprimer un fichier spécifique
rclone delete gdrive:Backup/Projet/fichier_a_supprimer.txt

# Supprimer tout le dossier (⚠️ attention !)
rclone purge gdrive:Backup/Projet/
```

* * *

## ⚙️  4. Options Avancées

### 🔹 **Options de synchronisation**

| **Option** | **Description** | **Exemple** |
| --- | --- | --- |
| `--dry-run` | Simule l’action sans appliquer | `rclone sync --dry-run dossier/ remote:` |
| `--progress` | Affiche une barre de progression | `rclone copy --progress fichier remote:` |
| `--exclude` | Exclut des fichiers | `rclone sync --exclude "*.tmp" dossier/ remote:` |
| `--include` | Inclut seulement certains fichiers | `rclone sync --include "*.pdf" dossier/ remote:` |
| `--delete-excluded` | Supprime les fichiers exclus | `rclone sync --exclude "*.tmp" --delete-excluded dossier/ remote:` |
| `--checksum` | Vérifie les sommes de contrôle | `rclone sync --checksum dossier/ remote:` |

* * *

### 🔹 **Filtrer les fichiers**

```bash
# Exclure plusieurs extensions
rclone sync --exclude "*.tmp" --exclude "*.log" dossier/ remote:

# Inclure seulement les PDF et images
rclone sync --include "*.pdf" --include "*.jpg" --include "*.png" dossier/ remote:

# Exclure un dossier spécifique
rclone sync --exclude "temp/" dossier/ remote:
```

* * *

### 🔹 **Gérer les conflits**

```bash
# Garder les fichiers les plus récents
rclone sync --update dossier/ remote:

# Ignorer les fichiers existants
rclone sync --ignore-existing dossier/ remote:
```

* * *

### 🔹 **Limiter la bande passante**

```bash
# Limiter à 10 Mo/s
rclone sync --bwlimit 10M dossier/ remote:

# Désactiver la limite
rclone sync --bwlimit off dossier/ remote:
```

* * *

### 🔹 **Synchronisation en arrière-plan**

```bash
# Lancer en arrière-plan (avec nohup)
nohup rclone sync dossier/ remote: &>

# Vérifier les logs
tail -f nohup.out
```

* * *

## 🔐  5. Chiffrement avec rclone crypt

### 🔹 **Créer un remote chiffré**

```bash
rclone config create my_crypt crypt remote=my_remote path=/encrypted --password mon_mot_de_passe
```

→ **Explications** :

- `my_crypt` : Nom du nouveau remote chiffré.
- `my_remote` : Remote de base (ex: `gdrive`, `s3`).
- `/encrypted` : Chemin dans le remote où stocker les fichiers chiffrés.
- `--password` : Mot de passe pour le chiffrement (minimum 16 caractères recommandé).

* * *

### 🔹 **Utiliser un fichier de mot de passe**

```bash
# Créer un fichier contenant le mot de passe
echo "mon_mot_de_passe_super_secure" > ~/.rclone-crypt-password
chmod 600 ~/.rclone-crypt-password

# Configurer le remote avec le fichier
rclone config create my_crypt crypt remote=my_remote path=/encrypted --password-command "cat ~/.rclone-crypt-password"
```

* * *

### 🔹 **Synchroniser avec un remote chiffré**

```bash
# Chiffrer et uploader un dossier
rclone sync /chemin/local/dossier/ my_crypt:backup/

# Télécharger et déchiffrer un dossier
rclone sync my_crypt:backup/ /chemin/local/dossier_dechiffré/
```

* * *

### 🔹 **Vérifier les fichiers chiffrés**

```bash
# Lister les fichiers dans le remote chiffré
rclone lsd my_crypt:

# Les fichiers ont des noms aléatoires (ex: "abc123", "def456")
```

* * *

## ⚠️  6. Bonnes Pratiques

### ✅ **À faire**

- \*\*Tester avec `--dry-run**` avant toute synchronisation importante :
    
    ```bash
    rclone sync --dry-run dossier/ remote:
    ```
    
- **Utiliser des mots de passe forts** pour `rclone crypt` (minimum 16 caractères).
- **Sauvegarder ta configuration** (`~/.config/rclone/rclone.conf`).
- **Chiffrer les données sensibles** avec `rclone crypt` avant de les uploader.
- **Vérifier les synchronisations** régulièrement :
    
    ```bash
    rclone check dossier/ remote:
    ```
    

### ❌ **À éviter**

- \*\*Utiliser `rclone sync` sans `--dry-run**` : Risque de supprimer des fichiers par erreur.
- **Stocker le mot de passe en clair** dans le fichier de configuration.
- **Synchroniser des fichiers ouverts** : Ferme les fichiers avant de synchroniser.
- **Ignorer les erreurs** : Vérifie toujours les messages d’erreur.

* * *

## 📊  8. Tableaux Récapitulatifs

* * *

### 🔹 **Commandes de Base**

| **Action** | **Commande** | **Explication** |
| --- | --- | --- |
| Configurer un remote | `rclone config` | Lance l’assistant de configuration |
| Lister les remotes | `rclone listremotes` | Affiche tous les remotes configurés |
| Lister les fichiers | `rclone lsd remote:chemin/` | Liste les dossiers dans un remote |
| Lister les fichiers détaillés | `rclone ls remote:chemin/` | Liste les fichiers avec leur taille |
| Copier un fichier | `rclone copy fichier.txt remote:chemin/` | Copie sans supprimer |
| Copier un dossier | `rclone copy dossier/ remote:chemin/` | Copie récursivement |
| Synchroniser (⚠️ supprime) | `rclone sync dossier/ remote:chemin/` | Synchronise en supprimant les fichiers manquants |
| Supprimer un fichier | `rclone delete remote:chemin/fichier.txt` | Supprime un fichier |
| Supprimer un dossier | `rclone purge remote:chemin/dossier/` | Supprime un dossier et son contenu |
| Créer un dossier | `rclone mkdir remote:chemin/nouveau_dossier/` | Crée un dossier |

* * *

### 🔹 **Options Avancées**

| **Option** | **Commande** | **Explication** |
| --- | --- | --- |
| Tester une synchronisation | `rclone sync --dry-run dossier/ remote:` | Simule sans appliquer |
| Barre de progression | `rclone copy --progress fichier remote:` | Affiche l’avancement |
| Exclure des fichiers | `rclone sync --exclude "*.tmp" dossier/ remote:` | Ignore les fichiers temporaires |
| Inclure des fichiers | `rclone sync --include "*.pdf" dossier/ remote:` | Seuls les PDF sont synchronisés |
| Limiter la bande passante | `rclone sync --bwlimit 10M dossier/ remote:` | Limite à 10 Mo/s |
| Vérifier les fichiers | `rclone check dossier/ remote:` | Vérifie l’intégrité |

* * *

### 🔹 **rclone crypt**

| **Action** | **Commande** | **Explication** |
| --- | --- | --- |
| Créer un remote chiffré | `rclone config create my_crypt crypt remote=my_remote path=/encrypted --password mot_de_passe` | Configure un remote chiffré |
| Synchroniser avec chiffrement | `rclone sync dossier/ my_crypt:backup/` | Chiffre et synchronise |
| Synchroniser avec déchiffrement | `rclone sync my_crypt:backup/ dossier/` | Déchiffre et synchronise |

* * *

### 🔹 **Workflow Résumé**

| **Étape** | **Action** | **Commande** |
| --- | --- | --- |
| 1   | Configurer un remote | `rclone config` |
| 2   | Lister les remotes | `rclone listremotes` |
| 3   | Synchroniser un dossier | `rclone sync dossier/ remote:backup/` |
| 4   | Vérifier la synchronisation | `rclone check dossier/ remote:backup/` |
| 5   | Créer un remote chiffré | `rclone config create my_crypt crypt remote=gdrive path=/encrypted --password mon_mot_de_passe` |
| 6   | Synchroniser avec chiffrement | `rclone sync dossier/ my_crypt:backup/` |

* * *

## 💡 **Conseils Finaux**

1.  **Pour les débutants** : Commence par `rclone copy` pour éviter les suppressions accidentelles.
2.  **Pour les sauvegardes** : Utilise `rclone sync --dry-run` avant chaque synchronisation.
3.  **Pour la sécurité** : Active le chiffrement avec `rclone crypt` pour les données sensibles.
4.  **Pour les gros fichiers** : Utilise `--progress` pour suivre l’avancement.
5.  **En cas d’erreur** : Vérifie les logs avec `--verbose` (ou `-vv` pour plus de détails).

* * *

> 🔗 **Pour aller plus loin** :
> 
> - [Documentation officielle rclone](https://rclone.org/docs/)
> - [Guide rclone crypt](https://rclone.org/crypt/)
> - [Liste des backends supportés](https://rclone.org/backends/)
> - `man rclone` (dans le terminal pour toutes les options)