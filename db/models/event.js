"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    static associate(models) {
      Event.belongsTo(models.Player, { foreignKey: "playerId" });
    }
  }
  Event.init(
    {
      gameId: DataTypes.INTEGER,
      playerId: DataTypes.INTEGER,
      type: DataTypes.STRING,
      value: DataTypes.INTEGER,
      timestamp: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Event",
    }
  );
  return Event;
};
