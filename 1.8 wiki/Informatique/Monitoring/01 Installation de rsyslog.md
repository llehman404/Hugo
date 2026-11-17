# Installation de rsyslog

> ⚠️ **Prérequis** : autoriser le port 514/tcp — voir fiche *Pare-feu (ufw)*

# Serveur syslog

## Installation

```bash
sudo apt update && sudo apt upgrade -y

sudo apt install rsyslog
```

## Création des dossiers de logs

rsyslog crée les fichiers mais **jamais** les répertoires. Il faut les créer avant :

```bash
sudo mkdir -p /var/log/barsamin /var/log/remote
sudo chown root:adm /var/log/barsamin /var/log/remote
sudo chmod 750 /var/log/barsamin /var/log/remote
```

## Configuration

```ini
# /etc/rsyslog.conf configuration file for rsyslog
#
# For more information install rsyslog-doc and see
# /usr/share/doc/rsyslog-doc/html/configuration/index.html


#################
#### MODULES ####
#################

module(load="imuxsock") # provides support for local system logging
module(load="imklog")   # provides kernel logging support
#module(load="immark")  # provides --MARK-- message capability

# provides UDP syslog reception 
#module(load="imudp")
#input(type="imudp" port="514")

# provides TCP syslog reception -> permet la réception des logs de serveurs tiers par le port 514
module(load="imtcp")
input(type="imtcp" port="514")


###########################
#### GLOBAL DIRECTIVES ####
###########################

#
# Set the default permissions for all log files.
#
$FileOwner root
$FileGroup adm
$FileCreateMode 0640
$DirCreateMode 0755
$Umask 0022

#
# Where to place spool and state files
#
$WorkDirectory /var/spool/rsyslog

#
# Include all config files in /etc/rsyslog.d/
#
$IncludeConfig /etc/rsyslog.d/*.conf


###############
#### RULES ####
###############

#
# Log anything besides private authentication messages to a single log file
#
*.*;auth,authpriv.none          -/var/log/syslog

#
# Log commonly used facilities to their own log file
# -> modifier le chemin selon l'endroit où l'on veut stocker les logs
#
auth,authpriv.*        			-/var/log/barsamin/auth.log
cron.*                          -/var/log/barsamin/cron.log
kern.*                          -/var/log/barsamin/kern.log
mail.*                          -/var/log/barsamin/mail.log
user.*                          -/var/log/barsamin/user.log

#
# Emergencies are sent to everybody logged in.
#
*.emerg                         :omusrmsg:*
```

## Redirection des logs distants

```bash
sudo micro /etc/rsyslog.d/10-remote.conf
```

```ini
# Les logs de Baal (Windows) -> redirection des logs des machines distantes
# vers le dossier voulu
if ($fromhost-ip == "192.168.10.10") then {
    action(type="omfile" file="/var/log/remote/baal.log")
    stop                      # <- important : "stop" empêche le log de continuer vers syslog
}

# Les logs de Mihr
if ($fromhost-ip == "192.168.10.30") then {
    action(type="omfile" file="/var/log/remote/mihr.log")
    stop
}
```

## Rotation des logs

### Pourquoi ?

Sans rotation, les fichiers de logs (`/var/log/remote/*.log`,  
`/var/log/barsamin/*.log`) grossissent indéfinissement jusqu'à remplir le disque.  
Debian gère déjà la rotation de ses fichiers classiques (`/var/log/syslog`, etc.),  
mais **pas** ceux qu'on a créés manuellement. Il faut donc les déclarer.

### Mise en place

Créer `/etc/logrotate.d/rsyslog-custom` :

```bash
sudo micro /etc/logrotate.d/rsyslog-custom
```

```
/var/log/remote/*.log /var/log/barsamin/*.log {
    daily
    rotate 14
    missingok
    notifempty
    compress
    delaycompress
    sharedscripts
    postrotate
        /usr/lib/rsyslog/rsyslog-rotate
    endscript
}
```

### Que fait chaque option ?

