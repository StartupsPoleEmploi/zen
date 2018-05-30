#!/bin/sh
docker-compose build && docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
