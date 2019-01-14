const {
  BelongsToOneRelation,
  HasManyRelation,
  HasOneRelation,
  ValidationError,
} = require('objection')
const { format, isValid } = require('date-fns')

const BaseModel = require('./BaseModel')

class Declaration extends BaseModel {
  static get tableName() {
    return 'Declarations'
  }

  $beforeUpdate() {
    super.$beforeUpdate()
    this.convertUTCDatesToPGDates()
  }

  $beforeInsert() {
    super.$beforeInsert()
    this.convertUTCDatesToPGDates()
  }

  $beforeValidate(jsonSchema, json, opt) {
    const objectToValidate = { ...opt.old, ...json }
    const {
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

  /*
    This resolves an issue with the way JS / PostgreSQL interact with dates:
    A date ISOString is written 2018-11-07T22:00:00.000Z to represent 2018-11-08, Paris time.
    So for example, the internshipStartDate field, when requested from the database,
    has for value 2018-11-07T22:00:00.000Z.
    However, when saving again that value (example: upsertGraph, which will save everything,
      not just modified values), the value 2018-11-07T22:00:00.000Z, when given to
    PostgresSQL, will be *truncated*, which will result in the date being off by one day.
    This resolves it by relying on the node server to correctly format dates to YYYY-MM-DD.
  */
  convertUTCDatesToPGDates() {
    const dateFields = [
      'internshipStartDate',
      'internshipEndDate',
      'sickLeaveStartDate',
      'sickLeaveEndDate',
      'maternityLeaveStartDate',
      'retirementStartDate',
      'invalidityStartDate',
    ]

    dateFields.forEach((field) => {
      if (this[field]) this[field] = format(this[field], 'YYYY-MM-DD')
    })
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

      // Adding any date (not timestamp) field to this model requires adding it to the
      // convertUTCDatesToPGDates method.
      properties: {
        id: { type: 'integer' },
        userId: { type: 'integer' },
        monthId: { type: ['integer'] },
        hasWorked: { type: 'boolean' },
        hasTrained: { type: 'boolean' },
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
        isTransmitted: {
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
        metadata: { type: 'json' },
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
