const BaseModel = require('./BaseModel')

class Administrator extends BaseModel {
  static get tableName() {
    return 'administrators'
  }

  static get jsonSchema() {
    return {
      type: 'object',

      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        password: { type: 'string' },
      },
    }
  }
}

module.exports = Administrator
