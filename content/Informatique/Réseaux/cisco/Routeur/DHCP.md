---
title: "Dhcp"
date: 1794925189
tags: ["Informatique", "Réseaux"]
categories: ["Informatique"]
themes: ["Informatique"]
draft: false
---

DHCP 

```cisco
enable
conf t 
int fa0/0
ip address 172.16.5.2 255.255.255.0
no shutdown 
exit 

ip dhcp pool VOIP 
network 176.16.5.0 255.255.255.0
default routeur 176.16.5.2
dns server 1.1.1.1

Router# show ip dhcp binding

```