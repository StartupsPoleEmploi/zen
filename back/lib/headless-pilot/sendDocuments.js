/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
const { transaction } = require('objection')
const { format } = require('date-fns')
const spawnBrowserPage = require('./spawn-browser-page')
const login = require('./login')

const { clickAndWaitForNavigation } = require('./utils')
const { uploadsDirectory } = require('../../config/default')
const ActivityLog = require('../../models/ActivityLog')

const isProd = process.env.NODE_ENV === 'production'
const SEND_DOCUMENTS_URL = isProd
  ? 'https://candidat.pole-emploi.fr/candidat/situationadministrative/uploaddocuments/tableaudebord.boutonenvoyer'
  : 'https://candidat-r.pe-qvr.fr/candidat/situationadministrative/uploaddocuments/tableaudebord.boutonenvoyer'

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
  SALARY_SHEET: 'BDS',
  EMPLOYER_CERTIFICATE: 'AEMP',
  WORK_CONTRACT: 'CDT',
  SICK_LEAVE_CERTIFICATE: 'AAT',
}

async function sendOneDocument(
  page,
  { filePath, isFileCertificate, label, selectOptionValue },
) {
  await page.setJavaScriptEnabled(false)

  // We specifically wait for the options inside the selects to appear
  // This is because when the select appear, the options
  // may not be loaded, are they seem to be loaded via ajax.
  await page.goto(SEND_DOCUMENTS_URL)

  await page
    .select('#listeDeroulanteContexte', DOC_CONTEXT.DECLARATION)
    .catch((e) => console.log('error in select #listeDeroulanteContexte', e))

  // We catch when the promise fail as sometimes the selects throw, but have correctly worked
  // If they didn't work, the next instructions will fail anyway.
  await Promise.all([
    page.waitForNavigation(),
    page.click('#listeDeroulanteContexte + noscript input[type="submit"]'),
  ])

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
  } else if (selectOptionValue === DOC_SITUATION_SELECT_VALUES.SICK_LEAVE) {
    await page.select(
      '#listeDeroulanteTypeDocument',
      DOC_TYPE_SELECT_VALUES.SICK_LEAVE_CERTIFICATE,
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

  await page.focus('#nomDocument')
  await page.click('#nomDocument', { clickCount: 3 })
  await page.keyboard.type(label)

  await clickAndWaitForNavigation(page, 'input[type="submit"][value="Valider"]')

  const fileInput = await page.$('#filePourMultiple')
  await fileInput.uploadFile(filePath)

  await Promise.all([
    page.click('#boutonAjouterFichier + noscript input[type="submit"]'),
    page.waitForNavigation(),
  ])

  await page.waitFor('#multi-upload .nom-doc')

  await clickAndWaitForNavigation(page, 'input[type="submit"][value="Valider"]')
  // Get to the confirmation page

  // Waiting for 5000ms. At this step, a preview of pdf is displayed in the browser
  // And everything crashes if we try to validate right away.
  // So we let the time to Chrome to finish whatever it's doing before moving on.
  // (We have configurated the browser to intercept the pdf loading
  // but the wait still helps)
  await page.waitFor(5000)

  const url = await page.url()
  if (!url.includes('previsualiserdocument')) {
    throw new Error(`Couldn't get to previsualisation page.`)
  }

  await clickAndWaitForNavigation(
    page,
    'input[type="submit"][value="Confirmer"]',
  )

  // waitForNavigation crashes here, so we wait for this block to be displayed to
  // be sure we are on the confirmation page
  await page.waitFor('.block.confirmation')
  // Finished.
  await page.setJavaScriptEnabled(true)
}

async function sendDocuments(declaration) {
  const page = await spawnBrowserPage()
  await login(page, declaration.user)

  const documentsFormData = [
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
      if (!declaration[fields.boolField] || !declaration[fields.docField])
        return prev
      return prev.concat({
        filePath: `${uploadsDirectory}${declaration[fields.docField].file}`,
        label: fields.label,
        selectOptionValue: fields.selectOptionValue,
        document: declaration[fields.docField],
      })
    }, [])
    .concat(
      declaration.employers.reduce(
        (prev, { employerName, document, hasEndedThisMonth }) => {
          if (!document || !document.file) return prev
          return prev.concat({
            filePath: `${uploadsDirectory}${document.file}`,
            label: `${hasEndedThisMonth ? 'AE' : 'BS'} - ${employerName}`,
            selectOptionValue: DOC_SITUATION_SELECT_VALUES.ACTIVITY_WITH_SALARY,
            isFileCertificate: hasEndedThisMonth,
            document,
          })
        },
        [],
      ),
    )
    .map(({ label, ...rest }) => ({
      label: `${label} - ${format(
        declaration.declarationMonth.month,
        'MM-YYYY',
      )}`,
      ...rest,
    }))
    .filter(({ document }) => !document.isTransmitted)

  let hasException = false

  for (const documentFormData of documentsFormData) {
    console.log(
      `Going send document ${documentFormData.label} (id: ${
        documentFormData.document.id
      })`,
    )
    try {
      await sendOneDocument(page, documentFormData).then(() =>
        transaction(ActivityLog.knex(), (trx) =>
          Promise.all([
            documentFormData.document
              .$query(trx)
              .patch({ isTransmitted: true }),
            ActivityLog.query(trx).insert({
              userId: declaration.user.id,
              action: ActivityLog.actions.TRANSMIT_FILE,
              metadata: JSON.stringify({ file: documentFormData.label }),
            }),
          ]),
        ),
      )
    } catch (e) {
      hasException = true
      console.error(
        `Error sending some documents from declaration ${
          declaration.id
        } (docId: ${documentFormData.document.id})`,
        e,
      )
    }

    if (hasException) {
      throw new Error(
        `Error sending some documents from declaration ${declaration.id}`,
      )
    }
  }
}

module.exports = sendDocuments
