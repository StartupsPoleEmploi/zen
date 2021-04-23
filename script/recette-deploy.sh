#!/bin/bash

echo "Enable maintenance page ..."
cp ./front/maintenance_page-disable.html ./front/maintenance_page.html
echo "Pull ..."
git pull origin develop
echo "Docker restart ..."
docker-compose -f docker-compose.yml -f docker-compose.qa.yml build
docker-compose -f docker-compose.yml -f docker-compose.qa.yml up -d --no-build
docker-compose -f docker-compose.yml -f docker-compose.qa.yml restart
echo "Disable maintenance page ..."
rm ./front/maintenance_page.html
echo "DEPLOY SUCCESSFULLY FINISHED"
