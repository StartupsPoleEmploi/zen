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
        type: DataTypes.DATEONLY,
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
        type: DataTypes.DATEONLY,
      },
      trainingEndDate: {
        defaultValue: null,
        type: DataTypes.DATEONLY,
      },
      hasInternship: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      internshipStartDate: {
        defaultValue: null,
        type: DataTypes.DATEONLY,
      },
      internshipEndDate: {
        defaultValue: null,
        type: DataTypes.DATEONLY,
      },
      hasSickLeave: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      sickLeaveStartDate: {
        defaultValue: null,
        type: DataTypes.DATEONLY,
      },
      sickLeaveEndDate: {
        defaultValue: null,
        type: DataTypes.DATEONLY,
      },
      hasMaternityLeave: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      maternityLeaveStartDate: {
        defaultValue: null,
        type: DataTypes.DATEONLY,
      },
      hasRetirement: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      retirementStartDate: {
        defaultValue: null,
        type: DataTypes.DATEONLY,
      },
      hasInvalidity: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      invalidityStartDate: {
        defaultValue: null,
        type: DataTypes.DATEONLY,
      },
      isLookingForJob: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      jobSearchEndDate: {
        type: DataTypes.DATEONLY,
      },
      jobSearchStopMotive: {
        type: DataTypes.STRING,
      },
      isFinished: {
        defaultValue: false,
        type: DataTypes.BOOLEAN,
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
    // Declaration.belongsTo(models.User, { as: 'user' })
  }
  return Declaration
}
