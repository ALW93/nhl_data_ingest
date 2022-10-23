const _ = require("lodash");
const axios = require("axios");

const { sequelize, Team, Player, Event } = require("../../db/models");
const { api_url } = require("../../config/config.json");

class DatabaseSynchronizer {
  async syncEvent(event, gameId) {
    const player = await Player.findOne({
      where: { externalId: event.playerId },
    });
    try {
      console.log(player.id);
    } catch (e) {
      console.error(`\n ERROR FINDING: ${player} ${event.playerId}`);
    }

    // const newEvent = Event.build({
    //   gameId: gameId,
    //   eventId: event.about.eventId,
    //   playerId: player.id,
    //   type: event.result.eventTypeId,
    //   value: _.get(event, "value", 1),
    //   timestamp: event.about.dateTime,
    // });

    // try {
    //   this._write(newEvent);
    // } catch (e) {
    //   console.error(`Error importing event: ${JSON.stringify(event)}`, e);
    // }
    // return newEvent;
  }

  async syncTeam(team) {
    const newTeam = Team.build({ externalId: team.id, name: team.name });
    try {
      this._write(newTeam);
    } catch (e) {
      console.error(`Error importing team: ${team.name}`, e);
    }
    return newTeam;
  }

  async syncPlayer(playerId) {
    const response = await axios.get(`${api_url}/people/${playerId}`);
    const player = response.data.people[0];

    const newPlayer = Player.build({
      externalId: player.id,
      teamId: player.currentTeam.id,
      number: player.primaryNumber,
      position: player.primaryPosition.type,
      name: player.fullName,
      age: player.currentAge,
    });

    try {
      this._write(newPlayer);
    } catch (e) {
      console.error(`Error importing playerId: ${player.id}`, e);
    }
    return newPlayer;
  }

  async _write(row) {
    await sequelize.transaction(async (tx) => {
      await row.save({ transaction: tx });
    });
  }
}

const db = new DatabaseSynchronizer();
module.exports = db;
