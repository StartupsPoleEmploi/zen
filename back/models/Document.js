const BaseModel = require('./BaseModel')

class Document extends BaseModel {
  static get tableName() {
    return 'documents'
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['file'],

      properties: {
        file: { type: ['string', 'null'] },
        isTransmitted: { type: 'boolean' },
      },
    }
  }

  static get relationMappings() {
    return {}
  }
}

module.exports = Document
