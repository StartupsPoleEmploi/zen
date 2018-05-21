module.exports = (sequelize, DataTypes) => {
  var Declaration = sequelize.define(
    'Declaration',
    {
      userId: {
        type: DataTypes.INTEGER,
        references: {
          deferrable: sequelize.Deferrable.INITIALLY_IMMEDIATE,
          model: 'Users',
          key: 'id',
        },
      },
      declaredMonth: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      hasWorked: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      hasTrained: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      trainingStartDate: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      trainingEndDate: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      hasInternship: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      internshipStartDate: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      internshipEndDate: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      hasSickLeave: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      sickLeaveStartDate: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      sickLeaveEndDate: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      hasMaternityLeave: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      maternityLeaveStartDate: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      hasRetirement: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      retirementStartDate: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      hasInvalidity: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      invalidityStartDate: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      isLookingForJob: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      jobSearchEndDate: {
        type: DataTypes.DATE,
      },
      jobSearchStopMotive: {
        type: DataTypes.STRING,
      },
    },
    {
      indexes: [
        {
          fields: ['userId'],
        },
        {
          fields: ['declaredMonth'],
        },
        {
          fields: ['userId', 'declaredMonth'],
          unique: true,
        },
      ],
    },
  )

  Declaration.associate = function(models) {
    Declaration.belongsTo(models.User)
  }
  return Declaration
}
