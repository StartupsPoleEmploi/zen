'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('Employers', {
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
        declarationId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'Declarations',
            key: 'id',
          },
        },
        employerName: {
          type: Sequelize.STRING,
        },
        workHours: {
          type: Sequelize.INTEGER,
        },
        salary: {
          type: Sequelize.INTEGER,
        },
        hasEndedThisMonth: {
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
      .then(() =>
        queryInterface.addIndex('Employers', {
          fields: ['userId'],
        }),
      )
      .then(() =>
        queryInterface.addIndex('Employers', {
          fields: ['declarationId'],
        }),
      )
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Employers')
  },
}
