module.exports = {
  clientId: process.env.CLIENT_OAUTH_ID,
  clientSecret: process.env.CLIENT_OAUTH_SECRET,
  cookieSecret: process.env.COOKIE_SECRET,
  redirectUri: process.env.AUTH_REDIRECT_URI,
  tokenHost: 'https://authentification-candidat.pole-emploi.fr',
  apiHost: 'https://api.emploi-store.fr',
}
