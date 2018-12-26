const puppeteer = require('puppeteer')

module.exports = async () => {
  const browser = await puppeteer.connect({
    browserWSEndpoint: 'ws://browserless:3000',
  })
  const page = await browser.newPage()

  // Try to prevent PDF preview from loading (causes crashes)
  await page.setRequestInterception(true)
  page.on('request', (interceptedRequest) => {
    if (
      interceptedRequest
        .url()
        .includes(
          '/candidat/situationadministrative/uploaddocuments/previsualiserdocument:generationdupdf/false/$N',
        )
    ) {
      interceptedRequest.abort()
    } else {
      interceptedRequest.continue()
    }
  })

  return page
}
