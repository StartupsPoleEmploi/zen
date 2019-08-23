const { BelongsToOneRelation, Model, ValidationError } = require('objection')
const { format, isAfter, isValid } = require('date-fns')

const types = {
  internship: 'internship',
  sickLeave: 'sickLeave',
  maternityLeave: 'maternityLeave',
  retirement: 'retirement',
  invalidity: 'invalidity',
  jobSearch: 'jobSearch',
}

class DeclarationInfo extends Model {
  static get tableName() {
    return 'declaration_infos'
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
    if (this.startDate) this.startDate = format(this.startDate, 'YYYY-MM-DD')
    if (this.endDate) this.endDate = format(this.endDate, 'YYYY-MM-DD')
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
    if (!opt.old && opt.patch) return // Custom validation logic only makes sense for objects modified using instance.$query()

    const objectToValidate = { ...opt.old, ...json }

    const throwValidationError = (label) => {
      throw new ValidationError({
        message: label,
        type: 'DeclarationInfoValidationError',
      })
    }

    const validateDates = (type, datesToValidate) => {
      if (!objectToValidate) return
      datesToValidate.forEach((date) => {
        if (!isValid(new Date(date))) throwValidationError(type)
      })
      if (
        datesToValidate.length === 2 &&
        isAfter(datesToValidate[0], datesToValidate[1])
      ) {
        throwValidationError(type)
      }
    }

    const { startDate, endDate, type } = objectToValidate

    if (type === types.internship || type === types.sickLeave) {
      validateDates(type, [startDate, endDate])
    }
    if (
      type === types.maternityLeave ||
      type === types.retirement ||
      type === types.invalidity
    ) {
      validateDates(type, [startDate])
    }
    if (type === types.jobSearch) {
      validateDates(type, [endDate])
    }
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['type'],

      properties: {
        id: { type: 'integer' },
        declarationId: { type: 'integer' },
        type: { type: ['string'] },
        startDate: { type: ['string', 'object', 'null'] },
        endDate: { type: ['string', 'object', 'null'] },
        file: { type: ['string', 'null'] },
        originalFileName: { type: ['string', 'null'] },
        isTransmitted: { type: 'boolean' },
        isCleanedUp: { default: false, type: 'boolean' },
      },
    }
  }

  // This object defines the relations to other models.
  static get relationMappings() {
    return {
      declaration: {
        relation: BelongsToOneRelation,
        modelClass: `${__dirname}/Declaration`,
        join: {
          from: 'declaration_infos.declarationId',
          to: 'declarations.id',
        },
      },
    }
  }

  static get types() {
    return types
  }
}

module.exports = DeclarationInfo
