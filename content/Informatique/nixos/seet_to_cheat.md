---
title: "Seet To Cheat"
date: 1794925189
tags: ["Informatique", "nixos"]
categories: ["Informatique"]
themes: ["Informatique"]
draft: false
---

# usual workflow 

`nix-rebuild test` --> test la configuration 

`nix-rebuild switch`	-> change de configuration 

`nix-rebuild switch --upgrade` -> change de configuration et va chercher les derniere mise a jour des différent paquet

# channel 

Run `sudo nix-channel --list` and make sure a nixos channel is present
Run `sudo nix-channel --update` separately and see if it errors
