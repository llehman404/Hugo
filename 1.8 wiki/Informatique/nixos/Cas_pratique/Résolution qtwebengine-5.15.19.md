# Résolution problème grade channel nix-os

## Contexte

Au moment de changer de version je me suis retrouvée avec la librairies suivante -> qtwebengine-5.15.19-bin n'etant plus supporter et ayant une faille de securiter il me fallait choisir. la garder ou la degager.

1.  Identification la source du problème : 

`nix-store -q --requisites /run/current-system | grep qtwebengine nix-store -q --referrers`

`/nix/store/jp668glxznzrifjjf8g5avnccrmdr3y0-qtwebengine-5.15.19-bin nix-store -q --referrers ~/.nix-profile | grep qtwebengine`

Dans mon cas ce paquet était lier a stremio que j'ai donc désinstaller mais le probléme etait que pour

4.  Autorisation temporaire :

`nixpkgs.config.permittedInsecurePackages = [ "qtwebengine-5.15.19" ];`

5.  Mise à jour :

`sudo nixos-rebuild switch sudo nix-channel --update sudo nixos-rebuild switch --upgrade`

6.  Retrait de l’autorisation :

`sudo nixos-rebuild switch`