---
title: "Serveur Sftp"
date: 1794925189
tags: ["Informatique", "Admyn_sys"]
categories: ["Informatique"]
themes: ["Informatique"]
draft: false
---

# Serveur SFTP

Ce tuto va permettre de configurer un serveur sftp avec beaucoup de restriction. les utilisateurs seront cantoné a leur dossier personnelle -> /sftp/user.

Ils ne pourront pas interagire et ce déplacer dans le reste du serveur. il ne pourront pas non plus ce connecter en ssh.

## Configuration du systéme de fichier

On va donc créer un groupe sftp. tout les utilisateurs que l’on créera par la suite seront membre de ce groupe.

```bash
root@sftp:~ $ sudo apt update && sudo apt upgrade -y

root@sftp:~ $ groups
loupulus adm dialout cdrom sudo audio video plugdev games users netdev gpio i2c spi render input

root@sftp:~ $ sudo groupadd sftp

root@sftp:~ $ groups
loupulus adm dialout cdrom sudo audio video plugdev games users netdev gpio i2c spi render input

root@sftp:~ $ sudo mkdir /sftp
 
root@sftp:~ $ lsd -l / | grep "sftp"
drwxr-xr-x root root 4.0 KB Wed May 20 15:18:37 2026 sftp

root@sftp:~ $ sudo chmod 750 /sftp

root@sftp:~ $ lsd -l / | grep "sftp"
drwxr-x--- root root 4.0 KB Wed May 20 15:18:37 2026 sftp
```

## Configuration d’un utilisateur

```bash
[root@sftp ~]#useradd -s /usr/bin/false -d /sftp/john -G sftp john
```

- L’option « -s » spécifie le shell à utiliser, on ne veut pas qu’il en utilise donc on lui indique un « faux » shell (en fait, c’est plutôt une commande qui ne fait rien et se termine avec un code d’erreur)
    
- L’option « -d » indique quel répertoire sera celui de l’utilisateur
    
- L’option -G ajoute l’utilisateur au groupe (ici sftp)
    

N’oubliez pas de lui affecter un mot de passe :

```bash
[root@sftp ~]#passwd john
```

Attention, par défaut, le répertoire « john » aura des permissions uniquement pour l’utilisateur john (et root bien entendu). Comme indiqué plus haut, pour que SFTP puisse fonctionner, il est obligatoire d’avoir des droits réglés sur 750 avec root en tant que propriétaire.

Il faut donc modifier le propriétaire du dossier. J’en profite pour déclarer « sftp » comme groupe propriétaire également et modifie les droits :

```bash
[root@sftp ~]#chown root:sftp /sftp/john
[root@sftp ~]#chmod 750 /sftp/john
```

On ne peut pas s’arrêter ici, car l’utilisateur « john » pourra bien se connecter, mais en aucun cas uploader quoi que ce soit. Il faut donc lui créer un répertoire dans lequel il pourra à loisir uploader des fichiers, créer d’autres répertoires, etc.

Rappelez-vous, lors de la configuration du service, on a spécifié « ForceCommand internal-sftp -d /upload » donc le répertoire qui sera utilisé par l’utilisateur doit s’appeler « upload ».

```bash
[root@sftp ~]#mkdir /sftp/john/upload
[root@sftp ~]#chown john:john /sftp/john/upload
[root@sftp ~]#chmod 750 /sftp/john/upload
```

## Configuration de ssh

On va par la suite modifier les fichiers de config ssh pour override les régles du systéme avec des régles spécifique a ce groupe.

```ini
root@sftp:~ $ micro /etc/ssh/sshd_config

override default of no subsystems
Subsystem sftp /usr/libexec/openssh/sftp-server
 
Example of overriding settings on a per-user basis
Match User anoncvs
X11Forwarding no
AllowTcpForwarding no
PermitTTY no
ForceCommand cvs server
```

```ini
override default of no subsystems
Subsystem sftp internal-sftp
 
Example of overriding settings on a per-user basis
Match Group sftp
X11Forwarding no
AllowTcpForwarding no
PermitTTY no
PermitTunnel no
ForceCommand internal-sftp -d /upload
ChrootDirectory /sftp/%u
AuthenticationMethods password
PasswordAuthentication yes
```

- `Subsystem sftp internal-sftp` -> **va indiquer au démon sshd d’utiliser les commandes intégrées**
    
- `Match Group sftp` -> **appliquer les lignes qui suivent à tous les utilisateurs faisant partie du groupe « sftp »**
    
- `X11Forwarding no` -> **va interdire la transmission de l’affichage entre le serveur et le client (ici nous n’avons pas d’interface graphique, mais il vaut mieux l’activer si d’aventure on en rajoute une)**
    
- `AllowTcpForwarding no` -> **va interdire les redirections TCP**
    
- `PermitTTY no` -> **va interdire l’utilisation du shell**
    
- `PermitTunnel no` -> **va interdire l’utilisation des commandes SSH pour créer des tunnels chiffrés**
    
- `ForceCommand internal-sftp` -> **va obliger les utilisateurs à n’utiliser QUE les commandes SFTP, l’option « -d /upload » va spécifier le répertoire dans lequel l’utilisateur arrive au moment de la connexion, ceci pour éviter qu’il n’arrive à sa racine, car il n’aura pas les droits d’écriture (voir plus bas)**
    
- `ChrootDirectory /sftp/%u` -> **va indiquer au démon que les utilisateurs doivent croire que la racine est /sftp/nomdelutilisateur**
    
- `AuthenticationMethods password` + `PasswordAuthentication yes` -> **Override pour les utilisateur interdiction de connexion par mot de passe**
    

&nbsp;

## **Relancer sshd et testr la connexion (client filezilla par exemple)**

&nbsp;

```bash
root@sftp:~ $ sudo systemctl restart sshd

root@sftp:~ $ sudo systemctl status sshd
● ssh.service - OpenBSD Secure Shell server
     Loaded: loaded (/usr/lib/systemd/system/ssh.service; enabled; preset: enabled)
     Active: active (running) since Wed 2026-05-20 15:58:47 CEST; 18s ago
 Invocation: b8d09d0eee4b4fcd8c0d851f3fbe5cc3
       Docs: man:sshd(8)
             man:sshd_config(5)
    Process: 19293 ExecStartPre=/usr/sbin/sshd -t (code=exited, status=0/SUCCESS)
   Main PID: 19296 (sshd)
      Tasks: 8 (limit: 9583)
        CPU: 113ms
     CGroup: /system.slice/ssh.service
             ├─ 2275 "sshd-session: loupulus [priv]"
             ├─ 2277 "sshd-session: loupulus@pts/0"
             ├─ 2278 -bash
             ├─19296 "sshd: /usr/sbin/sshd -D [listener] 0 of 10-100 startups"
             ├─19304 sudo systemctl status sshd
             ├─19306 sudo systemctl status sshd
             ├─19307 systemctl status sshd
             └─19308 less
```