---
title: "Sheet To Cheat Virtualbox"
date: 1794925189
tags: ["Informatique", "sheet_to_cheat_virtualbox.md"]
categories: ["Informatique"]
themes: ["Informatique"]
draft: false
---

```markdown
# 📋 Cheat Sheet VirtualBox pour NixOS

---
## 🔧 VBoxGuestAdditions
### Attacher/Détacher
```bash
# Attacher le fichier ISO (chemin réel ou lien symbolique)
VBoxManage storageattach "NomDeTaVM" --storagectl "IDE" --port 0 --device 0 --type dvddrive --medium /chemin/absolu/vers/VBoxGuestAdditions.iso

# Détacher le média
VBoxManage storageattach "NomDeTaVM" --storagectl "IDE" --port 0 --device 0 --medium none
```

---
## 🖥️ Gestion des VMs
| Action                     | Commande                                                                 |
|----------------------------|--------------------------------------------------------------------------|
| Lister les VMs             | `VBoxManage list vms`                                                    |
| Démarrer en mode tête      | `VBoxManage startvm "NomDeTaVM" --type headless`                         |
| Arrêter                    | `VBoxManage controlvm "NomDeTaVM" poweroff`                              |
| Redémarrer                 | `VBoxManage controlvm "NomDeTaVM" reset`                                 |
| Sauvegarder l'état         | `VBoxManage controlvm "NomDeTaVM" savestate`                             |
| Restaurer l'état           | `VBoxManage startvm "NomDeTaVM"`                                         |

---
## 🗄️ Stockage
### Contrôleurs
```bash
# Lister les contrôleurs
VBoxManage showvminfo "NomDeTaVM" | grep "Storage Controller"

# Ajouter un contrôleur SATA
VBoxManage storagectl "NomDeTaVM" --name "SATA" --add sata --controller IntelAhci
```

### Disques
```bash
# Attacher un disque VDI
VBoxManage storageattach "NomDeTaVM" --storagectl "SATA" --port 0 --device 0 --type hdd --medium /chemin/vers/disque.vdi
```

---
## 📸 Snapshots
| Action               | Commande                                                  |
|----------------------|----------------------------------------------------------|
| Lister               | `VBoxManage snapshot "NomDeTaVM" list`                   |
| Créer                | `VBoxManage snapshot "NomDeTaVM" take "NomDuSnapshot"`   |
| Restaurer            | `VBoxManage snapshot "NomDeTaVM" restore "NomDuSnapshot"`|
| Supprimer            | `VBoxManage snapshot "NomDeTaVM" delete "NomDuSnapshot"` |

---
## 📂 Dossiers Partagés
```bash
# Ajouter un dossier partagé (hôte → VM)
VBoxManage sharedfolder add "NomDeTaVM" --name "DossierPartage" --hostpath /chemin/hote --automount

# Monter dans la VM (après installation des VBoxGuestAdditions)
sudo usermod -aG vboxsf $USER  # Ajouter l'utilisateur au groupe
sudo mount -t vboxsf DossierPartage /mnt/partage
```

---
## 🌐 Réseau
| Mode       | Commande                                                  |
|------------|----------------------------------------------------------|
| NAT        | `VBoxManage modifyvm "NomDeTaVM" --nic1 nat`              |
| Pont       | `VBoxManage modifyvm "NomDeTaVM" --nic1 bridged --bridgeadapter1 eth0` |
| Interne    | `VBoxManage modifyvm "NomDeTaVM" --nic1 intnet`           |

---
## ⚡ Performances
```bash
# CPU/RAM
VBoxManage modifyvm "NomDeTaVM" --cpus 4 --memory 4096

# Accélération 3D
VBoxManage modifyvm "NomDeTaVM" --accelerate3d on --vram 128
```

---
## 🔧 Extensions & Export
```bash
# Lister les extensions
VBoxManage list extpacks

# Installer une extension
VBoxManage extpack install Oracle_VM_VirtualBox_Extension_Pack.vbox-extpack

# Exporter/Importer
VBoxManage export "NomDeTaVM" --output "vm.ova"
VBoxManage import "vm.ova"
```

---
## 💡 Astuces NixOS
1. **Chemins** : Toujours utiliser les chemins **absolus** (ex: `/nix/store/...`).
2. **Permissions** : Vérifier avec `ls -l /chemin/vers/fichier`.
3. **Liens symboliques** : Préférer les chemins réels pour VirtualBox.
4. **Dossiers partagés** : Installer `virtualbox-guest-utils` dans la VM.
```
