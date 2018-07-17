const { HasManyRelation } = require('objection')
const BaseModel = require('./BaseModel')

class User extends BaseModel {
  static get tableName() {
    return 'Users'
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['peId', 'firstName', 'lastName'],

      properties: {
        id: { type: 'integer' },
        peId: { type: 'string', minLength: 1, maxLength: 100 },
        firstName: { type: 'string', minLength: 1, maxLength: 30 },
        lastName: { type: 'string', minLength: 1, maxLength: 85 },
        email: { type: ['string', 'null'] },
        peCode: { type: ['string', 'null'] },
        pePass: { type: ['string', 'null'] },
        pePostalCode: { type: ['string', 'null'] },
      },
    }
  }

  // This object defines the relations to other models.
  static get relationMappings() {
    return {
      employers: {
        relation: HasManyRelation,
        modelClass: `${__dirname}/Employer`,
        join: {
          from: 'Users.id',
          to: 'Employers.userId',
        },
      },
      declarations: {
        relation: HasManyRelation,
        modelClass: `${__dirname}/Declaration`,
        join: {
          from: 'Users.id',
          to: 'Declarations.userId',
        },
      },
    }
  }
}

module.exports = User
