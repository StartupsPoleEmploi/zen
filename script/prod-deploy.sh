#!/bin/bash

echo "Enable maintenance page ..."
cp ./front/maintenance_page-disable.html ./front/maintenance_page.html
# disable script that restart the API when she is down
sudo touch /tmp/disable

echo "Pull ..."
git pull origin master

echo "Docker restart ..."
# need to bluid if env var as change
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart

echo "Disable maintenance page ..."
# enable script that restart the API when she is down
sudo rm /tmp/disable
rm ./front/maintenance_page.html

echo "DEPLOY SUCCESSFULLY FINISHED"
