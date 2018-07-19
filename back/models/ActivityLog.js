const { BelongsToOneRelation } = require('objection')
const BaseModel = require('./BaseModel')

class ActivityLog extends BaseModel {
  static get tableName() {
    return 'activity_logs'
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['action'],

      properties: {
        id: { type: 'integer' },
        userId: { type: 'integer' },
        action: { type: 'string' },
        metadata: { type: 'json' },
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
          from: 'activity_logs.userId',
          to: 'Users.id',
        },
      },
    }
  }

  static get actions() {
    return {
      VALIDATE_DECLARATION: 'VALIDATE_DECLARATION',
      VALIDATE_EMPLOYERS: 'VALIDATE_EMPLOYERS',
      VALIDATE_FILES: 'VALIDATE_FILES',
      TRANSMIT_FILE: 'TRANSMIT_FILE',
      TRANSMIT_DECLARATION: 'TRANSMIT_DECLARATION',
    }
  }

  $beforeUpdate() {} // overrides base model setting updatedAt

  $beforeInsert() {
    // overrides base model setting updatedAt
    this.createdAt = new Date().toISOString()
  }
}

module.exports = ActivityLog
