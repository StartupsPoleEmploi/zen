#!/bin/bash

DAY=`date +%d`;
WEEKDAY=`date +%A`;
NICE="/usr/bin/nice -n 15";

NAME=docker_$WEEKDAY.tar.bz2

mkdir -p /mnt/backups/$BACKUPS_ENV

$NICE tar --exclude=*.log --exclude=*.gz --exclude=*.bz2 --exclude=node_modules/* -jcPf - /home/docker | tee /mnt/backups/$BACKUPS_ENV/$NAME /home/backups/$NAME >/dev/null;
