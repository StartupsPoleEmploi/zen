'use strict'
module.exports = (sequelize, DataTypes) => {
  var Employer = sequelize.define(
    'Employer',
    {
      userId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: 'User',
          key: 'id',
        },
      },
      declarationId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: 'Declarations',
          key: 'id',
        },
      },
      employerName: DataTypes.STRING,
      workHours: DataTypes.INTEGER,
      salary: DataTypes.INTEGER,
      hasEndedThisMonth: DataTypes.BOOLEAN,
    },
    {
      indexes: [
        {
          fields: ['userId'],
        },
        {
          fields: ['declarationId'],
        },
      ],
    },
  )
  Employer.associate = function(models) {
    // Employer.belongsTo(models.User, { as: 'user' })
  }
  return Employer
}
