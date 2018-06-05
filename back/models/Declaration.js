const {
  BelongsToOneRelation,
  HasManyRelation,
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
        'declaredMonth',
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
        declaredMonth: { type: ['string', 'object', 'null'] },
        hasWorked: { type: 'boolean' },
        hasTrained: { type: 'boolean' },
        trainingStartDate: { type: ['string', 'object', 'null'] },
        trainingEndDate: { type: ['string', 'object', 'null'] },
        trainingDocument: { type: ['string', 'null'] },
        hasInternship: { type: 'boolean' },
        internshipStartDate: { type: ['string', 'object', 'null'] },
        internshipEndDate: { type: ['string', 'object', 'null'] },
        internshipDocument: { type: ['string', 'null'] },
        hasSickLeave: { type: 'boolean' },
        sickLeaveStartDate: { type: ['string', 'object', 'null'] },
        sickLeaveEndDate: { type: ['string', 'object', 'null'] },
        sickLeaveDocument: { type: ['string', 'null'] },
        hasMaternityLeave: { type: 'boolean' },
        maternityLeaveStartDate: { type: ['string', 'object', 'null'] },
        maternityLeaveDocument: { type: ['string', 'null'] },
        hasRetirement: { type: 'boolean' },
        retirementStartDate: { type: ['string', 'object', 'null'] },
        retirementDocument: { type: ['string', 'null'] },
        hasInvalidity: { type: 'boolean' },
        invalidityStartDate: { type: ['string', 'object', 'null'] },
        invalidityDocument: { type: ['string', 'null'] },
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
        modelClass: __dirname + '/User',
        join: {
          from: 'Declarations.userId',
          to: 'Users.id',
        },
      },
      employers: {
        relation: HasManyRelation,
        modelClass: __dirname + '/Employer',
        join: {
          from: 'Declarations.id',
          to: 'Employers.declarationId',
        },
      },
    }
  }
}

module.exports = Declaration
