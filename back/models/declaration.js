'use strict';
module.exports = (sequelize, DataTypes) => {
  var Declaration = sequelize.define('Declaration', {
    userId: {
      type: Sequelize.INTEGER,
      references: {
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
        model: User,
        key: 'id'
      }
    },
    declaredMonth: {
      allowNull: false,
      type: Sequelize.DATE
    },
    hasWorked: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
    },
    workSalary: {
      type: Sequelize.INTEGER
    },
    hasInternship: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
    },
    internshipDate: {
      defaultValue: null,
      type: Sequelize.DATE
    },
    hasIllness: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
    },
    illnessDate: {
      defaultValue: null,
      type: Sequelize.DATE
    },
    hasMaternityLeave: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
    },
    maternityLeaveDate: {
      defaultValue: null,
      type: Sequelize.DATE
    },
    hasRetirement: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
    },
    retirementDate: {
      defaultValue: null,
      type: Sequelize.DATE
    },
    hasInvalidity: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
    },
    invalidityDate: {
      defaultValue: null,
      type: Sequelize.DATE
    },
    isLookingForJob: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
    },
  }, {});

  Declaration.associate = function (models) {
    Declaration.belongsTo(models.User);
  };
  return Declaration;
};
