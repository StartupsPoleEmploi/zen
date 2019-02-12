const { BelongsToOneRelation } = require('objection')
const BaseModel = require('./BaseModel')

class DeclarationDocument extends BaseModel {
  static get tableName() {
    return 'declaration_documents'
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['declarationId', 'type'],

      properties: {
        id: { type: 'integer' },
        type: { type: ['string'] },
        declarationId: { type: 'integer' },
        file: { type: ['string', 'null'] },
        isTransmitted: { type: 'boolean ' },
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
          from: 'declaration_documents.declarationId',
          to: 'declarations.id',
        },
      },
    }
  }

  static get types() {
    return {
      internship: 'internship',
      sickLeave: 'sickLeave',
      maternityLeave: 'maternityLeave',
      retirement: 'retirement',
      invalidity: 'invalidity',
    }
  }
}

module.exports = DeclarationDocument
