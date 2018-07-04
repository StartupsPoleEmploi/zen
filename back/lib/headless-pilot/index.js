/* eslint-disable no-console */
const puppeteer = require('puppeteer')

const Declaration = require('../../models/Declaration')

// TODO remove next section when refactoring
const { Model } = require('objection')
const Knex = require('knex')
const { format } = require('date-fns')

const knex = Knex({
  client: 'pg',
  useNullAsDefault: true,
  connection: process.env.DATABASE_URL,
})
Model.knex(knex)

const { LOGIN, PASSWORD, POSTAL_CODE } = process.env

if (!LOGIN || !PASSWORD || !POSTAL_CODE)
  throw new Error(
    `login ${LOGIN}, password ${PASSWORD} or postalcode ${POSTAL_CODE} missing`,
  )

const isProd = process.env.NODE_ENV === 'production'
const LOGIN_URL = isProd
  ? 'https://authentification-candidat.pole-emploi.fr'
  : 'https://authentification-candidat-r.pe-qvr.fr/'
const REDIRECTION_TO_DECLARATION_URL = isProd
  ? 'https://authentification-candidat.pole-emploi.fr/compte/redirigervers?url=https://actualisation-authent.pole-emploi.fr/acces.htm&actu=true'
  : 'https://authentification-candidat-r.pe-qvr.fr/compte/redirigervers?url=https://actualisation-authent.pe-qvr.fr/acces.htm&actu=true'

const screenshot = (page) =>
  page
    .screenshot({
      path: `/home/back/lib/headless-pilot/${Date.now()}.png`,
      type: 'png',
      fullPage: true,
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

async function doDeclaration(page) {
  await page.goto(REDIRECTION_TO_DECLARATION_URL)
  await page.waitFor('#formationBloc')

  const declaration = await Declaration.query()
    .eager('employers')
    .findById(68) // for tests purposes, 67 is ingrid, 68 is hugo

  console.log(
    'Here is the declaration we will replicate',
    JSON.stringify(declaration, null, 2),
  )

  await page.click(declaration.hasTrained ? '#formationOui' : '#formationNon')
  await page.click('.nav.button-list button[type=submit]')

  // page change
  try {
    await page.waitForNavigation()
  } catch (e) {
    // We've waited until the timeout, which means something has hanged.
    // Still, the page's js may have been loaded so we still try to fill in the form
    // without exiting
    console.error(e)
  }
  await page.waitFor('#travailleBloc')

  await page.click(
    declaration.hasWorked ? '#blocTravail-open' : '#blocTravail-close',
  )
  if (declaration.hasWorked) {
    await page.waitFor('#blocTravail.js-show')
    await page.focus('#nbHeuresTrav')
    await page.keyboard.type(
      declaration.employers
        .reduce((prev, { workHours }) => prev + workHours, 0)
        .toString(),
    ) // FIXME
    await page.focus('#montSalaire')
    await page.keyboard.type(
      declaration.employers
        .reduce((prev, { salary }) => prev + salary, 0)
        .toString(),
    )
  }

  await page.click(
    declaration.hasInternship ? '#blocStage-open' : '#blocStage-close',
  )
  if (declaration.hasInternship) {
    await page.waitFor('#blocStage.js-show')
    await page.focus('#dateDebutStage')
    await page.keyboard.type(
      format(declaration.internshipStartDate, 'DD/MM/YYYY'),
    )
    await page.focus('#dateFinStage')
    await page.keyboard.type(
      format(declaration.internshipEndDate, 'DD/MM/YYYY'),
    )
  }

  await page.click(
    declaration.hasSickLeave ? '#blocMaladie-open' : '#blocMaladie-close',
  )

  if (declaration.hasSickLeave) {
    await page.waitFor('#blocMaladie.js-show')
    await page.focus('#dateDebutMaladie')
    await page.keyboard.type(
      format(declaration.sickLeaveStartDate, 'DD/MM/YYYY'),
    )
    await page.focus('#dateFinMaladie')
    await page.keyboard.type(format(declaration.sickLeaveEndDate, 'DD/MM/YYYY'))
  }

  await page.click(
    declaration.hasMaternityLeave
      ? '#blocMaternite-open'
      : '#blocMaternite-close',
  )

  if (declaration.hasMaternityLeave) {
    await page.waitFor('#blocMaternite.js-show')
    await page.focus('#dateDebutMaternite')
    await page.keyboard.type(
      format(declaration.maternityLeaveStartDate, 'DD/MM/YYYY'),
    )
  }

  await page.click(
    declaration.hasRetirement ? '#blocRetraite-open' : '#blocRetraite-close',
  )

  if (declaration.hasRetirement) {
    await page.waitFor('#blocRetraite.js-show')
    await page.focus('#dateRetraite')
    await page.keyboard.type(
      format(declaration.retirementStartDate, 'DD/MM/YYYY'),
    )
  }

  await page.click(
    declaration.hasInvalidity
      ? '#blocInvalidite-open'
      : '#blocInvalidite-close',
  )

  if (declaration.hasInvalidity) {
    await page.waitFor('#blocInvalidite.js-show')
    await page.focus('#dateInvalidite')
    await page.keyboard.type(
      format(declaration.invalidityStartDate, 'DD/MM/YYYY'),
    )
  }

  // none of the following is displayed on the form is user has trained
  if (!declaration.hasTrained) {
    await page.click(
      declaration.isLookingForJob
        ? '#blocRecherche-close'
        : '#blocRecherche-open',
    )

    if (!declaration.isLookingForJob) {
      await page.waitFor('#blocRecherche.js-show')
      await page.focus('#dateFinRech')
      await page.keyboard.type(
        format(declaration.jobSearchEndDate, 'DD/MM/YYYY'),
      )
      await page.click(
        declaration.jobSearchStopMotive === 'work'
          ? '#motifFinRechReprise'
          : declaration.jobSearchStopMotive === 'retirement'
            ? '#motifFinRechRetraite'
            : '#motifFinRechAutre',
      )
    }
  }
}

module.exports = (async () => {
  const browser = await puppeteer.connect({
    browserWSEndpoint: 'ws://browserless:3000',
  })
  const page = await browser.newPage()
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))

  try {
    await login(page)
    await doDeclaration(page)

    await screenshot(page)
    console.log('success')
    process.exit(0)
  } catch (e) {
    await screenshot(page)
    const content = await page.content()
    console.log(content)
    console.error(e)
    console.log('failure')
    process.exit(1)
  }
})()
