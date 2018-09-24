const NodeMailjet = require('node-mailjet')
const { addDays, format } = require('date-fns')
const superagent = require('superagent')
const { get } = require('lodash')

const LIST_ID = process.env.NODE_ENV === 'production' ? 14703 : 19487

if (!process.env.EMAIL_KEY || !process.env.EMAIL_KEY_SECRET) {
  throw new Error('Mailjet info is not configured')
}

const mailjet = NodeMailjet.connect(
  process.env.EMAIL_KEY,
  process.env.EMAIL_KEY_SECRET,
  { version: 'v3.1' },
)

module.exports = {
  sendMail: (opts) =>
    mailjet.post('send', { version: 'v3.1' }).request({
      // Mailjet *will* send e-mails out of prod if this line is removed
      SandboxMode: process.env.NODE_ENV !== 'production',
      ...opts,
    }),

  manageContact: ({ email, name, properties }) =>
    mailjet
      .post('contactslist', { version: 'v3' })
      .id(LIST_ID)
      .action('managecontact')
      .request({
        Email: email,
        name,
        Properties: properties,
        Action: 'addnoforce',
      }),

  createSegment: (opts) =>
    mailjet.post('contactfilter', { version: 'v3' }).request(opts),

  createCampaignDraft: (opts) =>
    mailjet.post('campaigndraft', { version: 'v3' }).request({
      Locale: 'fr_FR',
      Sender: "L'équipe Zen",
      SenderName: "L'équipe Zen",
      SenderEmail: 'no-reply@zen.pole-emploi.fr',
      ContactsListID: LIST_ID,
      ...opts,
    }),

  getCampaignTemplate: (id) =>
    mailjet
      .get('template', { version: 'v3' })
      .id(id)
      .action('detailcontent')
      .request(),

  setCampaignTemplate: (id, opts) =>
    mailjet
      .post('campaigndraft', { version: 'v3' })
      .id(id)
      .action('detailcontent')
      .request(opts),

  sendCampaignTest: (id) =>
    mailjet
      .post('campaigndraft', { version: 'v3' })
      .id(id)
      .action('test')
      .request({
        Recipients: [
          {
            Email: 'hugo@codeheroics.com',
            Name: 'Hugo Agbonon (Test Dev)',
          },
        ],
      }),

  scheduleCampaign: (id, opts = {}) => {
    const scheduledDate = opts.Date || addDays(new Date(), 1)

    return mailjet
      .post('campaigndraft', { version: 'v3' })
      .id(id)
      .action('schedule')
      .request({
        Date: scheduledDate,
        ...opts,
      })
      .then(() =>
        mailjet
          .get('campaigndraft', { version: 'v3' })
          .id(id)
          .request(),
      )
      .then((response) => {
        const campaignInfos = get(response, 'body.Data.0', {})

        if (!process.env.SLACK_WEBHOOK_SU_ZEN) return

        const message = `L'envoi de la campagne e-mail *${
          campaignInfos.Title
        }* est programmé et sera effectuée le *${format(
          scheduledDate,
          'DD/MM/YYYY à HH:mm',
        )}*. Merci de vérifier le segment utilisé à l'adresse https://app.mailjet.com/segmentation/edit/${
          campaignInfos.SegmentationID
        } en vérifiant le nombre d'utilisateurs concernés (sélectionner la liste « Utilisateurs » et appuyer sur « Calculer »)`

        return superagent.post(process.env.SLACK_WEBHOOK_SU_ZEN, {
          text: message,
        })
      })
  },

  formatDateForSegmentFilter: (date) => parseInt(format(date, 'YYYYMM'), 10),
}
