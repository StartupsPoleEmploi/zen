// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

const MAX_WAIT_TIME = 180000
const startTime = Date.now()

/*
 * This code is weird. Keep in mind that cypress will wait for its (bluebird) promises
 * before moving on after cy.request calls, which means that Promise.all can't be used
 * and that calls to cy.request will be equivalent to calls with an `await`
 *
 * This function's goal is to resolve when the app is ready (which means that nginx / node / front
 * will all be ready).
 */
const waitForAppToBeReady = () => {
  if (Date.now() - startTime > MAX_WAIT_TIME) {
    throw new Error('App not ready in time')
  }

  cy.request({
    url: '/api/ping',
    method: 'GET',
    failOnStatusCode: false,
  }).then((res) => {
    if (res.status !== 200) {
      return waitForAppToBeReady()
    }
  })

  cy.request({
    url: '/',
    method: 'GET',
    failOnStatusCode: false,
  }).then((res) => {
    if (res.status !== 200) {
      return waitForAppToBeReady()
    }
  })

  cy.clearCookies()
  cy.request({
    url: '/api/user',
    method: 'GET',
    failOnStatusCode: false,
  })
}

before(() => waitForAppToBeReady())
