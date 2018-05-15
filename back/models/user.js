'use strict'
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define(
    'User',
    {
      peId: DataTypes.STRING(100),
      firstName: DataTypes.STRING(30),
      lastName: DataTypes.STRING(85),
      email: DataTypes.STRING(60),
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['peId'],
        },
      ],
    },
  )
  return User
}
