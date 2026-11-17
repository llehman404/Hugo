# Protocole installation de wireguard

## Mise a jour du systéme et installation de wireguard

1.  Mise a jour du système --> `sudo apt update && sudo apt upgrade`
2.  Installation de Wireguard --> `sudo apt install wireguard`

## Generation des paires de clée et installation
Génération de clé privé et public --> `wg genkey | tee private_server.key` && `cat private_server.key | wg pubkey > public_server.key`

 Créer un fichier le fichier de conf wg0.conf dans etc/wireguard (convention de nom pour vpn ) et configure le vpn :

`[Interface]`  
`PrivateKey =`  
`Address = 10.0.0.1/24`  
`ListenPort = 51820`  
`SaveConfig = true` # attention a faire une fois tout bien parametre. quand l'installe est finaliser

`[Peer]`  
`PublicKey =`  
`AllowedIPs = 10.100.0.2/32`

## Parametre le routage 

### Autorisation kernel/systéme

Autoriser le serveur a faire du routage ip avec la commande et ajouter cette commande (sans sudo) aux fichier de conf /etc/sysctl.conf pour rendre le routage persistant :

`sudo sysctl -w net.ipv4.ip_forward=1`

### Parametrage iptables
 Si aucun pare-feu n'est installé sur le systéme les port seront ouvert et il faudra uniquement ajouté les régles iptables suivante dans la conig [interface] de wg0.conf pour autoriser la communication entre le reseaux local et le reseaux wireguard: 

```bash
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT;
iptables -t nat -A POSTROUTING -o enp0s3 -j MASQUERADE

PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j 
ACCEPT; iptables -t nat -D POSTROUTING -o enp0s3 -j MASQUERADE
```

### Paramétrage UFW

⚠⚠⚠ Attention si des régles nftables ou iptable on été écris a la main elle peuvent etre 
problématique pour la suite (expérience live)

```bash
sudo ufw allow 22/tcp
sudo ufw allow 51820/udp
```

Si un parefeu comme ufw , autoriser le port utilisé dans la config wireguard puis rajouter aux dossier  / etc / ufw / before.rules  les lignes suivante: 


A rajouté a la fin du fichier  les régles de NAT : 

```bash
# NAT - IP masquerade
*nat
:POSTROUTING ACCEPT [0:0]
-A POSTROUTING -o ens192 -j MASQUERADE

# End each table with the 'COMMIT' line or these rules won't be processed
COMMIT
```
Toujours au sein du même fichier de configuration, on va déclarer le réseau local "192.168.100.0/24" afin que l'on puisse le contacter. Voici les deux règles à ajouter (idéalement après la section "# ok icmp code for FORWARD" pour regrouper les règles) :

```ini
# autoriser le forwarding pour le réseau distant de confiance (+ le réseau du VPN)
-A ufw-before-forward -s 192.168.100.0/24 -j ACCEPT
-A ufw-before-forward -d 192.168.100.0/24 -j ACCEPT
-A ufw-before-forward -s 192.168.110.0/24 -j ACCEPT
-A ufw-before-forward -d 192.168.110.0/24 -j ACCEPT
```
Si l'on souhaite autoriser seulement un hôte, par exemple "192.168.100.11", c'est simple :

```
-A ufw-before-forward -s 192.168.100.11/32 -j ACCEPT
-A ufw-before-forward -d 192.168.100.11/32 -j ACCEPT
```

```bash
sudo ufw enable
sudo systemctl restart ufw
```

# Tunnel internet total 

Avec la configuration actuelle, une partie des flux passent par le VPN, et le reste passe par la connexion Internet du client, et c'est notamment le cas de la navigation Internet. Si l'on veut passer en mode "full tunnel" WireGuard pour que tout passe par le tunnel VPN, il y a quelques modifications à apporter à notre configuration....

Tout d'abord, il faut installer le paquet "resolvconf" sur le serveur :

```bash
sudo apt-get update
sudo apt-get install resolvconf
```

Une fois que c'est fait, il faut modifier le profil "wg0.conf" sur la machine Debian : on stoppe l'interface, on modifie, et on relance.
```bash
sudo wg-quick down /etc/wireguard/wg0.conf
```

Ensuite, dans le bloc [Interface], on ajoute le serveur DNS à utiliser. Dans mon cas, c'est le contrôleur de domaine de mon lab, mais on pourrait aussi installer Bind9 sur la machine Debian pour avoir un résolveur local.

```bash
DNS = 192.168.100.11
```

On sauvegarde le fichier, puis on relance l'interface :

```bash
sudo wg-quick up /etc/wireguard/wg0.conf
```
Enfin, au niveau de la configuration du tunnel sur le poste Windows 10, il faut modifier la section "AllowedIPs" pour indiquer que tout doit passer dans le tunnel. Remplacez :

```bash
AllowedIPs = 192.168.110.0/24, 192.168.100.0/24
```
Par :

```bash
AllowedIPs = 0.0.0.0/0
```
On peut voir que cela active aussi l'option "Bloquer tous les trafic hors tunnel (interrupteur)" (kill switch).

# Exemple de fichier de conf serveur 

```ini
[Interface]
Address = 10.0.0.1/24
DNS = 1.1.1.1
DNS = 192.168.1.1
DNS = fe80::ae84:c9ff:fe7d:ed84%eth0
DNS = 2a01:cb1d:800a:8500:ae84:c9ff:fe7d:ed84
SaveConfig = true
ListenPort = 51820
PrivateKey = 

[Peer]
PublicKey = 
AllowedIPs = 10.0.0.2/32
```

# Exemple fichier de conf client 

```ini
[Interface]
Address = 10.0.0.2/24
DNS = 1.1.1.1
PrivateKey = 

[Peer]
PublicKey = 
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = ipaddress:51820
PersistentKeepalive = 25
```