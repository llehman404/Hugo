---
title: "Openssl Vs Openssh Vs Gpg"
date: 1794925189
tags: ["Informatique", "Admyn_sys"]
categories: ["Informatique"]
themes: ["Informatique"]
draft: false
---

| **Critère** | **OpenSSH** | **OpenSSL** | **GnuPG (GPG)** |
| --- | --- | --- | --- |
| **Protocole principal** | SSH (Secure Shell) | TLS/SSL, DTLS | OpenPGP |
| **Port par défaut** | 22 | 443 (HTTPS), 993 (IMAPS), etc. | Aucun (fichiers/emails) |
| **Licence** | BSD (OpenSSH), GPL (certaines versions) | Apache 2.0 (OpenSSL 3.x), OpenSSL 1.x | GPLv3+ |
| **Utilisation principale** | Accès distant sécurisé (shell, SFTP) | Sécurisation des communications web | Chiffrement de fichiers/emails |
| **Protocoles supportés** | SSH, SFTP, SCP | TLS/SSL, DTLS, QUIC, IPsec | OpenPGP (RFC 4880), S/MIME |
| **Intégration avec d'autres outils** | Git, Ansible, Docker, etc. | Nginx, Apache, Postfix, etc. | Thunderbird (Enigmail), KMail, etc. |
| **Infrastructure de confiance** | Trust-on-first-use (TOFU) | PKI (Autorités de certification) | Web of Trust (WoT) |



