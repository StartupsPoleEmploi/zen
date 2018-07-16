/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
const puppeteer = require('puppeteer')

const Declaration = require('../../models/Declaration')

// TODO remove next section when refactoring
const { Model } = require('objection')
const Knex = require('knex')
const { format } = require('date-fns')
const { uploadsDirectory } = require('../../config/default')

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

let page

const isProd = process.env.NODE_ENV === 'production'
const LOGIN_URL = isProd
  ? 'https://authentification-candidat.pole-emploi.fr'
  : 'https://authentification-candidat-r.pe-qvr.fr/'
const REDIRECTION_TO_DECLARATION_URL = isProd
  ? 'https://authentification-candidat.pole-emploi.fr/compte/redirigervers?url=https://actualisation-authent.pole-emploi.fr/acces.htm&actu=true'
  : 'https://authentification-candidat-r.pe-qvr.fr/compte/redirigervers?url=https://actualisation-authent.pe-qvr.fr/acces.htm&actu=true'
const SEND_DOCUMENTS_URL = isProd
  ? 'https://candidat.pole-emploi.fr/candidat/situationadministrative/uploaddocuments/tableaudebord.boutonenvoyer'
  : 'https://candidat-r.pe-qvr.fr/candidat/situationadministrative/uploaddocuments/tableaudebord.boutonenvoyer'

async function clickAndWaitForNavigation(selector) {
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click(selector),
  ])
}

const DOC_CONTEXT = {
  DECLARATION: '1',
}

const DOC_SITUATION_SELECT_VALUES = {
  ACTIVITY_WITH_SALARY: '1',
  ACTIVITY_WITH_NO_SALARY: '2',
  INTERNSHIP_OR_TRAINING: '3',
  SICK_LEAVE: '4',
  RETIREMENT: '5',
  INVALIDITY: '6',
}

const DOC_TYPE_SELECT_VALUES = {
  SALARY_SHEET: 'BS',
  EMPLOYER_CERTIFICATE: 'AE_01',
  WORK_CONTRACT: 'CT_04',
}

const screenshot = () =>
  page
    .screenshot({
      path: `/home/back/lib/headless-pilot/${Date.now()}.png`,
      type: 'png',
      fullPage: true,
    })
    .then(() => console.log('screenshot taken'))

async function login() {
  // Step 1, identifier
  await page.goto(LOGIN_URL)
  await page.setCookie({ name: 'clavierVirtuelAccessible', value: 'true' })
  await page.waitFor('#identifiant')
  await page.keyboard.type(LOGIN)

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
  await page.keyboard.type(PASSWORD)
  await page.focus('#codepostal')
  await page.keyboard.type(POSTAL_CODE)

  // We submit but do not wait for everything as pe.fr loads a thousand things.
  // As soon as we know we're logged, it's ok.
  await page.click('#submit')
  await page.waitFor('.btn-account-connected') // make sure we are connected
}

async function doDeclaration(declaration) {
  await page.goto(REDIRECTION_TO_DECLARATION_URL)

  await page.waitFor('.group-set')
  // A page has loaded. We're either on the page to start the declaration
  // Or on the page to warn us it's been modified or that we can't do the
  // declaration anymore.
  // In that case, we print a warning and exit this page

  const isNormalDeclarationPage = await page.$('.note-form')
  if (!isNormalDeclarationPage) {
    console.warn(
      `Warning : Declaration already done. Exiting Declaration update.`,
    )
    await screenshot()
    return
  }

  await page.waitFor('#formationBloc')

  await page.click(declaration.hasTrained ? '#formationOui' : '#formationNon')

  // page change
  try {
    await clickAndWaitForNavigation('.nav.button-list button[type=submit]')
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
    )
    await page.focus('#montSalaire')
    await page.keyboard.type(
      declaration.employers
        .reduce((prev, { salary }) => prev + salary, 0)
        .toString(),
    )
  }

  const internshipInput = await page.$('.subgroup:not(.hide) #stageBloc')

  if (internshipInput) {
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

  // Only women get this input displayed on pe.fr:
  // men do get it, but it's automatically checked to "no" and hidden.
  // We don't have the info so we need this check to avoid trying
  // clicking on hidden fields
  const maternityInput = await page.$('.subgroup:not(.hide) #materniteBloc')

  if (maternityInput) {
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

    // Validate form
    try {
      await clickAndWaitForNavigation('button.js-only[type="submit"]')
    } catch (e) {
      console.log('timeout 1', e)
    }

    const hiddenInconsistencyInput = await page.$(
      'input[name="incoherenceValidee"]',
    )

    if (hiddenInconsistencyInput) {
      // Do this once more in case we went on inconsistency page.

      try {
        await clickAndWaitForNavigation('button.js-only[type="submit"]')
      } catch (e) {
        console.log('timeout 2', e)
      }
    }

    try {
      await clickAndWaitForNavigation('button.js-only[type="submit"]')
    } catch (e) {
      console.log('timeout 3', e)
    }

    // Ensure we got on the final redirection page by checking the link to the
    // confirmation pdf exists.
    await page.waitFor('.pdf-fat-link')

    await screenshot()
  }
}

