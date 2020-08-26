#!/bin/sh
docker-compose -f docker-compose.yml -f docker-compose.prod.ym build && docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
