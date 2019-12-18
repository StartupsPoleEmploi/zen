const puppeteer = require('puppeteer')
const { Readable } = require('stream')

const htmlToPdf = async (html, options = {}) => {
  const browser = await puppeteer.launch({
    // Those options are needed to work on Heroku
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'networkidle0' })
  await page.emulateMedia('print')

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    ...options,
  })
  const stream = new Readable()
  stream.push(pdfBuffer)
  stream.push(null)
  const size = pdfBuffer.length
  await browser.close()

  // @see: https://github.com/box/box-node-sdk/issues/143#issuecomment-307539138
  stream.httpVersion = '1.0'
  stream.headers = { 'content-length': size }

  return pdfBuffer
}

module.exports = {
  htmlToPdf,
}
