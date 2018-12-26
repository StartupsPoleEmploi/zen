async function clickAndWaitForNavigation(page, selector) {
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click(selector),
  ])
}

module.exports = {
  clickAndWaitForNavigation,
}
