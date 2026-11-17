# Processus simplifié pour créer et configurer une VM Debian avec OpenTofu

---

## **📌 Introduction**
Ce guide explique comment créer une VM Debian avec OpenTofu en deux étapes :
1. **Création de la VM avec l'ISO d'installation**.
2. **Configuration finale pour démarrer la VM sans l'ISO**.

---

## **📂 Fichiers de Configuration**

### **1️⃣ `install.tf` (Création de la VM et installation de Debian)**

Ce fichier est utilisé pour créer la VM et installer Debian.

```hcl
terraform {
  required_providers {
    libvirt = {
      source = "dmacvicar/libvirt"
      version = "0.8.3"
    }
  }
}

provider "libvirt" {
  uri = "qemu:///system"
}

resource "libvirt_volume" "debian_disk" {
  name   = "Vahagan_debian12.qcow2"
  pool   = "default"
  size   = 21474836480  # 20 Go
}

resource "libvirt_domain" "debian12_vm" {
  name   = "Vahagan_debian12"
  memory = 2048
  vcpu   = 2
  type   = "kvm"

  # Démarre d'abord sur le CDROM pour l'installation
  boot_device {
    dev = ["cdrom", "hd"]
  }

  disk {
    volume_id = libvirt_volume.debian_disk.id
  }

  disk {
    file = "/home/loupulus/ISO/debian-12.13.0-amd64-netinst.iso"
  }

  network_interface {
    network_id = "b2ec6e9c-5ad2-4938-91a2-fda4e8050151"
  }

  graphics {
    type        = "spice"
    autoport    = true
    listen_type = "address"
  }
}




2️⃣ Étapes pour installer Debian


Crée la VM avec l'ISO :
bash
Copy

tofu init
tofu apply





Installe Debian :
bash
Copy

virt-viewer Vahagan_debian12




Suis les étapes de l'installateur.
À la fin de l'installation, éteins la VM (via l'interface graphique ou virsh shutdown Vahagan_debian12).


3️⃣ final.tf (Démarrer la VM sans l'ISO)
Ce fichier est utilisé pour démarrer la VM sans l'ISO après l'installation.
hcl
Copy

terraform {
  required_providers {
    libvirt = {
      source = "dmacvicar/libvirt"
      version = "0.8.3"
    }
  }
}

provider "libvirt" {
  uri = "qemu:///system"
}

resource "libvirt_volume" "debian_disk" {
  name   = "Vahagan_debian12.qcow2"
  pool   = "default"
  size   = 21474836480  # 20 Go
}

resource "libvirt_domain" "debian12_vm" {
  name   = "Vahagan_debian12"
  memory = 2048
  vcpu   = 2
  type   = "kvm"

  # Démarre uniquement sur le disque dur
  boot_device {
    dev = ["hd"]
  }

  disk {
    volume_id = libvirt_volume.debian_disk.id
  }

  network_interface {
    network_id = "b2ec6e9c-5ad2-4938-91a2-fda4e8050151"
  }

  graphics {
    type        = "spice"
    autoport    = true
    listen_type = "address"
  }
}




4️⃣ Étapes pour démarrer la VM sans l'ISO


Déplace ou renomme ton fichier install.tf pour éviter les conflits :
bash
Copy

mv install.tf install.tf.bak





Utilise le fichier final.tf :
bash
Copy

tofu init
tofu apply





Démarre la VM :
bash
Copy

virsh start Vahagan_debian12





💡 Pourquoi cette méthode est meilleure ?

Séparation claire entre la phase d'installation et la phase finale.
Pas de modification manuelle du XML : OpenTofu gère tout automatiquement.
Reproductible : Tu peux recréer la VM facilement si nécessaire.

✅ Résumé des étapes simplifiées

Crée la VM avec install.tf et installe Debian.
Éteins la VM après l'installation.
Utilise final.tf pour démarrer la VM sans l'ISO.

📌 Alternative : Utiliser null_resource et local-exec (pour les experts)
Si tu veux tout automatiser dans un seul fichier, tu peux utiliser une approche avancée avec null_resource et local-exec pour exécuter des commandes virsh après l'installation. Cependant, cela nécessite une bonne maîtrise de Terraform/OpenTofu et de virsh.
text
Copy

Tu peux copier ce Markdown dans un fichier `.md` pour l'utiliser comme référence. 😊





