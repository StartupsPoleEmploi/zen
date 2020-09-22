#!/bin/bash
## 
# This script check if the uploads folder are mounted
##

DOCKERNAME=$1
MOUNTEDFOLDER=$2

TESTCMD=$(docker exec -t $DOCKERNAME ls $MOUNTEDFOLDER)
echo "$(date) - Check mounted status - docker : ${DOCKERNAME} - folder : ${MOUNTEDFOLDER}"
if [[ $TESTCMD =~ ^ls:* ]] ; then
  echo "${TESTCMD}"
  echo "Restarting docker $DOCKERNAME"
  docker restart $DOCKERNAME    
else
    echo "Everything is fine!"
fi


# to executable
# chmod +x script/control-mounted-volum.sh

# add to cron
# crontab -e
# */5 * * * * mkdir -p /home/docker/zen/logs/ && /home/docker/zen/script/control-mounted-volum.sh zen_node_1 uploads >> /home/docker/zen/logs/control-mounted-volum.log
# */5 * * * * mkdir -p /home/docker/zen/logs/ && /home/docker/zen/script/control-mounted-volum.sh zen_node_1 datalake >> /home/docker/zen/logs/control-mounted-volum.log
# */5 * * * * mkdir -p /home/docker/zen/logs/ && /home/docker/zen/script/control-mounted-volum.sh zen_cron_1 datalake >> /home/docker/zen/logs/control-mounted-volum.log

