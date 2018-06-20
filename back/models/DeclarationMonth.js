const { HasManyRelation } = require('objection')
const BaseModel = require('./BaseModel')

class DeclarationMonth extends BaseModel {
  static get tableName() {
    return 'declaration_months'
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['month', 'startDate', 'endDate'],

      properties: {
        id: { type: 'integer' },
        month: { type: 'date' },
        startDate: { type: 'date' },
        endDate: { type: 'date' },
      },
    }
  }

  // This object defines the relations to other models.
  static get relationMappings() {
    return {
      declarations: {
        relation: HasManyRelation,
        modelClass: `${__dirname}/Declaration`,
        join: {
          from: 'declaration_months.id',
          to: 'Declarations.monthId',
        },
      },
    }
  }
}

module.exports = DeclarationMonth
