/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
const spawnBrowserPage = require('./spawn-browser-page')
const login = require('./login')

module.exports = async function testLogin(user) {
  const page = await spawnBrowserPage()
  await login(page, user)

  console.log(`Success login for ${user.firstName} ${user.lastName}`)
}
