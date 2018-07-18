/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
const { format } = require('date-fns')
const { clickAndWaitForNavigation } = require('./utils')
const spawnBrowserPage = require('./spawn-browser-page')
const login = require('./login')

const isProd = process.env.NODE_ENV === 'production'
const REDIRECTION_TO_DECLARATION_URL = isProd
  ? 'https://authentification-candidat.pole-emploi.fr/compte/redirigervers?url=https://actualisation-authent.pole-emploi.fr/acces.htm&actu=true'
  : 'https://authentification-candidat-r.pe-qvr.fr/compte/redirigervers?url=https://actualisation-authent.pe-qvr.fr/acces.htm&actu=true'

module.exports = async function sendDeclaration(declaration) {
  const page = await spawnBrowserPage()
  await login(page, declaration.user)

  await page.goto(REDIRECTION_TO_DECLARATION_URL)

  await page.waitFor('.group-set')
  // A page has loaded. We're either on the page to start the declaration
  // Or on the page to warn us it's been modified or that we can't do the
  // declaration anymore.
  // In that case, we print a warning and exit this page

  const isNormalDeclarationPage = await page.$('.note-form')
  if (!isNormalDeclarationPage) {
    console.warn(
      `Warning : Declaration already done or unavailable. Exiting Declaration update.`,
    )
    return
  }

  await page.waitFor('#formationBloc')

  await page.click(declaration.hasTrained ? '#formationOui' : '#formationNon')

  // page change
  try {
    await clickAndWaitForNavigation(
      page,
      '.nav.button-list button[type=submit]',
    )
  } catch (e) {
    // We've waited until the timeout, which means something has hanged.
    // Still, the page's js may have been loaded so we still try to fill in the form
    // without exiting
    console.warn('declaration hanging, will try to continue', e)
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
    await clickAndWaitForNavigation(page, 'button.js-only[type="submit"]')

    const hiddenInconsistencyInput = await page.$(
      'input[name="incoherenceValidee"]',
    )

    if (hiddenInconsistencyInput) {
      // Do this once more in case we went on inconsistency page.

      await clickAndWaitForNavigation(page, 'button.js-only[type="submit"]')
    }

    await clickAndWaitForNavigation(page, 'button.js-only[type="submit"]')

    // Ensure we got on the final redirection page by checking the link to the
    // confirmation pdf exists.
    await page.waitFor('.pdf-fat-link')

    await declaration.$query().patch({ isTransmitted: true })
  }
}
