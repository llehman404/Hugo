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
  size   = 21474836480  # 20 Go en octets
}

resource "libvirt_domain" "debian12_vm" {
  name   = "Vahagan_debian12"
  memory = 2048
  vcpu   = 2
  type   = "kvm"  # Spécifie le type de domaine

  disk {
    volume_id = libvirt_volume.debian_disk.id
  }

  disk {
    file = "/home/loupulus/ISO/debian-live-12.4.0-amd64-gnome.iso"
  }

  network_interface {
    network_id = "b2ec6e9c-5ad2-4938-91a2-fda4e8050151"  # UUID du réseau
  }

  graphics {
    type        = "spice"
    autoport    = true
    listen_type = "address"
  }

  boot_device {
    dev = ["cdrom", "hd"]
  }
}

output "vm_info" {
  value = {
    name = libvirt_domain.debian12_vm.name
    network_interfaces = libvirt_domain.debian12_vm.network_interface
  }
}

```

&nbsp;`tofu init` -> initié le fichier de configuration main.tf

`tofu plan`  -> vérifié le plan de la vm 

`tofu apply` -> appliqué le plan 

`virt_viewer` -> accéder graphiquement a la vm 

installé le système exploitation 

`virsh destroy Vahagan_debian12` -> arrêter la vm 

`virsh dumpxml Vahagan_debian12 > /tmp/Vahagan_debian12.xml` -> exporter la configuration de la machine en xml.

`nano /tmp/Vahagan_debian12.xml` -> ouvrir le fichier 

supprimer les lignes suivantes pour empecher la machine de booter en boucle: 


`<boot dev='cdrom'/>` 

```xml
<boot dev='cdrom'/>
<disk type='file' device='cdrom'>
  <driver name='qemu' type='raw'/>
  <source file='/home/loupulus/ISO/debian-12.13.0-amd64-netinst.iso'/>
  <target dev='hda' bus='ide'/>
  <readonly/>
  <address type='drive' controller='0' bus='0' target='0' unit='0'/>
</disk>
<os>
  <type arch='x86_64' machine='pc-i440fx-10.1'>hvm</type>
  <boot dev='hd'/>
</os>
```
`virsh define /tmp/Vahagan_debian12.xml` -> recharger la config de la VM avec le fichier xml modifier

Pour activer la virtualisation imbriquée avec ta configuration actuelle, il faut modifier la section <cpu> dans le fichier XML de ta VM. Voici comment procéder :

1️⃣ Arrête la VM
bash
Copy

virsh destroy Vahagan_debian12




2️⃣ Récupère la configuration XML actuelle
bash
Copy

virsh dumpxml Vahagan_debian12 > /tmp/Vahagan_debian12.xml




3️⃣ Modifie le fichier XML
Ouvre le fichier /tmp/Vahagan_debian12.xml avec un éditeur de texte (par exemple, nano):
bash
Copy

nano /tmp/Vahagan_debian12.xml



Modifie la section <cpu>
Remplace la section <cpu> actuelle :
xml
Copy

<cpu mode='custom' match='exact' check='none'>
  <model fallback='forbid'>qemu64</model>
</cpu>



par cette configuration pour activer la virtualisation imbriquée :
xml
Copy

<cpu mode='host-passthrough' check='none'>
</cpu>



Si tu veux spécifiquement activer les fonctionnalités de virtualisation imbriquée pour Intel ou AMD, tu peux ajouter les lignes suivantes à l'intérieur de la section <cpu> :
Pour Intel :
xml
Copy

<cpu mode='host-passthrough' check='none'>
  <feature policy='require' name='vmx'/>
</cpu>



Pour AMD :
xml
Copy

<cpu mode='host-passthrough' check='none'>
  <feature policy='require' name='svm'/>
</cpu>




4️⃣ Applique les modifications
bash
Copy

virsh define /tmp/Vahagan_debian12.xml




5️⃣ Démarre la VM
bash
Copy

virsh start Vahagan_debian12




6️⃣ Vérifie que la virtualisation imbriquée est activée dans la VM
Connecte-toi à ta VM :
bash
Copy

virt-viewer Vahagan_debian12



Dans la VM, exécute la commande suivante pour vérifier que la virtualisation imbriquée est activée :
Pour Intel :
bash
Copy

cat /sys/module/kvm_intel/parameters/nested



Pour AMD :
bash
Copy

cat /sys/module/kvm_amd/parameters/nested




Résultat attendu : Y ou 1 (selon la version du noyau).

# Configuration CPU pour la virtualisation imbriquée terraform

  cpu {
    mode = "host-passthrough"
  }
