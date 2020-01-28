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

async function sendMail(opts) {
  return mailjet.post('send', { version: 'v3.1' }).request({
    // Mailjet *will* send e-mails out of prod if this line is removed
    SandboxMode: !isProd,
    ...opts,
    Messages: opts.Messages.map((message) => ({
      ...message,
      To: isProd ? message.To : [{ Email: config.get('testEmail') }],
    })),
  })
}

async function manageContact({ email, name, properties }) {
  return mailjet.post('contactslist', { version: 'v3' })
    .id(LIST_ID)
    .action('managecontact')
    .request({
      Email: email,
      name,
      Properties: properties,
      Action: 'addnoforce',
    })
}
  
function formatDateForSegmentFilter(date) {
  return parseInt(format(date, 'YYYYMM'), 10)
}

// https://dev.mailjet.com/reference/email/contacts/contact-list/
async function deleteUser(email) {
  return mailjet.post('contactslist', { version: 'v3' })
    .id(LIST_ID)
    .action('managecontact')
    .request({
      Email: email,
      Action: 'remove',
    })
}

async function getUser(email) {
  return mailjet.get('contact', { version: 'v3' })
    .id(email)
    .request()
    .then(({body}) => {
      if (body && body.Data.length) return body.Data[0];
      return null;
    }).catch(error => {
      if (error.statusCode === 404) return null;
      throw error;
    })
}

// https://github.com/mailjet/api-documentation/blob/master/guides/_exclusionlist.md
async function setExcludedUserFromCampaigns(email, toExclude) {
  return mailjet.put('contact', { version: 'v3' })
    .id(email)
    .request({
      IsExcludedFromCampaigns: toExclude ? "true" : "false",
    }).catch((error) => {
      // Not Modified 
      if (error.statusCode === 304) return true; 
      throw error;
    })
}

async function addUser(user) {
  return manageContact({
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    properties: {
      nom: user.lastName,
      prenom: user.firstName,
    },
  })
}

async function changeContactEmail({ oldEmail, newEmail }) {
  return mailjet.post('contactslist', { version: 'v3' })
  .id(LIST_ID)
  .action('managecontact')
  .request({ Email: oldEmail, Action: 'remove' })
  .then((res) => {
    if (!res.body.Count === 1) throw new Error('No contact to remove')
    const { Name: name, Properties: properties } = res.body.Data[0]
    return manageContact({ email: newEmail, name, properties })
  })
}

async function createSegment(opts) {
  return mailjet.post('contactfilter', { version: 'v3' }).request(opts)
}

async function createCampaignDraft(opts) {
  return mailjet.post('campaigndraft', { version: 'v3' }).request({
    Locale: 'fr_FR',
    Sender: "L'équipe Zen Pôle emploi",
    SenderName: "L'équipe Zen Pôle emploi",
    SenderEmail: 'no-reply@zen.pole-emploi.fr',
    ContactsListID: LIST_ID,
    ...opts,
  })
}

async function getTemplate(id) {
  const result = await mailjet.get('template', { version: 'v3' })
    .id(id)
    .action('detailcontent')
    .request();

  const { 
    'Html-part': html, 
    'Text-part': text 
  } = get( result, 'body.Data.0', {})
  if (!html || !text) {
    throw new Error(`No HTML or text part for template ${id}`)
  }

  return { html, text }
}

async function setTemplate(id, opts) {
  return mailjet.post('campaigndraft', { version: 'v3' })
    .id(id)
    .action('detailcontent')
    .request(opts)
}

async function sendCampaignTest(id) {
  return mailjet.post('campaigndraft', { version: 'v3' })
    .id(id)
    .action('test')
    .request({
      Recipients: [
        {
          Email: 'hugo@codeheroics.com',
          Name: 'Hugo Agbonon (Test Dev)',
        },
      ],
    })
}

async function scheduleCampaign(id, opts = {}) {
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
}

module.exports = {
  // user
  addUser,
  manageContact,
  deleteUser,
  setExcludedUserFromCampaigns,
  changeContactEmail,
  getUser,

  // email
  sendMail,
  createSegment,
  createCampaignDraft,
  getTemplate,
  setTemplate,
  sendCampaignTest,
  scheduleCampaign,
  formatDateForSegmentFilter,
}
