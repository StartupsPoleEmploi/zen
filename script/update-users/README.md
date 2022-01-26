# Script pour désactiver des utilisateurs Zen via fichier .csv

## Procédure de connexion

L'objectif est de mettre à jour la base de données de l'environnement de recette ou de production.

Il faut se connecter au VPN Zen, puis se connecter en SSH au serveur, en utilisant la redirection de port.  
Avec cette redirection de port, on peut ensuite accéder à la base postgres du serveur sur le port 5000 de sa machine
locale.  
Pour l'environnement de recette, il faut executer ces deux commandes dans deux terminaux différents.

```shell
$ ssh -L 5000:172.0.0.150:5432 jdevy@192.168.4.133
```

```shell
$ psql postgres://qa-user:qa-pass@localhost:5000/actualisation
```