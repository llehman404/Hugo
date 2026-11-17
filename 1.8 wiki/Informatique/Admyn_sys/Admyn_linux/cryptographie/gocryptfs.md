# 🔐 **Guide Complet : gocryptfs**

*Chiffrement transparent de dossiers locaux*

---

## 📌 **Sommaire**

1. [📥 Installation](#installation)
2. [🔐 Commandes de Base](#commandes-base)
3. [🔄 Workflow Complet](#workflow)
4. [⚙️ Options Avancées](#options-avancees)
5. [⚠️ Bonnes Pratiques](#bonnes-pratiques)
6. [📊 Tableau Récapitulatif](#tableau)

---


## 🔐 &nbsp;1. Commandes de Base

### 🔹 **Initialisation d'un dossier chiffré**

```bash
gocryptfs -init /chemin/vers/dossier_chiffré
```

→ **Explications** :

- Crée un **fichier de configuration** (`gocryptfs.conf`) dans `dossier_chiffré`.
- Te demande un **mot de passe** (à retenir absolument !).
- **Ne stocke pas le mot de passe** : il faut le retenir ou utiliser `-passfile`.

---

### 🔹 **Monter/Démonter un dossier**

#### Monter (déchiffrer)

```bash
gocryptfs /chemin/vers/dossier_chiffré /chemin/vers/dossier_monté
```

→ **Explications** :

- `dossier_chiffré` : Dossier où sont stockés les fichiers **chiffrés** (ex: `~/crypt`).
- `dossier_monté` : Dossier où les fichiers seront **accessibles en clair** (ex: `~/monté`).
- **Demande le mot de passe** à la connexion.

#### Monter avec un fichier de mot de passe

```bash
# Créer un fichier contenant le mot de passe (sécurisé !)
echo "mon_mot_de_passe_super_secure" > ~/.gocryptfs-password
chmod 600 ~/.gocryptfs-password  # Restreindre les permissions

# Monter avec le fichier de mot de passe
gocryptfs -passfile ~/.gocryptfs-password /chemin/vers/dossier_chiffré /chemin/vers/dossier_monté
```

#### Démonter

```bash
# Linux/macOS
fusermount -u /chemin/vers/dossier_monté

# Windows (avec WinFSP)
net use /delete /chemin/vers/dossier_monté
```

---

## 🔄 &nbsp;2. Workflow Complet

### 📌 **Scénario** :

Christian veut chiffrer son dossier `~/Documents/ProjetSecret` pour le protéger.

---

### **Étape 1 : Initialiser le dossier chiffré**

```bash
# 1.1 Créer le dossier chiffré
mkdir ~/Documents/ProjetSecret_chiffré

# 1.2 Initialiser gocryptfs
cd ~/Documents/ProjetSecret_chiffré
gocryptfs -init .
# → Définir un mot de passe (ex: "MonMotDePasseSuperSecure123!")
```

---

### **Étape 2 : Copier les fichiers dans le dossier chiffré**

```bash
# 2.1 Monter le dossier chiffré
mkdir ~/Documents/ProjetSecret_monté
gocryptfs ~/Documents/ProjetSecret_chiffré ~/Documents/ProjetSecret_monté
# → Saisir le mot de passe

# 2.2 Copier les fichiers originaux
cp -r ~/Documents/ProjetSecret/* ~/Documents/ProjetSecret_monté/

# 2.3 Vérifier que tout est bien copié
ls ~/Documents/ProjetSecret_monté

# 2.4 Démonter le dossier
fusermount -u ~/Documents/ProjetSecret_monté
```

---

### **Étape 3 : Accéder aux fichiers plus tard**

```bash
# 3.1 Monter le dossier chiffré
mkdir ~/Documents/ProjetSecret_monté
gocryptfs ~/Documents/ProjetSecret_chiffré ~/Documents/ProjetSecret_monté
# → Saisir le mot de passe

# 3.2 Accéder aux fichiers (en clair)
ls ~/Documents/ProjetSecret_monté
cat ~/Documents/ProjetSecret_monté/fichier.txt

# 3.3 Modifier un fichier
nano ~/Documents/ProjetSecret_monté/fichier.txt

# 3.4 Démonter quand terminé
fusermount -u ~/Documents/ProjetSecret_monté
```

---

### **Étape 4 : Ajouter de nouveaux fichiers**

```bash
# 4.1 Monter le dossier
mkdir ~/Documents/ProjetSecret_monté
gocryptfs ~/Documents/ProjetSecret_chiffré ~/Documents/ProjetSecret_monté

# 4.2 Ajouter un nouveau fichier
cp ~/Téléchargements/nouveau_fichier.pdf ~/Documents/ProjetSecret_monté/

# 4.3 Démonter
fusermount -u ~/Documents/ProjetSecret_monté
```

---

## ⚙️ &nbsp;3. Options Avancées

### 🔹 **Options de montage**


| **Option**     | **Description**                                            | **Exemple**                                            |
| -------------- | ---------------------------------------------------------- | ------------------------------------------------------ |
| `-ro`          | Monter en **lecture seule**                                | `gocryptfs -ro dossier_chiffré dossier_monté`          |
| `-allow_other` | Autoriser d'autres utilisateurs à accéder au dossier monté | `gocryptfs -allow_other dossier_chiffré dossier_monté` |
| `-aessiv`      | Utiliser **AES-SIV** (meilleur pour les noms de fichiers)  | `gocryptfs -aessiv -init dossier_chiffré`              |
| `-longnames`   | Autoriser les noms de fichiers longs                       | `gocryptfs -longnames -init dossier_chiffré`           |


---

### 🔹 **Vérifier l'intégrité des fichiers**

```bash
gocryptfs -fsck /chemin/vers/dossier_chiffré
```

→ **Utile** si tu suspectes une corruption des fichiers chiffrés.

---

### 🔹 **Changer le mot de passe**

```bash
# 1. Créer un nouveau dossier chiffré avec le nouveau mot de passe
mkdir ~/nouveau_dossier_chiffré
gocryptfs -init ~/nouveau_dossier_chiffré

# 2. Monter les deux dossiers
mkdir ~/ancien_monté ~/nouveau_monté
gocryptfs ~/ancien_dossier_chiffré ~/ancien_monté
gocryptfs ~/nouveau_dossier_chiffré ~/nouveau_monté

# 3. Copier les fichiers de l'ancien vers le nouveau
cp -r ~/ancien_monté/* ~/nouveau_monté/

# 4. Démonter les deux dossiers
fusermount -u ~/ancien_monté
fusermount -u ~/nouveau_monté

# 5. Remplacer l'ancien dossier par le nouveau
rm -rf ~/ancien_dossier_chiffré
mv ~/nouveau_dossier_chiffré ~/ancien_dossier_chiffré
```

---

### 🔹 **Utiliser une clé au lieu d'un mot de passe**

```bash
# Générer une clé aléatoire (32 octets)
head -c 32 /dev/urandom > ~/.gocryptfs-key
chmod 600 ~/.gocryptfs-key

# Initialiser avec une clé
mkdir ~/dossier_chiffré
gocryptfs -init -masterkey ~/.gocryptfs-key ~/dossier_chiffré

# Monter avec la clé
gocryptfs -masterkey ~/.gocryptfs-key ~/dossier_chiffré ~/dossier_monté
```

---

## ⚠️ &nbsp;4. Bonnes Pratiques

### ✅ **À faire**

- **Sauvegarder le mot de passe/clé** : Stocke-le dans un **gestionnaire de mots de passe** (Bitwarden, KeePass) ou sur un **support hors ligne** (clé USB chiffrée).
- **Utiliser des mots de passe forts** : Minimum **16 caractères**, avec majuscules, minuscules, chiffres et symboles.
- **Vérifier les permissions** : Les fichiers de mot de passe/clé doivent avoir des permissions restreintes (`chmod 600`).
- **Démonter après utilisation** : Pour éviter que les fichiers ne restent accessibles en clair.
- **Faire des sauvegardes** : Sauvegarde ton dossier chiffré **ET** ton mot de passe/clé.

### ❌ **À éviter**

- **Oublier le mot de passe** : Sans lui, tes fichiers seront **inaccessibles**.
- **Stocker le mot de passe en clair** dans un fichier non protégé.
- **Monter le dossier en permanence** : Risque de sécurité si ton ordinateur est compromis.
- **Utiliser des mots de passe faibles** : Facile à deviner ou à brute-forcer.

---

## 📊 &nbsp;6. Tableau Récapitulatif


| **Action**                                 | **Commande**                                                                    | **Explication**                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------- | --------------------------------------------------- |
| **Installer gocryptfs**                    | `sudo apt install gocryptfs`                                                    | Installe gocryptfs sur Debian/Ubuntu                |
| **Initialiser un dossier chiffré**         | `gocryptfs -init /chemin/dossier_chiffré`                                       | Crée un nouveau dossier chiffré                     |
| **Monter un dossier**                      | `gocryptfs /chemin/dossier_chiffré /chemin/dossier_monté`                       | Rend les fichiers accessibles en clair              |
| **Monter avec un fichier de mot de passe** | `gocryptfs -passfile ~/.password /chemin/dossier_chiffré /chemin/dossier_monté` | Utilise un fichier pour le mot de passe             |
| **Monter avec une clé**                    | `gocryptfs -masterkey ~/.key /chemin/dossier_chiffré /chemin/dossier_monté`     | Utilise une clé au lieu d'un mot de passe           |
| **Démonter un dossier**                    | `fusermount -u /chemin/dossier_monté`                                           | Ferme l'accès aux fichiers en clair                 |
| **Vérifier l'intégrité**                   | `gocryptfs -fsck /chemin/dossier_chiffré`                                       | Vérifie que les fichiers ne sont pas corrompus      |
| **Monter en lecture seule**                | `gocryptfs -ro /chemin/dossier_chiffré /chemin/dossier_monté`                   | Accès en lecture seule                              |
| **Autoriser d'autres utilisateurs**        | `gocryptfs -allow_other /chemin/dossier_chiffré /chemin/dossier_monté`          | Permet à d'autres utilisateurs d'accéder au dossier |


---

## 💡 **Conseils Finaux**

1. **Pour les débutants** : Commence par un **dossier test** pour t'habituer à gocryptfs.
2. **Pour la sécurité maximale** : Utilise une **clé aléatoire** (`-masterkey`) au lieu d'un mot de passe.
3. **Pour les sauvegardes** : Sauvegarde **à la fois** le dossier chiffré **ET** le mot de passe/clé.
4. **En cas d'urgence** : Si tu oublies ton mot de passe, tes fichiers seront **perdus**. Il n'y a **pas de récupération possible** !

---

> 🔗 **Pour aller plus loin** :
>
> - [Documentation officielle gocryptfs](https://nuetzlich.net/gocryptfs/)
> - [GitHub gocryptfs](https://github.com/rfjakob/gocryptfs)
> - `man gocryptfs` (dans le terminal pour toutes les options)