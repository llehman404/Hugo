# Insatallation apache
```bash
sudo apt update -y\
&& sudo apt upgrade -y\
sudo apt install apache2 -y\
sudo apt install curl -y\
systemctl status apache2
ip a 
curl ipadress or go te navigation program si interface graphique
```

# installation de mariadb

```bash
apt install mariadb-server
systemctl status mariadb
systemctl is-enabled mariadb
```


# Installation de php 

```bash
sudo apt install php php-cli
sudo apt install php-fpm
sudo apt install php-mysql
sudo systemctl status php8.4-fpm
# Pour apache -> 
sudo a2enmod proxy_fcgi setenvif
sudo a2enconf php8.4-fpm
sudo systemctl reload apache2
sudo systemctl is-active php8.4-fpm
```

⚠⚠⚠ Ne pas activer mod_php et PHP-FPM simultanément ⚠⚠⚠

Si mod_php est présent et actif pour le même vhost, désactivez-le avant d'activer PHP-FPM : `a2dismod php8.4`. Vérifiez ensuite avec `apache2ctl -M | grep php` qu'aucun module PHP n'apparaît dans la liste des modules chargés. Pour un même périmètre de fichiers dans un vhost, configurez un seul gestionnaire PHP effectif.

Ces deux commandes permettent de désactiver mod_php et de confirmer qu'aucun module PHP résiduel n'est encore chargé par Apache :

```bash
sudo a2dismod php8.4
sudo apache2ctl -M | grep php
sudo systemctl restart apache2
```

Tester la chaine complét par une page php : 

```bash
micro /var/www/html/info.php
<?php infophp():?> > info.php
http://[adresse-du-serveur]/info.php
```

Une fois le test réalisé et la confirmation que le test est fonctionnel suprimer le fichier info.php: 

```bash
sudo rm /var/www/html/info.php
```


# Installation et configuration mariaDB

## Installation 
```bash
sudo mariadb-secure-installation
```
1. Saisir le mot de passe actuel du compte root, puis définir ou non un nouveau mot de passe pour ce compte (voir ci-dessous)
2. Supprimer les comptes anonymes — répondre Oui
3. Désactiver l'accès root distant — répondre Oui
4. Supprimer la base `test` et ses droits d'accès — répondre Oui
5. Recharger les tables de privilèges — répondre Oui

## Création de la base de données et de son utilisateurs
```bash
sudo mariadb # Ce connecter à mariadb
```
Préférez un nom de compte qui reflète l'application qu'il sert (`glpi_user`, `intranet_app`…) plutôt qu'un nom générique. Cela peut faciliter l'identification lors de l'audit des comptes MariaDB ; la traçabilité des droits repose surtout sur des comptes distincts et une gestion explicite des privilèges, notamment si plusieurs applications cohabitent sur le même serveur.
```mariadb
CREATE DATABASE Test_Database CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci; # Crée une base de donnée
SHOW DATABASES;
CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'mot_de_passe_robuste'; # Crée une utilisateur
GRANT SELECT, INSERT, UPDATE, DELETE ON Test_Database.* TO 'appuser'@'localhost'; # on peux aussi GRANT CREATE  pour permetre a un utilisateur de créer des tables.
FLUSH PRIVILEGES;
EXIT;
```
## Test de connexion
```bash
mariadb -u appuser -p # Connexion avec utilisateur
SHOW DATABASES; # Doit renvoyer le nom de la base de données et information_shcema
USE mysql; # Doit renvoyer un message de refus de connexion 
```
## créer une table est insérer des valeurs 
```bash
mariadb -u appuser -p ou sudo mariadb ou sudo mariadb -u root  # Connexion avec utilisateur qui à les droit de connection ou avec root 
USE Test_Database
create table test (msg text);
insert into test values ('coucou');
select * from test;
quit
```
# Configuration php
```bash
cd /var/html/wwww
ls -> index.html
micro test.php
```

Dans test.php : 
```php
<?php
phpinfo() ;
?>
```
```bash
curl adresseip/test.php # ou navigateur 
```
normalement on devriat arriver sur une page php donnant diffèrente information 

# L'inspection de l'état du service et de sa configuration
Quand on modifie un fichier de configuration  il faut systématiquement  créer un fichier de sauvegarde bak. Chaque modification du fichier de configuraion d'un serveur web apache doit être suivit
du code suivant : 

```bash
systemctl status apache2
apachectl configtest
systemctl reload apache2
systemctl status apache2 
```
Quand `systemctl status apache2` ne suffit pas à identifier la cause, les journaux prennent le relais. Par défaut, sur Debian, Apache journalise les accès et les erreurs dans `/var/log/apache2/`, tandis que les messages du service géré par systemd peuvent être consultés avec `journalctl -u apache2`. Savoir laquelle consulter en premier dépend de la nature du problème.

