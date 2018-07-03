/* eslint-disable no-console */
const puppeteer = require('puppeteer')

const { LOGIN, PASSWORD, POSTAL_CODE } = process.env

if (!LOGIN || !PASSWORD || !POSTAL_CODE)
  throw new Error(
    `login ${LOGIN}, password ${PASSWORD} or postalcode ${POSTAL_CODE} missing`,
  )

const LOGIN_URL = 'https://authentification-candidat-r.pe-qvr.fr/'
const REDIRECTION_TO_DECLARATION_URL =
  'https://authentification-candidat-r.pe-qvr.fr/compte/redirigervers?url=https://actualisation-authent.pe-qvr.fr/acces.htm&actu=true'

const screenshot = (page) =>
  page
    .screenshot({
      path: `/home/back/lib/headless-pilot/${Date.now()}.png`,
      type: 'png',
    })
    .then(() => console.log('screenshot taken'))

async function login(page) {
  // Step 1, identifier
  await page.goto(LOGIN_URL)
  await page.setCookie({ name: 'clavierVirtuelAccessible', value: 'true' })
  await page.waitFor('#identifiant')
  await page.keyboard.type(LOGIN)

  page.click('#submit') // awaiting on this stalls everything
  await page.waitFor('#password')

  const hasShownLienAccessible = await page.$('#lienAccessible')

  if (hasShownLienAccessible) {
    page.click('#lienAccessible')
    await page.waitFor('#utilisation_clavier')

    // Sometimes it is checked but doesn't show right away the correct password manager :(
    const isChecked = await page.$('#utilisation_clavier:checked')
    if (!isChecked) {
      await page.click('#utilisation_clavier')
    }
    page.click('#submit')
    await page.waitFor('#password')
  }

  // Step 2, password and postal code
  await page.focus('#password')
  await page.keyboard.type(PASSWORD)
  await page.focus('#codepostal')
  await page.keyboard.type(POSTAL_CODE)
  page.click('#submit')

  await page.waitFor('.btn-account-connected') // make sure we are connected
}

module.exports = (async () => {
  const browser = await puppeteer.connect({
    browserWSEndpoint: 'ws://browserless:3000',
  })
  const page = await browser.newPage()
  // page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))

  try {
    await login(page)
    await page.goto(REDIRECTION_TO_DECLARATION_URL)
    await page.waitFor('#formationBloc')
    await screenshot(page)
    console.log('success')
    process.exit(0)
  } catch (e) {
    console.error(e)
    await screenshot(page)
    console.log('failure')
    process.exit(1)
  }
})()
