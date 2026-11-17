# 🔧 Fiche 3 — Maintenance &amp; procédures opérationnelles

> Fiche **procédurale** : les gestes d'exploitation courants, valables sur tout serveur Debian durci de l'infrastructure. Les valeurs propres à un serveur (plage de maintenance, habilitations) figurent dans sa Fiche 1.

## 1. Vérifications de routine

```bash
# État des services critiques
systemctl status <service>

# Ports en écoute — comparer à la Fiche 1 du serveur
ss -tulpn

# État du pare-feu
ufw status verbose

# Erreurs au démarrage
journalctl -b
```

Un service attendu absent ou un port non documenté = écart à investiguer et à consigner.

## 2. Mises à jour automatiques — contrôler que l'automatisation vit

```bash
cat /etc/apt/apt.conf.d/20auto-upgrades                      # les deux "1"
unattended-upgrade --dry-run --debug | grep -i "origin"      # périmètre security uniquement
systemctl list-timers apt-daily*                             # prochaines exécutions
cat /var/log/unattended-upgrades/unattended-upgrades.log     # historique
```

Interprétation du log : la ligne `Packages that were upgraded` liste ce qui a été appliqué automatiquement ; la ligne `not upgraded automatically` liste ce qui reste manuel (hors périmètre sécurité).

## 3. Mises à jour fonctionnelles (fenêtre de maintenance)

Réflexe : snapshot avant, application pendant la fenêtre, vérification après.

```bash
apt update && apt list --upgradable   # identifier
apt upgrade                           # appliquer après snapshot
```

## 4. Modifier le pare-feu UFW

```bash
ufw status verbose            # état AVANT toute modification
ufw allow <port>/tcp          # ouvrir
ufw delete allow <port>/tcp   # supprimer une règle
```

⚠️ Ne jamais fermer la session SSH en cours avant d'avoir vérifié que le port 22 reste ouvert.  
→ Après la modification : mettre à jour la section réseau de la Fiche 1 du serveur (un écart fiche/pare-feu crée une fausse confiance).

## 5. Diagnostiquer un problème réseau / SSH

Tester un port :

```bash
nc -zv <ip> <port>      # TCP — bannière "SSH-2.0-..." = service joignable
nmap -p <port> <ip>     # open / closed / filtered
```

SSH ne répond pas — ordre de diagnostic :

```bash
systemctl status ssh          # 1. le service tourne-t-il ?
ss -tlnp | grep :22           # 2. écoute sur 0.0.0.0:22 (et pas 127.0.0.1)
ufw status verbose            # 3. le pare-feu autorise-t-il ?
nc -zv <ip> 22                # 4. le port répond-il depuis le client ?
```


| Symptôme                | Cause probable                                                            |
| ----------------------- | ------------------------------------------------------------------------- |
| `Connection refused`    | Rien n'écoute sur le port (service arrêté, mauvais port)                  |
| `Connection timed out`  | IP injoignable, pare-feu qui droppe                                       |
| `Permission denied`     | Réseau OK — problème d'authentification (mot de passe, clé, sshd\_config) |
| Port `closed` au scan   | Pare-feu laisse passer mais aucun service n'écoute                        |
| Port `filtered` au scan | Pare-feu qui bloque                                                       |


## 6. Modifier un paramètre noyau

> Debian 13 Trixie : `/etc/sysctl.conf` est ignoré silencieusement — toujours utiliser `/etc/sysctl.d/`.

```bash
nano /etc/sysctl.d/99-hardening.conf    # ajouter/modifier le paramètre
sysctl --system                         # appliquer sans redémarrer
sysctl <paramètre>                      # vérifier la valeur active
```

Documenter le changement dans la Fiche 1 du serveur.

## 7. Snapshot &amp; rollback

Snapshot — à prendre avant toute intervention risquée :

- **Quand** : avant mise à jour fonctionnelle, modification pare-feu, déploiement applicatif
- **Nommage** : `<serveur>_<date>_<motif>` (ex. `srv-prod-01_2026-09-24_maj-fonctionnelles`)
- **Où / habilitations** : voir Fiche 1 du serveur

Rollback — étapes :

1. Arrêt propre du serveur
2. Restauration du snapshot préalable
3. Redémarrage
4. Vérifications de routine (section 1)
5. Consigner l'incident et le rollback dans le journal des modifications de la Fiche 1

## 8. Gestion des comptes

```bash
useradd -m <compte>          # créer
usermod -aG sudo <compte>    # donner sudo (si justifié)
userdel -r <compte>          # supprimer
```

Principe du moindre privilège : un compte sans besoin de `sudo` ne doit pas en avoir.  
→ Toute création/suppression doit être répercutée dans la section comptes de la Fiche 1.

## 9. Après chaque intervention

La mise à jour de la documentation **fait partie de l'intervention**, elle ne se reporte pas :

- Ajouter une ligne au journal des modifications de la Fiche 1 (date, version, auteur, description)
- Mettre à jour les sections concernées (réseau, comptes, durcissement)
- Vérifier que fiche et réalité concordent avant de clôturer l'intervention