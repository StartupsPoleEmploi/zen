#!/bin/bash

hostname="zen-prod"
date_pour_dump=`date +"%Y%m%d"`
jour_pour_backup=`date +"%d"`
nom_fichier_dump="zen_de_eligible_full_"$date_pour_dump"0700.csv"
nom_fichier_backup="production-data_"$jour_pour_backup"_matin.tar.bz2"

# Recupere les interruptions et quitte au lieu de continuer la boucle
trap "echo Exited!; exit;" SIGINT SIGTERM
MAX_RETRIES=3
i=0
# Set le retour initial à 'failure'
false

# Vérifie si la copie des fichiers nécessaires a fonctionné
while [ $? -ne 0 -a $i -lt $MAX_RETRIES ]
do
  i=$(($i+1))
  echo "Copie du fichier PEDUMP depuis le serveur "$hostname" sur le repertoire courant :"$nom_fichier_dump
  scp -o ConnectTimeout=10 $hostname:/mnt/datalakepe/depuis_datalake/$nom_fichier_dump .

  echo "Copie du fichier BACKUP depuis le serveur "$hostname" sur le repertoire courant :"$nom_fichier_backup
  scp -o ConnectTimeout=10 $hostname:/mnt/backups/production/$nom_fichier_backup .
done

if [ $i -eq $MAX_RETRIES ]
then
  echo "Nombre d'essais max atteint."
fi

mv "$nom_fichier_dump" "zen_de_eligible_full.csv"

# Chargement d'un backup de la BDD Zen sur un docker local ainsi que de l'extract des DE eligible
echo "Transformation du fichier backup en script SQL"
bzip2 -dcq "$nom_fichier_backup">dump_backup_BDD_zen.sql
echo "Démarrage du docker postgresql"
docker-compose up -d
echo "Copie du script backup SQL dans le container docker"
docker cp dump_backup_BDD_zen.sql mailing-fermeture-regions_db_1:/dump_backup_BDD_zen.sql
echo "Chargement du script backup SQL dans la BDD"
docker exec -it mailing-fermeture-regions_db_1 psql -U zen-user -d actualisation -f /dump_backup_BDD_zen.sql

echo "Copie du script creation_table_de_eligible SQL et du fichier csv dans le container docker"
docker cp creation_table_de_eligible.sql mailing-fermeture-regions_db_1:/creation_table_de_eligible.sql
docker cp zen_de_eligible_full.csv mailing-fermeture-regions_db_1:/zen_de_eligible_full.csv
echo "Création et peuplement de la table de_eligible depuis le fichier PEDUMP"
docker exec -it mailing-fermeture-regions_db_1 psql -U zen-user -d actualisation -f /creation_table_de_eligible.sql

#Les tables sont chargées et prêtes à être requetées. On utilise la liste des codes postaux du fichier texte.
file="liste_code_postaux.txt"
read -d $'\x04' liste_code_postaux < "$file"

echo "Extrait la liste des DE pour la campagne de mail sur les départements : "$liste_code_postaux
docker exec -it mailing-fermeture-regions_db_1 psql -U zen-user -d actualisation -c '\COPY
(SELECT DISTINCT ON ("u"."email", "u"."firstName","u"."lastName") "u"."email","u"."lastName","u"."firstName","u"."gender","u"."postalCode","u"."agencyCode","e"."id_rci","e"."id_individu", "u"."id", "u"."registeredAt", "u"."isBlocked"
 FROM "Users" as "u"
 JOIN "de_eligible" "e" ON "u"."email" = "e"."email"
 WHERE LEFT("u"."postalCode", 2) IN ('$liste_code_postaux')
 AND "u"."isAuthorized" is true
 AND "u"."registeredAt" is not null
 AND "u"."isBlocked" is false
 AND "e"."id_individu" is not null)
TO /tmp/extraction-mailing.csv WITH CSV HEADER;'

#On extrait le résultat de la requête dans un fichier CSV qu'on vient copier dans notre répertoire courant
docker cp mailing-fermeture-regions_db_1:/tmp/extraction-mailing.csv .

#On fait le ménage
echo "Drop la DB actualisation"
docker exec -it mailing-fermeture-regions_db_1 psql -U zen-user -d postgres -c "DROP DATABASE actualisation WITH (FORCE)"

#echo "Stop le container et le détruit"
docker-compose stop
docker-compose rm -f

#echo "Fait le ménage dans le répertoire"
rm -f "$nom_fichier_backup" "dump_backup_BDD_zen.sql" "zen_de_eligible_full.csv"