async function sendDocument({
  filePath,
  isFileCertificate,
  label,
  selectOptionValue,
}) {
  await page.setJavaScriptEnabled(false)

  // We specifically wait for the options inside the selects to appear
  // This is because when the select appear, the options
  // may not be loaded, are they seem to be loaded via ajax.
  await page.goto(SEND_DOCUMENTS_URL)
  console.log('On send documents page')

  await page
    .select('#listeDeroulanteContexte', DOC_CONTEXT.DECLARATION)
    .catch((e) => console.log('error in select #listeDeroulanteContexte', e))

  // We catch when the promise fail as sometimes the selects throw, but have correctly worked
  // If they didn't work, the next instructions will fail anyway.
  await Promise.all([
    page.waitForNavigation(),
    page.click('#listeDeroulanteContexte + noscript input[type="submit"]'),
  ])

  console.log('Gonna select the situation')

  await page
    .select('#listeDeroulanteSituation', selectOptionValue)
    .catch((e) => console.log('error in select #listeDeroulanteSituation', e))

  // We catch when the promise fail as sometimes the selects throw, but have correctly worked
  // If they didn't work, the next instructions will fail anyway.
  await Promise.all([
    page.click('#listeDeroulanteSituation + noscript input[type="submit"]'),
    page.waitForNavigation(),
  ])

  if (selectOptionValue === DOC_SITUATION_SELECT_VALUES.ACTIVITY_WITH_SALARY) {
    console.log('Gonna choose to send either a salary sheet or a certificate')

    await page.select(
      '#listeDeroulanteTypeDocument',
      isFileCertificate
        ? DOC_TYPE_SELECT_VALUES.EMPLOYER_CERTIFICATE
        : DOC_TYPE_SELECT_VALUES.SALARY_SHEET,
    )
    // We catch when the promise fail as sometimes the selects throw, but have correctly worked
    // If they didn't work, the next instructions will fail anyway.
    await Promise.all([
      page.click(
        '#listeDeroulanteTypeDocument + noscript input[type="submit"]',
      ),
      page.waitForNavigation(),
    ])
  }

  console.log('Gonna write the document name')

  await page.focus('#nomDocument')
  await page.click('#nomDocument', { clickCount: 3 })
  await page.keyboard.type(label)

  console.log('Gonna validate document infos')

  await clickAndWaitForNavigation('input[type="submit"][value="Valider"]')

  console.log('On page to upload document')

  const fileInput = await page.$('#filePourMultiple')
  await fileInput.uploadFile(filePath)

  console.log('Gonna upload the document')

  await Promise.all([
    page.click('#boutonAjouterFichier + noscript input[type="submit"]'),
    page.waitForNavigation(),
  ])

  console.log('Gonna check that the document was uploaded')

  await page.waitFor('#multi-upload .nom-doc')

  console.log('Gonna validate')
  await clickAndWaitForNavigation('input[type="submit"][value="Valider"]')
  // Get to the confirmation page

  console.log('Waiting 5s before moving on')

  // Waiting for 5000ms. At this step, a preview of pdf is displayed in the browser
  // And everything crashes if we try to validate right away.
  // So we let the time to Chrome to finish whatever it's doing before moving on.
  await page.waitFor(5000)

  console.log('Gonna do final confirmation')

  await clickAndWaitForNavigation('input[type="submit"][value="Confirmer"]')

  // waitForNavigation crashes here, so we wait for this block to be displayed to
  // be sure we are on the confirmation page
  await page.waitFor('.block.confirmation')
  // Finished.
  await page.setJavaScriptEnabled(true)
}

