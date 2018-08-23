const NodeMailjet = require('node-mailjet')
const { addDays } = require('date-fns')

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

  createContact: ({ email, name, properties }) =>
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

  scheduleCampaign: (id) =>
    mailjet
      .post('campaigndraft', { version: 'v3' })
      .id(id)
      .action('schedule')
      .request({
        date: addDays(new Date(), 1),
      }),

  sendCampaign: (id) =>
    mailjet
      .post('campaigndraft', { version: 'v3' })
      .id(id)
      .action('send')
      .request(),
}
