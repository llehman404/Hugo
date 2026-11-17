# Connexion graphique a une vm

`virsh list --all`

`virsh dominfaddr` -> information réseaux sur la vm

`virsh dominfo` -> information sur la vm (id, nom, rame , …)

`virsh domdisplya` \-> donne le port d’ecoute, les paramétre de connexion SPICE a une vm

`virsh vncdisplay` -> donne le port d’ecoute, les paramétre de connexion VNC au une vm

`spicy [nom de la vm / - h adresse ip ] -p [numéro de port]` -> connexion graphique avec le protocol SPICE

ou

`virt-viewer [nom de la vm]` -> connexion graphique avec le protocole. Mieux dans libvirt/manager

`virsh shutdown` -> Eteindre la vm

`virsh destroy` -> si un probléme et que la vm ne veux pas s’eteindre

# Installation d’un VM

## Dans la vm si mode graphique

`spice-vadgent` -> A installé dans la vm. trés improtant pour avoir une bonne fluidité graphique.

`virsh edit [nom de la vm]` -> permet de editer en le fichier xml su

pour pouvoir utiliser le copier - coller avec :

```xml
<channel type='spicevmc'>
  <target type='virtio' name='com.redhat.spice.0'/>
  <address type='virtio-serial' controller='0' bus='0' port='2'/>
</channel>
```

va créer un tunnel entre hote et la vm pour faire fonctionner le copier-coller

```xml
<clipboard copypaste='yes'/>
```

dans la vm enable sipce-vdagent avec systemctl enable: ‘org.qemu.guest_agent.0’

&nbsp;