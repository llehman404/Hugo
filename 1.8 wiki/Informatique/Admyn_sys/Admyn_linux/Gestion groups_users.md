gestion groups/users 
# Gestion des Droits et Groupes sous Linux

## Gestion des Utilisateurs et Groupe 

- Ajouter un utilisateur : `useradd < (-m crée un repertoir) (-d indique le chemin ver le repertoir) /repertoir associer a l'utilisateur>  utilisateur` sous debian:`adduser` permet de créer les repertoire automatiquement avec mot de passe ect...
- set-up un password : `passwd "user"`
- ajouter un home directory a un compte utilisateur deja créer :`mkdir /home/utilisateur && chown utilisateur:groupe /chemin/du/dossier`
- Supprimer un utilisateur : `deluser --remove-home loupulus`
 - Créer un groupe : `groupadd nom_du_groupe`
 -  Supprimer un groupe : `groupdel nom_du_groupe`
 -   enlever un utilisateur de un groupe : `gpasswd -d user group`
- Vérifier les groupes d’un utilisateur : `groups loupulus`
 - Ajouter un utilisateur à un groupe : `usermod -aG group user`
- Vérifier les groupes d’un utilisateur : `groups loupulus`
- Changer le shell d’un utilisateur : `chsh -s /bin/bash loupulus`
- Lister tous les utilisateurs : `cut -d: -f1 /etc/passwd` or `cat /etc/passwd | awk -F : '{print $1}'`
- liste groupe, protocole, mod de passe ect : `getent `

## Gestion des Droits `sudo`

- Vérifier les droits `sudo` : `sudo whoami`
- Éditer le fichier `sudoers` : `visudo`
- Autoriser un groupe à utiliser `sudo` : `%sudo ALL=(ALL:ALL) ALL`
- Limiter `sudo` à une commande : `loupulus ALL=(root) NOPASSWD: /usr/bin/systemctl restart nginx`



