#!/bin/bash

DAY=`date +%d`;
WEEKDAY=`date +%A`;
MONTH=`date +%m`;
NICE="/usr/bin/nice -n 15";
DATE="$WEEKDAY";

OPTION=${1:-matin};

NAME="prod-data_${DAY}_${OPTION}.tar.bz2";

DIR1="/mnt/backups/$BACKUPS_ENV";
DIR2="/home/backups";

mkdir -p "$DIR1";

PGPASSWORD="$POSTGRES_PASSWORD" $NICE pg_dump -h db -U zen-user actualisation | bzip2 -cq9 | tee $DIR1/$NAME >$DIR2/$NAME;
