"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Events",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        gameId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        eventId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        playerId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Players",
            key: "id",
            as: "playerId",
          },
        },
        type: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        value: {
          type: Sequelize.INTEGER,
          default: 1,
        },
        timestamp: {
          type: Sequelize.DATE,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {
        uniqueKeys: {
          actions_unique: {
            fields: ["gameId", "eventId", "playerId", "type"],
          },
        },
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Events");
  },
};
