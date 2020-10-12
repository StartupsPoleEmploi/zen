#!/bin/bash
## 
# This script clean environment unused files and system
##

# clean system
apt-get autoclean
apt-get autoremove
apt-get -y purge $(dpkg --get-selections linux-headers-[0-9]* linux-image-[0-9]* | awk '{print $1}' | grep -v $(uname -r | cut -d"-" -f-2))

# clean docker
docker system prune -f
docker rm $(docker ps -aq)
docker rmi $(docker images -q)
docker volume rm $(docker volume ls)

# to executable
# chmod +x script/docker-clean.sh

# add to cron
# crontab -e
# * 1 * * * mkdir -p /home/docker/zen/logs/ && /home/docker/zen/script/docker-clean.sh >> /home/docker/zen/logs/docker-clean.log
