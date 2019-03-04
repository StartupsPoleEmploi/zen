const {
  BelongsToOneRelation,
  HasManyRelation,
  HasOneRelation,
  ValidationError,
} = require('objection')
const { isAfter, isValid } = require('date-fns')
const { get } = require('lodash')

const BaseModel = require('./BaseModel')

class Declaration extends BaseModel {
  static get tableName() {
    return 'declarations'
  }

  $beforeValidate(jsonSchema, json, opt) {
    const objectToValidate = { ...opt.old, ...json }
    const { dates, isLookingForJob, jobSearchStopMotive } = objectToValidate

    const throwValidationError = (label) => {
      throw new ValidationError({
        message: label,
        type: 'DeclarationValidationError',
      })
    }

    const validateDates = (key, datesToValidate) => {
      if (!objectToValidate[key]) return
      datesToValidate.forEach((date) => {
        if (!isValid(new Date(date))) throwValidationError(key)
      })
      if (
        datesToValidate.length === 2 &&
        isAfter(datesToValidate[0], datesToValidate[1])
      ) {
        throwValidationError(key)
      }
    }

    if (objectToValidate.hasInternship) {
      if (!dates || !dates.internships || !dates.internships.length) {
        throwValidationError('internships')
      }
      dates.internships.forEach(({ startDate, endDate }) =>
        validateDates('hasInternship', [startDate, endDate]),
      )
    }
    if (objectToValidate.hasSickLeave) {
      if (!dates || !dates.sickLeaves || !dates.sickLeaves.length) {
        throwValidationError('sickLeaves')
      }
      dates.sickLeaves.forEach(({ startDate, endDate }) =>
        validateDates('hasSickLeave', [startDate, endDate]),
      )
    }

    validateDates('hasMaternityLeave', [get(dates, 'maternityLeave.startDate')])
    validateDates('hasRetirement', [get(dates, 'retirement.startDate')])
    validateDates('hasInvalidity', [get(dates, 'invalidity.startDate')])

    if (!isLookingForJob) {
      if (!isValid(new Date(get(dates, 'jobSearch.endDate')))) {
        throwValidationError('isLookingForJob - jobSearchDate')
      }
      if (!jobSearchStopMotive) {
        throwValidationError('isLookingForJob - stopJobSearchMotive')
      }
    }
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'userId',
        'hasWorked',
        'hasTrained',
        'hasInternship',
        'hasSickLeave',
        'hasMaternityLeave',
        'hasRetirement',
        'hasInvalidity',
        'isLookingForJob',
        'hasFinishedDeclaringEmployers',
      ],

      properties: {
        id: { type: 'integer' },
        userId: { type: 'integer' },
        monthId: { type: ['integer'] },
        hasWorked: { type: 'boolean' },
        hasTrained: { type: 'boolean' },
        hasInternship: { type: 'boolean' },
        hasSickLeave: { type: 'boolean' },
        hasMaternityLeave: { type: 'boolean' },
        hasRetirement: { type: 'boolean' },
        hasInvalidity: { type: 'boolean' },
        isLookingForJob: { type: 'boolean' },
        jobSearchStopMotive: { type: ['string', 'null'] },
        hasFinishedDeclaringEmployers: {
          default: false,
          type: 'boolean',
        },
        isFinished: {
          default: false,
          type: 'boolean',
        },
        isEmailSent: {
          default: false,
          type: 'boolean',
        },
        isDocEmailSent: {
          default: false,
          type: 'boolean',
        },
        metadata: { type: 'object' },
        dates: {
          type: 'object',
          properties: {
            internships: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  startDate: { type: 'date' },
                  endDate: { type: 'date' },
                },
              },
            },
            sickLeaves: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  startDate: { type: 'date' },
                  endDate: { type: 'date' },
                },
              },
            },
            maternityLeave: {
              type: 'object',
              properties: {
                startDate: { type: 'date' },
              },
            },
            retirement: {
              type: 'object',
              properties: {
                startDate: { type: 'date' },
              },
            },
            invalidity: {
              type: 'object',
              properties: {
                startDate: { type: 'date' },
              },
            },
            jobSearch: {
              type: 'object',
              properties: {
                endDate: { type: 'date' },
              },
            },
            transmittedAt: { type: ['date', 'null'] },
          },
        },
      },
    }
  }

  // This object defines the relations to other models.
  static get relationMappings() {
    return {
      user: {
        relation: BelongsToOneRelation,
        modelClass: `${__dirname}/User`,
        join: {
          from: 'declarations.userId',
          to: 'Users.id',
        },
      },
      employers: {
        relation: HasManyRelation,
        modelClass: `${__dirname}/Employer`,
        join: {
          from: 'declarations.id',
          to: 'employers.declarationId',
        },
      },
      declarationMonth: {
        relation: BelongsToOneRelation,
        modelClass: `${__dirname}/DeclarationMonth`,
        join: {
          from: 'declarations.monthId',
          to: 'declaration_months.id',
        },
      },
      documents: {
        relation: HasManyRelation,
        modelClass: `${__dirname}/DeclarationDocument`,
        join: {
          from: 'declarations.id',
          to: 'declaration_documents.declarationId',
        },
      },
      review: {
        relation: HasOneRelation,
        modelClass: `${__dirname}/DeclarationReview`,
        join: {
          from: 'declarations.id',
          to: 'declaration_reviews.declarationId',
        },
      },
    }
  }

  // helper function to determine if a declaration needs documents
  static needsDocuments(declaration) {
    return [
      'hasWorked',
      'hasInternship',
      'hasSickLeave',
      'hasMaternityLeave',
      'hasRetirement',
      'hasInvalidity',
    ].some((hasSomething) => declaration[hasSomething])
  }
}

module.exports = Declaration
