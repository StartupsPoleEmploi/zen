const { BelongsToOneRelation } = require('objection')
const BaseModel = require('./BaseModel')

class Employer extends BaseModel {
  static get tableName() {
    return 'Employers'
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['employerName', 'userId', 'declarationId'],

      properties: {
        id: { type: 'integer' },
        userId: { type: 'integer' },
        declarationId: { type: 'integer' },
        employerName: { type: 'string' },
        workHours: { type: ['integer', 'null'] },
        salary: { type: ['integer', 'null'] },
        hasEndedThisMonth: { type: 'boolean' },
        file: { type: 'string' },
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
          from: 'Employers.userId',
          to: 'Users.id',
        },
      },
      declaration: {
        relation: BelongsToOneRelation,
        modelClass: `${__dirname}/Declaration`,
        join: {
          from: 'Employers.declarationId',
          to: 'Declarations.id',
        },
      },
    }
  }
}

module.exports = Employer
