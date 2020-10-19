#!/bin/bash
## 
# This script clean environment unused files and system
##

# clean old files 
PM = $(date -d "-1 month" +%m)
PY = $(date -d "-1 month" +%Y)
rm `ls /mnt/backups/ -1 --hide=prod-data_\d{4}-\d{2}-\d{2}_00-00.sql | grep -e prod-data_$PY-$PM`
rm `ls /mnt/datalakepe/depuis_datalake/zen_de_eligible_full_$PY$PM*.csv`

# to executable
# chmod +x script/clean-env.sh

# add to cron
# crontab -e
# * 1 * * * mkdir -p /home/docker/zen/logs/ && /home/docker/zen/script/clean-env.sh >> /home/docker/zen/logs/zen-clean-env-cron.log
