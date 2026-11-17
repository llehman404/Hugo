---
title: "Bluetooth"
date: 1794925189
tags: ["Informatique", "nixos"]
categories: ["Informatique"]
themes: ["Informatique"]
draft: false
---

**Command Line Interface (CLI)**  
Alternatively, Bluetooth devices can be paired from the command line using bluetoothctl.

$ bluetoothctl  
\[bluetooth\] # power on  
\[bluetooth\] # agent on  
\[bluetooth\] # default-agent  
\[bluetooth\] # scan on  
…put device in pairing mode and wait \[hex-address\] to appear here…  
\[bluetooth\] # pair \[hex-address\]  
\[bluetooth\] # connect \[hex-address\]

Bluetooth devices automatically connect with bluetoothctl as well:

$ bluetoothctl  
\[bluetooth\] # trust \[hex-address\]

**Cannot use bluetooth while it previously worked**  
Symptoms:

```
When using bluetoothctl, getting "No agent is registered".
When using blueman or anything using dbus to talk to bluez, getting dbus.exceptions.DBusException: org.freedesktop.DBus.Error.AccessDenied: Rejected send message"
```

This possibly can be fixed by restarting the display-manager session. The session management may have had an issue with registering your current session and doesn’t allow you to control bluetooth.

k

source : https://nixos.wiki/wiki/Bluetooth