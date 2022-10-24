const axios = require("axios");

const { sequelize, Team, Player, Event } = require("../../db/models");
const { api_url } = require("../../config/config.json");

class DatabaseSynchronizer {
  async syncEvent(event, playerId, gameId, type, value = 1) {
    const player = await Player.findOne({
      where: { externalId: playerId },
    });

    if (!player) {
      console.log(`Syncing missing player: ${playerId}`);
      await this.syncPlayer(playerId, event.team.id);
    }

    const newEvent = Event.build({
      gameId: gameId,
      eventId: event.about.eventId,
      playerId: playerId,
      type: type,
      value: value,
      timestamp: event.about.dateTime,
    });

    try {
      await this._write(newEvent);
    } catch (e) {
      if (e.name == "SequelizeUniqueConstraintError") {
        console.error(
          `Event ${event.about.eventId} already processed -- skipping`
        );
        return;
      }
      console.error(`Error importing event: ${event.about.id}`, e.name);
    }
    return newEvent;
  }

  async syncTeam(team) {
    const newTeam = Team.build({ externalId: team.id, name: team.name });
    try {
      await this._write(newTeam);
    } catch (e) {
      console.error(`Error importing team: ${team.name}`, e.name);
    }
    return newTeam;
  }

  async syncPlayer(playerId, teamId = 0) {
    const response = await axios.get(`${api_url}/people/${playerId}`);
    const player = response.data.people[0];

    const newPlayer = Player.build({
      externalId: player.id,
      teamId: teamId || player.currentTeam.id,
      number: player.primaryNumber,
      position: player.primaryPosition.type,
      name: player.fullName,
      age: player.currentAge,
    });

    try {
      await this._write(newPlayer);
    } catch (e) {
      if (e.name == "SequelizeUniqueConstraintError") {
        return;
      }
      console.error(`Error importing player: ${player.id}`, e.name);
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
