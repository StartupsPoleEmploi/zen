'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('Declarations', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        userId: {
          allowNull: false,
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

        declaredMonth: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        hasWorked: {
          allowNull: false,
          type: Sequelize.BOOLEAN,
        },
        hasTrained: {
          allowNull: false,
          type: Sequelize.BOOLEAN,
        },
        trainingStartDate: {
          defaultValue: null,
          type: Sequelize.DATE,
        },
        trainingEndDate: {
          defaultValue: null,
          type: Sequelize.DATE,
        },
        hasInternship: {
          allowNull: false,
          type: Sequelize.BOOLEAN,
        },
        internshipStartDate: {
          defaultValue: null,
          type: Sequelize.DATE,
        },
        internshipEndDate: {
          defaultValue: null,
          type: Sequelize.DATE,
        },
        hasSickLeave: {
          allowNull: false,
          type: Sequelize.BOOLEAN,
        },
        sickLeaveStartDate: {
          defaultValue: null,
          type: Sequelize.DATE,
        },
        sickLeaveEndDate: {
          defaultValue: null,
          type: Sequelize.DATE,
        },
        hasMaternityLeave: {
          allowNull: false,
          type: Sequelize.BOOLEAN,
        },
        maternityLeaveStartDate: {
          defaultValue: null,
          type: Sequelize.DATE,
        },
        maternityLeaveEndDate: {
          defaultValue: null,
          type: Sequelize.DATE,
        },
        hasRetirement: {
          allowNull: false,
          type: Sequelize.BOOLEAN,
        },
        retirementStartDate: {
          defaultValue: null,
          type: Sequelize.DATE,
        },
        hasInvalidity: {
          allowNull: false,
          type: Sequelize.BOOLEAN,
        },
        invalidityStartDate: {
          defaultValue: null,
          type: Sequelize.DATE,
        },
        isLookingForJob: {
          allowNull: false,
          type: Sequelize.BOOLEAN,
        },
        jobSearchEndDate: {
          type: Sequelize.DATE,
        },
        jobSearchStopMotive: {
          type: Sequelize.STRING,
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
      .then(() =>
        queryInterface.addIndex('Declarations', {
          fields: ['userId'],
        }),
      )
      .then(() =>
        queryInterface.addIndex('Declarations', {
          fields: ['declaredMonth'],
        }),
      )
      .then(() =>
        queryInterface.addIndex('Declarations', {
          fields: ['userId', 'declaredMonth'],
          unique: true,
        }),
      )
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Declarations')
  },
}
