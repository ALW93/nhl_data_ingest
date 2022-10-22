"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Player extends Model {
    static associate(models) {
      Player.belongsTo(models.Team, { foreignKey: "teamId" });
      Player.hasMany(models.Event, { foreignKey: "playerId" });
    }
  }
  Player.init(
    {
      externalId: DataTypes.INTEGER,
      teamId: DataTypes.INTEGER,
      number: DataTypes.INTEGER,
      position: DataTypes.STRING,
      name: DataTypes.STRING,
      age: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Player",
    }
  );
  return Player;
};
