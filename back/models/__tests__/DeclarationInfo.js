const { startOfMonth, endOfMonth } = require('date-fns')
const DeclarationInfo = require('../DeclarationInfo')

const now = new Date()
const pastDate = startOfMonth(now)
const futureDate = endOfMonth(now)

describe('DeclarationInfo Model', () => {
  describe('Validation', () => {
    const typesToTest = [
      'internship',
      'sickLeave',
      'maternityLeave',
      'retirement',
      'invalidity',
      'jobSearch',
    ]

    typesToTest.forEach((type) => {
      describe(type, () => {
        test(`rejects without infos`, () => {
          expect(() =>
            DeclarationInfo.fromJson({
              type,
            }).$validate(),
          ).toThrow()
        })

        if (type === 'internship' || type === 'sickLeave') {
          test(`accept with correct infos`, () => {
            DeclarationInfo.fromJson({
              type,
              startDate: pastDate,
              endDate: futureDate,
            }).$validate()
          })

          test(`rejects with out of order infos`, () => {
            expect(() =>
              DeclarationInfo.fromJson({
                type,
                startDate: futureDate,
                endDate: pastDate,
              }).$validate(),
            ).toThrow()
          })

          test(`rejects with no start date`, () => {
            expect(() =>
              DeclarationInfo.fromJson({ type, endDate: pastDate }).$validate(),
            ).toThrow()
          })
          test(`rejects with no end date`, () => {
            expect(() =>
              DeclarationInfo.fromJson({ type, endDate: pastDate }).$validate(),
            ).toThrow()
          })
        }

        if (
          type === 'maternityLeave' ||
          type === 'retirement' ||
          type === 'invalidity'
        ) {
          test(`accept with correct infos`, () => {
            DeclarationInfo.fromJson({
              type,
              startDate: pastDate,
            }).$validate()
          })

          test(`rejects with no start date`, () => {
            expect(() =>
              DeclarationInfo.fromJson({ type, endDate: pastDate }).$validate(),
            ).toThrow()
          })
        }

        if (type === 'jobSearch') {
          test(`accept with correct infos`, () => {
            DeclarationInfo.fromJson({ type, endDate: pastDate }).$validate()
          })
          test(`rejects with no end date`, () => {
            expect(() =>
              DeclarationInfo.fromJson({
                type,
                startDate: pastDate,
              }).$validate(),
            ).toThrow()
          })
        }
      })
    })
  })
})