Dans une installation Debian par défaut, le répertoire `/var/log/apache2/` contient notamment deux fichiers : error.log, qui enregistre les erreurs de traitement des requêtes, et `access.log`, qui trace les requêtes traitées avec leur code de réponse HTTP. La directive `ErrorLog` dans la configuration d'un vhost peut rediriger ce journal vers un fichier spécifique au site — vérifiez-la si vous ne trouvez pas l'erreur dans le fichier global.
Remarque
Journaux par vhost

Si plusieurs vhosts sont configurés sur le serveur de la PME industrielle cliente, chacun peut disposer de son propre `error.log` défini par la directive `ErrorLog` dans son fichier de configuration. Consultez le fichier de configuration du vhost concerné pour localiser le bon journal avant de chercher dans `/var/log/apache2/error.log`.

Pour un échec de démarrage du service — c'est-à-dire quand Apache ne parvient pas à se lancer — le journal systemd est la première source à consulter. La commande `journalctl -u apache2` filtre les entrées du journal systemd pour le service Apache. L'option `--no-pager` désactive la pagination et affiche la sortie directement dans le terminal, ce qui facilite la copie ou le filtrage par `grep`. Pour limiter l'affichage aux entrées les plus récentes, l'option `-n 50` restreint la sortie aux cinquante derniers événements.

```bash
# Afficher l'intégralité du journal systemd d'Apache sans pagination
# → à utiliser pour un diagnostic d'échec de démarrage
journalctl -u apache2 --no-pager

# Limiter aux cinquante entrées les plus récentes
# → utile pour cibler rapidement les derniers événements
journalctl -u apache2 --no-pager -n 50

# Suivre error.log en temps réel (erreurs de traitement des requêtes)
# → à lancer pendant qu'un utilisateur reproduit le problème
tail -f /var/log/apache2/error.log

# Suivre access.log en temps réel (requêtes reçues et codes HTTP)
# → à croiser avec error.log pour corréler requête et erreur
tail -f /var/log/apache2/access.log
```


La distinction entre une erreur de démarrage et une erreur de traitement de requête est structurante pour choisir le bon journal. Sur Debian, une erreur de démarrage d'Apache se consulte dans le journal systemd via `journalctl -u apache2`. Une erreur de traitement — Apache fonctionne mais retourne un code HTTP comme 500 ou 502 — se diagnostique dans `error.log` et se vérifie dans l'access log. Les deux sources sont complémentaires et non redondantes.

| Situation | Source à consulter | Commande |
| --- | --- | --- |
| Apache ne démarre pas (état `failed`) | Journal systemd | `journalctl -u apache2 --no-pager` |
| Apache tourne mais retourne des erreurs HTTP | error.log Apache | `tail -f /var/log/apache2/error.log` |
| Requête reçue mais réponse inattendue | access.log + error.log | `tail -f /var/log/apache2/access.log` |


Pour observer l'apparition d'une erreur en temps réel — par exemple pendant qu'un utilisateur reproduit le problème — la commande `tail -f /var/log/apache2/error.log` suit le fichier en direct et affiche chaque nouvelle ligne au fur et à mesure de son écriture. Cette corrélation temporelle est précieuse : vous voyez exactement à quel moment l'erreur apparaît dans le journal, ce qui permet de la relier à l'action qui l'a déclenchée.

## Exemple 1 — Corrélation temporelle avec tail -f

Vous suspectez que PHP-FPM devient injoignable sous charge. Ouvrez un terminal et lancez `tail -f /var/log/apache2/error.log`. Dans un second terminal, déclenchez une requête vers l'application. Si une ligne d'erreur apparaît immédiatement dans le premier terminal au moment de la requête, cela constitue un indice de corrélation : l'erreur peut être liée à cette requête, mais il faut la confirmer avec l'horodatage, les journaux d'accès et, si possible, un identifiant de requête.

## Exemple complet 2 — La démarche de diagnostic jusqu'au rétablissement

La démarche de diagnostic jusqu'au rétablissement

Lire un journal sans méthode, c'est chercher une aiguille dans une botte de foin. La valeur d'une démarche de diagnostic structurée, c'est qu'elle réduit le temps de rétablissement en évitant les vérifications redondantes et les corrections prématurées. Voici comment ordonner les vérifications quand un service Apache présente un comportement anormal.

### Démarche de diagnostic en quatre étapes

1. **Statut du service** : `systemctl status apache2` — consulter l'état du service (`active`, `inactive` ou `failed`) ainsi que les messages récents signalant une éventuelle anomalie.
2. **Validation de configuration** : `apachectl configtest` — confirmer ou exclure une erreur de syntaxe comme cause.
3. **Lecture des journaux** : `journalctl -u apache2` pour un échec de démarrage, `tail -f /var/log/apache2/error.log` — dans la configuration Debian/Ubuntu par défaut, consulter en continu le journal d'erreur Apache pour rechercher une erreur de traitement de requête.
4. **Correction ciblée** : modifier uniquement ce que les journaux désignent, puis exécuter de nouveau `apachectl configtest`, puis recharger Apache avec `systemctl reload apache2` si le test réussit.

   Cette séquence évite deux erreurs fréquentes : corriger sans avoir lu les journaux (on corrige la mauvaise chose) et recharger sans avoir vérifié la configuration (le rechargement peut échouer ou appliquer une configuration incorrecte). Chaque étape conditionne la suivante.

