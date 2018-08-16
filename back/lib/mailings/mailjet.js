const NodeMailjet = require('node-mailjet')

const TEST_LIST_ID = 18516

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
      .id(TEST_LIST_ID)
      .action('managecontact')
      .request({
        Email: email,
        name,
        Properties: properties,
        Action: 'addnoforce',
      }),
}
