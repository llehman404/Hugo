Serveur DHCP 

```bash
micro etc/resolv.conf
	nameserver 1.1.1.1
	nameserver 8.8.8.8

micro etc/network/interfaces
	# This file describes the network interfaces available on your system
	# and how to activate them. For more information, see interfaces(5).

	source /etc/network/interfaces.d/*

	# The loopback network interface
	auto lo
	iface lo inet loopback

	# The primary network interface
	allow-hotplug enp0s3
        	iface enp0s3 inet static
        	address 192.168.60.10/24
        	gateway 192.168.60.1
        	dns-nameservers 1.1.1.1 8.8.8.8
	# This is an autoconfigured IPv6 interface
	iface enp0s3 inet6 auto

systemctl restart networking.service

sudo apt update && sudo apt upgrade

sudo apt instal isc-dhcp-server

micro /etc/default/isc-dhcp-server 
	# Defaults for isc-dhcp-server (sourced by /etc/init.d/isc-dhcp-server)

	# Path to dhcpd's config file (default: /etc/dhcp/dhcpd.conf).
	#DHCPDv4_CONF=/etc/dhcp/dhcpd.conf
	#DHCPDv6_CONF=/etc/dhcp/dhcpd6.conf

	# Path to dhcpd's PID file (default: /var/run/dhcpd.pid).
	#DHCPDv4_PID=/var/run/dhcpd.pid
	#DHCPDv6_PID=/var/run/dhcpd6.pid

	# Additional options to start dhcpd with.
	#       Don't use options -cf or -pf here; use DHCPD_CONF/ DHCPD_PID instead
	#OPTIONS=""

	# On what interfaces should the DHCP server (dhcpd) serve DHCP requests?
	#       Separate multiple interfaces with spaces, e.g. "eth0 eth1".
->	INTERFACESv4="enp0s3"
	INTERFACESv6=""



```
