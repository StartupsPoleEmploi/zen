const bcryptjs = require('bcryptjs');
const { omit } = require('lodash');
const BaseModel = require('./BaseModel');

function encryptPassword(password) {
  return bcryptjs.hashSync(password, 10);
}

class Useradmin extends BaseModel {
  static get tableName() {
    return 'useradmins';
  }

  async $beforeUpdate(opt, queryContext) {
    await super.$beforeUpdate(opt, queryContext);
    if (this.password) {
      this.password = encryptPassword(this.password);
    }
  }

  async $beforeInsert() {
    await super.$beforeInsert();
    this.password = encryptPassword(this.password);
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email', 'type', 'password'],

      properties: {
        id: { type: 'integer' },
        firstName: { type: ['string', 'null'], maxLength: 128 },
        lastName: { type: ['string', 'null'], maxLength: 128 },
        email: { type: 'string', minLength: 6, maxLength: 128 },
        password: { type: 'string', minLength: 6, maxLength: 128 },
        type: { type: 'string', enum: ['admin', 'viewer'] },
      },
    };
  }

  get $secureFields() {
    return ['password'];
  }

  // omit stuff when creating json response from model
  $formatJson(json, options) {
    json = super.$formatJson(json, options);
    return omit(json, this.$secureFields);
  }

  static get relationMappings() {
    return {};
  }
}

module.exports = Useradmin;
