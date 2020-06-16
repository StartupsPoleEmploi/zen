const { HasManyRelation } = require('objection');
const BaseModel = require('./BaseModel');

class DeclarationMonth extends BaseModel {
  static get tableName() {
    return 'declaration_months';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['month', 'startDate', 'endDate'],

      properties: {
        id: { type: 'integer' },
        month: { type: ['string', 'object'] },
        startDate: { type: ['string', 'object'] },
        endDate: { type: ['string', 'object'] },
      },
    };
  }

  // This object defines the relations to other models.
  static get relationMappings() {
    return {
      declarations: {
        relation: HasManyRelation,
        modelClass: `${__dirname}/Declaration`,
        join: {
          from: 'declaration_months.id',
          to: 'declarations.monthId',
        },
      },
    };
  }
}

module.exports = DeclarationMonth;
