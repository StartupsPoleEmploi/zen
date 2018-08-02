const NodeMailjet = require('node-mailjet')

if (!process.env.EMAIL_KEY || !process.env.EMAIL_KEY_SECRET) {
  throw new Error('Mailjet info is not configured')
}

const mailjet = NodeMailjet.connect(
  process.env.EMAIL_KEY,
  process.env.EMAIL_KEY_SECRET,
  { version: 'v3.1' },
)

module.exports = (opts) =>
  mailjet.post('send', { version: 'v3.1' }).request(opts)
