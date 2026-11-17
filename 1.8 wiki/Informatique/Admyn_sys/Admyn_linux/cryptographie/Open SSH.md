# 🔐 Fiche SSH — Administration à distance sécurisée (Debian)

> Fiche d'exploitation basée sur le cours « L'administration à distance sécurisée via SSH » (recommandations ANSSI).  
> Objectif : canal chiffré SSHv2, authentification par clé Ed25519, mots de passe désactivés, transferts sécurisés.

---

## 1. Serveur — installation et gestion du service

```bash
sudo apt install openssh-server   # installe le démon sshd
sudo systemctl start ssh          # démarre le service
sudo systemctl enable ssh         # active au démarrage de la machine
sudo systemctl status ssh         # état : active (running), uptime, derniers logs
```

> ⚠️ Sous Debian, l'unité s'appelle **`ssh`** (pas `sshd`).

```bash
sudo nano /etc/ssh/sshd_config        # fichier principal de configuration
sudo sshd -t                          # test de syntaxe — aucune sortie = OK
sudo systemctl reload ssh             # applique la config SANS couper les sessions ouvertes
```

> 💡 Préférer `reload` à `restart` : les sessions en cours restent actives pendant le durcissement.

Autres commandes utiles :

```bash
ssh -V                       # version d'OpenSSH (détermine les directives disponibles)
ip a                         # adresse IP de la machine
journalctl -u ssh             # journaux du service : authentifications réussies/échouées
sudo ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub   # empreinte de la clé d'hôte du serveur
```

> 💡 **Fichiers inclus** : placer le durcissement dans `/etc/ssh/sshd_config.d/99-hardening.conf`  
> (vérifier que `Include /etc/ssh/sshd_config.d/*.conf` est présent dans `sshd_config`).  
> Avantage : résiste aux mises à jour du paquet, et sépare les thèmes.

---

## 2. Client — mise en place de l'authentification par clé 

