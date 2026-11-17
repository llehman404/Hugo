---
title: "Git"
date: 1794925189
tags: ["Informatique", "Développement"]
categories: ["Informatique"]
themes: ["Informatique"]
draft: false
---

# Git sheet to cheat

## Statut et Préparation

- `git status` → Donne le statut de la branche.
- `git add <nom_du_fichier>` → Ajoute le/les fichier(s) à l’état stage.

## Validation et Envoi

- `git commit -m "Message décrivant les changements"` → Valide les dossiers en état stage.
- `git push origin <nom_de_la_branche>` → Push les commits sur le dépôt distant.

## Branches

- `git branch <nom_de_la_branche>` → Crée (ou bouge sur) une branche.
- `git switch <nom_de_la_branche>` → Change de branche.
- `git branch -m` → Renomme une branche.
- `git branch -d <branch>` → Détruit une branche.
- `git branch -D <branch>` -> détruit la branche de facons forcé
- `git branch -vv` → Vérifie les noms des branches.

## Configuration

- `git config --global` → Configure le compte utilisateur (global).

```bash
apt install git

# Ton nom et ton email — ils seront attachés à chaque commit (traçabilité du cours)
git config --global user.name "loupulus"
git config --global user.email "ton.email@exemple.fr"

# Petit confort : branche par défaut + couleurs
git config --global init.defaultBranch main
git config --global color.ui auto
Si clée SSH avec nom spécifique -> ⚠⚠⚠ git config core.sshCommand "ssh -i ~/.ssh/Tir -o IdentitiesOnly=yes" ⚠⚠⚠ 
```

- `git config --local` → Même chose, mais dans un dossier spécifique.
- `git config get <key>` → Affiche un élément attaché à une clé de la config.
- `git config list` → Liste la config.
- `git config set <key>` → Configure un élément.
- `git config unset <key>` → Enlève un élément attaché à une clé.
- `git config remove-section <section>` → Supprime une section de la config.

## Logs et Historique

- `git log` (`git log -n 10`) → Visualise les commits effectués. `-n` limite le nombre de commits affichés.
- `git log --decorate=full`
- `git log --oneline`
- `git log --decorate=full --oneline`
- `git log --oneline --graph --all`
- `git log --oneline --graph --parents`
- `git cat-file -p <hash>` → Visualise le hash d’un commit, du tree ou d’un blob.

## Reset et Modifications

- `git commit --amend -m "F: Merge branch 'add_classics'"` → Change le nom du commit.
- `git reset --hard <commit-hash>` → Reviens au commit choisi et supprime tout ce qui est ultérieur.
- `git reset --soft <commit-hash>` → Reviens au commit choisi et remet les commits ultérieurs en stage.

## Dépôts Distants

- `git remote add <name> <uri>` → Lie le dépôt local à un dépôt distant.
- `git fetch` → Télécharge le dépôt distant.
- `git fetch origin` → `origin` est le nom standard pour une branche importée.
- `git remote remove origin` → Supprime le lien avec le dépôt distant.
- `git ls-remote origin`
- `git remote -v`
- `git pull origin/nom_de_la_branche`
- `git push -u` -> lier la branche a une branche lointaine

## Stash (Remiser)

- `git stash` → Remise temporaire des modifications non validées.
- `git stash pop` → Récupère les modifications remisées.

## Restore (Restaurer)

- `git restore <nom_du_fichier>` → Annule les modifications locales non validées sur un fichier.
- `git restore --staged <nom_du_fichier>` → Enlève un fichier de la zone de staging.


#  Merge 
git checkout main && git merge <branch>
git branch -d <branch>
git push origin --delete <branch>

