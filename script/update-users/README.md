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
Dans un autre terminal :
```shell
$ psql postgres://qa-user:qa-pass@localhost:5000/actualisation

# vérifier pour un DE du fichier si on a bien le flag isAuthorized=t avant et isAuthorized=f après
$ actualisation=# select * from "Users" where "email"='aanja11@yahoo.fr';
$ actualisation=# \q
```

---

#### Lancer le script

Copier le fichier [mon_fichier].csv dans ce dossier ./update-users
> Remarque 1 : le csv est celui de l'extract avec juste les 3 premières colonnes avec séparateur "|"
> Remarque 2 : vérifier qu'il s'agit bien du .csv correspondant au mois de l'actu (ne pas prendre
> l'extract de mailing fait en même temps mais qui lui est destiné au mois suivant)

```shell
$ node update-zen-users.js [mon_fichier].csv
```

Remarques : 
- dans le script update-zen-users.js, penser à basculer la connection ligne 7 (recette/prod)
- pour trouver le mdp de connection pour la prod (ligne 9) (normalement pas besoin), il faut entrer dans le container de prod zen_db_1 et faire 'env'
```bash
jdevy@dlx046:/home/docker/zen$ docker exec -it zen_db_1 /bin/bash
root@9ddccbbe27a3:/# env
LANG=en_US.utf8
TZ=Europe/Paris
HOSTNAME=9ddccbbe27a3
GOSU_VERSION=1.10
PGDATA=/var/lib/postgresql/data
POSTGRES_DB=actualisation
TERM=xterm
POSTGRES_USER=zen-user
POSTGRES_PASSWORD=...
...
```

