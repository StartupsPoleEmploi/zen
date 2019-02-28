const { BelongsToOneRelation, Model } = require('objection')

class DeclarationReview extends Model {
  static get tableName() {
    return 'declaration_reviews'
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['declarationId'],

      properties: {
        id: { type: 'integer' },
        declarationId: { type: 'integer' },
        isVerified: { type: 'boolean ' },
        notes: { type: ['string', 'null'] },
      },
    }
  }

  // This object defines the relations to other models.
  static get relationMappings() {
    return {
      declaration: {
        relation: BelongsToOneRelation,
        modelClass: `${__dirname}/Declaration`,
        join: {
          from: 'declaration_reviews.declarationId',
          to: 'declarations.id',
        },
      },
    }
  }
}

module.exports = DeclarationReview
