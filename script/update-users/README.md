## Script pour désactiver des utilisateurs Zen via fichier .csv

L'objectif est de mettre à jour la base de données de l'environnement de recette ou de production 
à partir de données fournies en entrée dans un fichier .csv.

Ici, passer le flag "isAuthorized" à false.

---

#### Ouvrir le VPN ZEN
Pré-requis, ouvrir le VPN Zen.

---

#### Redirection du port 
Avec cette redirection de port, 
on peut ensuite accéder à la base postgres du serveur sur le port 5000 de sa machine
locale.  

- pour l'environnement de __recette__
```shell
$ ssh -L 5000:172.0.0.150:5432 jdevy@192.168.4.133
```
- pour l'environnement de __production__
```shell
$ ssh -L 5000:172.0.0.150:5432 jdevy@137.74.27.5
```
> Rmq : 172.0.0.150 correspond au "network" défini pour le container docker db

---

#### Vérification

Vérifier qu'on se connecte bien à la base distante
```shell
$ psql postgres://qa-user:qa-pass@localhost:5000/actualisation
$ actualisation=# \q
```

---

#### Lancer le script

Copier le fichier [mon_fichier].csv dans ce dossier ./update-users
```shell
$ node update-zen-users.js [mon_fichier].csv
```
