# Zen

## Setup

**A `.env` file must be created and populated with appropriate configuration values. Sample values in the `.env.example` file.**

**For front-end Sentry use, a `front/.env.local` needs creation and configuration too.**

Install Docker, Docker-Compose and yarn, then

```
yarn
docker-compose build
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up # dev
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up # prod
```

Dev containers start with :

- Express app on port 8080
- React app on port 3000
- nginx (last React production build) on port 80

Production containers only open port 443 & 80

## Development help

- Pressing Escape on the development environment will show a modal allowing to edit the contents of `req.session.user`, allowing for quick user change
- Adding a `local-development.js` file in `back/config` will allow disabling calls to pe-api, resulting in less dependencies and easier development in case of partner qa environment failures. Template :

```js
module.exports = {
  bypassDeclarationDispatch: true, // disables calls to pe-api for documents
  bypassDocumentsDispatch: true // disables calls to pe-api for declarations
};
```

## Production

### HTTPS certificate

The entrust-zen.pole-emploi.fr-key.pem file must be put in the nginx folder
