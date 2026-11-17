---
title: "Fiche   Processus D Installation Du Serveur"
date: 1794925189
tags: ["Informatique", "Admyn_sys"]
categories: ["Informatique"]
themes: ["Informatique"]
draft: false
---

# 📦 Fiche 2 — Processus d'installation du serveur

> Fiche **procédurale** : déroulé d'installation générique d'un serveur Debian durci, de l'ISO jusqu'à la mise en production. À suivre dans l'ordre.

## Étape 1 — Installation du système

1. Récupérer l'ISO **Debian stable** (Trixie) sur debian.org et vérifier son intégrité (somme de contrôle).
2. Créer la VM avec les ressources minimales : **1 Go RAM, 20 Go disque, 1 vCPU**.
3. Lancer l'installation :
  - Langue, clavier, locale selon le contexte
  - Nom de machine conforme à la convention d'équipe
  - Table de partition : **GPT**
4. Schéma de partition type (20 Go) :


| Partition | %     | Taille |
| --------- | ----- | ------ |
| EFI       | 1,5 % | 300 Mo |
| `/boot`   | 1,5 % | 300 Mo |
| `/`       | 40 %  | 9 Go   |
| `/var`    | 40 %  | 7 Go   |
| `/srv`    | 10 %  | 2 Go   |
| `/home`   | 2,5 % | 500 Mo |
| swap      | 5 %   | 1 Go   |


- `/var` et `/srv` en **partitions indépendantes** : un remplissage (logs, données) ne bloque pas le système.
- Swap réduit (&lt; 1 Go) : suffisant, un serveur durci n'a pas vocation à swapper.

5. Cocher la tâche « serveur SSH » (installation d'`openssh-server`) et **aucune** tâche de bureau inutile.
6. Créer le compte administrateur dédié (pas d'usage direct de root).

## Étape 2 — Configuration initiale (premier démarrage)

```bash
# 1. Mise à jour complète dès le premier démarrage
# (des correctifs ont pu paraître entre la création de l'ISO et l'installation)
apt update && apt upgrade -y

# 2. Vérifier que le dépôt security est actif dans sources.list
grep security /etc/apt/sources.list /etc/apt/sources.list.d/* 2>/dev/null

# 3. Outils de base
apt install wget curl sudo ufw micro nmap telnet openssh

# 4. Sudo : configurer si besoin puis ajouter l'admin au groupe sudo
visudo
usermod -aG sudo <admin>

# 5. SSH : vérifier le service et l'écoute
systemctl status ssh
ss -tlnp | grep :22        # doit écouter sur 0.0.0.0:22
```

## Étape 3 — Pare-feu UFW

⚠️ **Danger** : activer UFW sans ouvrir le port SSH bloque l'administration distante.  
Toujours autoriser les ports **avant** `ufw enable`, et garder la session SSH ouverte pendant la vérification.

```bash
ufw allow 22/tcp        # SSH en premier
# + ports du rôle du serveur (80, 443…)
ufw enable
ufw status verbose      # vérifier AVANT de fermer la session
```

Politique cible : `default deny incoming` — seul ce qui est nécessaire au rôle est ouvert.

## Étape 4 — Mises à jour automatiques de sécurité

```bash
apt install unattended-upgrades
dpkg-reconfigure unattended-upgrades    # répondre Oui
```

Vérification (le piège : paquet installé mais fichier absent = automatisation inactive) :

```bash
cat /etc/apt/apt.conf.d/20auto-upgrades
# les deux lignes doivent valoir "1" :
#   APT::Periodic::Update-Package-Lists "1";
#   APT::Periodic::Unattended-Upgrade "1";
```

Limiter le périmètre à la sécurité uniquement — dans `/etc/apt/apt.conf.d/50unattended-upgrades`, commenter la ligne du dépôt principal :

```
//"origin=Debian,codename=${distro_codename},label=Debian";
```

Puis `systemctl restart unattended-upgrades.service`.

Validation du périmètre :

```bash
unattended-upgrade --dry-run --debug | grep -i "origin"
```

Seules les origines `label=Debian-Security` doivent apparaître.

## Étape 5 — Paramètres noyau (durcissement sysctl)

> Debian 13 Trixie : `/etc/sysctl.conf` est **ignoré silencieusement**. Toujours utiliser `/etc/sysctl.d/`.

```bash
nano /etc/sysctl.d/99-hardening.conf
#   exemple : net.ipv4.tcp_syncookies = 1   (protection SYN flooding)
sysctl --system                        # appliquer sans redémarrer
```

Documenter l'emplacement de ce fichier dans la Fiche 1.

## Étape 6 — Validation avant mise en production

```bash
# Séquence de vérification (en root ou sudo) :
systemctl status ssh        # services critiques
ss -tulpn                   # ports en écoute — comparer à la Fiche 1
ufw status verbose          # pare-feu conforme
journalctl -b               # erreurs au démarrage
```

Puis **premier redémarrage complet** et répétition de la séquence + contrôle de persistance :

```bash
cat /etc/fstab                              # montages conformes
mount | grep -E '/var|/srv|/home|/tmp'
ufw status verbose                          # pare-feu toujours actif
systemctl list-units --type=service --state=running   # services activés
```

> Une configuration qui ne survit pas au redémarrage n'est pas une configuration : c'est un état temporaire.

