/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
const isProd = process.env.NODE_ENV === 'production'
const LOGIN_URL = isProd
  ? 'https://authentification-candidat.pole-emploi.fr'
  : 'https://authentification-candidat-r.pe-qvr.fr/'

module.exports = async function login(page, user) {
  // Step 1, identifier
  await page.goto(LOGIN_URL)
  await page.setCookie({ name: 'clavierVirtuelAccessible', value: 'true' })
  await page.waitFor('#identifiant')
  await page.keyboard.type(user.peCode)

  await page.click('#submit')
  await page.waitFor('#password')

  const hasShownLienAccessible = await page.$('#lienAccessible')

  if (hasShownLienAccessible) {
    await page.click('#lienAccessible')
    await page.waitFor('#utilisation_clavier')

    // Sometimes it is checked but doesn't show right away the correct password manager :(
    const isChecked = await page.$('#utilisation_clavier:checked')
    if (!isChecked) {
      await page.click('#utilisation_clavier')
    }
    await page.click('#submit')
    await page.waitFor('#password')
  }

  // Step 2, password and postal code
  await page.focus('#password')
  await page.keyboard.type(user.pePass)
  await page.focus('#codepostal')
  await page.keyboard.type(user.pePostalCode)

  // We submit but do not wait for everything as pe.fr loads a thousand things.
  // As soon as we know we're logged, it's ok.
  await page.click('#submit')
  await page.waitFor('.btn-account-connected') // make sure we are connected
}
