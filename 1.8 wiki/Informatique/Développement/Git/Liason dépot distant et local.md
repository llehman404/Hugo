# Création d'un nouveaux dépot local et distant 

- Créer le dépot distant sur github
```bash
echo "# bookbot" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin git@github.com:llehman404/bookbot.git
#Si clé ssh nomé et rentré dans conf ssh 
git remote set-url origin Git-Hub:llehman404/CiscoPackettracer.git
# Tester la clée 
ssh -T Git-Hub
git push -u origin main
```

# Création d'un dépot pour un projet déja existant

```bash
git remote add origin git@github.com:llehman404/bookbot.git
#Si clé ssh nomé et rentré dans conf ssh 
git remote set-url origin Git-Hub:llehman404/CiscoPackettracer.git
# Tester la clée 
ssh -T Git-Hub
git branch -M main
git push -u origin main
```