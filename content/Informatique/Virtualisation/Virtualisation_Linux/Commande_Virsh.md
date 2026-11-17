---
title: "Commande Virsh"
date: 1794925189
tags: ["Informatique", "Virtualisation"]
categories: ["Informatique"]
themes: ["Informatique"]
draft: false
---

# Commande Virsh 

## Commande pour prise d’information

`virsh -c qemu:///system version` -> donne la version de libvirt et qemu 

`virsh net-list --all` -> donne tout les reseaux existant 

`virsh list --all` -> montre toute les vm existante 

`virsh pool-list --all`  -> montre tout les pool existant 

`virsh dominfo ubuntu-test`

`virsh domiflist` -> donne le reseaux de la vm 

`virsh domiflist` -> donne le pool de la vm


## Commande de gestion 

```bash
virsh start <vm>

virsh shutdown <vm>

virsh destroy <vm> 

virsh undefine --remove-all-storage <nom_de_la_vm>`  # Supprime vm plus le disque.

```