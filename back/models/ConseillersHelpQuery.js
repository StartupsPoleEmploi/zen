const BaseModel = require('./BaseModel')

class ConseillersHelpQuery extends BaseModel {
  static get tableName() {
    return 'conseillers_help_query'
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email'],

      properties: {
        id: { type: 'integer' },
        email: { type: 'string' },
      },
    }
  }

  // This object defines the relations to other models.
  static get relationMappings() {
    return {}
  }
}

module.exports = ConseillersHelpQuery
