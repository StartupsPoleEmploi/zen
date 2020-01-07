const NodeMailjet = require('node-mailjet')
const { addDays, format } = require('date-fns')
const superagent = require('superagent')
const { get } = require('lodash')
const config = require('config')

const isProd = process.env.NODE_ENV === 'production'
const LIST_ID = isProd ? 14703 : 10129294 // id of prod list / a test list with devs

if (!process.env.EMAIL_KEY || !process.env.EMAIL_KEY_SECRET) {
  throw new Error('Mailjet info is not configured')
}

const mailjet = NodeMailjet.connect(
  process.env.EMAIL_KEY,
  process.env.EMAIL_KEY_SECRET,
  { version: 'v3.1' },
)

const sendMail = (opts) =>
  mailjet.post('send', { version: 'v3.1' }).request({
    // Mailjet *will* send e-mails out of prod if this line is removed
    SandboxMode: !isProd,
    ...opts,
    Messages: opts.Messages.map((message) => ({
      ...message,
      To: isProd ? message.To : [{ Email: config.get('testEmail') }],
    })),
  })

const manageContact = ({ email, name, properties }) =>
  mailjet
    .post('contactslist', { version: 'v3' })
    .id(LIST_ID)
    .action('managecontact')
    .request({
      Email: email,
      name,
      Properties: properties,
      Action: 'addnoforce',
    })

const formatDateForSegmentFilter = (date) =>
  parseInt(format(date, 'YYYYMM'), 10)

// https://dev.mailjet.com/reference/email/contacts/contact-list/
const deleteUser = (email) =>
  mailjet
    .post('contactslist', { version: 'v3' })
    .id(LIST_ID)
    .action('managecontact')
    .request({
      Email: email,
      Action: 'remove',
    })

// https://github.com/mailjet/api-documentation/blob/master/guides/_exclusionlist.md
const setExcludedUserFromCampaigns = (email, toExclude) =>
  mailjet
    .put('contact', { version: 'v3' })
    .id(email)
    .request({
      IsExcludedFromCampaigns: toExclude ? "true" : "false",
    }).catch((error) => {
      // Not Modified 
      if (error.statusCode === 304) return true; 
      throw error;
    })

module.exports = {
  sendMail,
  manageContact,
  deleteUser,
  setExcludedUserFromCampaigns,

  changeContactEmail: ({ oldEmail, newEmail }) =>
    mailjet
      .post('contactslist', { version: 'v3' })
      .id(LIST_ID)
      .action('managecontact')
      .request({
        Email: oldEmail,
        Action: 'remove',
      })
      .then((res) => {
        if (!res.body.Count === 1) throw new Error('No contact to remove')
        const { Name: name, Properties: properties } = res.body.Data[0]
        return manageContact({ email: newEmail, name, properties })
      }),

  createSegment: (opts) =>
    mailjet.post('contactfilter', { version: 'v3' }).request(opts),

  createCampaignDraft: (opts) =>
    mailjet.post('campaigndraft', { version: 'v3' }).request({
      Locale: 'fr_FR',
      Sender: "L'équipe Zen Pôle emploi",
      SenderName: "L'équipe Zen Pôle emploi",
      SenderEmail: 'no-reply@zen.pole-emploi.fr',
      ContactsListID: LIST_ID,
      ...opts,
    }),

  getTemplate: (id) =>
    mailjet
      .get('template', { version: 'v3' })
      .id(id)
      .action('detailcontent')
      .request()
      .then((result) => {
        const { 'Html-part': html, 'Text-part': text } = get(
          result,
          'body.Data.0',
          {},
        )
        if (!html || !text) {
          throw new Error(`No HTML or text part for template ${id}`)
        }

        return { html, text }
      }),

  setTemplate: (id, opts) =>
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
        }* est programmé et sera effectué le *${format(
          scheduledDate,
          'DD/MM/YYYY à HH:mm',
        )}*. Merci d'en vérifier les détails à l'adresse https://app.mailjet.com/campaigns`

        return superagent.post(process.env.SLACK_WEBHOOK_SU_ZEN, {
          text: message,
        })
      })
  },

  authorizeContactsAndSendConfirmationEmails: ({ users, activeMonth }) =>
    (isProd
      ? mailjet
          .post('contactslist', { version: 'v3' })
          .id(LIST_ID)
          .action('managemanycontacts')
          .request({
            Action: 'addnoforce',
            Contacts: users.map((user) => ({
              Email: user.email,
              Properties: {
                validation_necessaire: false,
                // If we activate users during a declaration period, we don't want to send them
                // reminder during this period, as they may already have done their declarations
                // using pe.fr
                declaration_effectuee_mois: activeMonth
                  ? formatDateForSegmentFilter(activeMonth)
                  : undefined,
                document_envoye_mois: activeMonth
                  ? formatDateForSegmentFilter(activeMonth)
                  : undefined,
              },
            })),
          })
      : Promise.resolve()
    ).then(() =>
      // sends in bulk, one separate email per user
      // not enforced here, but the limit on API 3.1 is 50 messages / call
      sendMail({
        Messages: users.map((user) => ({
          From: {
            Email: 'no-reply@zen.pole-emploi.fr',
            Name: `L'équipe Zen`,
          },
          To: [
            {
              Email: user.email,
              Name: `${user.firstName} ${user.lastName}`,
            },
          ],
          TemplateID: 725394,
          TemplateLanguage: true,
          Subject: `Bienvenue sur Zen !`,

          CustomCampaign: 'Confirmation de validation',
        })),
      }),
    ),

  formatDateForSegmentFilter,
}
