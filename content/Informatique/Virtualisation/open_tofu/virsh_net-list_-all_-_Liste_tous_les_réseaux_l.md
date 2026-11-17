---
title: "Virsh Net List  All   Liste Tous Les Réseaux L"
date: 1794925189
tags: ["Informatique", "Virtualisation"]
categories: ["Informatique"]
themes: ["Informatique"]
draft: false
---

# Commande de configuration libvirt virsh

`virsh net-list --all`  -> Liste tous les réseaux libvirtrécupére

`virsh net-start default`  -> démarre le réseaux ciblé

`virsh list --all` -> liste toute les vm libvirt

`virsh pool-list --all` -> liste tout les pool libivirt

`sudo virsh dumpxml Ubuntu_template > Ubuntu_template.xml` -> Cette commande sert à récupérer   le fichier xml de configuration d'une vm 

`virsh net-dumpxml default | grep uuid`  -> Récupère l’UUID du réseau “default”. Nécessaire pour spécifier l’UUID dans la configuration OpenTofu

`virsh net-start default` -> Démarre le réseau “default”.

`virsh net-autostart default` -> Configure le réseau pour qu’il démarre automatiquement au redémarrage de libvirtd

`virsh list --all` -> Liste toutes les machines virtuelles existantes.

`virsh shutdown`  -> éteint la machine

`virsh destroy` -> éteint également la machine mais plus comme si on coupait alimentation

`virsh start` -> démarre al vm

`virsh undefine Vahagan_debian12` -> supprime la définition de la VM existante de la liste mais pas les disque associer, les fichier physique

`rm /var/lib/libvirt/images/` -> pour allez modifier supprimé les fichiers

`virsh domifaddr` -> donne adresse ip de la vm

`virsh domiflist` --> donne adresse mac de la vm

`virt-viewer --connect qemu:///system Vahagan_debian12` -> connectée a la vm