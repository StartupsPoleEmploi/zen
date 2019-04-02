/* eslint-disable no-await-in-loop */

const mailjet = require('../lib/mailings/mailjet')

// enter here emails
const emails = []

async function doWork() {
  for (const email of emails) {
    /*
     * Add integer values like 201902 (for february 2019) for
     * document_envoye_mois
     * declaration_effectuee_mois
     * to set users as already done for the current month.
     */

    await mailjet.manageContact({
      email,
      properties: {
        validation_necessaire: false,
      },
    })
    console.log(email)
  }
}

doWork().then(() => console.log('done'))
