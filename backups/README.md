# Zen - backups

## Principe

Ce conteneur docker va piloter 
- le backup complet de l'application (1 fois par jour)
- le backup de la base de données (2 fois par jour à 0h et 12h)

Le cron est conteneurisé aussi donc, tout provient du code source, ce n'est pas le host qui pilote.

Dans le conteneur, on peut voir les cron ici :

```bash
root@backups:/etc/cron.d# ll
total 24
drwxr-xr-x 1 root root 4096 juin  17 13:44 ./
drwxr-xr-x 1 root root 4096 juin  17 13:45 ../
-rw-r--r-- 1 root root   66 juin  17 13:44 backups
-rw-r--r-- 1 root root  156 juin  17 13:44 backups_db
```

Ils sont définis dans le dockerfile_backups :
```bash
.../...
RUN echo "0 2 * * * root bash /home/backups/BACKUP.sh >>/var/log/backup.log" >>/etc/cron.d/backups; \
    echo "0 0 * * * root bash /home/backups/BACKUP_DB.sh matin >>/var/log/backup_db.log" >>/etc/cron.d/backups_db; \
    echo "0 12 * * * root bash /home/backups/BACKUP_DB.sh midi >>/var/log/backup_db.log" >>/etc/cron.d/backups_db;
.../...
```

## 2 scripts
##### BACKUP.sh
Produit un .tar.bz2 en local et sur /mnt.\
Il y a une rotation sur 7 jours.\
Pas besoin de procédure de nettoyage.


```bash
jdevy@dlx046:/home/docker/zen/backups ls -lrt
total 184224496
-rw-r--r-- 1 jdevy docker 26429506071 Jun 12 07:05 docker_samedi.tar.bz2
-rw-r--r-- 1 jdevy docker 26540324551 Jun 13 07:08 docker_dimanche.tar.bz2
-rw-r--r-- 1 jdevy docker 26679040496 Jun 14 07:12 docker_lundi.tar.bz2
-rw-r--r-- 1 root  root   27007452758 Jun 15 06:27 docker_mardi.tar.bz2
-rw-r--r-- 1 root  root   27153266687 Jun 16 07:10 docker_mercredi.tar.bz2
.../...


jdevy@dlx046:/mnt/backups/production$ ls -lrt
total 184410292
-rwxrwxr-x 1 root ubuntu 26429506071 Jun 12 07:05 docker_samedi.tar.bz2
-rwxrwxr-x 1 root ubuntu 26540324551 Jun 13 07:08 docker_dimanche.tar.bz2
-rwxrwxr-x 1 root ubuntu 26679040496 Jun 14 07:12 docker_lundi.tar.bz2
-rwxrwxr-x 1 root ubuntu 27007452758 Jun 15 06:27 docker_mardi.tar.bz2
-rwxrwxr-x 1 root ubuntu 27153266687 Jun 16 07:10 docker_mercredi.tar.bz2
.../...
```

##### BACKUP_DB.sh
Produit un .tar.bz2 en local et sur /mnt.\
Deux sauvegardes par jour et une rotation sur 31 jours.\
Pas besoin de procédure de nettoyage.

```bash
jdevy@dlx046:/home/docker/zen/backups ls -lrt
total 184224496
-rwxrwxr-x 1 root ubuntu    95882871 Jun 18 00:22 production-data_18_matin.tar.bz2
-rwxrwxr-x 1 root ubuntu    95882871 Jun 18 12:02 production-data_18_midi.tar.bz2
.../...


jdevy@dlx046:/mnt/backups/production$ ls -lrt
total 184410292
-rw-r--r-- 1 root root   87199459 juin  18 00:01 production-data_18_matin.tar.bz2
-rw-r--r-- 1 root root   87199459 juin  18 12:01 production-data_18_midi.tar.bz2
.../...
```