> Ordre logique : **① connexion par mot de passe** (on n'a pas encore de clé !) → **② génération de la paire de clés** → **③ déploiement de la clé publique sur le serveur** → **④ connexion par clé** → **⑤ durcissement du serveur (§3)**.

### Étape 1 — Première connexion par mot de passe + empreinte du serveur

```bash
ssh user@adresse_ip            # connexion par MOT DE PASSE (compte NON root !)
ssh -p 22 user@adresse_ip      # en précisant le port
```

> Toujours se connecter avec un **compte ordinaire**, puis élever avec `sudo` (moindre privilège).
> À ce stade, **aucune de vos clés n'existe ni n'intervient** : l'authentification se fait par mot de passe.

#### À la première connexion : le serveur prouve son identité (TOFU)

**À la toute première connexion**, le client affiche l'**empreinte de la clé d'hôte du serveur** et demande confirmation (mécanisme **TOFU** — Trust On First Use) :

```
The authenticity of host '192.168.1.10' can't be established.
ed25519 key fingerprint is SHA256:AbCdEf...
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

**Deux paires de clés différentes, deux rôles différents :**

| | Clé d'**hôte** | Clés **utilisateur** (Tir, Baal...) |
|---|---|---|
| Générée par | le serveur, à l'installation d'OpenSSH | vous, avec `ssh-keygen` |
| Stockée | `/etc/ssh/ssh_host_ed25519_key(.pub)` sur le serveur | `~/.ssh/` sur votre poste |
| Sert à | au **serveur** de prouver son identité **envers vous** | à **vous** authentifier **vers le serveur** |
| Intervient à la 1ère connexion ? | ✅ oui (c'est l'empreinte affichée) | ❌ non (mot de passe) |

L'**empreinte** (`SHA256:AbCdEf...`) n'est pas un objet à part : c'est le **hash de la clé publique d'hôte** — sa « carte d'identité » raccourcie, plus lisible que la clé complète.

**Le problème du TOFU** : à la première connexion, vous ne pouvez pas *prouver* que cette empreinte est la bonne — vous ne la connaissez pas encore, et elle pourrait être celle d'un attaquant en man-in-the-middle. La seule parade est de la **recouper par un canal annexe** avant de valider :

```bash
# Sur le serveur (console physique ou interface hébergeur) :
sudo ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
# → comparer caractère par caractère avec l'empreinte affichée par le client
```

Une fois recoupée, répondre `yes` :

- `yes` → l'empreinte est enregistrée dans `~/.ssh/known_hosts` (côté client). Ce fichier ne
  contient **que des empreintes de clés d'hôte** (pour reconnaître les serveurs) — il ne contient
  aucune de vos clés utilisateur.
- **Connexions suivantes** → la vérification devient automatique : le serveur signe avec sa clé
  privée d'hôte, le client compare avec `known_hosts`. Plus besoin de confiance.
- ⚠️ **Avertissement de clé changée** = serveur réinstallé **ou** attaque man-in-the-middle.
  Ne jamais supprimer l'entrée de `known_hosts` sans avoir vérifié le changement par un autre canal
  (console physique, interface hébergeur).

### Étape 2 — Génération de la paire de clés (une fois connecté, on peut remplacer le mot de passe)

```bash
ssh-keygen -t ed25519 -C "clée de connexion aux vm Baal et Armazd" -f ~/.ssh/Tir
```

- `-t ed25519` → algorithme recommandé (RSA 4096 acceptable ; **DSA supprimé depuis OpenSSH 10.0**)
- `-C` → commentaire pour identifier la clé côté serveur
- **Passphrase obligatoire** (ANSSI) : chiffre la clé privée localement → laisse le temps de révoquer la clé en cas de vol

Fichiers créés dans `~/.ssh/` :


| Fichier                      | Rôle                                           | Permission  |
| ---------------------------- | ---------------------------------------------- | ----------- |
| `~/.ssh/` (répertoire)       | contient les clés                              | `chmod 700` |
| `id_ed25519` / `Tir`         | clé **privée** — ne quitte jamais le poste     | `chmod 600` |
| `id_ed25519.pub` / `Tir.pub` | clé **publique** — à déployer sur les serveurs | `chmod 644` |


> ⚠️ Permissions trop larges (ex. 644 sur la clé privée) → le client **ignore la clé**.  
> Vérifier après chaque manipulation : `ls -la ~/.ssh/`

### Étape 3 — Déploiement de la clé publique sur le serveur

```bash
ssh-copy-id -i ~/.ssh/Tir.pub user@adresse_ip
```

> Toujours préciser le `.pub` et l'utilisateur/serveur cible — sinon ssh-copy-id peut choisir une autre clé.

Côté serveur, vérifier :

```bash
cat ~/.ssh/authorized_keys    # la ligne ssh-ed25519 ... commentaire doit y figurer
chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys
```

> ⚠️ Avec `StrictModes` (actif par défaut), un `authorized_keys` trop permissif = authentification refusée.

**Audit des clés** : chaque ligne = un accès potentiel → purger régulièrement les clés obsolètes  
(départs, postes remplacés), noter date d'ajout et propriétaire. Fiche d'exploitation à jour.

### Étape 4 — Connexion avec la clé

```bash
ssh -i ~/.ssh/Tir -p 22 user@adresse_ip
```

> ✅ **Toujours tester la connexion par clé AVANT de désactiver les mots de passe**,  
> en gardant la session courante ouverte comme filet de sécurité.

### Étape 5 — Fichier de configuration client `~/.ssh/config`

```ini
# vm debian pour le ECF de Studi
Host glpi
    HostName [adresse_ip/nom_de_domaine]
    User loupulus
    IdentityFile ~/.ssh/CreativeStudios_GLPI-Serveur
    Port 22

# raspberrypi Baal
Host Baal
    HostName 192.168.1.34
    User loupulus
    IdentityFile ~/.ssh/Baal
    Port 22
```

Ensuite : `ssh Baal` suffit.

---

## 3. Configuration serveur durcie — `/etc/ssh/sshd_config`

Directives clés (recommandations ANSSI) :

```ini
Port 22

# --- Authentification : clé publique UNIQUEMENT ---
AuthenticationMethods publickey
PubkeyAuthentication yes
PasswordAuthentication no        # désactive les mots de passe
KbdInteractiveAuthentication no   # ⚠️ obligatoire aussi ! (chemin PAM keyboard-interactive)
PermitEmptyPasswords no
UsePAM yes                        # garder le défaut Debian ; les 2 directives "no" ci-dessus suffisent

PermitRootLogin no                # jamais de root direct → compte nominatif + sudo (traçabilité)
StrictModes yes                   # refuse les fichiers/permissions trop permissifs
AllowUsers loupulus               # liste blanche des comptes autorisés en SSH

# --- Sessions ---
LoginGraceTime 2m
MaxAuthTries 6
MaxSessions 5
LogLevel INFO                     # journalise connexions sans surcharger (recommandé prod)

X11Forwarding no
PrintMotd no
AcceptEnv LANG LC_* COLORTERM NO_COLOR
Subsystem sftp internal-sftp
```

> ⚠️ **Piège Debian 13** : `PasswordAuthentication no` seul ne suffit PAS si `UsePAM yes`.  
> Le chemin `keyboard-interactive` peut encore accepter un mot de passe.  
> → mettre **les deux** : `PasswordAuthentication no` **et** `KbdInteractiveAuthentication no`.

### Tableau récapitulatif du durcissement


| Directive                      | Valeur           | Effet                                              |
| ------------------------------ | ---------------- | -------------------------------------------------- |
| `PermitRootLogin`              | `no`             | Interdit la connexion SSH directe du root          |
| `PasswordAuthentication`       | `no`             | Désactive l'authentification par mot de passe      |
| `KbdInteractiveAuthentication` | `no`             | Désactive le chemin keyboard-interactive (PAM)     |
| `AllowUsers`                   | liste nominative | Limite l'accès aux comptes explicitement autorisés |
| `LogLevel`                     | `INFO`           | Journalisation suffisante en production            |
| `PubkeyAuthentication`         | `yes`            | Active l'authentification par clé                  |


### Procédure de modification (sans se verrouiller dehors)

1. `sudo nano /etc/ssh/sshd_config`
2. Modifier / ajouter les directives
3. `sudo sshd -t` — aucune sortie = syntaxe OK
4. `sudo systemctl reload ssh` — n'interrompt pas les sessions ouvertes
5. **Tester depuis un second terminal** : clé OK + mot de passe refusé + root refusé
6. Ce n'est qu'après ces tests qu'on peut fermer la session de secours

### Les 4 tests de validation finale

```bash
systemctl status ssh                                   # 1. service actif
ssh -o PreferredAuthentications=publickey \
    -o PasswordAuthentication=no user@ip "echo OK"    # 2. connexion par clé OK
ssh root@adresse_ip                                    # 3. attendu : Permission denied (publickey)
ssh -o PubkeyAuthentication=no user@adresse_ip        # 4. attendu : Permission denied
```

---

## 4. Bloc `Match` — comptes SFTP restreints

Pour confiner des comptes de dépôt (partenaires, automatisation) au seul transfert de fichiers :

```ini
Match Group sftp
    ChrootDirectory /sftp/%u
    ForceCommand internal-sftp -d /upload
    AllowTcpForwarding no
    X11Forwarding no
    PermitTTY no
    PermitTunnel no
```

> ⚠️ **Prérequis ChrootDirectory** : le répertoire ET chaque composant du chemin doivent  
> appartenir à **root** et ne pas être inscriptibles par groupe/autres (`ls -ld` pour vérifier),  
> sinon sshd refuse la session avec une erreur peu explicite côté client.

> 💡 Conforme ANSSI : on peut aussi exiger une clé pour ces comptes plutôt qu'un mot de passe.

---

## 5. Transfert de fichiers

### 5.1 scp — transferts ponctuels

```bash
scp rapport.pdf user@192.168.1.50:/home/user/rapports/    # envoyer (source → destination)
scp user@192.168.1.50:/var/log/syslog ./logs/             # récupérer
scp -r user@192.168.1.50:/etc/nginx/ ./sauvegarde_nginx/  # répertoire entier (-r)
```

- Syntaxe : **source puis destination** (la destination est toujours le dernier argument)
- Depuis OpenSSH 9.0, scp utilise le protocole SFTP en interne (syntaxe inchangée)
- ⚠️ scp ne préserve pas toujours les droits → vérifier avec `ls -l` après transfert

**Vérification d'intégrité** (fichiers sensibles / configs) :

```bash
sha256sum fichier                          # sur le poste local
ssh user@ip "sha256sum /chemin/fichier"     # sur le serveur
# → les deux empreintes doivent être identiques
```

### 5.2 sftp — session interactive

```bash
sftp user@192.168.1.50
```


| Commande                      | Action                                |
| ----------------------------- | ------------------------------------- |
| `ls` / `lls`                  | lister côté serveur / côté local      |
| `cd` / `lcd`                  | changer de répertoire serveur / local |
| `get fichier` / `put fichier` | télécharger / envoyer                 |
| `get -R repertoire/`          | télécharger un répertoire entier      |
| `bye` ou `exit`               | fermer la session                     |


> **scp vs sftp** : scp = une commande, un transfert ponctuel ; sftp = navigation et plusieurs fichiers en une session.

Traçabilité des transferts :

```bash
journalctl -u ssh --since "today" | grep sftp
```

### 5.3 rsync (suite logique du cours)

```bash
rsync -avz -e ssh user@192.168.1.50:/var/backups/ ./sauvegardes_locales/
```

Réutilise le même canal : même compte, même clé Ed25519, même port. Prérequis des sauvegardes distantes.

---

## 6. Redirection de port (tunnel SSH)

```bash
ssh -L 8081:localhost:4080 Baal
```

> Forwarding **local** : depuis le poste client, on accède à un service joignable **depuis le serveur**  
> (ex. une application web du serveur non exposée publiquement). Sur le poste client, naviguer vers `http://localhost:8081`.

---

## 7. Fiche d'exploitation (à maintenir à jour)


| Rubrique                  | Contenu                                            |
| ------------------------- | -------------------------------------------------- |
| Identification du serveur | IP, nom d'hôte, OS (ex. Debian 13 Trixie)          |
| Configuration SSH         | Port, directives durcies actives                   |
| Comptes autorisés         | Liste des comptes SSH et leur rôle                 |
| Registre des clés         | Type, empreinte SHA256, date d'ajout, propriétaire |
| Procédure de révocation   | Étapes pour retirer une clé compromise             |
| Dernière vérification     | Date + résultat des 4 tests                        |


Rotation des clés : réviser à chaque départ de technicien ou au moins une fois par an.

---

## ✅ Checklist complète (ordre chronologique)

1. ☐ Installer et activer : `apt install openssh-server` + `systemctl enable --now ssh`
2. ☐ Vérifier le service : `systemctl status ssh`
3. ☐ Première connexion + **vérification de l'empreinte** avant de valider `yes`
4. ☐ Générer la clé Ed25519 **avec passphrase** : `ssh-keygen -t ed25519 -C "..."`
5. ☐ Appliquer les permissions : `700` sur `~/.ssh/`, `600` sur la clé privée
6. ☐ Déployer : `ssh-copy-id -i ~/.ssh/cle.pub user@ip`
7. ☐ Vérifier `authorized_keys` + droits (`600`), tester la connexion par clé
8. ☐ Durcir `sshd_config` : `PermitRootLogin no`, `PasswordAuthentication no`, `KbdInteractiveAuthentication no`, `AllowUsers`, `LogLevel INFO`
9. ☐ `sshd -t` puis `systemctl reload ssh` (session de secours ouverte !)
10. ☐ 4 tests de validation, puis fermeture de la session de secours
11. ☐ Documenter dans la fiche d'exploitation (clés, empreintes, dates)