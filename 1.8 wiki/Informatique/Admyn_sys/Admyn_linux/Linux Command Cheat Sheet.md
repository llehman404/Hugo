# Linux Command Cheat Sheet

## Opérateurs
- `&&` → Exécute les commandes dans l'ordre.
- `;` → Exécute la deuxième commande après la première.
- `&` → Exécute la deuxième commande en parallèle de la première.
- `|` → Redirige la sortie de la première commande vers la deuxième (pipe).
- `||` → Exécute la deuxième commande seulement si la première échoue.

## Options courantes
- `-y` → Valide automatiquement toutes les confirmations.
- `-a` → Supprime tous les droits (selon le contexte).
- `a+` → Attribue tous les droits (selon le contexte).

## Réseau et système
- `hostname -i` → Affiche l'adresse IP locale.
- `uname -a` → Affiche le nom, le type et le système d'exploitation.
- `free -h` → Affiche la mémoire RAM disponible (format lisible).
- `dh -h` -> Mémoire disque durt
- `lscpu` → Affiche les caractéristiques du CPU.
- `lshw` → Affiche les caractéristiques matérielles (hardware).
- `sed -i` : Option de sed permettant d’éditer un fichier directement (sans sortie standard), en appliquant les modifications en place (attention : écrase le fichier original).

## Wildcards de base
- `*` : Remplace zéro ou plusieurs caractères.
  - Exemple : `ls *.txt` → Liste tous les fichiers se terminant par `.txt`.

- `?` : Remplace un seul caractère.
  - Exemple : `ls fichier?.txt` → Liste `fichier1.txt`, `fichierA.txt` (mais pas `fichier10.txt`).

- `[...]` : Remplace un caractère parmi une liste.
  - Exemple : `ls fichier[1-3].txt` → Liste `fichier1.txt`, `fichier2.txt`, `fichier3.txt`.

- `{...}` : Liste explicite de motifs.
  - Exemple : `echo {a,b,c}.txt` → Génère `a.txt b.txt c.txt`.

 - `!` : **Exclusion** dans les crochets `[...]`.
  - Exemple : `ls fichier[!1].txt` → Liste tous les `fichierX.txt` sauf `fichier1.txt`.

  -`^` : Ancrage en regex qui impose que le motif suivant doive apparaître au début d'une ligne (ex: ^abc match uniquement les lignes commençant par abc).

## **Navigation et édition de base**

- **Déplacer le curseur**
  - `Ctrl + A` : Aller au **début** de la ligne.
  - `Ctrl + E` : Aller à la **fin** de la ligne.
  - `Alt + B` : Reculer d’un **mot**.
  - `Alt + F` : Avancer d’un **mot**.
  - `Ctrl + XX` : Basculer entre le début de la ligne et la position actuelle.

- **Suppression**
  - `Ctrl + U` : Supprimer **tout avant** le curseur.
  - `Ctrl + K` : Supprimer **tout après** le curseur.
  - `Ctrl + W` : Supprimer le **mot précédent**.
  - `Alt + D` : Supprimer le **mot suivant**.
  - `Ctrl + D` : Supprimer le **caractère sous le curseur** (ou quitter le terminal si la ligne est vide).


## **Contrôle des processus**

- `Ctrl + C` : **Interrompre** la commande en cours.
- `Ctrl + Z` : **Suspendre** la commande (mettre en arrière-plan).
- `Ctrl + D` : Fermer le terminal ou envoyer un `EOF` (fin de fichier).
- `fg` : Ramener un processus suspendu au **premier plan**.
- `bg` : Relancer un processus suspendu en **arrière-plan**.
- `jobs` : Lister les processus en arrière-plan.
- `kill %n` : Tuer le processus numéro `n` (ex: `kill %1`).


    
sudo apache2ctl configtest

cat /proc/sys/net/ipv4/ip_forward verifier que le forwarding du noyaux est bien activé 