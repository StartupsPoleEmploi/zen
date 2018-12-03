const puppeteer = require('puppeteer')

module.exports = async () => {
  const browser = await puppeteer.connect({
    browserWSEndpoint: 'ws://browserless:3000',
  })
  const page = await browser.newPage()
  // remove "HeadlessChrome" from the user agent to avoid being blocked
  await page.setUserAgent(
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3466.0 Safari/537.36',
  )
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
