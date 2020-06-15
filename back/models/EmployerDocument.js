const { BelongsToOneRelation } = require('objection');
const BaseModel = require('./BaseModel');

class EmployerDocument extends BaseModel {
  static get tableName() {
    return 'employer_documents';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['employerId', 'type'],

      properties: {
        id: { type: 'integer' },
        type: { type: ['string'] },
        employerId: { type: 'integer' },
        file: { type: ['string', 'null'] },
        originalFileName: { type: ['string', 'null'] },
        isTransmitted: { type: 'boolean' },
        isCleanedUp: { type: 'boolean' },
      },
    };
  }

  // This object defines the relations to other models.
  static get relationMappings() {
    return {
      employer: {
        relation: BelongsToOneRelation,
        modelClass: `${__dirname}/Employer`,
        join: {
          from: 'employer_documents.employerId',
          to: 'employers.id',
        },
      },
    };
  }

  static get types() {
    return {
      salarySheet: 'salarySheet',
      employerCertificate: 'employerCertificate',
    };
  }
}

module.exports = EmployerDocument;
