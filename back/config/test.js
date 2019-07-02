// This is set to true for e2e tests, and is set to false for backend tests which stub
// the calls, by setting the env variables in the docker-compose run command.
// This avoids having to create and handle another NODE_ENV for e2e tests
module.exports = {
  bypassDeclarationDispatch: true,
  bypassDocumentsDispatch: true,
}
