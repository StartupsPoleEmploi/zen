const { BelongsToOneRelation, HasManyRelation } = require('objection');
const BaseModel = require('./BaseModel');

class Employer extends BaseModel {
  static get tableName() {
    return 'employers';
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
        salary: { type: ['number', 'null'] },
        hasEndedThisMonth: { type: ['boolean', 'null'] },
        documentId: { type: ['integer'] },
      },
    };
  }

  // This object defines the relations to other models.
  static get relationMappings() {
    return {
      user: {
        relation: BelongsToOneRelation,
        modelClass: `${__dirname}/User`,
        join: {
          from: 'employers.userId',
          to: 'Users.id',
        },
      },
      declaration: {
        relation: BelongsToOneRelation,
        modelClass: `${__dirname}/Declaration`,
        join: {
          from: 'employers.declarationId',
          to: 'declarations.id',
        },
      },
      documents: {
        relation: HasManyRelation,
        modelClass: `${__dirname}/EmployerDocument`,
        join: {
          from: 'employers.id',
          to: 'employer_documents.employerId',
        },
      },
    };
  }
}

module.exports = Employer;
