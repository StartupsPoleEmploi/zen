# Actualisation

## Setup

**A `.env` file must be created and populated with appropriate configuration values. Sample values in the `.env.example` file.**

```
docker-compose build
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up # dev
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up # prod
```

Dev containers start with :

* Express app on port 8080
* React app on port 3000
* nginx (last React production build) on port 80

Production containers only open port 443 & 80
