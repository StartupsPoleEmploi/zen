const {
  BelongsToOneRelation,
  HasManyRelation,
  HasOneRelation,
  ValidationError,
} = require('objection')
const { isValid } = require('date-fns')

const BaseModel = require('./BaseModel')

class Declaration extends BaseModel {
  static get tableName() {
    return 'Declarations'
  }

  $beforeValidate(jsonSchema, json, opt) {
    const objectToValidate = { ...opt.old, ...json }
    const {
      trainingStartDate,
      trainingEndDate,
      internshipStartDate,
      internshipEndDate,
      sickLeaveStartDate,
      sickLeaveEndDate,
      maternityLeaveStartDate,
      retirementStartDate,
      invalidityStartDate,
      isLookingForJob,
      jobSearchEndDate,
      jobSearchStopMotive,
    } = objectToValidate

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
    }

    validateDates('hasTrained', [trainingStartDate, trainingEndDate])
    validateDates('hasInternship', [internshipStartDate, internshipEndDate])
    validateDates('hasSickLeave', [sickLeaveStartDate, sickLeaveEndDate])
    validateDates('hasMaternityLeave', [maternityLeaveStartDate])
    validateDates('hasRetirement', [retirementStartDate])
    validateDates('hasInvalidity', [invalidityStartDate])

    if (!isLookingForJob) {
      if (!isValid(new Date(jobSearchEndDate))) {
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
        trainingStartDate: { type: ['string', 'object', 'null'] },
        trainingEndDate: { type: ['string', 'object', 'null'] },
        trainingDocumentId: { type: ['integer', 'null'] },
        hasInternship: { type: 'boolean' },
        internshipStartDate: { type: ['string', 'object', 'null'] },
        internshipEndDate: { type: ['string', 'object', 'null'] },
        internshipDocumentId: { type: ['integer', 'null'] },
        hasSickLeave: { type: 'boolean' },
        sickLeaveStartDate: { type: ['string', 'object', 'null'] },
        sickLeaveEndDate: { type: ['string', 'object', 'null'] },
        sickLeaveDocumentId: { type: ['integer', 'null'] },
        hasMaternityLeave: { type: 'boolean' },
        maternityLeaveStartDate: { type: ['string', 'object', 'null'] },
        maternityLeaveDocumentId: { type: ['integer', 'null'] },
        hasRetirement: { type: 'boolean' },
        retirementStartDate: { type: ['string', 'object', 'null'] },
        retirementDocumentId: { type: ['integer', 'null'] },
        hasInvalidity: { type: 'boolean' },
        invalidityStartDate: { type: ['string', 'object', 'null'] },
        invalidityDocumentId: { type: ['integer', 'null'] },
        isLookingForJob: { type: 'boolean' },
        jobSearchEndDate: { type: ['string', 'object', 'null'] },
        jobSearchStopMotive: { type: ['string', 'null'] },
        hasFinishedDeclaringEmployers: {
          default: false,
          type: 'boolean',
        },
        isFinished: {
          default: false,
          type: 'boolean',
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
          from: 'Declarations.userId',
          to: 'Users.id',
        },
      },
      employers: {
        relation: HasManyRelation,
        modelClass: `${__dirname}/Employer`,
        join: {
          from: 'Declarations.id',
          to: 'Employers.declarationId',
        },
      },
      declarationMonth: {
        relation: BelongsToOneRelation,
        modelClass: `${__dirname}/DeclarationMonth`,
        join: {
          from: 'Declarations.monthId',
          to: 'declaration_months.id',
        },
      },

      trainingDocument: {
        relation: HasOneRelation,
        modelClass: `${__dirname}/Document`,
        join: {
          from: 'Declarations.trainingDocumentId',
          to: 'documents.id',
        },
      },
      internshipDocument: {
        relation: HasOneRelation,
        modelClass: `${__dirname}/Document`,
        join: {
          from: 'Declarations.internshipDocumentId',
          to: 'documents.id',
        },
      },
      sickLeaveDocument: {
        relation: HasOneRelation,
        modelClass: `${__dirname}/Document`,
        join: {
          from: 'Declarations.sickLeaveDocumentId',
          to: 'documents.id',
        },
      },
      maternityLeaveDocument: {
        relation: HasOneRelation,
        modelClass: `${__dirname}/Document`,
        join: {
          from: 'Declarations.maternityLeaveDocumentId',
          to: 'documents.id',
        },
      },
      retirementDocument: {
        relation: HasOneRelation,
        modelClass: `${__dirname}/Document`,
        join: {
          from: 'Declarations.retirementDocumentId',
          to: 'documents.id',
        },
      },
      invalidityDocument: {
        relation: HasOneRelation,
        modelClass: `${__dirname}/Document`,
        join: {
          from: 'Declarations.invalidityDocumentId',
          to: 'documents.id',
        },
      },
    }
  }
}

module.exports = Declaration