- `daily` : la rotation est vérifiée tous les jours.
- `rotate 14` : on garde 14 générations d'historique, les plus vieilles sont  
supprimées.
- `missingok` : ne pas planter si un fichier n'existe pas encore.
- `notifempty` : ne pas tourner un fichier vide.
- `compress` : compresse les vieilles générations (`.gz`).
- `delaycompress` : compresse avec un jour de retard, pour que la génération  
la plus récente reste lisible en clair.
- `sharedscripts` : les scripts `postrotate` ne sont exécutés qu'une seule  
fois pour tous les fichiers concernés, pas un par un.

Résultat dans le dossier :

```
mihr.log          <- le log actuel (rsyslog écrit dedans)
mihr.log.1        <- hier, encore en clair
mihr.log.2.gz     <- avant-hier, compressé
mihr.log.3.gz     <- ... jusqu'à 14 générations
```

### À quoi sert le bloc `postrotate` ?

Quand logrotate renomme `mihr.log` → `mihr.log.1`, rsyslog **continue d'écrire**  
**dans l'ancien fichier** (il l'a ouvert par son nom d'origine). La commande  
`/usr/lib/rsyslog/rsyslog-rotate` signale à rsyslog de se reconfigurer, ce qui  
lui fait rouvrir un nouveau `mihr.log` vide. Sans ça, tous les logs continueraient  
d'aller dans le `.1` et le nouveau fichier resterait vide.

### Vérification

```bash
sudo logrotate -d /etc/logrotate.d/rsyslog-custom
```

`-d` = mode **dry-run** : simule la rotation et affiche ce qui se passerait,  
**sans rien modifier**. C'est juste pour valider la config. Une fois le fichier  
créé, plus rien à faire : la rotation est lancée automatiquement chaque jour  
par le timer système (`logrotate.timer`).

## Démarrage / vérification

```bash
sudo systemctl restart rsyslog.service
sudo systemctl status rsyslog.service

# Vérifier que le port écoute :
ss -tlnp | grep 514
```

# Agent rsyslog

## Installation

```bash
sudo apt update && sudo apt upgrade -y

sudo apt install rsyslog
```

## Configuration

```ini
#### MODULES ####
#################

module(load="imuxsock") # provides support for local system logging
module(load="imklog")   # provides kernel logging support
#module(load="immark")  # provides --MARK-- message capability

# provides UDP syslog reception
#module(load="imudp")
#input(type="imudp" port="514")

# Réception TCP : inutile sur un agent (il émet, il ne reçoit pas)
#module(load="imtcp")
#input(type="imtcp" port="514")


###########################
#### GLOBAL DIRECTIVES ####
###########################

#
# Set the default permissions for all log files.
#
$FileOwner root
$FileGroup adm
$FileCreateMode 0640
$DirCreateMode 0755
$Umask 0022

#
# Where to place spool and state files
#
$WorkDirectory /var/spool/rsyslog

#
# Include all config files in /etc/rsyslog.d/
#
$IncludeConfig /etc/rsyslog.d/*.conf


###############
#### RULES ####
###############

#
# Log anything besides private authentication messages to a single log file
#
*.*;auth,authpriv.none          -/var/log/syslog

#
# Log commonly used facilities to their own log file
#
auth,authpriv.*                 -/var/log/auth.log
cron.*                          -/var/log/cron.log
kern.*                          -/var/log/kern.log
mail.*                          -/var/log/mail.log
user.*                          -/var/log/user.log

#
# Emergencies are sent to everybody logged in.
#
*.emerg                         :omusrmsg:*

# Redirection des logs vers le serveur Syslog
# -> adresse du serveur syslog. On lui envoie tout (*.*)
#    par TCP (@@) ; en UDP ce serait un seul @
*.* @@192.168.10.40:514
```

## Démarrage / test

```bash
sudo systemctl restart rsyslog # peux-etre fait aussi sur le serveur 

# Envoyer un log de test :
logger -p local0.info "test rsyslog depuis l'agent"

# Sur le serveur, vérifier la réception :
tail -f /var/log/remote/mihr.log
```