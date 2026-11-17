---
title: "Gnugpg"
date: 1794925189
tags: ["Informatique", "Admyn_sys"]
categories: ["Informatique"]
themes: ["Informatique"]
draft: false
---

# 🔐 **Guide Complet GPG : Commandes + Workflow Pratique**

* * *

## 📌 **Sommaire**

1.  [📁 Localisation des clés](#localisation)
2.  [🔑 Génération d’une paire de clés](#generation)
3.  [📤 Export/Import des clés](#export-import)
4.  [🔒 Chiffrement/Déchiffrement](#chiffrement)
5.  [✅ Signature/Vérification](#signature)
6.  [🔄 \*\*Workflow Complet : Échange Sécurisé](#workflow)\*\*
7.  [⚠️ Bonnes Pratiques](#bonnes-pratiques)

* * *

## 📁  1. Localisation des clés

> **Dossier par défaut** : `~/.gnupg/`
> 
> - **Clés publiques** : `pubring.kbx` (index des clés)
> - **Clés privées** : `private-keys-v1.d/` (stockage sécurisé)
> - **Configuration** : `gpg.conf` (options par défaut)

* * *

## 🔑  2. Génération d’une paire de clés

### Commande de base

```bash
gpg --full-generate-key
```

→ Lance un assistant interactif pour créer une **paire de clés RSA** (publique + privée).

### Étapes de l’assistant :

1.  **Type de clé** : `RSA and RSA` (recommandé)
2.  **Taille de la clé** : `4096 bits` (sécurité optimale)
3.  **Durée de validité** : `0` (pas d’expiration) ou `1y` (1 an)
4.  **Nom et email** : Ex: `Christian Dupont <christian@toto.local>`
5.  **Phrase de passe** : **Obligatoire** pour protéger la clé privée.

### Résultat :

- Une **clé principale** (pour signer) + une **sous-clé** (pour chiffrer).
- Exemple de sortie après génération :
    
    ```
    gpg: clé 60061C64B3269CAA marquée comme étant de confiance absolue
    gpg: certificat de révocation créé sous '/home/user/.gnupg/openpgp-revocs.d/...rev'
    ```
    

* * *

## 📤  3. Export/Import des clés

### 🔹 **Exporter une clé publique**

#### Par ID de clé (recommandé)

```bash
gpg --export --armor 60061C64B3269CAA > christian_public.asc
```

→ Exporte la clé publique **au format ASCII Armor** (lisible en texte) dans `christian_public.asc`.

#### Par UID (nom/email)

```bash
gpg --export --armor "christian@toto.local" > christian_public.asc
```

→ Exporte la clé associée à l’email `christian@toto.local`.

* * *

### 🔹 **Exporter une clé privée** ⚠️

#### Par ID de clé

```bash
gpg --export-secret-keys --armor 60061C64B3269CAA > christian_private.asc
```

→ ⚠️ **Attention** : Exporte la clé **privée** (à protéger absolument !).

#### Par UID

```bash
gpg --export-secret-keys --armor "christian" > christian_private.asc
```

→ Même principe, mais via le nom d’utilisateur.

* * *

### 🔹 **Importer une clé**

#### Clé publique

```bash
gpg --import alice_public.asc
```

→ Ajoute la clé publique d’Alice à votre trousseau pour lui envoyer des messages chiffrés.

#### Clé privée

```bash
gpg --import christian_private.asc
```

→ Importe une clé privée (ex: depuis une sauvegarde).

* * *

### 🔹 **Lister les clés**

#### Clés privées (vôtres)

```bash
gpg --list-secret-keys --keyid-format LONG
```

→ Affiche vos clés privées avec leurs **IDs longs** (ex: `60061C64B3269CAA`).

#### Clés publiques (toutes)

```bash
gpg --list-public-keys
```

→ Liste toutes les clés publiques importées (y compris celles des autres).

* * *

## 🔒  4. Chiffrement/Déchiffrement

### 🔹 **Chiffrer un fichier**

```bash
gpg --encrypt --recipient "christian@toto.local" --armor --output message_chiffre.asc message.txt
```

→ Chiffre `message.txt` pour `christian@toto.local` et sauvegarde le résultat en **ASCII Armor** dans `message_chiffre.asc`.

- `--recipient` : Destinataire (doit correspondre à un UID dans votre trousseau).
- `--armor` : Sortie en texte (sinon, binaire `.gpg`).
- `--output` : Nom du fichier de sortie.

* * *

### 🔹 **Déchiffrer un fichier**

```bash
gpg --decrypt --output message_clair.txt message_chiffre.asc
```

→ Déchiffre `message_chiffre.asc` et sauvegarde le résultat dans `message_clair.txt`.

- GPG demandera votre **phrase de passe** si la clé privée est protégée.

* * *

## ✅  5. Signature/Vérification

### 🔹 **Signer un fichier**

```bash
gpg --sign --armor --output document_signe.asc document.txt
```

→ Crée une **signature détachée** (fichier séparé) pour `document.txt`.

#### Signer + Chiffrer

```bash
gpg --sign --encrypt --recipient "alice@exemple.com" --armor --output message_signe_chiffre.asc message.txt
```

→ Chiffre **ET** signe le fichier en une seule étape.

* * *

### 🔹 **Vérifier une signature**

```bash
gpg --verify document_signe.asc document.txt
```

→ Vérifie que `document.txt` a bien été signé par la clé associée.

* * *

## 🔄  6. **Workflow Complet : Échange Sécurisé entre Christian et Alice**

### 📌 **Scénario** :

Christian veut envoyer un message **chiffré et signé** à Alice.

* * *

### **Étape 1 : Christian prépare ses clés**

```bash
# 1.1 Générer une paire de clés (si ce n'est pas déjà fait)
gpg --full-generate-key
# → Suivre l'assistant (RSA 4096 bits, email: christian@toto.local)

# 1.2 Exporter sa clé publique pour la partager avec Alice
gpg --export --armor "christian@toto.local" > christian_public.asc
```

* * *

### **Étape 2 : Alice importe la clé publique de Christian**

```bash
# 2.1 Alice télécharge christian_public.asc (par email, USB, etc.)
# 2.2 Importer la clé dans son trousseau
gpg --import christian_public.asc

# 2.3 Vérifier que la clé est bien importée
gpg --list-public-keys
# → Doit afficher la clé de Christian
```

* * *

### **Étape 3 : Alice envoie sa clé publique à Christian**

```bash
# Alice exporte sa clé publique
gpg --export --armor "alice@exemple.com" > alice_public.asc

# Alice envoie alice_public.asc à Christian (par email sécurisé, etc.)
```

* * *

### **Étape 4 : Christian importe la clé publique d’Alice**

```bash
# Christian importe la clé d'Alice
gpg --import alice_public.asc
```

* * *

### **Étape 5 : Christian envoie un message chiffré et signé à Alice**

```bash
# 5.1 Créer un message texte
echo "Bonjour Alice, voici un message secret !" > message.txt

# 5.2 Chiffrer ET signer le message pour Alice
gpg --sign --encrypt --recipient "alice@exemple.com" --armor --output message_secure.asc message.txt

# 5.3 Envoyer message_secure.asc à Alice (par email, etc.)
```

- **Chiffrement** = 🔒 **Confidentialité** (seul le destinataire peut lire).
- **Signature** = ✍️ **Authenticité** (preuve que c’est bien toi).
- **Les deux** = 🔒✍️ **Confidentialité + Authenticité** (recommandé pour les échanges sensibles).

* * *

### **Étape 6 : Alice déchiffre et vérifie le message**

```bash
# 6.1 Déchiffrer le message (GPG utilise automatiquement la clé privée d'Alice)
gpg --decrypt --output message_decrypt.txt message_secure.asc

# 6.2 Vérifier la signature (optionnel, car --decrypt le fait déjà)
gpg --verify message_secure.asc
# → Affiche : "Bonne signature de Christian <christian@toto.local>"
```

* * *

### **Étape 7 : Alice répond à Christian**

```bash
# 7.1 Créer une réponse
echo "Merci Christian, message reçu !" > reponse.txt

# 7.2 Chiffrer pour Christian (en utilisant SA clé publique)
gpg --encrypt --recipient "christian@toto.local" --armor --output reponse_secure.asc reponse.txt

# 7.3 Envoyer reponse_secure.asc à Christian
```

&nbsp;

### 🗑️ **Supprimer une clé**

```bash
# Supprimer une clé publique
gpg --delete-key christian@toto.local

# Supprimer une clé privée
gpg --delete-secret-key christian@toto.local
```

⚠️ **Attention** : La suppression est **irréversible** !

* * *

## 📚 **Résumé des commandes essentielles**

| Action | Commande |
| --- | --- |
| Générer une clé | `gpg --full-generate-key` |
| Lister mes clés privées | `gpg --list-secret-keys` |
| Exporter clé publique | `gpg --export --armor "UID" > pub.asc` |
| Exporter clé privée | `gpg --export-secret-keys --armor "UID" > priv.asc` |
| Importer une clé | `gpg --import fichier.asc` |
| Chiffrer un fichier | `gpg --encrypt --recipient "UID" --armor fichier` |
| Déchiffrer un fichier | `gpg --decrypt fichier.asc` |
| Signer un fichier | `gpg --sign --armor fichier` |
| Vérifier une signature | `gpg --verify fichier.asc` |

* * *

> 💡 **Astuce** : Utilisez `gpg --help` ou `man gpg` pour explorer toutes les options.  
> 📖 **Documentation officielle** : [GNU Privacy Guard](https://www.gnupg.org/)