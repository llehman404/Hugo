# basic worflow 

`git status `  

`git switch -c <working branch>`

`git status`

`git add -A ` 

`git commit -m`

`git switch main`

`git merge`

`git branch -d <working branch>`

`git push origin main`


# Créer une branche long terme

`git switch -c <working branch>`

`git log --oneline` les deux branches doive etre sur 
le mème HEAD

`git push -u origin HEAD:flake` -> créer une branche dans le dépot distant te le lit a la branche locale