La lecture des journaux permet aussi de distinguer deux familles d'erreurs que la démarche procédurale seule ne différencie pas : une erreur de configuration Apache et une erreur PHP-FPM. Une erreur de configuration Apache se manifeste dès le démarrage ou le rechargement — `apachectl configtest` la signale, et `journalctl -u apache2` la détaille avec le fichier et la ligne fautive. Une erreur PHP-FPM, en revanche, n'apparaît qu'à l'exécution d'une requête : Apache démarre normalement, mais `error.log` affiche un message de type `AH01079` indiquant que le backend FastCGI est injoignable. Cette distinction oriente immédiatement vers le bon service à inspecter.

Prenons un cas concret. Les collaborateurs de la PME industrielle cliente signalent une page d'erreur 500 sur l'application interne. Vous exécutez `systemctl status apache2` : le service est `active (running)`, donc Apache fonctionne. L'erreur n'est pas un échec de démarrage. Vous ouvrez `tail -f /var/log/apache2/error.log` et déclenchez une nouvelle requête. La ligne suivante apparaît dans le journal :

### Corrélation erreur 500 et journal error.log

Le journal affiche : `AH01079: failed to make connection to backend: php-fpm`. Ce message indique qu'Apache ne parvient pas à joindre le processus PHP-FPM. Une cause fréquente est que le service PHP-FPM correspondant est arrêté ou que son socket est absent ou inaccessible, par exemple en raison de permissions ou d'un mauvais chemin. Vous vérifiez avec `systemctl status php8.4-fpm` : le service est en état `failed`. Si le service PHP-FPM est arrêté, vous pouvez le démarrer avec `systemctl start php8.4-fpm`, puis vérifier son état et le bon traitement des requêtes.

```bash
[error] AH01079: failed to make connection to backend: php-fpm
```
Ce message apparaît dans `error.log` et oriente directement vers la vérification du service PHP-FPM : Apache a bien reçu la requête, mais ne parvient pas à la transmettre au backend.

```bash
systemctl status php8.4-fpm
systemctl start php8.4-fpm
systemctl status php8.4-fpm
```
La troisième commande confirme le retour à l'état actif : le service doit afficher `active (running)` avant de considérer le rétablissement comme effectif.

Une fois la correction appliquée, la confirmation du rétablissement passe par `systemctl status apache2` — l'état doit afficher `active (running)` — et par un test fonctionnel de l'application. Un rechargement (`systemctl reload apache2`) n'est nécessaire que si la configuration a été modifiée ; si seul PHP-FPM a été relancé, Apache peut généralement reprendre automatiquement la communication avec le socket, sans rechargement de sa configuration.

### Correction ciblée, pas correction globale 

Une erreur identifiée dans les journaux désigne une cause précise. Modifier plusieurs paramètres simultanément pour « voir ce qui fonctionne » rend impossible l'identification de ce qui a réellement résolu le problème — et complique le diagnostic si l'erreur persiste.

La dernière étape du rétablissement est souvent négligée en contexte d'urgence : la consignation de l'incident dans la fiche d'exploitation. Cette fiche n'est pas une formalité administrative : elle constitue la mémoire opérationnelle du serveur. Pour un prestataire d'infogérance intervenant sur le serveur de la PME industrielle cliente, elle permet à tout technicien de comprendre ce qui s'est passé, ce qui a été fait et comment vérifier que le service est bien rétabli — sans avoir à reconstituer le diagnostic depuis zéro.

### Ce que doit contenir une fiche d'exploitation

Une fiche d'exploitation utile comporte au minimum quatre éléments : la date et l'heure de détection de l'incident, la cause identifiée (avec le message de journal exact si possible), l'action corrective appliquée, et la vérification du rétablissement (commande exécutée et résultat observé). Ces quatre éléments permettent de traiter un incident similaire plus rapidement lors d'une prochaine occurrence.

La démarche décrite ici — statut, configtest, journaux, correction ciblée, vérification, consignation — s'applique à Apache mais suit la même logique pour MariaDB ou PHP-FPM. Une fois cette séquence intégrée, vous disposez d'un cadre de diagnostic transférable à l'ensemble des services de la stack LAMP, quelle que soit la brique qui présente un comportement anormal.

### Transposer la démarche à MariaDB et PHP-FPMRéduire

La même logique statut → journaux → correction ciblée → vérification s'applique aux autres services de la stack. Pour MariaDB, les commandes équivalentes sont `systemctl status mariadb` pour consulter l'état du service et `journalctl -u mariadb` pour lire les journaux systemd associés. Pour PHP-FPM, utilisez `systemctl status php8.4-fpm` et `journalctl -u php8.4-fpm`. Dans chaque cas, la séquence reste identique : vérifier l'état, lire les journaux pour identifier la cause, appliquer une correction ciblée, puis confirmer le rétablissement.