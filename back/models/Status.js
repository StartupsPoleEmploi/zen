const BaseModel = require('./BaseModel')

class Status extends BaseModel {
  static get tableName() {
    return 'status'
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['up'],

      properties: {
        up: { type: 'boolean' },
      },
    }
  }

  static get relationMappings() {
    return {}
  }
}

module.exports = Status
