---
title: "Gestion Utilisateurs Et Groupe"
date: 1794925189
tags: ["Informatique", "Admyn_sys"]
categories: ["Informatique"]
themes: ["Informatique"]
draft: false
---

# Utilisateurs
```bash
useradd # commande basique pour créer un utilisateur. voir les argument pour créer répertoir, chemin et droit. scriptable

adduser # sous debian créer un un user de facon interactive avec répertoire ect. recommandé pour créer un user relier à un individut

passwd user # permet de créer ou changer un password

deluser --remove-home <user> # supprime un utilisateurs et son home_directory 

chsh -s /bin/<bash, zsh, ...> # détermine le shell d'un utilisateur 

cut -d: -f1 etc/passwd # liste les users 
```

# 	