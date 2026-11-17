---
title: "Méthode De Calcul D Une Étendue Réseau"
date: 1794925189
tags: ["Informatique", "Réseaux"]
categories: ["Informatique"]
themes: ["Informatique"]
draft: false
---

# Méthode de calcul d'une étendue réseau

**Exemple fil rouge — 1 500 appareils dans un bloc /21 :**

```
étendue totale -> 10.2.0.0 - 10.2.7.255
>>> 1500 / 256
5.859375
>>> 256 * 0.859375
220.0

soit 10.2.5.220 (la 1 500e adresse attribuée)
```

## 1/ Définir la taille du masque

ex : /16
ex: /26

## 2/ Définir le début de l'étendue

(classe A : 10.0.0.0, classe B : 172.16.0.0, classe C : 192.168.0.0)

ex : début de l'étendue à 10.0.0.0
ex: début de l'ètendue à 192.168.0.0

## 3/ Calculer la plage réseau

On sait qu'avec un CIDR :

- de 25 à 32, on est dans le 4e octet : 10.0.0.x
- de 17 à 24, on est dans le 3e octet : 10.0.x.x
- de 9 à 16, on est dans le 2e octet : 10.x.x.x
- de 1 à 8, on est dans le 1er octet : x.x.x.x

Formule :

```
2 ** (32 - masque) / 256 = résultat
si résultat >= 256 : résultat / 256 = résultat final
si le résultat < 1 : 256 * résultat = résultat final
```
Placer le résultat dans l'octet selon son masque.

### Exemple 1 — Dans notre cas, avec un masque en /16, on est dans le 2e octet

```
2**(32-16) / 256 = 256
256 / 256 = 1
```

Notre base de calcul ne part pas de 1 mais de zéro. Il faut donc retirer 1 au
résultat obtenu. Cela peut être perturbant dans ce cas précis, car enlever 1
équivaut à passer de l'adresse réseau 10.1.0.0 à 10.0.255.255.

→ L'étendue va de 10.0.0.0 à 10.0.255.255.

### Exemple 2 — Avec un masque de classe C, comme /26, et une étendue qui commence à 192.168.0.0

```
2**(32-26) / 256 = 0.25
```

On applique le principe d'un odomètre : notre base de calcul ne part pas de 1
mais de zéro. Il faut donc retirer 1 au résultat obtenu.

```
0.25 × 256 = 64   → le pas vaut 64
64 − 1 = 63       → la fin de l'étendue
```

→ L'étendue va de 192.168.0.0 à 192.168.0.63.

## 4/ Calcul de la plage utilisable

On prend la plage calculée précédemment et on enlève deux adresses : l'adresse
réseau et l'adresse de diffusion (broadcast).

- ex : étendue 192.168.0.0 - 192.168.0.63 → plage exploitable 192.168.0.1 - 192.168.0.62
- ex : étendue 10.0.0.0 - 10.0.255.255 → plage exploitable 10.0.0.1 - 10.0.255.254

## 5/ Calcul de l'étendue occupée par le nombre d'appareils

ex : pour 63 255 appareils

```
63255 / 256 = 247.08984375
0.08984375 × 256 = 23
```

La quantité d'adresses utilisées est la suivante : **10.0.0.1 - 10.0.247.23**
(soit, de la première exploitable à la 63 255e adresse).

**Vérification de l'étape 5 — l'aller-retour de l'odomètre :**

1. Recomposer l'adresse de fin en nombre :

   étage × 256 + dernier octet = (247 × 256) + 23 = 63 232 + 23 = **63 255** ✓

   On doit retrouver exactement le nombre d'appareils — sinon, une étape a dérivé.

   