const { startOfMonth, endOfMonth } = require('date-fns')
const DeclarationDate = require('../DeclarationDate')

const now = new Date()
const pastDate = startOfMonth(now)
const futureDate = endOfMonth(now)

describe('DeclarationDate Model', () => {
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
        test(`rejects without dates`, () => {
          expect(() =>
            DeclarationDate.fromJson({
              type,
            }).$validate(),
          ).toThrow()
        })

        if (type === 'internship' || type === 'sickLeave') {
          test(`accept with correct dates`, () => {
            DeclarationDate.fromJson({
              type,
              startDate: pastDate,
              endDate: futureDate,
            }).$validate()
          })

          test(`rejects with out of order dates`, () => {
            expect(() =>
              DeclarationDate.fromJson({
                type,
                startDate: futureDate,
                endDate: pastDate,
              }).$validate(),
            ).toThrow()
          })

          test(`rejects with no start date`, () => {
            expect(() =>
              DeclarationDate.fromJson({ type, endDate: pastDate }).$validate(),
            ).toThrow()
          })
          test(`rejects with no end date`, () => {
            expect(() =>
              DeclarationDate.fromJson({ type, endDate: pastDate }).$validate(),
            ).toThrow()
          })
        }

        if (
          type === 'maternityLeave' ||
          type === 'retirement' ||
          type === 'invalidity'
        ) {
          test(`accept with correct dates`, () => {
            DeclarationDate.fromJson({
              type,
              startDate: pastDate,
            }).$validate()
          })

          test(`rejects with no start date`, () => {
            expect(() =>
              DeclarationDate.fromJson({ type, endDate: pastDate }).$validate(),
            ).toThrow()
          })
        }

        if (type === 'jobSearch') {
          test(`accept with correct dates`, () => {
            DeclarationDate.fromJson({ type, endDate: pastDate }).$validate()
          })
          test(`rejects with no end date`, () => {
            expect(() =>
              DeclarationDate.fromJson({
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
