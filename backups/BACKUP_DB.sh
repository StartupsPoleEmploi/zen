#!/bin/bash

DAY=`date +%d`;
WEEKDAY=`date +%A`;
MONTH=`date +%m`;
NICE="/usr/bin/nice -n 15";
DATE="$WEEKDAY";

OPTION=${1:-matin};
BACKUPS_ENV=${2:-production};

# ex: prod-data_18_matin.tar.bz2  (le cron déclenche 2 sauvegardes par jour sur 31 jours)
NAME="${BACKUPS_ENV}-data_${DAY}_${OPTION}.tar.bz2";

DIR1="/mnt/backups/$BACKUPS_ENV";
DIR2="/home/backups";

mkdir -p "$DIR1";

source /root/db_env.sh

PGPASSWORD="$POSTGRES_PASSWORD" $NICE /usr/bin/pg_dump -h db -U $POSTGRES_USER actualisation | bzip2 -cq9 | tee $DIR1/$NAME >$DIR2/$NAME;
