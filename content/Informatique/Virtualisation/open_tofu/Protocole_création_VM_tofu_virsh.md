---
title: "Protocole Création Vm Tofu Virsh"
date: 1794925189
tags: ["Informatique", "Virtualisation"]
categories: ["Informatique"]
themes: ["Informatique"]
draft: false
---

- création du dossier
- création du fichier terraform
- tofu init
- tofu plan
- tofu apply
- virsh list -all
- virsh net-list --all
- virsh pool-list --all
- virt-viewer [vm_name]
- procéder à installation
- shutdown
- sudo virsh dumpxml Ubuntu_test > /tmp/Ubuntu_test.xml
- modifier les section boot / disk / video / graphique
-  sudo virsh define /tmp/Ubuntu_test.xml
-  [loupulus@nixos:/tmp]$ sudo virsh qemu-monitor-command Ubuntu_test --hmp "info spice"
-  