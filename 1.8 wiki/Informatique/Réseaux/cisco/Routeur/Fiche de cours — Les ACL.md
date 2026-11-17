# Fiche de cours — Les ACL

## 1. Concepts

### Définition

Une ACL est une liste séquentielle d'instructions permit ou deny, appelées entrées de contrôle d'accès. Quand un paquet traverse une interface configurée avec une ACL, le routeur compare le paquet à chaque entrée dans l'ordre : à la première correspondance, il applique l'instruction et n'analyse pas la suite. C'est le filtrage de paquets.

### Points clés

1. Par défaut, un routeur n'a pas d'ACL et ne filtre rien : il route selon la table de routage.
2. Le filtrage standard se fait en couche 3 (adresse IP source).
3. Le filtrage étendu se fait en couches 3 et 4 (adresses, protocole, ports).
4. La dernière instruction d'une ACL est toujours un déni implicite, invisible mais automatique : si un paquet ne correspond à aucune entrée, il est rejeté. Une ACL sans aucun permit bloque donc tout.
5. Les ACL ne s'appliquent pas au trafic généré par le routeur lui-même.

### Sens d'application : in ou out

**ACL entrante (in)** : le paquet est filtré avant le routage, ce qui évite une recherche inutile si le paquet est rejeté. Idéal quand le réseau connecté à l'interface d'entrée est la seule source des paquets à examiner.

**ACL sortante (out)** : le paquet est routé puis filtré à la sortie. Idéal quand le même filtre s'applique à des paquets venant de plusieurs interfaces d'entrée et sortant par la même interface.

## 2. Les trois types d'ACL

### ACL standard

Numéros 1 à 99. Filtre sur l'adresse IP source (et une partie de la destination via le masque inversé). À placer le plus près possible de la destination, en sortie (out).

### ACL étendue

Numéros 100 à 199. Filtre sur source et destination, protocole (TCP, UDP), ports source et destination, services (SSH, Telnet...). À placer le plus près possible de la source, en entrée (in).

### ACL nommée

Une ACL étendue (ou standard) à laquelle on affecte un nom au lieu d'un numéro.

## 3. Commandes de gestion des ACL

### Création

access-list 1 deny host 172.16.1.10 (ACL standard)
access-list 100 permit tcp host 192.168.1.10 host 192.168.100.2 eq 80 (ACL étendue)
ip access-list extended web (ACL nommée : on entre ensuite en mode config-ext-nacl et on ajoute les règles une par une)

### Application sur une interface

Sans ça, l'ACL ne fait rien :

interface fa0/0
ip access-group 1 out (numéro ou nom de la liste, sens in ou out)

### Suppression

no access-list 1 (supprime toute la liste numérotée)
no ip access-list extended web (supprime la liste nommée)
no ip access-group 1 out (détache la liste de l'interface sans la supprimer)

### Modification

Sur une ACL numérotée : impossible d'insérer au milieu. La bonne méthode est no access-list 100 puis recréation complète de la liste dans le bon ordre (recopier les règles dans un éditeur texte avant de supprimer).

Sur une ACL nommée : modification ligne par ligne possible. En mode ip access-list extended web :

no 10 (supprime la règle numéro 10)
10 permit tcp host 192.168.1.10 host 192.168.100.2 eq 80 (insère la règle à la position 10, ce qui permet d'ordonner la liste)
remark texte (ajoute un commentaire pour documenter la règle)

### Observation

show access-lists (toutes les ACL du routeur, avec les correspondances comptées par règle)
show ip access-list (les ACL IP uniquement)
show ip interface fa0/0 (montre quelle ACL est appliquée sur l'interface, et dans quel sens)
do show ip access-list (depuis un mode config)
clear access-list counters (remet les compteurs de correspondances à zéro avant un test)

### Diagnostic

Le compteur de correspondances (match) en face de chaque règle est l'outil de diagnostic : si le paquet de test n'incrémente aucune règle, il est soit bloqué avant (mauvaise interface), soit aucun permit ne le concerne et c'est le déni implicite qui le jette.