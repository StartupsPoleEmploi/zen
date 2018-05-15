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
      workSalary: {
        type: DataTypes.INTEGER,
      },
      hasInternship: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      internshipDate: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      hasIllness: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      illnessDate: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      hasMaternityLeave: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      maternityLeaveDate: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      hasRetirement: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      retirementDate: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      hasInvalidity: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      invalidityDate: {
        defaultValue: null,
        type: DataTypes.DATE,
      },
      isLookingForJob: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
    },
    {},
  )

  Declaration.associate = function(models) {
    Declaration.belongsTo(models.User)
  }
  return Declaration
}
