---
title: "Résumé Problème Docker Sur Nixos"
date: 1794925189
tags: ["Informatique", "Virtualisation"]
categories: ["Informatique"]
themes: ["Informatique"]
draft: false
---

# Résumé : Problème Docker sur NixOS

## Problème
- `docker ps` ne fonctionnait qu'en `root` malgré :
  - Permissions du socket : `srw-rw---- root docker`
  - Utilisateur `loupulus` dans le groupe `docker` (`groups loupulus`)

## Cause
La session actuelle n'avait **pas le groupe `docker` actif** dans ses groupes effectifs :
- `id` et `groups` n'affichaient pas `docker` avant `newgrp docker`.

## Solution
```bash
newgrp docker
```
## Exemple concret 

```bash
[loupulus@Vivacia:~/.ssh]$ sg docker -c "docker ps"
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES

[loupulus@Vivacia:~/.ssh]$ id
uid=1000(loupulus) gid=100(users) groupes=100(users),1(wheel),20(lp),57(networkmanager),67(libvirtd),72(vboxusers),302(kvm)

[loupulus@Vivacia:~/.ssh]$ groups
users wheel lp networkmanager libvirtd vboxusers kvm

[loupulus@Vivacia:~/.ssh]$ newgrp docker
 ______________
< Hello, Loup! >
 --------------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||

[loupulus@Vivacia:~/.ssh]$ id
uid=1000(loupulus) gid=131(docker) groupes=131(docker),1(wheel),20(lp),57(networkmanager),67(libvirtd),72(vboxusers),100(users),302(kvm)

[loupulus@Vivacia:~/.ssh]$ groups 
docker wheel lp networkmanager libvirtd vboxusers users kvm

[loupulus@Vivacia:~/.ssh]$ docker ps
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES

```