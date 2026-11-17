---
title: "Fiche   Identification Serveur"
date: 1794925189
tags: ["Informatique", "Admyn_sys"]
categories: ["Informatique"]
themes: ["Informatique"]
draft: false
---

# 📄 Fiche 1 — Identification &amp; configuration du serveur

> Fiche **informative** : elle décrit l'état du serveur. Elle ne contient ni procédure, ni secret (les mots de passe et clés relèvent du gestionnaire de secrets).  
> Champs à remplir avec les valeurs réelles du serveur documenté.

## 1. Identification


| Rubrique                                     | Valeur |
| -------------------------------------------- | ------ |
| Nom de la machine                            |        |
| Rôle / fonction                              |        |
| Système d'exploitation                       |        |
| Responsable / équipe                         |        |
| Date de mise en service                      |        |
| Environnement (test / recette / prod)        |        |
| Ressources (RAM / disque / vCPU)             |        |
| Emplacement (hyperviseur, datacenter, cloud) |        |


## 2. Partitionnement &amp; points de montage

Table de partition : — récupérable avec `lsblk` ou `fdisk -l`


| Partition | Point de montage | Taille | Système de fichiers | Options de montage |
| --------- | ---------------- | ------ | ------------------- | ------------------ |
|           |                  |        |                     |                    |
|           |                  |        |                     |                    |
|           |                  |        |                     |                    |


Notes :

- `/tmp` en tmpfs (comportement par défaut sous Debian 13) : taille max = 50 % de la RAM, mémoire consommée uniquement par les fichiers réellement créés.
- Justifications des séparations de partitions (ex. `/var`, `/srv` isolés pour qu'un remplissage ne bloque pas le système).

## 3. Durcissement appliqué &amp; justifications


| Mesure                    | Mise en œuvre                      | Justification |
| ------------------------- | ---------------------------------- | ------------- |
| Mises à jour automatiques | `unattended-upgrades`, périmètre : |               |
| Pare-feu                  | UFW, politique par défaut :        |               |
| Comptes                   | root distant désactivé : oui/non   |               |
| Services                  | Liste des services actifs :        |               |
| SSH                       | Config spécifique :                |               |
| Paramètres noyau          | Fichier `/etc/sysctl.d/…` :        |               |


## 4. Réseau &amp; accès


| Élément                                    | Valeur |
| ------------------------------------------ | ------ |
| Adresse IP / masque                        |        |
| Mode d'attribution (statique / DHCP)       |        |
| Passerelle                                 |        |
| Interface réseau active                    |        |
| Ports ouverts en entrée (port + service)   |        |
| Politique pare-feu et exceptions           |        |
| Accès d'administration (commande complète) |        |


## 5. Comptes &amp; privilèges


| Compte | Rôle fonctionnel | Privilèges / restrictions |
| ------ | ---------------- | ------------------------- |
|        |                  |                           |
|        |                  |                           |


Emplacement du gestionnaire de secrets de l'équipe (jamais les secrets eux-mêmes) :

## 6. Journal des modifications


| Date | Version | Auteur | Description du changement |
| ---- | ------- | ------ | ------------------------- |
|      |         |        |                           |
|      |         |        |                           |