async function sendAllDocuments(declaration) {
  const files = [
    {
      boolField: 'hasTrained',
      docField: 'trainingDocument',
      label: 'Formation',
      selectOptionValue: DOC_SITUATION_SELECT_VALUES.INTERNSHIP_OR_TRAINING,
    },
    {
      boolField: 'hasInternship',
      docField: 'internshipDocument',
      label: 'Stage',
      selectOptionValue: DOC_SITUATION_SELECT_VALUES.INTERNSHIP_OR_TRAINING,
    },
    {
      boolField: 'hasSickLeave',
      docField: 'sickLeaveDocument',
      label: 'Congé Maladie',
      selectOptionValue: DOC_SITUATION_SELECT_VALUES.SICK_LEAVE,
    },
    {
      boolField: 'hasMaternityLeave',
      docField: 'maternityLeaveDocument',
      label: 'Congé maternité',
      // No specific value for this.
      selectOptionValue: DOC_SITUATION_SELECT_VALUES.SICK_LEAVE,
    },
    {
      boolField: 'hasRetirement',
      docField: 'retirementDocument',
      label: 'Retraite',
      selectOptionValue: DOC_SITUATION_SELECT_VALUES.RETIREMENT,
    },
    {
      boolField: 'hasInvalidity',
      docField: 'invalidityDocument',
      label: 'Invalidité',
      selectOptionValue: DOC_SITUATION_SELECT_VALUES.INVALIDITY,
    },
  ]
    .reduce((prev, fields) => {
      if (!declaration[fields.boolField]) return prev
      return prev.concat({
        filePath: `${uploadsDirectory}${declaration[fields.docField]}`,
        label: fields.label,
        selectOptionValue: fields.selectOptionValue,
      })
    }, [])
    .concat(
      declaration.employers.map(
        ({ employerName, file, hasEndedThisMonth }) => ({
          filePath: `${uploadsDirectory}${file}`,
          label: `Employeur - ${employerName}`,
          selectOptionValue: DOC_SITUATION_SELECT_VALUES.ACTIVITY_WITH_SALARY,
          isFileCertificate: hasEndedThisMonth,
        }),
      ),
    )
    .map(({ label, ...rest }) => ({
      label: `${label} - ${format(
        declaration.declarationMonth.month,
        'MM-YYYY',
      )}`,
      ...rest,
    }))

  for (const file of files) {
    await sendDocument(file)
  }
}

module.exports = (async () => {
  const browser = await puppeteer.connect({
    browserWSEndpoint: 'ws://browserless:3000',
  })
  page = await browser.newPage()
  // page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))
  page.on('close', (msg) => console.log('page closed', msg))
  page.on('error', (error) => console.log('page closed', error))

  // Prevent PDF preview from loading (causes crashes)
  await page.setRequestInterception(true)
  page.on('request', (interceptedRequest) => {
    console.log(interceptedRequest.url())
    if (
      interceptedRequest
        .url()
        .includes(
          '/candidat/situationadministrative/uploaddocuments/previsualiserdocument:generationdupdf/false/$N',
        )
    ) {
      interceptedRequest.abort()
    } else {
      interceptedRequest.continue()
    }
  })

  const declaration = await Declaration.query()
    .eager('[employers, declarationMonth]')
    .findById(68) // for tests purposes, 67 is ingrid, 68 is hugo

  console.log(
    'Here is the declaration we will replicate',
    JSON.stringify(declaration, null, 2),
  )

  try {
    console.log('start')
    await login()
    console.log('finished login')
    await doDeclaration(declaration)
    console.log('finished declaration')
    await sendAllDocuments(declaration)

    await screenshot()
    console.log('success')
    process.exit(0)
  } catch (e) {
    console.error(e)
    console.log('failure')
    await screenshot()
    // const content = await page.content()
    // console.log(content)
    process.exit(1)
  }
})()
