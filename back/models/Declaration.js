const {
  BelongsToOneRelation,
  HasManyRelation,
  HasOneRelation,
  ValidationError,
} = require('objection')

const BaseModel = require('./BaseModel')

class Declaration extends BaseModel {
  static get tableName() {
    return 'declarations'
  }

  $beforeValidate(jsonSchema, json, opt) {
    if (!opt.old && opt.patch) return // Custom validation logic only makes sense for objects modified using instance.$query()

    const objectToValidate = { ...opt.old, ...json }
    const { isLookingForJob, jobSearchStopMotive } = objectToValidate

    const throwValidationError = (label) => {
      throw new ValidationError({
        message: label,
        type: 'DeclarationValidationError',
      })
    }

    if (!isLookingForJob) {
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
        isCleanedUp: {
          default: false,
          type: 'boolean',
        },
        metadata: { type: 'object' },
        transmittedAt: { type: ['string', 'object', 'null'] },
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
      infos: {
        relation: HasManyRelation,
        modelClass: `${__dirname}/DeclarationInfo`,
        join: {
          from: 'declarations.id',
          to: 'declaration_infos.declarationId',
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
