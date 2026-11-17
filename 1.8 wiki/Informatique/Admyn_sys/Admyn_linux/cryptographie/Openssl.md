Explications

Étapes à exécuter
	

Lignes de commandes

Création de la paire de clés RSA
	

openssl genrsa -out toto.pem 1024

Affichage du fichier de la clé privée RSA
	

cat toto.pem

Visualisation des clés RSA
	

openssl rsa -in toto.pem -text -noout

Cryptage d'un fichier de clés privées RSA
	

Openssl rsa -in tototo.pem -des3 -out tototo.pem

Exportation d'une clé publique
	

openssl rsa -in tototo.pem -pubout -out tototoPublique.pem

Vérification de l'exportation
	

tototoPublique.pem -pubin