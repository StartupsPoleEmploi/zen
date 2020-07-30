#!/bin/bash
## 
# This script check if the uploads folder are mounted
##

DOCKERNAME=zen_node_1
MOUNTEDFOLDER=uploads

TESTCMD=$(docker exec -it $DOCKERNAME ls $MOUNTEDFOLDER)
echo "$(date) - Check mounted status"
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
# */5 * * * * mkdir -p /home/docker/zen/logs/ && /home/docker/zen/script/control-mounted-volum.sh >> /home/docker/zen/logs/control-mounted-volum.log

