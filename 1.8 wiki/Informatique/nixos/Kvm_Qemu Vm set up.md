# Objectif

Objectif est de documentée intallation de tout les modules pour pouvoir faire de la virtualisation avec KVM comme hyperviseur de niveau 1 et qemu pour émulation des périphérique.

## Configuration nix-os 
```
virtualisation.libvirtd.enable = true;
systemd.services.libvirtd.enable = true;
systemd.tmpfiles.rules = [
	"d /run/libvirt 0770 root kvm -"
  ];
boot.kernelModules = ["kvm-intel"];
programs.virt-manager.enable = true;
boot.extraModprobeConfig = ''
    options kvm-intel nested=1
    options kvm-intel enable_shadow_vmcs=1
    options kvm-intel enable_apicv=1
'';

with pkgs = [qemu_kvm virt-wiewer]; # qemu_kvm est le ce qui va permettre la virtualization et virt-viewer accéder a la vm en graphic 

extraGroups = ["libvirtd" "kvm" "qemu-libvirtd"];
```
## Créer un dossier pour stocker les disque durt des machines virtuelle 
```bash
  sudo mkdir -p /var/lib/libvirt/images
  sudo chown -R root:kvm /var/lib/libvirt/images
  sudo chmod -R 770 /var/lib/libvirt/images
# Maniére Imperative de créer un pool de vm
  sudo virsh pool-define-as default dir - - - - "/var/lib/libvirtd/images" -> stdout "pool default define"
  sudo virsh pool-start default -> stdout "pool default started"
  sudo virsh pool-autostart default
# Maniére déclarative de créer un pool:
  sudo mkdir -p /etc/libvirt/pools
  sudo nano /etc/libvirt/pools/default.xml
  sudo virsh pool-start default
  sudo virsh pool-autostart default
```
🖐 notabene: Un pool est un espace de stockage (dossier, partition, stockage réseau, etc.) où libvirt stocke les disques virtuels (fichiers .qcow2, .raw, etc.) des machines virtuelles.

