const { Model } = require('objection')
const { pick } = require('lodash')

module.exports = class BaseModel extends Model {
  $beforeUpdate() {
    this.updatedAt = new Date().toISOString()
  }

  $beforeInsert() {
    this.createdAt = new Date().toISOString()
    this.updatedAt = this.createdAt
  }

  /*
    When parsing JSON, automatically remove keys not defined in properties or relations
   */
  $parseJson(json, opt) {
    return pick(
      super.$parseJson(json, opt),
      Object.keys(this.constructor.jsonSchema.properties).concat(
        Object.keys(this.constructor.relationMappings),
      ),
    )
  }
}
