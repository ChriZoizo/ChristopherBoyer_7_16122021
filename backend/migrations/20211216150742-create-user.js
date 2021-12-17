'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
        isEmail: true,
        unique: true
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING
      },
      firstName: {
        allowNull: false,
        type: Sequelize.STRING,
        len: [2,40]
      },
      lastName: {
        allowNull: false,
        type: Sequelize.STRING,
        len: [1, 40]
      },
      nickname: {
        allowNull: true,
        type: Sequelize.STRING,
        len: [2,30]
      },
      bio: {
        allowNull: true,
        type: Sequelize.STRING
      },
      brithday: {
        allowNull: true,
        type: Sequelize.DATE
      },
      profilImageUrl: {
        allowNull: true,
        type: Sequelize.STRING
      },
      isAdmin: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users')
  }
}
