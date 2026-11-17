---
title: "Configuration Réseau Pour Debian Ip Statique Dn"
date: 1794925189
tags: ["Informatique", "Admyn_sys"]
categories: ["Informatique"]
themes: ["Informatique"]
draft: false
---

# Configuration Réseau pour Debian (IP Statique + DNS)

---

## 📌 1. Configurer une IP Statique

### Fichier : `/etc/network/interfaces`

*(Pour Debian avec `ifupdown`)*

```bash
sudo nano /etc/network/interfaces
```

**Exemple de configuration** (à adapter) :

```plaintext
auto eth0
iface eth0 inet static
    address 192.168.60.4      # IP statique de la VM
    netmask 255.255.255.0     # Masque de sous-réseau
    gateway 192.168.60.254   # Passerelle (routeur ou serveur Windows)
    dns-nameservers 192.168.60.1  # IP du serveur DNS (Barsamin)
```

**Appliquer les changements** :

```bash
sudo systemctl restart networking
```

---

## 📌 2. Configurer le Serveur DNS (`/etc/resolv.conf`)

### Fichier : `/etc/resolv.conf`

```bash
sudo nano /etc/resolv.conf
```

**Contenu** (remplacer `192.168.60.1` par l'IP de ton serveur DNS) :

```plaintext
nameserver 192.168.60.1
```

**Rendre le fichier immuable** (pour éviter qu'il soit écrasé) :

```bash
sudo chattr +i /etc/resolv.conf
```

---

## 📌 3. Configurer les Noms d'Hôtes (`/etc/hosts`)

### Fichier : `/etc/hosts`

```bash
sudo nano /etc/hosts
```

**Exemple** (à adapter) :

```plaintext
127.0.0.1       localhost
192.168.60.4   Armazd Armazd.GreenTechSprint.fr
192.168.60.1   Barsamin Barsamin.GreenTechSprint.fr
```

