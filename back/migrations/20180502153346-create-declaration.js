'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Declarations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      declaredMonth: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      hasWorked: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      workSalary: {
        type: Sequelize.INTEGER,
      },
      hasInternship: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      internshipDate: {
        defaultValue: null,
        type: Sequelize.DATE,
      },
      hasIllness: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      illnessDate: {
        defaultValue: null,
        type: Sequelize.DATE,
      },
      hasMaternityLeave: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      maternityLeaveDate: {
        defaultValue: null,
        type: Sequelize.DATE,
      },
      hasRetirement: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      retirementDate: {
        defaultValue: null,
        type: Sequelize.DATE,
      },
      hasInvalidity: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      invalidityDate: {
        defaultValue: null,
        type: Sequelize.DATE,
      },
      isLookingForJob: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Declarations')
  },
}
